import type { Market } from "./types";

const GAMMA = "https://gamma-api.polymarket.com";
const FETCH_OPTS: RequestInit = { cache: "no-store" };

/** Minimum live markets to pull from Gamma before filtering. */
export const POLYMARKET_POOL_TARGET = 250;
export const POLYMARKET_PAGE_SIZE = 100;

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
  volume24hr?: number;
  liquidity?: string | number;
  liquidityNum?: number;
  endDate?: string;
  outcomePrices?: string | string[];
  tags?: { id?: number; slug?: string; label?: string }[] | string;
  active?: boolean;
  closed?: boolean;
};

type GammaTag = { id: number; slug?: string; label?: string };

type KeysetPayload = { markets?: GammaMarket[]; next_cursor?: string | null };

let tagCache: { at: number; tags: GammaTag[] } | null = null;
const TAG_CACHE_MS = 60 * 60 * 1000;

function mapMarket(m: GammaMarket): Market | null {
  if (!m?.question) return null;
  const prices = parseJsonArray(m.outcomePrices).map((p) => Number(p));
  const volume = Number(m.volumeNum ?? m.volume ?? 0) || 0;
  const liquidity = Number(m.liquidityNum ?? m.liquidity ?? 0) || null;
  const volume24hr = Number(m.volume24hr ?? 0) || null;
  return {
    id: String(m.id),
    slug: m.slug ?? null,
    question: m.question,
    category: m.category ?? null,
    image: m.image ?? m.icon ?? null,
    yes_price: Number.isFinite(prices[0]) ? prices[0] : null,
    no_price: Number.isFinite(prices[1]) ? prices[1] : null,
    volume,
    volume_24hr: volume24hr,
    liquidity,
    end_date: m.endDate ?? null,
    url: m.slug ? `https://polymarket.com/event/${m.slug}` : "https://polymarket.com",
  };
}

function isLive(m: Market): boolean {
  if (m.yes_price == null) return true;
  return m.yes_price > 0.01 && m.yes_price < 0.99;
}

function dedupeMarkets(markets: Market[]): Market[] {
  const seen = new Set<string>();
  const out: Market[] = [];
  for (const m of markets) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    out.push(m);
  }
  return out;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, FETCH_OPTS);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function fetchMarketsLegacyPage(offset: number, limit: number, extra = ""): Promise<Market[]> {
  const url =
    `${GAMMA}/markets?active=true&closed=false&archived=false` +
    `&order=volumeNum&ascending=false&limit=${limit}&offset=${offset}${extra}`;
  const data = await fetchJson<GammaMarket[]>(url);
  if (!Array.isArray(data)) return [];
  return data.map(mapMarket).filter((m): m is Market => m !== null);
}

async function fetchMarketsKeysetPage(
  afterCursor?: string,
  limit = POLYMARKET_PAGE_SIZE,
  extra = "",
): Promise<{ markets: Market[]; nextCursor: string | null }> {
  const params = new URLSearchParams({
    limit: String(Math.min(100, limit)),
    order: "volume_num",
    ascending: "false",
  });
  if (afterCursor) params.set("after_cursor", afterCursor);
  const url = `${GAMMA}/markets/keyset?${params}${extra ? `&${extra.replace(/^\?/, "")}` : ""}`;
  const data = await fetchJson<KeysetPayload | GammaMarket[]>(url);

  if (Array.isArray(data)) {
    return {
      markets: data.map(mapMarket).filter((m): m is Market => m !== null),
      nextCursor: null,
    };
  }
  if (!data?.markets) return { markets: [], nextCursor: null };
  return {
    markets: data.markets.map(mapMarket).filter((m): m is Market => m !== null),
    nextCursor: data.next_cursor ?? null,
  };
}

async function paginateMarkets(target: number, extra = ""): Promise<Market[]> {
  const collected: Market[] = [];
  let cursor: string | null = null;
  let legacyOffset = 0;

  for (let page = 0; page < 6 && collected.length < target; page++) {
    const keyset = await fetchMarketsKeysetPage(cursor ?? undefined, POLYMARKET_PAGE_SIZE, extra);
    if (keyset.markets.length) {
      collected.push(...keyset.markets);
      cursor = keyset.nextCursor;
      if (!cursor) break;
      continue;
    }

    const legacy = await fetchMarketsLegacyPage(legacyOffset, POLYMARKET_PAGE_SIZE, extra);
    if (!legacy.length) break;
    collected.push(...legacy);
    legacyOffset += POLYMARKET_PAGE_SIZE;
    if (legacy.length < POLYMARKET_PAGE_SIZE) break;
  }

  return dedupeMarkets(collected);
}

