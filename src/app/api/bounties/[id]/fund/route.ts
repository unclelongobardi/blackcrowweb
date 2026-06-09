import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { getBountyById } from "@/lib/bounties";
import { creatorPostInfluenceFromLamports } from "@/lib/bountyInfluence";
import { query } from "@/lib/db";
import { verifyDepositTx } from "@/lib/solana";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const bounty = await getBountyById(id);
  if (!bounty) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (bounty.created_by !== ctx.profile.id) {
    return NextResponse.json({ error: "Only the bounty creator can fund it." }, { status: 403 });
  }
  if (bounty.status !== "funding") {
    return NextResponse.json({ error: "Bounty is not awaiting funding." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const txSignature = String(body.tx_signature ?? "").trim();
  if (!txSignature) return NextResponse.json({ error: "Transaction signature required." }, { status: 400 });

  const verified = await verifyDepositTx(
    txSignature,
    BigInt(bounty.reward_sol_lamports),
    id,
    ctx.profile.wallet_address,
  );
  if (!verified.ok) return NextResponse.json({ error: verified.error }, { status: 400 });

  const creatorFeathers = creatorPostInfluenceFromLamports(bounty.reward_sol_lamports);

  await query(
    `update bounties set status = 'open', deposit_tx = $2, funded_at = now(), creator_wallet = $3,
       creator_base_lamports = reward_sol_lamports
     where id = $1`,
    [id, txSignature, ctx.profile.wallet_address],
  );

  await query("update profiles set influence = influence + $2 where id = $1", [
    ctx.profile.id,
    creatorFeathers,
  ]);

  return NextResponse.json({ funded: true, status: "open", creator_feathers: creatorFeathers });
}
