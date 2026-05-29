import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ operations: [] });
  const supabase = getSupabaseAdmin();
  const status = new URL(request.url).searchParams.get("status");

  let query = supabase
    .from("operations")
    .select("*, market:markets(*), cabal:cabals(*), author:profiles(*), operation_joins(profile_id)")
    .order("created_at", { ascending: false })
    .limit(50);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const operations = (data ?? []).map((o) => {
    const { operation_joins, ...rest } = o;
    return { ...rest, member_count: (operation_joins as unknown[] | null)?.length ?? 0 };
  });
  return NextResponse.json({ operations });
}

export async function POST(request: Request) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const title = String(body.title ?? "").trim().slice(0, 80);
  if (title.length < 4) return NextResponse.json({ error: "Title too short." }, { status: 400 });
  const target_side = body.target_side === "NO" ? "NO" : "YES";

  let market_id: string | null = body.market_id ?? null;

  // If a full Polymarket market object is provided, cache it first.
  if (body.market?.id) {
    const m = body.market;
    market_id = String(m.id);
    await ctx.supabase.from("markets").upsert(
      {
        id: market_id,
        slug: m.slug ?? null,
        question: m.question ?? title,
        category: m.category ?? null,
        image: m.image ?? null,
        yes_price: m.yes_price ?? null,
        no_price: m.no_price ?? null,
        volume: m.volume ?? null,
        end_date: m.end_date ?? null,
        url: m.url ?? null,
        last_synced: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
  }

  const { data: op, error } = await ctx.supabase
    .from("operations")
    .insert({
      title,
      thesis: body.thesis ? String(body.thesis).slice(0, 400) : null,
      target_side,
      market_id,
      cabal_id: body.cabal_id ?? null,
      created_by: ctx.profile.id,
      status: "active",
    })
    .select("*, market:markets(*), cabal:cabals(*), author:profiles(*)")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await ctx.supabase.from("operation_joins").insert({
    operation_id: op.id,
    profile_id: ctx.profile.id,
    conviction: 100,
  });

  // Reward: launching an operation grants +10 influence.
  await ctx.supabase
    .from("profiles")
    .update({ influence: ctx.profile.influence + 10 })
    .eq("id", ctx.profile.id);

  return NextResponse.json({ operation: { ...op, member_count: 1 } });
}
