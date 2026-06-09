import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { getBountyById } from "@/lib/bounties";
import { query, queryOne } from "@/lib/db";
import { notify } from "@/lib/notifications";
import { sendPayout } from "@/lib/solana";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const bounty = await getBountyById(id);
  if (!bounty) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (bounty.created_by !== ctx.profile.id) {
    return NextResponse.json({ error: "Only the bounty creator can approve." }, { status: 403 });
  }
  if (bounty.status !== "submitted") {
    return NextResponse.json({ error: "No proof to approve yet." }, { status: 400 });
  }
  if (!bounty.helper_wallet) {
    return NextResponse.json({ error: "Helper has no wallet on file." }, { status: 400 });
  }

  const payout = await sendPayout(bounty.helper_wallet, BigInt(bounty.reward_sol_lamports));
  if (!payout.ok) return NextResponse.json({ error: payout.error }, { status: 500 });

  await query(
    `update bounties set status = 'paid', payout_tx = $2, paid_at = now() where id = $1`,
    [id, payout.signature],
  );

  if (bounty.helper_id) {
    await query(
      "update profiles set influence = influence + $2 where id = $1",
      [bounty.helper_id, bounty.reward_influence],
    );
    await notify(
      bounty.helper_id,
      "bounty_paid",
      `You got paid for: ${bounty.title}. Check your wallet.`,
      `/app/rewards`,
    );
  }

  return NextResponse.json({ paid: true, payout_tx: payout.signature });
}
