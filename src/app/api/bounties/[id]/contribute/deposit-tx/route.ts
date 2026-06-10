import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { getBountyById } from "@/lib/bounties";
import { canContributeToPool } from "@/lib/bountyRules";
import { query } from "@/lib/db";
import { buildDepositTransaction, canOperateEscrow } from "@/lib/solana";
import { solToLamports } from "@/lib/solanaFormat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Build an unsigned SOL deposit tx to add to a bounty pool. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  if (!canOperateEscrow()) {
    return NextResponse.json({ error: "Escrow wallet is not fully configured on the server." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const wallet = body.wallet_address ? String(body.wallet_address).trim() : ctx.profile.wallet_address;
  if (!wallet) return NextResponse.json({ error: "Connect a Solana wallet first." }, { status: 400 });
  if (wallet !== ctx.profile.wallet_address) {
    await query("update profiles set wallet_address = $1 where id = $2", [wallet, ctx.profile.id]);
  }

  const bounty = await getBountyById(id);
  if (!bounty) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!canContributeToPool(bounty.status, bounty.is_official, bounty.expires_at)) {
    return NextResponse.json({ error: "This bounty is not accepting pool contributions." }, { status: 400 });
  }

  const rewardSol = Number(body.amount_sol);
  if (!Number.isFinite(rewardSol) || rewardSol < 0.01) {
    return NextResponse.json({ error: "Minimum contribution is 0.01 SOL." }, { status: 400 });
  }
  if (rewardSol > 50) {
    return NextResponse.json({ error: "Maximum contribution per tx is 50 SOL." }, { status: 400 });
  }

  const lamports = solToLamports(rewardSol);
  const built = await buildDepositTransaction(wallet, lamports, id);
  if ("error" in built) return NextResponse.json({ error: built.error }, { status: 500 });

  return NextResponse.json({ ...built, lamports: lamports.toString() });
}
