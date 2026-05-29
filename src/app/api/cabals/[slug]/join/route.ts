import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;

  const { data: cabal } = await ctx.supabase.from("cabals").select("id").eq("slug", slug).maybeSingle();
  if (!cabal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: existing } = await ctx.supabase
    .from("cabal_members")
    .select("cabal_id")
    .eq("cabal_id", cabal.id)
    .eq("profile_id", ctx.profile.id)
    .maybeSingle();

  if (existing) {
    await ctx.supabase
      .from("cabal_members")
      .delete()
      .eq("cabal_id", cabal.id)
      .eq("profile_id", ctx.profile.id);
    return NextResponse.json({ joined: false });
  }

  await ctx.supabase
    .from("cabal_members")
    .insert({ cabal_id: cabal.id, profile_id: ctx.profile.id, role: "operative" });
  return NextResponse.json({ joined: true });
}
