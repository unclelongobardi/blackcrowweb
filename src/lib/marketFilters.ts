import type { Market } from "./types";
import { annotateExploitability, pickExploitable, pickInteresting } from "./polymarket";

export type MarketFilterOpts = {
  mode?: string;
  category?: string;
  q?: string;
  liquidity?: string;
  sort?: string;
  limit?: number;
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  weather: ["temperature", "weather", "rain", "snow", "hurricane", "degrees", "fahrenheit", "celsius"],
  crypto: ["bitcoin", "btc", "ethereum", "eth", "solana", "crypto", "etf", "token"],
  economy: ["fed", "rate", "inflation", "gdp", "recession", "treasury", "jobs"],
  politics: ["election", "president", "trump", "biden", "congress", "senate", "vote"],
  sports: ["nba", "nfl", "fifa", "world cup", "ufc", "mlb", "nhl"],
};

function inferCategory(m: Market): string {
  const text = `${m.question} ${m.category ?? ""}`.toLowerCase();
  for (const [cat, keys] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keys.some((k) => text.includes(k))) return cat;
  }
  return (m.category ?? "other").toLowerCase();
}

export function filterMarkets(pool: Market[], opts: MarketFilterOpts): Market[] {
  const limit = Math.min(48, opts.limit ?? 24);
  let markets =
    opts.mode === "exploitable" ? pickExploitable(pool, 120) : pickInteresting(pool, 120);
  markets = annotateExploitability(markets);

  if (opts.category && opts.category !== "all") {
    const cat = opts.category.toLowerCase();
    markets = markets.filter((m) => inferCategory(m) === cat || (m.category ?? "").toLowerCase().includes(cat));
  }

  if (opts.liquidity === "thin") {
    markets = markets.filter((m) => m.liquidity_tier === "thin");
  } else if (opts.liquidity === "medium") {
    markets = markets.filter((m) => m.liquidity_tier === "medium");
  }

  if (opts.q?.trim()) {
    const q = opts.q.trim().toLowerCase();
    markets = markets.filter(
      (m) =>
        m.question.toLowerCase().includes(q) ||
        (m.slug ?? "").toLowerCase().includes(q) ||
        (m.category ?? "").toLowerCase().includes(q),
    );
  }

  if (opts.sort === "volume") {
    markets.sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));
  } else if (opts.sort === "contested") {
    markets.sort(
      (a, b) =>
        Math.abs(0.5 - (a.yes_price ?? 0.5)) - Math.abs(0.5 - (b.yes_price ?? 0.5)),
    );
  } else if (opts.mode === "exploitable" || opts.sort === "exploitable") {
    markets.sort((a, b) => (a.exploit_score ?? 0) - (b.exploit_score ?? 0));
  }

  return markets.slice(0, limit);
}

export { inferCategory };
