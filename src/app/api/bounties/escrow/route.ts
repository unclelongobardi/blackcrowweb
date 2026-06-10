import { NextResponse } from "next/server";
import { getEscrowStatus } from "@/lib/solana";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getEscrowStatus();
  return NextResponse.json(status);
}
