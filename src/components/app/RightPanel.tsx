"use client";

import Link from "next/link";
import Sparkline from "./Sparkline";
import { genSpark } from "@/lib/spark";
import { IconFlame } from "@/components/icons";
import type { Market } from "@/lib/types";

function shortName(q: string): string {
  return q.length > 28 ? q.slice(0, 28).trimEnd() + "…" : q;
}

export default function RightPanel({ markets }: { markets: Market[] }) {
  const watch = markets.slice(0, 5);

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[300px] shrink-0 flex-col border-l border-line bg-surface/20 p-4 xl:flex">
      <div className="glass flex min-h-0 flex-1 flex-col rounded-2xl">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="section-label">Thin books</h2>
          <Link href="/app/markets" className="text-[11px] font-medium text-faint hover:text-foreground">
            View all
          </Link>
        </div>
        <div className="divide-y divide-line overflow-y-auto">
          {watch.map((m) => {
            const yes = m.yes_price != null ? Math.round(m.yes_price * 100) : 50;
            const up = yes >= 50;
            return (
              <Link
                key={m.id}
                href="/app/markets"
                className="ui-row flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02]"
              >
                <IconFlame className="h-4 w-4 shrink-0 text-amber-500/80" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold text-foreground">{shortName(m.question)}</p>
                  <p className="text-[11px] text-faint">
                    {m.liquidity_tier === "thin" ? "Thin book" : m.category || "Market"}
                  </p>
                </div>
                <Sparkline
                  data={genSpark(m.id, 20, up ? 0.05 : -0.05)}
                  width={48}
                  height={22}
                  color={up ? "#22c55e" : "#f0506e"}
                />
                <div className="w-9 text-right">
                  <p className={`font-mono text-[13px] font-bold ${up ? "text-bull" : "text-bear"}`}>{yes}%</p>
                </div>
              </Link>
            );
          })}
          {watch.length === 0 && <p className="px-4 py-5 text-[12px] text-faint">Loading markets…</p>}
        </div>
      </div>
    </aside>
  );
}
