"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useApi } from "@/lib/useApi";
import { useGuestGuard } from "@/hooks/useGuestGuard";
import { compactNumber } from "@/lib/format";
import CreateBountyModal from "@/components/app/CreateBountyModal";
import MarketCard from "@/components/app/MarketCard";
import { IconFlame, IconGrid, IconRepeat } from "@/components/icons";
import { MARKET_CATEGORIES } from "@/lib/marketFilters";
import type { Market } from "@/lib/types";
import { uiBtnPrimary } from "@/lib/uiClasses";

const REFRESH_MS = 45_000;
const MARKETS_FETCH_LIMIT = 100;

type MarketsMeta = {
  synced_at: string;
  pool_size: number;
  returned: number;
  category_counts: Record<string, number>;
  stats: {
    totalVol: number;
    vol24: number;
    thin: number;
    medium: number;
    thick: number;
    contested: number;
    avgYes: number;
    avgSpread: number;
    count: number;
  };
};

function secondsAgo(iso: string | null): number {
  if (!iso) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
}

function MarketsContent() {
  const api = useApi();
  const router = useRouter();
  const { requireAuth } = useGuestGuard();
  const searchParams = useSearchParams();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [meta, setMeta] = useState<MarketsMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bountyTarget, setBountyTarget] = useState<Market | null>(null);
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const [tick, setTick] = useState(0);
  const initialLoad = useRef(true);

  const mode = searchParams.get("mode") ?? "";
  const category = searchParams.get("category") ?? "all";
  const q = searchParams.get("q") ?? "";
  const liquidity = searchParams.get("liquidity") ?? "all";
  const sort = searchParams.get("sort") ?? "volume";

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      try {
        const params = new URLSearchParams({ limit: String(MARKETS_FETCH_LIMIT) });
        if (mode) params.set("mode", mode);
        if (category !== "all") params.set("category", category);
        if (q) params.set("q", q);
        if (liquidity !== "all") params.set("liquidity", liquidity);
        if (sort) params.set("sort", sort);
        const data = await api<{ markets: Market[]; meta: MarketsMeta }>(`/api/markets?${params}`);
        setMarkets(data.markets);
        setMeta(data.meta);
      } finally {
        setLoading(false);
        setRefreshing(false);
        initialLoad.current = false;
      }
    },
    [api, mode, category, q, liquidity, sort],
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      if (!initialLoad.current) load(true);
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  const stats = useMemo(() => {
    if (meta?.stats) {
      return {
        ...meta.stats,
        poolSize: meta.pool_size,
        syncedAt: meta.synced_at,
        categoryCounts: meta.category_counts,
      };
    }
    const totalVol = markets.reduce((s, m) => s + (m.volume ?? 0), 0);
    const thin = markets.filter((m) => m.liquidity_tier === "thin").length;
    const contested = markets.filter(
      (m) => m.yes_price != null && m.yes_price >= 0.35 && m.yes_price <= 0.65,
    ).length;
    const maxVolume = Math.max(...markets.map((m) => m.volume ?? 0), 1);
    return {
      count: markets.length,
      totalVol,
      vol24: 0,
      thin,
      medium: 0,
      thick: 0,
      contested,
      avgYes: 50,
      avgSpread: 0,
      maxVolume,
      poolSize: markets.length,
      syncedAt: null as string | null,
      categoryCounts: {} as Record<string, number>,
    };
  }, [markets, meta]);

  const maxVolume = Math.max(...markets.map((m) => m.volume ?? 0), 1);
  const ageSec = secondsAgo(stats.syncedAt);
  const nextRefresh = Math.max(0, Math.ceil((REFRESH_MS - ageSec * 1000) / 1000));

  function setFilter(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value === "all" || !value) p.delete(key);
    else p.set(key, value);
    router.push(`/app/markets?${p.toString()}`);
  }

  function applySearch() {
    setFilter("q", searchInput.trim());
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-6">
      <header className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-label">Polymarket intel</p>
            <h1 className="font-display text-2xl font-extrabold tracking-tight">MARKETS</h1>
            <p className="mt-1 max-w-xl text-[13px] text-faint">
              Live books from Polymarket Gamma — {MARKETS_FETCH_LIMIT}+ markets, auto-refresh every 45s. Real volume,
              prices, and liquidity tiers.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {stats.syncedAt && (
              <span className="hidden text-[11px] text-faint sm:inline">
                Synced {ageSec}s ago · next {nextRefresh}s
              </span>
            )}
            <button
              type="button"
              onClick={() => load(true)}
              disabled={refreshing}
              className="ui-btn flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-[11px] font-semibold text-muted hover:text-foreground disabled:opacity-60"
            >
              <IconRepeat className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "SYNCING…" : "REFRESH"}
            </button>
          </div>
        </div>

        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
          >
            {[
              { label: "Showing", value: String(stats.count), sub: `of ${stats.poolSize} scanned` },
              { label: "Total volume", value: `$${compactNumber(stats.totalVol)}`, sub: "lifetime" },
              { label: "24h volume", value: `$${compactNumber(stats.vol24)}`, sub: "recent flow" },
              { label: "Thin books", value: String(stats.thin), sub: `${stats.medium} med · ${stats.thick} thick` },
              { label: "Contested", value: String(stats.contested), sub: "35–65% YES" },
              { label: "Avg YES", value: `${Math.round(stats.avgYes)}%`, sub: `${stats.avgSpread.toFixed(0)}pt from 50/50` },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-line bg-surface/30 px-3 py-3 sm:px-4">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-faint sm:text-[10px]">{s.label}</p>
                <p className="mt-1 font-mono text-lg font-bold text-foreground sm:text-xl">{s.value}</p>
                <p className="text-[9px] text-muted sm:text-[10px]">{s.sub}</p>
              </div>
            ))}
          </motion.div>
        )}
      </header>

      <div className="mb-4 flex flex-wrap gap-2 rounded-2xl border border-line bg-surface/20 p-3">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applySearch()}
          placeholder="Search question, slug, category…"
          className="min-w-[200px] flex-1 rounded-xl border border-line bg-surface/60 px-4 py-2.5 text-[13px] outline-none focus:border-bull/40"
        />
        <button
          onClick={applySearch}
          className={`${uiBtnPrimary} rounded-xl px-4 py-2.5 text-[12px] font-bold`}
        >
          SEARCH
        </button>
        <select
          value={mode}
          onChange={(e) => setFilter("mode", e.target.value)}
          className="rounded-xl border border-line bg-surface/60 px-3 py-2.5 text-[12px]"
        >
          <option value="">All active</option>
          <option value="exploitable">Thin books only</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setFilter("sort", e.target.value)}
          className="rounded-xl border border-line bg-surface/60 px-3 py-2.5 text-[12px]"
        >
          <option value="volume">Highest volume</option>
          <option value="date">End date</option>
          <option value="volume24">24h volume</option>
          <option value="contested">Most contested</option>
          <option value="exploitable">Most exploitable</option>
        </select>
        <select
          value={liquidity}
          onChange={(e) => setFilter("liquidity", e.target.value)}
          className="rounded-xl border border-line bg-surface/60 px-3 py-2.5 text-[12px]"
        >
          <option value="all">Any liquidity</option>
          <option value="thin">Thin only</option>
          <option value="medium">Medium</option>
        </select>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {MARKET_CATEGORIES.map((c) => {
          const count = meta?.category_counts?.[c.id];
          return (
            <button
              key={c.id}
              onClick={() => setFilter("category", c.id)}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-bold tracking-wide ${
                category === c.id ? "bg-bull text-white" : "border border-line text-muted hover:border-bull/30"
              }`}
            >
              {c.label.toUpperCase()}
              {count != null && c.id !== "all" && (
                <span className={`ml-1.5 font-mono text-[10px] ${category === c.id ? "text-white/80" : "text-faint"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-[420px] animate-pulse rounded-2xl border border-line bg-surface/30" />
          ))}
        </div>
      ) : markets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line py-20 text-center">
          <IconGrid className="mx-auto h-8 w-8 text-faint" />
          <p className="mt-3 text-[15px] font-bold text-foreground">No markets match</p>
          <p className="mt-1 text-[13px] text-faint">
            Try another category or switch to &quot;All active&quot;. Weather and crypto load from Polymarket tags + keyword scan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {markets.map((m, i) => (
            <MarketCard
              key={m.id}
              market={m}
              maxVolume={maxVolume}
              index={i}
              onPostBounty={(market) => requireAuth(() => setBountyTarget(market))}
            />
          ))}
        </div>
      )}

      {!loading && markets.length > 0 && (
        <p className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-faint">
          <IconFlame className="h-3.5 w-3.5 text-bull" />
          Live Polymarket Gamma · {markets.length} markets shown · pool {stats.poolSize} · auto-refresh 45s
          {stats.syncedAt && <span>· last sync {ageSec}s ago</span>}
        </p>
      )}

      {bountyTarget && (
        <CreateBountyModal
          market={bountyTarget}
          onClose={() => setBountyTarget(null)}
          onCreated={(b) => {
            setBountyTarget(null);
            router.push(`/app/bounties?status=funding#bounty-${b.id}`);
          }}
        />
      )}
    </div>
  );
}

export default function MarketsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-faint">Loading markets…</div>}>
      <MarketsContent />
    </Suspense>
  );
}