async function loadTags(): Promise<GammaTag[]> {
  if (tagCache && Date.now() - tagCache.at < TAG_CACHE_MS) return tagCache.tags;
  const tags = await fetchJson<GammaTag[]>(`${GAMMA}/tags?limit=500`);
  const list = Array.isArray(tags) ? tags.filter((t) => t?.id) : [];
  tagCache = { at: Date.now(), tags: list };
  return list;
}

async function fetchMarketsBySearch(query: string, limit = 80): Promise<Market[]> {
  const url = `${GAMMA}/public-search?q=${encodeURIComponent(query)}&limit=${limit}`;
  const data = await fetchJson<{ events?: { markets?: GammaMarket[] }[]; markets?: GammaMarket[] }>(url);
  const raw: GammaMarket[] = [];
  if (Array.isArray(data?.markets)) raw.push(...data.markets);
  if (Array.isArray(data?.events)) {
    for (const ev of data.events) {
      if (Array.isArray(ev.markets)) raw.push(...ev.markets);
    }
  }
  return raw.map(mapMarket).filter((m): m is Market => m !== null);
}

/** Extra Gamma search queries per UI category when tag fetch is sparse. */
const CATEGORY_SEARCH_QUERIES: Record<string, string[]> = {
  weather: ["temperature", "weather", "hurricane", "rainfall"],
  crypto: ["bitcoin", "ethereum", "crypto", "solana"],
  economy: ["fed rate", "inflation", "recession"],
  politics: ["election", "president", "trump"],
  sports: ["nba", "nfl", "super bowl"],
};

/** Map UI category → Polymarket tag slugs/labels to query by tag_id. */
const CATEGORY_TAG_HINTS: Record<string, string[]> = {
  crypto: ["crypto", "bitcoin", "cryptocurrency", "ethereum", "defi"],
  weather: ["weather", "climate", "science", "environment"],
  economy: ["finance", "economics", "fed", "economy", "business"],
  politics: ["politics", "us-politics", "world-politics", "elections", "geopolitics"],
  sports: ["sports", "nba", "nfl", "soccer", "mlb", "nhl", "ufc"],
};

export async function resolveTagIdsForCategory(category: string): Promise<number[]> {
  const hints = CATEGORY_TAG_HINTS[category.toLowerCase()];
  if (!hints?.length) return [];
  const tags = await loadTags();
  const ids = new Set<number>();
  for (const tag of tags) {
    const slug = (tag.slug ?? "").toLowerCase();
    const label = (tag.label ?? "").toLowerCase();
    if (hints.some((h) => slug.includes(h) || label.includes(h) || h.includes(slug))) {
      ids.add(tag.id);
    }
  }
  return [...ids].slice(0, 4);
}

export type PolymarketPoolResult = {
  markets: Market[];
  fetchedAt: string;
  poolSize: number;
};

/** Fetch a wide pool of live Polymarket markets (paginated, real Gamma data). */
export async function fetchPolymarketPool(opts?: {
  minCount?: number;
  category?: string;
}): Promise<PolymarketPoolResult> {
  const minCount = opts?.minCount ?? POLYMARKET_POOL_TARGET;
  const category = opts?.category?.toLowerCase();
  const fetchedAt = new Date().toISOString();

  const batches: Market[][] = [];

  if (category && category !== "all") {
    const tagIds = await resolveTagIdsForCategory(category);
    for (const tagId of tagIds) {
      const tagged = await paginateMarkets(120, `tag_id=${tagId}`);
      if (tagged.length) batches.push(tagged);
    }
    const searches = CATEGORY_SEARCH_QUERIES[category] ?? [];
    for (const q of searches.slice(0, 3)) {
      const found = await fetchMarketsBySearch(q, 60);
      if (found.length) batches.push(found);
    }
  }

  const general = await paginateMarkets(minCount);
  batches.push(general);

  const merged = dedupeMarkets(batches.flat());
  const live = merged.filter(isLive);
  const pool = live.length >= Math.min(minCount, 50) ? live : merged;

  return { markets: pool, fetchedAt, poolSize: pool.length };
}

/** Back-compat: return top N markets from a fresh pool. */
export async function fetchPolymarketMarkets(limit = 24): Promise<Market[]> {
  const { markets } = await fetchPolymarketPool({ minCount: Math.max(limit * 3, 120) });
  return markets.slice(0, limit);
}

/**
 * Prefer balanced, still-open markets (10%–90%) for previews so the UI looks
 * lively instead of showing near-certain outcomes. Falls back to the rest.
 */
