import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
}

export async function GET() {
  if (!isSupabaseConfigured()) return NextResponse.json({ cabals: [] });
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("cabals")
    .select("*, cabal_members(profile_id)")
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const cabals = (data ?? []).map((c) => {
    const { cabal_members, ...rest } = c;
    return { ...rest, member_count: (cabal_members as unknown[] | null)?.length ?? 0 };
  });
  return NextResponse.json({ cabals });
}

export async function POST(request: Request) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim().slice(0, 50);
  if (name.length < 3) return NextResponse.json({ error: "Name too short." }, { status: 400 });
  const slug = slugify(name);

  const { data: exists } = await ctx.supabase.from("cabals").select("id").eq("slug", slug).maybeSingle();
  if (exists) return NextResponse.json({ error: "A cabal with that name exists." }, { status: 409 });

  const { data: cabal, error } = await ctx.supabase
    .from("cabals")
    .insert({
      slug,
      name,
      motto: body.motto ? String(body.motto).slice(0, 80) : null,
      description: body.description ? String(body.description).slice(0, 280) : null,
      emblem_seed: slug,
      created_by: ctx.profile.id,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await ctx.supabase
    .from("cabal_members")
    .insert({ cabal_id: cabal.id, profile_id: ctx.profile.id, role: "leader" });

  // Reward: founding a cabal grants +20 influence.
  await ctx.supabase
    .from("profiles")
    .update({ influence: ctx.profile.influence + 20 })
    .eq("id", ctx.profile.id);

  return NextResponse.json({ cabal: { ...cabal, member_count: 1 } });
}
