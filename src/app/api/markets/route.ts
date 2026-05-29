import { NextResponse } from "next/server";
import { fetchPolymarketMarkets } from "@/lib/polymarket";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const limit = Math.min(48, Number(new URL(request.url).searchParams.get("limit") ?? 24) || 24);
  const markets = await fetchPolymarketMarkets(limit);

  // Best-effort cache so operations can reference live markets.
  if (markets.length && isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      await supabase.from("markets").upsert(
        markets.map((m) => ({ ...m, last_synced: new Date().toISOString() })),
        { onConflict: "id" },
      );
    } catch {
      /* non-fatal */
    }
  }

  return NextResponse.json({ markets });
}
