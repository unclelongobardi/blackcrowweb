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
  const urls = [
    `${GAMMA}/markets?active=true&closed=false&archived=false&order=volumeNum&ascending=false&limit=${limit}`,
    `${GAMMA}/markets?closed=false&limit=${limit}`,
    `${GAMMA}/markets?limit=${limit}`,
  ];
  for (const url of urls) {
    const markets = await tryFetch(url);
    if (markets && markets.length) return markets;
  }
  return [];
}
