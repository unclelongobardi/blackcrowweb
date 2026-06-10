import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { getBountyById } from "@/lib/bounties";
import { helperInfluenceFromLamports } from "@/lib/bountyInfluence";
import {
  claimBountyForPayout,
  getExistingPayoutSignature,
  releaseBountyPayoutLock,
} from "@/lib/bountySettlement";
import { enforceFinancialRateLimit } from "@/lib/financialRateLimit";
import { recordEscrowTransaction } from "@/lib/escrowLedger";
import { query, queryOne } from "@/lib/db";
import { notify } from "@/lib/notifications";
import { canOperateEscrow, ensureEscrowCanPay, getEscrowAddress, sendPayout } from "@/lib/solana";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const limited = await enforceFinancialRateLimit(request, ctx.profile.id, "approve");
  if (limited) return limited;

  if (!canOperateEscrow()) {
    return NextResponse.json({ error: "Escrow wallet is not fully configured on the server." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const participantId = body.participant_id ? String(body.participant_id) : null;

  const bounty = await getBountyById(id);
  if (!bounty) return NextResponse.json({ error: "Not found." }, { status: 404 });

  if (bounty.created_by !== ctx.profile.id) {
    return NextResponse.json({ error: "Only the bounty creator can approve." }, { status: 403 });
  }

  if (bounty.status === "paid") {
    return NextResponse.json({ error: "This bounty was already paid out." }, { status: 400 });
  }

  const isOfficial = !!bounty.is_official;
  if (!bounty.deposit_tx && !isOfficial) {
    return NextResponse.json({ error: "Bounty was never funded." }, { status: 400 });
  }

  const existingPayout = await getExistingPayoutSignature(id);
  if (existingPayout) {
    await query(
      `update bounties set status = 'paid', payout_tx = $2, paid_at = coalesce(paid_at, now()) where id = $1`,
      [id, existingPayout],
    );
    const updated = await getBountyById(id, ctx.profile.id);
    return NextResponse.json({ paid: true, payout_tx: existingPayout, bounty: updated });
  }

  type ParticipantRow = {
    id: string;
    profile_id: string;
    wallet_address: string | null;
    status: string;
  };

  let participant: ParticipantRow | null = null;

  if (participantId) {
    participant = await queryOne<ParticipantRow>(
      "select id, profile_id, wallet_address, status from bounty_participants where id = $1 and bounty_id = $2",
      [participantId, id],
    );
    if (!participant || participant.status !== "submitted") {
      return NextResponse.json({ error: "No pending proof from that participant." }, { status: 400 });
    }
  } else {
    participant = await queryOne<ParticipantRow>(
      `select id, profile_id, wallet_address, status from bounty_participants
       where bounty_id = $1 and status = 'submitted'
       order by submitted_at asc limit 1`,
      [id],
    );
  }

  if (!participant?.wallet_address) {
    return NextResponse.json({ error: "No submitted proof to approve." }, { status: 400 });
  }

  const claimed = await claimBountyForPayout(id);
  if (!claimed) {
    return NextResponse.json({ error: "Payout already in progress or bounty is closed." }, { status: 409 });
  }

  const payoutLamports = BigInt(bounty.reward_sol_lamports);
  const balanceCheck = await ensureEscrowCanPay(payoutLamports);
  if (!balanceCheck.ok) {
    await releaseBountyPayoutLock(id);
    return NextResponse.json({ error: balanceCheck.error }, { status: 500 });
  }

  const payout = await sendPayout(participant.wallet_address, payoutLamports);
  if (!payout.ok) {
    await releaseBountyPayoutLock(id);
    return NextResponse.json({ error: payout.error }, { status: 500 });
  }

  const payoutTx = payout.signature;
  const escrowAddress = getEscrowAddress();

  try {
    await query(
      `update bounty_participants set status = 'approved', reviewed_at = now(), payout_tx = $2 where id = $1`,
      [participant.id, payoutTx],
    );
    await query(
      `update bounty_participants set status = 'rejected', reviewed_at = now()
       where bounty_id = $1 and id != $2 and status = 'submitted'`,
      [id, participant.id],
    );

    await query(
      `update bounties set status = 'paid', payout_tx = $2, paid_at = now(), helper_id = $3, helper_wallet = $4 where id = $1`,
      [id, payoutTx, participant.profile_id, participant.wallet_address],
    );

    await recordEscrowTransaction({
      bountyId: id,
      kind: "payout",
      txSignature: payoutTx,
      lamports: payoutLamports,
      fromWallet: escrowAddress,
      toWallet: participant.wallet_address,
      profileId: participant.profile_id,
    });

    const feathers = helperInfluenceFromLamports(bounty.reward_sol_lamports);
    await query("update profiles set influence = influence + $2 where id = $1", [
      participant.profile_id,
      feathers,
    ]);

    await notify(
      participant.profile_id,
      "bounty_paid",
      `You got paid for: ${bounty.title}. Check your wallet.`,
      `/app/bounties#bounty-${id}`,
    );
  } catch (err) {
    await releaseBountyPayoutLock(id);
    throw err;
  }

  const updated = await getBountyById(id, ctx.profile.id);
  return NextResponse.json({ paid: true, payout_tx: payoutTx, bounty: updated });
}
