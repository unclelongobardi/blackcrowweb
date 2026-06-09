import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { getBountyById } from "@/lib/bounties";
import { query } from "@/lib/db";
import { notify } from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  if (!ctx.profile.wallet_address) {
    return NextResponse.json({ error: "Connect a Solana wallet first." }, { status: 400 });
  }

  const bounty = await getBountyById(id);
  if (!bounty) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (bounty.status !== "open") {
    return NextResponse.json({ error: "This bounty is not available." }, { status: 400 });
  }
  if (!bounty.deposit_tx) {
    return NextResponse.json({ error: "Escrow not funded yet." }, { status: 400 });
  }
  if (bounty.created_by === ctx.profile.id) {
    return NextResponse.json({ error: "You cannot accept your own bounty." }, { status: 400 });
  }

  await query(
    `update bounties set status = 'assigned', helper_id = $2, helper_wallet = $3, assigned_at = now()
     where id = $1 and status = 'open'`,
    [id, ctx.profile.id, ctx.profile.wallet_address],
  );

  if (bounty.created_by) {
    await notify(
      bounty.created_by,
      "bounty_accepted",
      `${ctx.profile.codename} accepted your bounty: ${bounty.title}`,
      `/app/rewards`,
    );
  }

  return NextResponse.json({ accepted: true, status: "assigned" });
}
