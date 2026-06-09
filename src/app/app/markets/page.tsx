"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi } from "@/lib/useApi";
import { compactNumber, pct } from "@/lib/format";
import CreateBountyModal from "@/components/app/CreateBountyModal";
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
        <h1 className="font-display text-2xl font-extrabold tracking-tight">MARKETS</h1>
        <p className="mt-1 max-w-xl text-[13px] text-faint">
          Filter by type, find thin books, post a bounty in SOL. You bet on Polymarket — we coordinate here.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applySearch()}
          placeholder="Search markets..."
          className="min-w-[200px] flex-1 rounded-xl border border-line bg-surface/60 px-4 py-2.5 text-[13px] outline-none focus:border-white/25"
        />
        <button
          onClick={applySearch}
          className="rounded-xl border border-line px-4 py-2.5 text-[12px] font-bold text-muted hover:text-foreground"
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
              category === c.id ? "bg-foreground text-black" : "border border-line text-muted"
            }`}
          >
            {c.label.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-foreground" />
        </div>
      ) : markets.length === 0 ? (
        <p className="py-16 text-center text-[13px] text-faint">No markets match your filters.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {markets.map((m) => (
            <div key={m.id} className="glass glass-hover flex flex-col rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-faint">
                    {m.category ?? "Market"}
                  </span>
                  {m.liquidity_tier === "thin" && (
                    <span className="rounded-md bg-bull/10 px-2 py-0.5 text-[10px] font-bold text-bull">THIN</span>
                  )}
                </div>
                <span className="text-[11px] text-faint">Vol {compactNumber(m.volume)}</span>
              </div>
              <p className="mt-3 line-clamp-3 min-h-[3.5rem] text-[14px] font-medium leading-snug text-foreground">
                {m.question}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 rounded-lg bg-bull/10 px-3 py-1.5 text-center">
                  <span className="font-mono text-sm font-bold text-bull">{pct(m.yes_price)}</span>
                  <span className="ml-1 text-[10px] tracking-wide text-faint">YES</span>
                </div>
                <div className="flex-1 rounded-lg bg-bear/10 px-3 py-1.5 text-center">
                  <span className="font-mono text-sm font-bold text-bear">{pct(m.no_price)}</span>
                  <span className="ml-1 text-[10px] tracking-wide text-faint">NO</span>
                </div>
              </div>
              <button
                onClick={() => setBountyTarget(m)}
                className="mt-3 rounded-lg bg-foreground px-3 py-2 text-[11px] font-bold tracking-wide text-black transition-transform hover:scale-[1.02]"
              >
                POST BOUNTY
              </button>
              {m.url && (
                <a href={m.url} target="_blank" rel="noopener noreferrer" className="mt-2 text-center text-[10px] text-faint hover:text-muted">
                  View on Polymarket →
                </a>
              )}
            </div>
          ))}
        </div>
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
