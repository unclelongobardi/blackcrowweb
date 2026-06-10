import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { getBountyById } from "@/lib/bounties";
import { query } from "@/lib/db";
import { buildDepositTransaction, canOperateEscrow } from "@/lib/solana";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Returns an unsigned deposit transaction for the creator to sign. */
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
