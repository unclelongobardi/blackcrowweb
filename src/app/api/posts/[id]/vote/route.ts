import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const value = body.value === 1 || body.value === -1 ? body.value : 0;

  const { supabase, profile } = ctx;

  const { data: existing } = await supabase
    .from("post_votes")
    .select("value")
    .eq("post_id", id)
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (value === 0 || (existing && existing.value === value)) {
    // Toggle off.
    await supabase.from("post_votes").delete().eq("post_id", id).eq("profile_id", profile.id);
  } else {
    await supabase
      .from("post_votes")
      .upsert({ post_id: id, profile_id: profile.id, value }, { onConflict: "post_id,profile_id" });
  }

  const { data: votes } = await supabase.from("post_votes").select("value").eq("post_id", id);
  const score = (votes ?? []).reduce((acc, v) => acc + (v.value ?? 0), 0);
  const myVote = value === 0 || (existing && existing.value === value) ? 0 : value;

  return NextResponse.json({ score, my_vote: myVote });
}
