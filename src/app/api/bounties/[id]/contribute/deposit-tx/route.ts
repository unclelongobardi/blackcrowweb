import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { getBountyById } from "@/lib/bounties";
import { canContributeToPool } from "@/lib/bountyRules";
import { enforceFinancialRateLimit } from "@/lib/financialRateLimit";
import { resolveVerifiedSolanaWallet } from "@/lib/privyWallets";
import { buildDepositTransaction, canOperateEscrow } from "@/lib/solana";
import { solToLamports } from "@/lib/solanaFormat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CONTRIBUTION_SOL = 50;

/** Build an unsigned SOL deposit tx to add to a bounty pool. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const limited = await enforceFinancialRateLimit(request, ctx.profile.id, "deposit-tx");
  if (limited) return limited;

  if (!canOperateEscrow()) {
    return NextResponse.json({ error: "Escrow wallet is not fully configured on the server." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const requestedWallet = body.wallet_address ? String(body.wallet_address).trim() : null;
  const verified = await resolveVerifiedSolanaWallet(request, ctx, requestedWallet);
  if (!verified.ok) return NextResponse.json({ error: verified.error }, { status: 400 });
  const wallet = verified.address;

  const bounty = await getBountyById(id);
  if (!bounty) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!canContributeToPool(bounty.status, bounty.is_official, bounty.expires_at)) {
    return NextResponse.json({ error: "This bounty is not accepting pool contributions." }, { status: 400 });
  }

  const rewardSol = Number(body.amount_sol);
  if (!Number.isFinite(rewardSol) || rewardSol < 0.01) {
    return NextResponse.json({ error: "Minimum contribution is 0.01 SOL." }, { status: 400 });
  }
  if (rewardSol > MAX_CONTRIBUTION_SOL) {
    return NextResponse.json({ error: `Maximum contribution per tx is ${MAX_CONTRIBUTION_SOL} SOL.` }, { status: 400 });
  }

  const lamports = solToLamports(rewardSol);
  const built = await buildDepositTransaction(wallet, lamports, id);
  if ("error" in built) return NextResponse.json({ error: built.error }, { status: 500 });

  return NextResponse.json({ ...built, lamports: lamports.toString() });
}
