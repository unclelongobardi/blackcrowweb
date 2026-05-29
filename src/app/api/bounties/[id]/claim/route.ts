import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const proof = body.proof ? String(body.proof).slice(0, 400) : null;

  const { data: bounty } = await ctx.supabase.from("bounties").select("*").eq("id", id).maybeSingle();
  if (!bounty || bounty.status !== "open") {
    return NextResponse.json({ error: "Bounty not available." }, { status: 400 });
  }

  const { error } = await ctx.supabase
    .from("bounty_claims")
    .insert({ bounty_id: id, profile_id: ctx.profile.id, proof, status: "pending" });
  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Already claimed." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ claimed: true });
}
