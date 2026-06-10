import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { getBountyById } from "@/lib/bounties";
import { enforceFinancialRateLimit } from "@/lib/financialRateLimit";
import { resolveVerifiedSolanaWallet } from "@/lib/privyWallets";
import { buildDepositTransaction, canOperateEscrow } from "@/lib/solana";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Returns an unsigned deposit transaction for the creator to sign. */
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
  if (bounty.created_by !== ctx.profile.id) {
    return NextResponse.json({ error: "Only the creator can fund this bounty." }, { status: 403 });
  }
  if (bounty.status !== "funding") {
    return NextResponse.json({ error: "Bounty is not awaiting funding." }, { status: 400 });
  }

  const built = await buildDepositTransaction(wallet, BigInt(bounty.reward_sol_lamports), id);
  if ("error" in built) return NextResponse.json({ error: built.error }, { status: 500 });

  return NextResponse.json(built);
}
