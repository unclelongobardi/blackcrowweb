import { NextResponse } from "next/server";
import { getEscrowAddress, isEscrowConfigured } from "@/lib/solana";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const address = getEscrowAddress();
  return NextResponse.json({
    address,
    configured: isEscrowConfigured(),
    network: process.env.SOLANA_NETWORK ?? "mainnet-beta",
  });
}
