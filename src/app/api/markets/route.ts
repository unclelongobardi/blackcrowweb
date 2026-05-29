import { NextResponse } from "next/server";
import { fetchPolymarketMarkets } from "@/lib/polymarket";
import { getPool, isDbConfigured } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const limit = Math.min(48, Number(new URL(request.url).searchParams.get("limit") ?? 24) || 24);
  const markets = await fetchPolymarketMarkets(limit);

  // Best-effort cache so operations can reference live markets.
  if (markets.length && isDbConfigured()) {
    try {
      const pool = getPool();
      const values: string[] = [];
      const params: unknown[] = [];
      markets.forEach((m, i) => {
        const b = i * 10;
        values.push(
          `($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5},$${b + 6},$${b + 7},$${b + 8},$${b + 9},$${b + 10}, now())`,
        );
        params.push(
          m.id, m.slug, m.question, m.category, m.image,
          m.yes_price, m.no_price, m.volume, m.end_date, m.url,
        );
      });
      await pool.query(
        `insert into markets (id, slug, question, category, image, yes_price, no_price, volume, end_date, url, last_synced)
         values ${values.join(",")}
         on conflict (id) do update set
           yes_price = excluded.yes_price, no_price = excluded.no_price,
           volume = excluded.volume, last_synced = now()`,
        params,
      );
    } catch {
      /* non-fatal */
    }
  }

  return NextResponse.json({ markets });
}
