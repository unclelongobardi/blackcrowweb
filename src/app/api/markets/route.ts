import { NextResponse } from "next/server";
import { fetchPolymarketPool, computeMarketStats } from "@/lib/polymarket";
import { countByCategory, filterMarkets } from "@/lib/marketFilters";
import { getPool, isDbConfigured } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category") ?? undefined;
  const isWorldCup = category?.toLowerCase() === "world_cup";
  const limit = isWorldCup
    ? Math.min(300, Number(url.searchParams.get("limit") ?? 250) || 250)
    : Number(url.searchParams.get("limit") ?? 100) || 100;

  const { markets: pool, fetchedAt, poolSize } = await fetchPolymarketPool({
    minCount: isWorldCup ? 200 : 250,
    category: category && category !== "all" ? category : undefined,
  });

  const markets = filterMarkets(pool, {
    mode: url.searchParams.get("mode") ?? undefined,
    category,
    q: url.searchParams.get("q") ?? undefined,
    liquidity: url.searchParams.get("liquidity") ?? undefined,
    sort: isWorldCup && !url.searchParams.get("sort") ? "date" : url.searchParams.get("sort") ?? undefined,
    limit,
  });

  const categoryCounts = countByCategory(pool);
  const stats = computeMarketStats(markets);

  if (markets.length && isDbConfigured()) {
    try {
      const db = getPool();
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
      await db.query(
        `insert into markets (id, slug, question, category, image, yes_price, no_price, volume, end_date, url, last_synced)
         values ${values.join(",")}
         on conflict (id) do update set
           slug = excluded.slug,
           question = excluded.question,
           category = excluded.category,
           image = excluded.image,
           yes_price = excluded.yes_price,
           no_price = excluded.no_price,
           volume = excluded.volume,
           end_date = excluded.end_date,
           url = excluded.url,
           last_synced = now()`,
        params,
      );
    } catch {
      /* non-fatal */
    }
  }

  return NextResponse.json({
    markets,
    meta: {
      synced_at: fetchedAt,
      pool_size: poolSize,
      returned: markets.length,
      category_counts: categoryCounts,
      stats,
    },
  });
}
