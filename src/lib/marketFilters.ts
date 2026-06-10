import type { Market } from "./types";
import { annotateExploitability, pickExploitable } from "./polymarket";

export type MarketFilterOpts = {
  mode?: string;
  category?: string;
  q?: string;
  liquidity?: string;
  sort?: string;
  limit?: number;
};

export type MarketCategoryId = "all" | "weather" | "crypto" | "economy" | "politics" | "sports";

export const MARKET_CATEGORIES: { id: MarketCategoryId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "weather", label: "Weather" },
  { id: "crypto", label: "Crypto" },
  { id: "economy", label: "Economy" },
  { id: "politics", label: "Politics" },
  { id: "sports", label: "Sports" },
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  weather: [
    "temperature", "weather", "rain", "snow", "hurricane", "degrees", "fahrenheit", "celsius",
    "heat", "storm", "wind", "precipitation", "drought", "forecast", "high in", "low in",
    "climate", "hottest", "coldest", "inches of",
  ],
  crypto: [
    "bitcoin", "btc", "ethereum", "eth", "solana", "sol", "crypto", "etf", "token", "coinbase",
    "binance", "xrp", "doge", "memecoin", "altcoin", "blockchain", "defi", "stablecoin",
    "microstrategy", "halving", "sec approve",
  ],
  economy: [
    "fed", "rate", "inflation", "gdp", "recession", "treasury", "jobs", "unemployment", "cpi",
    "powell", "interest", "tariff", "trade deficit", "debt ceiling", "yield", "payroll",
    "fomc", "cut rates", "hike",
  ],
  politics: [
    "election", "president", "trump", "biden", "congress", "senate", "vote", "nominee",
    "supreme court", "governor", "primary", "impeach", "cabinet", "democrat", "republican",
    "parliament", "prime minister", "ceasefire", "sanctions",
  ],
  sports: [
    "nba", "nfl", "fifa", "world cup", "ufc", "mlb", "nhl", "super bowl", "champions league",
    "premier league", "tennis", "golf", "f1", "grand prix", "olympic", "ncaa", "mvp",
  ],
};

export function inferCategory(m: Market): string {
  const text = `${m.question} ${m.category ?? ""}`.toLowerCase();
  for (const [cat, keys] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keys.some((k) => text.includes(k))) return cat;
  }
  const raw = (m.category ?? "other").toLowerCase();
  if (raw.includes("crypto")) return "crypto";
  if (raw.includes("sport")) return "sports";
  if (raw.includes("politic")) return "politics";
  if (raw.includes("weather") || raw.includes("climate")) return "weather";
  if (raw.includes("econom") || raw.includes("financ")) return "economy";
  return raw;
}

export function countByCategory(pool: Market[]): Record<string, number> {
  const counts: Record<string, number> = {
    all: pool.length,
    weather: 0,
    crypto: 0,
    economy: 0,
    politics: 0,
    sports: 0,
    other: 0,
  };
  for (const m of pool) {
    const cat = inferCategory(m);
    if (cat in counts && cat !== "all") counts[cat]++;
    else counts.other++;
  }
  return counts;
}

function matchesCategory(m: Market, cat: string): boolean {
  const inferred = inferCategory(m);
  if (inferred === cat) return true;
  const raw = (m.category ?? "").toLowerCase();
  return raw.includes(cat);
}

export function filterMarkets(pool: Market[], opts: MarketFilterOpts): Market[] {
  const limit = Math.min(150, Math.max(1, opts.limit ?? 100));
  const category = opts.category?.toLowerCase();
  const hasCategory = Boolean(category && category !== "all");

  let markets = annotateExploitability([...pool]);

  if (hasCategory) {
    markets = markets.filter((m) => matchesCategory(m, category!));
  }

  if (opts.mode === "exploitable" && !hasCategory) {
    markets = pickExploitable(markets, Math.max(limit, 120));
    markets = annotateExploitability(markets);
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
  } else if (opts.sort === "volume24") {
    markets.sort((a, b) => (b.volume_24hr ?? 0) - (a.volume_24hr ?? 0));
  } else if (opts.sort === "contested") {
    markets.sort(
      (a, b) =>
        Math.abs(0.5 - (a.yes_price ?? 0.5)) - Math.abs(0.5 - (b.yes_price ?? 0.5)),
    );
  } else if (opts.mode === "exploitable" || opts.sort === "exploitable") {
    markets.sort((a, b) => (a.exploit_score ?? 0) - (b.exploit_score ?? 0));
  } else {
    markets.sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));
  }

  return markets.slice(0, limit);
}
