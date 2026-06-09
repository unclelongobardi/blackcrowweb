"use client";

import Link from "next/link";
import Sparkline from "./Sparkline";
import { genSpark } from "@/lib/spark";
import { lamportsToSol } from "@/lib/solanaFormat";
import { IconFlame } from "@/components/icons";
import type { Bounty, Market } from "@/lib/types";

function Section({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-[11px] font-bold tracking-[0.16em] text-muted">{title}</h2>
        {href && (
          <Link href={href} className="text-[11px] font-medium text-faint transition-colors hover:text-foreground">
            View all
          </Link>
        )}
      </div>
      <div className="border-t border-line">{children}</div>
    </div>
  );
}

function shortName(q: string): string {
  return q.length > 28 ? q.slice(0, 28).trimEnd() + "…" : q;
}

export default function RightPanel({
  markets,
  bounties = [],
}: {
  markets: Market[];
  bounties?: Bounty[];
}) {
  const watch = markets.slice(0, 5);
  const open = bounties.filter((b) => b.status === "open").slice(0, 4);
  const officialCount = bounties.filter((b) => b.is_official && b.status === "open").length;

  return (
    <aside className="hidden w-[332px] shrink-0 flex-col gap-4 p-4 xl:flex">
      <Section title={officialCount ? `OPEN BOUNTIES (${officialCount} OFFICIAL)` : "OPEN BOUNTIES"} href="/app">
        <div className="divide-y divide-line">
          {open.length === 0 ? (
            <p className="px-4 py-5 text-[12px] leading-relaxed text-faint">
              Nothing open yet.{" "}
              <Link href="/app/markets" className="text-bull hover:underline">
                Find a market
              </Link>{" "}
              and post one.
            </p>
          ) : (
            open.map((b) => (
              <div key={b.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {b.is_official && (
                      <span className="mb-1 inline-block text-[9px] font-bold uppercase tracking-wide text-bull">
                        BlackCrow
                      </span>
                    )}
                    <p className="line-clamp-2 text-[12.5px] font-semibold text-foreground">{b.title}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[12px] font-bold text-bull">
                    {lamportsToSol(b.reward_sol_lamports)} SOL
                  </span>
                </div>
                {b.task && (
                  <p className="mt-1 line-clamp-2 text-[11px] text-faint">{b.task}</p>
                )}
              </div>
            ))
          )}
        </div>
      </Section>

      <Section title="THIN BOOKS" href="/app/markets">
        <div className="divide-y divide-line">
          {watch.map((m) => {
            const yes = m.yes_price != null ? Math.round(m.yes_price * 100) : 50;
            const up = yes >= 50;
            return (
              <Link
                key={m.id}
                href="/app/markets"
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02]"
              >
                <IconFlame className="h-4 w-4 shrink-0 text-amber-500/80" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold text-foreground">{shortName(m.question)}</p>
                  <p className="text-[11px] text-faint">
                    {m.liquidity_tier === "thin" ? "Thin book" : m.category || "Market"}
                  </p>
                </div>
                <Sparkline data={genSpark(m.id, 20, up ? 0.05 : -0.05)} width={48} height={22} color={up ? "#22c55e" : "#f0506e"} />
                <div className="w-9 text-right">
                  <p className={`font-mono text-[13px] font-bold ${up ? "text-bull" : "text-bear"}`}>{yes}%</p>
                </div>
              </Link>
            );
          })}
          {watch.length === 0 && <p className="px-4 py-5 text-[12px] text-faint">Loading markets…</p>}
        </div>
      </Section>

    </aside>
  );
}
