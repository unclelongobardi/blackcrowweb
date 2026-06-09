"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { shortLabel, compactNumber } from "@/lib/format";
import type { Market } from "@/lib/types";

type Ticker = { name: string; val: string; up: boolean; vol?: string };

const FALLBACK: Ticker[] = [
  { name: "BTC > $100K", val: "63%", up: true },
  { name: "ETH > $4K", val: "41%", up: false },
  { name: "SOL > $200", val: "28%", up: false },
  { name: "FED RATE CUT", val: "42%", up: false },
  { name: "BLACKROCK ETF", val: "72%", up: true },
  { name: "US RECESSION", val: "66%", up: true },
  { name: "NVDA EARNINGS BEAT", val: "57%", up: true },
  { name: "GOV SHUTDOWN", val: "34%", up: false },
  { name: "ALTSEASON 2026", val: "49%", up: false },
];

function Row({ tickers }: { tickers: Ticker[] }) {
  return (
    <div className="flex shrink-0 items-center gap-10 px-5">
      {tickers.map((t, i) => (
        <div key={i} className="flex items-center gap-2.5 whitespace-nowrap">
          <span className="text-[12px] font-medium tracking-[0.1em] text-muted">{t.name}</span>
          <span className={`font-mono text-[12px] font-bold ${t.up ? "text-bull" : "text-bear"}`}>
            {t.val}
          </span>
          {t.vol && <span className="font-mono text-[11px] text-faint">${t.vol} vol</span>}
          <span className="text-faint">·</span>
        </div>
      ))}
    </div>
  );
}

export default function SocialProof({ markets = [] }: { markets?: Market[] }) {
  const live = markets.filter((m) => m.yes_price != null);
  const tickers: Ticker[] =
    live.length >= 6
      ? live.slice(0, 12).map((m) => {
          const yes = Math.round((m.yes_price ?? 0) * 100);
          return {
            name: shortLabel(m.question, 30).toUpperCase(),
            val: `${yes}%`,
            up: yes >= 50,
            vol: compactNumber(m.volume),
          };
        })
      : FALLBACK;

  const thin = live.filter((m) => (m.volume ?? 0) < 200_000).length;
  const totalVol = live.reduce((s, m) => s + (m.volume ?? 0), 0);

  return (
    <section id="markets" className="scroll-mt-24 border-b border-line bg-surface/30">
      <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-6 pb-4 pt-8">
        <div>
          <p className="section-label">Polymarket live</p>
          <h2 className="font-display text-xl font-extrabold tracking-tight">MARKETS</h2>
          {live.length > 0 && (
            <p className="mt-1 text-[12px] text-faint">
              {live.length} active · ${compactNumber(totalVol)} volume · {thin} thin books
            </p>
          )}
        </div>
        <Link
          href="/app/markets"
          className="rounded-xl border border-line px-4 py-2 text-[11px] font-bold text-muted hover:border-bull/40 hover:text-foreground"
        >
          EXPLORE ALL →
        </Link>
      </div>

      <div className="relative flex overflow-hidden py-3.5">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
        <motion.div
          className="flex"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 36, ease: "linear", repeat: Infinity }}
        >
          <Row tickers={tickers} />
          <Row tickers={tickers} />
          <Row tickers={tickers} />
          <Row tickers={tickers} />
        </motion.div>
      </div>
    </section>
  );
}
