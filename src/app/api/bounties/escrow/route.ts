import { NextResponse } from "next/server";
import { getEscrowStatus } from "@/lib/solana";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public escrow metadata for deposit UX (no balance/liability). */
export async function GET() {
  const status = await getEscrowStatus();
  return NextResponse.json({
    configured: status.configured,
    signingConfigured: status.signingConfigured,
    address: status.address,
    network: status.network,
  });
}
