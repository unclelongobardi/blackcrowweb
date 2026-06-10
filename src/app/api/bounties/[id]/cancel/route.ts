import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { getBountyById } from "@/lib/bounties";
import { recordEscrowTransaction } from "@/lib/escrowLedger";
import { query, queryOne } from "@/lib/db";
import { canOperateEscrow, getEscrowAddress, sendRefund } from "@/lib/solana";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const bounty = await getBountyById(id);
  if (!bounty) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (bounty.is_official) {
    return NextResponse.json({ error: "Official bounties cannot be cancelled." }, { status: 400 });
  }
  if (bounty.created_by !== ctx.profile.id) {
    return NextResponse.json({ error: "Only the bounty creator can cancel." }, { status: 403 });
  }

  if (bounty.status === "paid" || bounty.status === "cancelled") {
    return NextResponse.json({ error: "This bounty is already closed." }, { status: 400 });
  }

  const hasApproved = await queryOne(
    `select 1 from bounty_participants where bounty_id = $1 and status = 'approved' limit 1`,
    [id],
  );
  if (hasApproved) {
    return NextResponse.json({ error: "Cannot cancel after a payout was approved." }, { status: 400 });
  }

  const hasSubmitted = await queryOne(
    `select 1 from bounty_participants where bounty_id = $1 and status = 'submitted' limit 1`,
    [id],
  );

  if (bounty.status === "funding") {
    await query(`update bounties set status = 'cancelled' where id = $1`, [id]);
    const updated = await getBountyById(id, ctx.profile.id);
    return NextResponse.json({ cancelled: true, refunded: false, bounty: updated });
  }

  if (!["open", "assigned", "submitted", "expired"].includes(bounty.status)) {
    return NextResponse.json({ error: "This bounty cannot be cancelled." }, { status: 400 });
  }

  if (hasSubmitted) {
    return NextResponse.json(
      { error: "Resolve or reject pending proofs before cancelling." },
      { status: 400 },
    );
  }

  const refundWallet = bounty.creator_wallet ?? ctx.profile.wallet_address;
  if (!refundWallet) {
    return NextResponse.json({ error: "No creator wallet on file for refund." }, { status: 400 });
  }

  const baseLamports = BigInt(bounty.creator_base_lamports ?? bounty.reward_sol_lamports);
  const contributions = BigInt(bounty.contributions_lamports ?? 0);
  const refundLamports = baseLamports;

  if (refundLamports <= BigInt(0) || !bounty.deposit_tx) {
    await query(`update bounties set status = 'cancelled' where id = $1`, [id]);
    const updated = await getBountyById(id, ctx.profile.id);
    return NextResponse.json({ cancelled: true, refunded: false, bounty: updated });
  }

  if (!canOperateEscrow()) {
    return NextResponse.json({ error: "Escrow wallet is not fully configured on the server." }, { status: 503 });
  }

  const refund = await sendRefund(refundWallet, refundLamports);
  if (!refund.ok) return NextResponse.json({ error: refund.error }, { status: 500 });

  await query(
    `update bounties set status = 'cancelled', payout_tx = $2 where id = $1`,
    [id, refund.signature],
  );

  await recordEscrowTransaction({
    bountyId: id,
    kind: "refund",
    txSignature: refund.signature,
    lamports: refundLamports,
    fromWallet: getEscrowAddress(),
    toWallet: refundWallet,
    profileId: ctx.profile.id,
  });

  const updated = await getBountyById(id, ctx.profile.id);
  return NextResponse.json({
    cancelled: true,
    refunded: true,
    refund_tx: refund.signature,
    refund_lamports: refundLamports.toString(),
    pool_contributions_retained: contributions > BigInt(0),
    bounty: updated,
  });
}
