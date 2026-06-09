import type { Market } from "./types";

const GAMMA = "https://gamma-api.polymarket.com";

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

type GammaMarket = {
  id: string | number;
  question?: string;
  slug?: string;
  image?: string;
  icon?: string;
  category?: string;
  volume?: string | number;
  volumeNum?: number;
  endDate?: string;
  outcomePrices?: string | string[];
};

function mapMarket(m: GammaMarket): Market | null {
  if (!m?.question) return null;
  const prices = parseJsonArray(m.outcomePrices).map((p) => Number(p));
  const volume = Number(m.volumeNum ?? m.volume ?? 0) || 0;
  return {
    id: String(m.id),
    slug: m.slug ?? null,
    question: m.question,
    category: m.category ?? null,
    image: m.image ?? m.icon ?? null,
    yes_price: Number.isFinite(prices[0]) ? prices[0] : null,
    no_price: Number.isFinite(prices[1]) ? prices[1] : null,
    volume,
    end_date: m.endDate ?? null,
    url: m.slug ? `https://polymarket.com/event/${m.slug}` : "https://polymarket.com",
  };
}

async function tryFetch(url: string): Promise<Market[] | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = (await res.json()) as GammaMarket[];
    if (!Array.isArray(data)) return null;
    return data.map(mapMarket).filter((m): m is Market => m !== null);
  } catch {
    return null;
  }
}

/** Fetch the most active Polymarket markets (read-only, public Gamma API). */
export async function fetchPolymarketMarkets(limit = 24): Promise<Market[]> {
  // Fetch a wider pool so we can drop already-resolved markets and still fill `limit`.
  const pool = Math.max(limit, Math.min(80, limit * 3));
  const urls = [
    `${GAMMA}/markets?active=true&closed=false&archived=false&order=volumeNum&ascending=false&limit=${pool}`,
    `${GAMMA}/markets?closed=false&limit=${pool}`,
    `${GAMMA}/markets?limit=${pool}`,
  ];
  for (const url of urls) {
    const markets = await tryFetch(url);
    if (markets && markets.length) {
      // Drop effectively-resolved markets (price pinned at the extremes).
      const live = markets.filter(
        (m) => m.yes_price != null && m.yes_price > 0.02 && m.yes_price < 0.98,
      );
      return (live.length ? live : markets).slice(0, limit);
    }
  }
  return [];
}

/**
 * Prefer balanced, still-open markets (10%–90%) for previews so the UI looks
 * lively instead of showing near-certain outcomes. Falls back to the rest.
 */
const TOPIC_KEYWORDS: Record<number, string[]> = {
  // 0 = most on-brand (crypto / markets / economy)
  0: [
    "bitcoin", "btc", "ethereum", "eth", "solana", "sol", "crypto", "etf", "coinbase",
    "binance", "stablecoin", "xrp", "doge", "token", "altcoin", "memecoin", "nasdaq",
    "s&p", "stock", "fed", "rate", "inflation", "recession", "gdp", "cpi", "powell",
    "interest", "treasury", "jobs", "unemployment", "market", "price",
  ],
  // 1 = politics / geopolitics
  1: [
    "election", "president", "trump", "biden", "senate", "congress", "government",
    "shutdown", "war", "invade", "nuclear", "ceasefire", "nato", "iran", "ukraine",
    "israel", "putin", "china", "tariff", "supreme court", "nominee", "vote",
  ],
  // 3 = sports (deprioritized)
  3: [
    "fifa", "world cup", "nba", "nfl", "super bowl", "champions league", "premier league",
    "la liga", "finals", "playoff", "match", "win the", "ballon", "uefa", "mlb", "nhl",
    "f1", "grand prix", "olympic", "tournament",
  ],
};

function topicScore(m: Market): number {
  const text = `${m.question} ${m.category ?? ""}`.toLowerCase();
  if (TOPIC_KEYWORDS[3].some((k) => text.includes(k))) return 3; // sports last
  if (TOPIC_KEYWORDS[0].some((k) => text.includes(k))) return 0;
  if (TOPIC_KEYWORDS[1].some((k) => text.includes(k))) return 1;
  return 2;
}

export function pickInteresting(markets: Market[], n = 14): Market[] {
  const balanced = markets.filter(
    (m) => m.yes_price != null && m.yes_price >= 0.1 && m.yes_price <= 0.9,
  );
  // Sort: on-brand topics first, then most contested (closest to 50/50).
  const rank = (m: Market) => topicScore(m) * 10 + Math.abs(0.5 - (m.yes_price ?? 0));
  balanced.sort((a, b) => rank(a) - rank(b));

  // Only backfill with extremes if we genuinely don't have enough balanced ones.
  if (balanced.length >= Math.min(n, 5)) return balanced.slice(0, n);
  const rest = markets.filter((m) => !balanced.includes(m));
  return [...balanced, ...rest].slice(0, n);
}
