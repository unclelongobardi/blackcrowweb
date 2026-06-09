"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useApi } from "@/lib/useApi";
import { compactNumber } from "@/lib/format";
import CreateBountyModal from "@/components/app/CreateBountyModal";
import MarketCard from "@/components/app/MarketCard";
import { IconFlame, IconGrid } from "@/components/icons";
import type { Market } from "@/lib/types";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "weather", label: "Weather" },
  { id: "crypto", label: "Crypto" },
  { id: "economy", label: "Economy" },
  { id: "politics", label: "Politics" },
  { id: "sports", label: "Sports" },
];

function MarketsContent() {
  const api = useApi();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [bountyTarget, setBountyTarget] = useState<Market | null>(null);
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");

  const mode = searchParams.get("mode") ?? "exploitable";
  const category = searchParams.get("category") ?? "all";
  const q = searchParams.get("q") ?? "";
  const liquidity = searchParams.get("liquidity") ?? "all";
  const sort = searchParams.get("sort") ?? "exploitable";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "36" });
      if (mode) params.set("mode", mode);
      if (category !== "all") params.set("category", category);
      if (q) params.set("q", q);
      if (liquidity !== "all") params.set("liquidity", liquidity);
      if (sort) params.set("sort", sort);
      const data = await api<{ markets: Market[] }>(`/api/markets?${params}`);
      setMarkets(data.markets);
    } finally {
      setLoading(false);
    }
  }, [api, mode, category, q, liquidity, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const totalVol = markets.reduce((s, m) => s + (m.volume ?? 0), 0);
    const thin = markets.filter((m) => m.liquidity_tier === "thin").length;
    const avgYes =
      markets.length > 0
        ? Math.round(
            markets.reduce((s, m) => s + (m.yes_price != null ? m.yes_price * 100 : 50), 0) / markets.length,
          )
        : 0;
    const contested = markets.filter(
      (m) => m.yes_price != null && m.yes_price >= 0.35 && m.yes_price <= 0.65,
    ).length;
    const maxVolume = Math.max(...markets.map((m) => m.volume ?? 0), 1);
    return { totalVol, thin, avgYes, contested, maxVolume, count: markets.length };
  }, [markets]);

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
              Live books from Polymarket — volume, liquidity tier, and op scores to spot thin, movable markets.
            </p>
          </div>
          <button
            type="button"
            onClick={() => load()}
            className="ui-btn rounded-xl border border-line px-4 py-2 text-[11px] font-semibold text-muted hover:text-foreground"
          >
            Refresh feed
          </button>
        </div>

        {!loading && markets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4"
          >
            {[
              { label: "Showing", value: String(stats.count), sub: "markets" },
              { label: "Total volume", value: `$${compactNumber(stats.totalVol)}`, sub: "filtered set" },
              { label: "Thin books", value: String(stats.thin), sub: "low liquidity" },
              { label: "Contested", value: String(stats.contested), sub: "35–65% YES" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-line bg-surface/30 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-faint">{s.label}</p>
                <p className="mt-1 font-mono text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted">{s.sub}</p>
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
          className="rounded-xl bg-foreground px-4 py-2.5 text-[12px] font-bold text-black"
        >
          SEARCH
        </button>
        <select
          value={mode}
          onChange={(e) => setFilter("mode", e.target.value)}
          className="rounded-xl border border-line bg-surface/60 px-3 py-2.5 text-[12px]"
        >
          <option value="exploitable">Thin books</option>
          <option value="">All active</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setFilter("sort", e.target.value)}
          className="rounded-xl border border-line bg-surface/60 px-3 py-2.5 text-[12px]"
        >
          <option value="exploitable">Most exploitable</option>
          <option value="contested">Most contested</option>
          <option value="volume">Highest volume</option>
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
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter("category", c.id)}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-bold tracking-wide ${
              category === c.id ? "bg-bull text-black" : "border border-line text-muted hover:border-bull/30"
            }`}
          >
            {c.label.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[420px] animate-pulse rounded-2xl border border-line bg-surface/30" />
          ))}
        </div>
      ) : markets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line py-20 text-center">
          <IconGrid className="mx-auto h-8 w-8 text-faint" />
          <p className="mt-3 text-[15px] font-bold text-foreground">No markets match</p>
          <p className="mt-1 text-[13px] text-faint">Try clearing filters or switching to all active markets.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {markets.map((m, i) => (
            <MarketCard
              key={m.id}
              market={m}
              maxVolume={stats.maxVolume}
              index={i}
              onPostBounty={setBountyTarget}
            />
          ))}
        </div>
      )}

      {!loading && markets.length > 0 && (
        <p className="mt-8 flex items-center justify-center gap-1.5 text-[11px] text-faint">
          <IconFlame className="h-3.5 w-3.5 text-bull" />
          Data synced from Polymarket Gamma API · avg YES {stats.avgYes}% across this view
        </p>
      )}

      {bountyTarget && (
        <CreateBountyModal
          market={bountyTarget}
          onClose={() => setBountyTarget(null)}
          onCreated={() => {
            setBountyTarget(null);
            router.push("/app");
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
