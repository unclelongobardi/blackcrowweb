"use client";

import Link from "next/link";
import Sparkline from "./Sparkline";
import { genSpark } from "@/lib/spark";
import { compactNumber, pct } from "@/lib/format";
import { IconFlame } from "@/components/icons";
import type { Market } from "@/lib/types";

function shortName(q: string): string {
  return q.length > 32 ? q.slice(0, 32).trimEnd() + "…" : q;
}

export default function RightPanel({ markets }: { markets: Market[] }) {
  const watch = markets.slice(0, 8);
  const thinCount = watch.filter((m) => m.liquidity_tier === "thin").length;
  const totalVol = watch.reduce((sum, m) => sum + (m.volume ?? 0), 0);
  const avgYes =
    watch.length > 0
      ? Math.round(
          watch.reduce((sum, m) => sum + (m.yes_price != null ? m.yes_price * 100 : 50), 0) / watch.length,
        )
      : null;

  return (
    <div className="glass flex max-h-[44vh] min-h-[240px] flex-col rounded-2xl border border-line bg-surface/20">
      <div className="border-b border-line px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="section-label">Thin books</h2>
          <Link href="/app/markets" className="text-[11px] font-medium text-faint hover:text-foreground">
            View all
          </Link>
        </div>
        <p className="mt-1.5 text-[10.5px] leading-relaxed text-faint">
          Shallow liquidity — small trades move the price. Ideal for field ops, bounties, and cabal plays.
        </p>
        {watch.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-muted">
              {thinCount || watch.length} thin
            </span>
            <span className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-muted">
              Vol {compactNumber(totalVol)}
            </span>
            {avgYes != null && (
              <span className="rounded-md bg-bull/10 px-2 py-0.5 font-mono text-[10px] text-bull">
                Avg YES {avgYes}%
              </span>
            )}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 divide-y divide-line overflow-y-auto">
        {watch.map((m) => {
          const yes = m.yes_price != null ? Math.round(m.yes_price * 100) : 50;
          const no = m.no_price != null ? Math.round(m.no_price * 100) : 100 - yes;
          const up = yes >= 50;
          const tier = m.liquidity_tier ?? "medium";
          return (
            <Link
              key={m.id}
              href="/app/markets"
              className="ui-row block px-4 py-3 hover:bg-white/[0.02]"
            >
              <div className="flex items-start gap-2.5">
                <IconFlame
                  className={`mt-0.5 h-4 w-4 shrink-0 ${tier === "thin" ? "text-amber-500/90" : "text-faint"}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold leading-snug text-foreground">{shortName(m.question)}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-faint">
                    <span className="font-semibold uppercase tracking-wide text-muted">
                      {tier === "thin" ? "Thin book" : tier === "thick" ? "Thick" : "Medium"}
                    </span>
                    {m.category && <span>{m.category}</span>}
                    <span className="font-mono">Vol {compactNumber(m.volume)}</span>
                    {m.exploit_score != null && m.exploit_score > 0.5 && (
                      <span className="rounded bg-amber-500/15 px-1 py-px font-mono text-amber-400">
                        Score {(m.exploit_score * 100).toFixed(0)}
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`font-mono text-[11px] font-bold ${up ? "text-bull" : "text-faint"}`}>
                      YES {pct(m.yes_price)}
                    </span>
                    <span className="text-faint">·</span>
                    <span className="font-mono text-[11px] font-bold text-bear">NO {no}%</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Sparkline
                    data={genSpark(m.id, 20, up ? 0.05 : -0.05)}
                    width={52}
                    height={24}
                    color={up ? "#22c55e" : "#f0506e"}
                  />
                  <span className={`font-mono text-[12px] font-bold ${up ? "text-bull" : "text-bear"}`}>{yes}%</span>
                </div>
              </div>
            </Link>
          );
        })}
        {watch.length === 0 && (
          <p className="px-4 py-5 text-[12px] text-faint">Scanning for thin markets…</p>
        )}
      </div>
    </div>
  );
}
