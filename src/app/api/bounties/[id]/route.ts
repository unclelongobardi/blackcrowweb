import { NextResponse } from "next/server";
import { getProfileId } from "@/lib/auth";
import { getBountyById } from "@/lib/bounties";
import { isDbConfigured } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  const { id } = await params;
  const myId = await getProfileId(request);
  const bounty = await getBountyById(id, myId);
  if (!bounty) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ bounty });
}
