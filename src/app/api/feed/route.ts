import { NextResponse } from "next/server";
import { getAuthedProfile, verifyDid } from "@/lib/auth";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VoteRow = { value: number };

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ posts: [] });
  const supabase = getSupabaseAdmin();
  const url = new URL(request.url);
  const operationId = url.searchParams.get("operation_id");
  const marketId = url.searchParams.get("market_id");

  let query = supabase
    .from("posts")
    .select("*, author:profiles(*), market:markets(*), post_votes(value)")
    .is("parent_id", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (operationId) query = query.eq("operation_id", operationId);
  if (marketId) query = query.eq("market_id", marketId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Who is asking (for my_vote)?
  const did = await verifyDid(request);
  let myId: string | null = null;
  if (did) {
    const { data: me } = await supabase.from("profiles").select("id").eq("privy_did", did).maybeSingle();
    myId = me?.id ?? null;
  }

  const ids = (data ?? []).map((p) => p.id);
  const replyCounts: Record<string, number> = {};
  const myVotes: Record<string, number> = {};
  if (ids.length) {
    const { data: replies } = await supabase.from("posts").select("parent_id").in("parent_id", ids);
    for (const r of replies ?? []) {
      if (r.parent_id) replyCounts[r.parent_id] = (replyCounts[r.parent_id] ?? 0) + 1;
    }
    if (myId) {
      const { data: votes } = await supabase
        .from("post_votes")
        .select("post_id, value")
        .eq("profile_id", myId)
        .in("post_id", ids);
      for (const v of votes ?? []) myVotes[v.post_id] = v.value;
    }
  }

  const posts = (data ?? []).map((p) => {
    const votes = (p.post_votes as VoteRow[] | null) ?? [];
    const score = votes.reduce((acc, v) => acc + (v.value ?? 0), 0);
    const { post_votes, ...rest } = p;
    void post_votes;
    return {
      ...rest,
      score,
      reply_count: replyCounts[p.id] ?? 0,
      my_vote: myVotes[p.id] ?? 0,
    };
  });

  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const content = String(body.content ?? "").trim();
  if (!content || content.length > 600) {
    return NextResponse.json({ error: "Post must be 1-600 characters." }, { status: 400 });
  }
  const sentiment = ["bullish", "bearish", "neutral"].includes(body.sentiment) ? body.sentiment : "neutral";

  const { data, error } = await ctx.supabase
    .from("posts")
    .insert({
      author_id: ctx.profile.id,
      content,
      sentiment,
      market_id: body.market_id ?? null,
      operation_id: body.operation_id ?? null,
      parent_id: body.parent_id ?? null,
    })
    .select("*, author:profiles(*), market:markets(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Reward: posting intel grants +2 influence.
  await ctx.supabase
    .from("profiles")
    .update({ influence: ctx.profile.influence + 2 })
    .eq("id", ctx.profile.id);

  return NextResponse.json({ post: { ...data, score: 0, reply_count: 0, my_vote: 0 } });
}
