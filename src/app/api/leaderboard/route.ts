import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured()) return NextResponse.json({ operatives: [], cabals: [] });
  const supabase = getSupabaseAdmin();

  const { data: operatives } = await supabase
    .from("profiles")
    .select("id, codename, display_name, avatar_seed, influence")
    .order("influence", { ascending: false })
    .limit(25);

  const { data: cabals } = await supabase
    .from("cabals")
    .select("id, slug, name, motto, emblem_seed, cabal_members(profile_id)")
    .limit(25);

  const rankedCabals = (cabals ?? [])
    .map((c) => {
      const { cabal_members, ...rest } = c;
      return { ...rest, member_count: (cabal_members as unknown[] | null)?.length ?? 0 };
    })
    .sort((a, b) => b.member_count - a.member_count);

  return NextResponse.json({ operatives: operatives ?? [], cabals: rankedCabals });
}
