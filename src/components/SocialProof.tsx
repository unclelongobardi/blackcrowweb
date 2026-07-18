"use client";

import { motion } from "framer-motion";
import { shortLabel } from "@/lib/format";
import type { Market } from "@/lib/types";

type Ticker = { name: string; val: string; up: boolean };

const FALLBACK: Ticker[] = [
  { name: "LIVE POLYMARKET FEED UNAVAILABLE", val: "RETRY SOON", up: false },
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
          };
        })
      : FALLBACK;

  return (
    <section className="relative border-y border-line bg-surface/30">
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
