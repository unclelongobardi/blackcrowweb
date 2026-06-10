import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { getBountyById } from "@/lib/bounties";
import { canContributeToPool } from "@/lib/bountyRules";
import { helperInfluenceFromLamports } from "@/lib/bountyInfluence";
import { isEscrowTxSignatureUsed, recordEscrowTransaction } from "@/lib/escrowLedger";
import { query } from "@/lib/db";
import { notify } from "@/lib/notifications";
import { canOperateEscrow, getEscrowAddress, verifyDepositTx } from "@/lib/solana";
import { solToLamports } from "@/lib/solanaFormat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  if (!canOperateEscrow()) {
    return NextResponse.json({ error: "Escrow wallet is not fully configured on the server." }, { status: 503 });
  }

  const bounty = await getBountyById(id);
  if (!bounty) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!canContributeToPool(bounty.status, bounty.is_official, bounty.expires_at)) {
    return NextResponse.json({ error: "This bounty is not accepting pool contributions." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const txSignature = String(body.tx_signature ?? "").trim();
  const rewardSol = Number(body.amount_sol);
  if (!txSignature) return NextResponse.json({ error: "Transaction signature required." }, { status: 400 });
  if (!Number.isFinite(rewardSol) || rewardSol < 0.01) {
    return NextResponse.json({ error: "Invalid contribution amount." }, { status: 400 });
  }

  const lamports = solToLamports(rewardSol);

  if (await isEscrowTxSignatureUsed(txSignature)) {
    return NextResponse.json({ error: "Transaction already recorded." }, { status: 409 });
  }

  const verified = await verifyDepositTx(txSignature, lamports, id, ctx.profile.wallet_address);
  if (!verified.ok) return NextResponse.json({ error: verified.error }, { status: 400 });

  await query(
    `insert into bounty_contributions (bounty_id, profile_id, lamports, tx_signature)
     values ($1, $2, $3, $4)`,
    [id, ctx.profile.id, lamports.toString(), txSignature],
  );

  const newTotal = BigInt(bounty.reward_sol_lamports) + lamports;
  const newInfluence = helperInfluenceFromLamports(newTotal);

  await query(
    `update bounties set reward_sol_lamports = $2, reward_influence = $3 where id = $1`,
    [id, newTotal.toString(), newInfluence],
  );

  await recordEscrowTransaction({
    bountyId: id,
    kind: "contribution",
    txSignature,
    lamports: verified.receivedLamports,
    fromWallet: ctx.profile.wallet_address,
    toWallet: getEscrowAddress(),
    profileId: ctx.profile.id,
  });

  if (bounty.created_by && bounty.created_by !== ctx.profile.id) {
    await notify(
      bounty.created_by,
      "bounty_contribution",
      `${ctx.profile.codename} added ${rewardSol} SOL to your bounty pool`,
      `/app`,
    );
  }

  const updated = await getBountyById(id, ctx.profile.id);
  return NextResponse.json({
    contributed: true,
    pool_sol_lamports: newTotal.toString(),
    reward_influence: newInfluence,
    bounty: updated,
  });
}
