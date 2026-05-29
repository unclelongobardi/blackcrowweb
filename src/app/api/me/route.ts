import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ authenticated: false, error: "Backend not configured." }, { status: 503 });
  }
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ authenticated: false }, { status: 401 });

  const { supabase, profile } = ctx;
  const [{ count: cabals }, { count: operations }, { count: posts }] = await Promise.all([
    supabase.from("cabal_members").select("*", { count: "exact", head: true }).eq("profile_id", profile.id),
    supabase.from("operation_joins").select("*", { count: "exact", head: true }).eq("profile_id", profile.id),
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("author_id", profile.id),
  ]);

  // Rank by influence.
  const { count: higher } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gt("influence", profile.influence);

  return NextResponse.json({
    authenticated: true,
    profile,
    stats: {
      cabals: cabals ?? 0,
      operations: operations ?? 0,
      posts: posts ?? 0,
      rank: (higher ?? 0) + 1,
    },
  });
}
