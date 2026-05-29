import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const proof = body.proof ? String(body.proof).slice(0, 400) : null;

  const bounty = await queryOne<{ status: string }>("select status from bounties where id = $1", [id]);
  if (!bounty || bounty.status !== "open") {
    return NextResponse.json({ error: "Bounty not available." }, { status: 400 });
  }

  try {
    await query(
      "insert into bounty_claims (bounty_id, profile_id, proof, status) values ($1, $2, $3, 'pending')",
      [id, ctx.profile.id, proof],
    );
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "23505") return NextResponse.json({ error: "Already claimed." }, { status: 409 });
    return NextResponse.json({ error: "Failed to claim." }, { status: 500 });
  }

  return NextResponse.json({ claimed: true });
}
