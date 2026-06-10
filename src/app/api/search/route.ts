import { NextResponse } from "next/server";
import { fetchPolymarketMarkets } from "@/lib/polymarket";
import { filterMarkets } from "@/lib/marketFilters";
import { isDbConfigured, query } from "@/lib/db";
import type { Cabal, Profile } from "@/lib/types";
import { PUBLIC_PROFILE_SQL } from "@/lib/profilePublic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const type = url.searchParams.get("type") ?? "all";

  const result: {
    markets: ReturnType<typeof filterMarkets>;
    users: Profile[];
    cabals: Cabal[];
  } = { markets: [], users: [], cabals: [] };

  if (!q) return NextResponse.json(result);

  if (type === "all" || type === "markets") {
    const pool = await fetchPolymarketMarkets(150);
    result.markets = filterMarkets(pool, { q, limit: 12 });
  }

  if (isDbConfigured() && (type === "all" || type === "users")) {
    result.users = await query<Profile>(
      `select ${PUBLIC_PROFILE_SQL}
       from profiles
       where codename ilike $1 or display_name ilike $1
       order by influence desc
       limit 8`,
      [`%${q}%`],
    );
  }

  if (isDbConfigured() && (type === "all" || type === "cabals")) {
    result.cabals = await query<Cabal>(
      `select c.*, (select count(*) from cabal_members m where m.cabal_id = c.id)::int as member_count
       from cabals c
       where c.visibility = 'public' and (c.name ilike $1 or c.slug ilike $1 or c.description ilike $1)
       limit 8`,
      [`%${q}%`],
    );
  }

  return NextResponse.json(result);
}