const TOPIC_KEYWORDS: Record<number, string[]> = {
  0: [
    "bitcoin", "btc", "ethereum", "eth", "solana", "sol", "crypto", "etf", "coinbase",
    "binance", "stablecoin", "xrp", "doge", "token", "altcoin", "memecoin", "nasdaq",
    "s&p", "stock", "fed", "rate", "inflation", "recession", "gdp", "cpi", "powell",
    "interest", "treasury", "jobs", "unemployment", "market", "price",
  ],
  1: [
    "election", "president", "trump", "biden", "senate", "congress", "government",
    "shutdown", "war", "invade", "nuclear", "ceasefire", "nato", "iran", "ukraine",
    "israel", "putin", "china", "tariff", "supreme court", "nominee", "vote",
  ],
  3: [
    "fifa", "world cup", "nba", "nfl", "super bowl", "champions league", "premier league",
    "la liga", "nba finals", "playoff", "ballon d", "uefa", "mlb", "nhl", "ncaa",
    "f1", "grand prix", "olympic", "tournament", "golf", "tennis", "boxing", "ufc",
  ],
};

function topicScore(m: Market): number {
  const text = `${m.question} ${m.category ?? ""}`.toLowerCase();
  if (TOPIC_KEYWORDS[3].some((k) => text.includes(k))) return 3;
  if (TOPIC_KEYWORDS[0].some((k) => text.includes(k))) return 0;
  if (TOPIC_KEYWORDS[1].some((k) => text.includes(k))) return 1;
  return 2;
}

export function pickInteresting(markets: Market[], n = 14): Market[] {
  const balanced = markets.filter(
    (m) => m.yes_price != null && m.yes_price >= 0.1 && m.yes_price <= 0.9,
  );
  const rank = (m: Market) => topicScore(m) * 10 + Math.abs(0.5 - (m.yes_price ?? 0));
  balanced.sort((a, b) => rank(a) - rank(b));
  if (balanced.length >= Math.min(n, 5)) return balanced.slice(0, n);
  const rest = markets.filter((m) => !balanced.includes(m));
  return [...balanced, ...rest].slice(0, n);
}

const EXPLOIT_KEYWORDS = [
  "temperature", "temp", "weather", "rain", "snow", "hurricane", "storm", "heat",
  "fahrenheit", "celsius", "high in", "low in", "above", "below", "degrees",
  "city", "london", "nyc", "new york", "chicago", "miami", "paris", "tokyo",
  "population", "count", "number of", "will there be", "daily", "weekly",
];

function exploitKeywordBonus(m: Market): number {
  const text = m.question.toLowerCase();
  return EXPLOIT_KEYWORDS.some((k) => text.includes(k)) ? -15 : 0;
}

function liquidityTier(volume: number): Market["liquidity_tier"] {
  if (volume < 25_000) return "thin";
  if (volume < 150_000) return "medium";
  return "thick";
}

export function exploitScore(m: Market): number {
  const vol = m.volume ?? 0;
  const contested = Math.abs(0.5 - (m.yes_price ?? 0.5));
  const volScore = Math.log10(Math.max(vol, 500));
  return volScore * 20 + contested * 30 + exploitKeywordBonus(m) + topicScore(m) * 5;
}

export function annotateExploitability(markets: Market[]): Market[] {
  return markets.map((m) => ({
    ...m,
    exploit_score: exploitScore(m),
    liquidity_tier: liquidityTier(m.volume ?? 0),
  }));
}

export function pickExploitable(markets: Market[], n = 18): Market[] {
  const live = markets.filter(
    (m) => m.yes_price != null && m.yes_price > 0.05 && m.yes_price < 0.95,
  );
  const thin = live.filter((m) => (m.volume ?? 0) < 200_000);
  const pool = thin.length >= 6 ? thin : live;
  const ranked = annotateExploitability([...pool]);
  ranked.sort((a, b) => (a.exploit_score ?? 0) - (b.exploit_score ?? 0));
  return ranked.slice(0, n);
}

export function computeMarketStats(markets: Market[]) {
  const totalVol = markets.reduce((s, m) => s + (m.volume ?? 0), 0);
  const vol24 = markets.reduce((s, m) => s + (m.volume_24hr ?? 0), 0);
  const thin = markets.filter((m) => m.liquidity_tier === "thin").length;
  const medium = markets.filter((m) => m.liquidity_tier === "medium").length;
  const thick = markets.filter((m) => m.liquidity_tier === "thick").length;
  const contested = markets.filter(
    (m) => m.yes_price != null && m.yes_price >= 0.35 && m.yes_price <= 0.65,
  ).length;
  const avgYes =
    markets.length > 0
      ? markets.reduce((s, m) => s + (m.yes_price != null ? m.yes_price * 100 : 50), 0) / markets.length
      : 50;
  const avgSpread =
    markets.length > 0
      ? markets.reduce(
          (s, m) => s + Math.abs(50 - (m.yes_price != null ? m.yes_price * 100 : 50)),
          0,
        ) / markets.length
      : 0;
  return { totalVol, vol24, thin, medium, thick, contested, avgYes, avgSpread, count: markets.length };
}
