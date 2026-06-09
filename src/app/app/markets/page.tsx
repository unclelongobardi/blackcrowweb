"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/useApi";
import { compactNumber, pct } from "@/lib/format";
import { useAppContext } from "@/components/app/appContext";
import CreateBountyModal from "@/components/app/CreateBountyModal";
import type { Bounty, Market } from "@/lib/types";

type Tab = "exploitable" | "all";

export default function MarketsPage() {
  const api = useApi();
  const router = useRouter();
  const { refreshMe } = useAppContext();
  const [tab, setTab] = useState<Tab>("exploitable");
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [opTarget, setOpTarget] = useState<Market | null>(null);
  const [bountyTarget, setBountyTarget] = useState<Market | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const mode = tab === "exploitable" ? "exploitable" : undefined;
        const q = mode ? `?limit=36&mode=${mode}` : "?limit=36";
        const data = await api<{ markets: Market[] }>(`/api/markets${q}`);
        setMarkets(data.markets);
      } finally {
        setLoading(false);
      }
    })();
  }, [api, tab]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-6">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">TARGET MARKETS</h1>
        <p className="mt-1 max-w-xl text-[13px] text-faint">
          Find thin books you can actually move. Hair dryer on a thermometer? That&apos;s an action bounty.
          You don&apos;t bet here — you find the play, rally people, bet on Polymarket yourself.
        </p>
      </header>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setTab("exploitable")}
          className={`rounded-lg px-4 py-2 text-[12px] font-bold tracking-wide ${
            tab === "exploitable" ? "bg-foreground text-black" : "border border-line text-muted"
          }`}
        >
          THIN BOOKS
        </button>
        <button
          onClick={() => setTab("all")}
          className={`rounded-lg px-4 py-2 text-[12px] font-bold tracking-wide ${
            tab === "all" ? "bg-foreground text-black" : "border border-line text-muted"
          }`}
        >
          ALL MARKETS
        </button>
      </div>

      {tab === "exploitable" && (
        <p className="mb-4 rounded-lg border border-bull/20 bg-bull/5 px-4 py-3 text-[12px] text-muted">
          <span className="font-bold text-bull">Exploitable</span> = low volume, still open, easy to nudge.
          Post a bounty if you need someone on the ground.
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-foreground" />
        </div>
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
                    <span className="rounded-md bg-bull/10 px-2 py-0.5 text-[10px] font-bold text-bull">
                      THIN
                    </span>
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
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setOpTarget(m)}
                  className="flex-1 rounded-lg border border-line px-3 py-2 text-[11px] font-bold tracking-wide text-foreground transition-colors hover:border-white/25"
                >
                  OPERATION
                </button>
                <button
                  onClick={() => setBountyTarget(m)}
                  className="flex-1 rounded-lg bg-foreground px-3 py-2 text-[11px] font-bold tracking-wide text-black transition-transform hover:scale-[1.02]"
                >
                  POST BOUNTY
                </button>
              </div>
              {m.url && (
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-center text-[10px] text-faint hover:text-muted"
                >
                  View on Polymarket →
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {opTarget && (
        <LaunchModal
          market={opTarget}
          onClose={() => setOpTarget(null)}
          onLaunched={async () => {
            setOpTarget(null);
            await refreshMe();
            router.push("/app/operations");
          }}
        />
      )}

      {bountyTarget && (
        <CreateBountyModal
          market={bountyTarget}
          onClose={() => setBountyTarget(null)}
          onCreated={() => {
            setBountyTarget(null);
            router.push("/app/rewards");
          }}
        />
      )}
    </div>
  );
}

function LaunchModal({
  market,
  onClose,
  onLaunched,
}: {
  market: Market;
  onClose: () => void;
  onLaunched: () => void;
}) {
  const api = useApi();
  const [title, setTitle] = useState("");
  const [thesis, setThesis] = useState("");
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function launch() {
    if (title.trim().length < 4) {
      setError("Give the operation a name (4+ chars).");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api("/api/operations", {
        method: "POST",
        body: JSON.stringify({ title, thesis, target_side: side, market }),
      });
      onLaunched();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to launch.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">
      <div className="glass w-full max-w-md rounded-2xl p-6">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-faint">NEW OPERATION</p>
        <p className="mt-1 line-clamp-2 text-[14px] font-medium text-foreground">{market.question}</p>
        <div className="mt-4 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Operation codename"
            className="w-full rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-foreground placeholder:text-faint outline-none focus:border-white/25"
          />
          <textarea
            value={thesis}
            onChange={(e) => setThesis(e.target.value)}
            placeholder="The plan — what we push and how"
            rows={3}
            className="w-full resize-none rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-foreground placeholder:text-faint outline-none focus:border-white/25"
          />
          <div className="flex gap-2">
            {(["YES", "NO"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSide(s)}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-[12px] font-bold tracking-wide ${
                  side === s
                    ? s === "YES"
                      ? "border-bull/40 bg-bull/10 text-bull"
                      : "border-bear/40 bg-bear/10 text-bear"
                    : "border-line text-faint"
                }`}
              >
                PUSH {s}
              </button>
            ))}
          </div>
          {error && <p className="text-[12px] text-bear">{error}</p>}
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-line px-4 py-3 text-[13px] font-semibold text-muted">
            Cancel
          </button>
          <button
            onClick={launch}
            disabled={loading}
            className="flex-1 rounded-xl bg-foreground px-4 py-3 text-[13px] font-bold text-black disabled:opacity-60"
          >
            {loading ? "LAUNCHING…" : "LAUNCH"}
          </button>
        </div>
      </div>
    </div>
  );
}
