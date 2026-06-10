import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { getBountyById } from "@/lib/bounties";
import { canAcceptBounty } from "@/lib/bountyRules";
import { enforceFinancialRateLimit } from "@/lib/financialRateLimit";
import { resolveVerifiedSolanaWallet } from "@/lib/privyWallets";
import { query, queryOne } from "@/lib/db";
import { notify } from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const limited = await enforceFinancialRateLimit(request, ctx.profile.id, "accept");
  if (limited) return limited;

  const verified = await resolveVerifiedSolanaWallet(request, ctx, ctx.profile.wallet_address);
  if (!verified.ok) return NextResponse.json({ error: verified.error }, { status: 400 });
  const wallet = verified.address;

  const bounty = await getBountyById(id);
  if (!bounty) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!canAcceptBounty(bounty)) {
    return NextResponse.json(
      { error: bounty.expires_at && new Date(bounty.expires_at) <= new Date()
          ? "This bounty has expired."
          : "This bounty is not available." },
      { status: 400 },
    );
  }
  if (bounty.created_by === ctx.profile.id) {
    return NextResponse.json({ error: "You cannot accept your own bounty." }, { status: 400 });
  }

  const existing = await queryOne<{ id: string }>(
    "select id from bounty_participants where bounty_id = $1 and profile_id = $2",
    [id, ctx.profile.id],
  );
  if (existing) {
    return NextResponse.json({ error: "You already joined this bounty." }, { status: 400 });
  }

  await query(
    `insert into bounty_participants (bounty_id, profile_id, wallet_address, status)
     values ($1, $2, $3, 'accepted')`,
    [id, ctx.profile.id, wallet],
  );

  await query(
    `update bounties set
       status = case when status = 'open' then 'assigned' else status end,
       helper_id = coalesce(helper_id, $2),
       helper_wallet = coalesce(helper_wallet, $3),
       assigned_at = coalesce(assigned_at, now())
     where id = $1`,
    [id, ctx.profile.id, wallet],
  );

  if (bounty.created_by) {
    await notify(
      bounty.created_by,
      "bounty_accepted",
      `${ctx.profile.codename} joined your bounty: ${bounty.title}`,
      `/app/bounties#bounty-${id}`,
    );
  }

  const updated = await getBountyById(id, ctx.profile.id);
  return NextResponse.json({ accepted: true, status: updated?.status ?? "assigned", bounty: updated });
}
