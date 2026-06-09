import { NextResponse } from "next/server";

/** @deprecated Use /accept instead */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    { error: "Use POST /api/bounties/[id]/accept to take a bounty." },
    { status: 410 },
  );
}
