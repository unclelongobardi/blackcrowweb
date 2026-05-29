"use client";

import { motion } from "framer-motion";

const TICKERS = [
  { name: "BTC > $100K", val: "+63%", up: true },
  { name: "ETH > $4K", val: "-41%", up: false },
  { name: "SOL > $200", val: "-28%", up: false },
  { name: "FED RATE CUT", val: "+42%", up: true },
  { name: "BLACKROCK ETF", val: "+72%", up: true },
  { name: "US RECESSION Q4", val: "+66%", up: true },
  { name: "NVDA EARNINGS BEAT", val: "+57%", up: true },
  { name: "GOV SHUTDOWN", val: "-34%", up: false },
  { name: "ALTSEASON 2025", val: "+49%", up: true },
];

function Row() {
  return (
    <div className="flex shrink-0 items-center gap-10 px-5">
      {TICKERS.map((t, i) => (
        <div key={i} className="flex items-center gap-2.5 whitespace-nowrap">
          <span className="text-[12px] font-medium tracking-[0.1em] text-muted">{t.name}</span>
          <span
            className={`font-mono text-[12px] font-bold ${t.up ? "text-bull" : "text-bear"}`}
          >
            {t.val}
          </span>
          <span className="text-faint">·</span>
        </div>
      ))}
    </div>
  );
}

export default function SocialProof() {
  return (
    <section className="relative border-y border-line bg-surface/30">
      <div className="relative flex overflow-hidden py-3.5">
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
        <motion.div
          className="flex"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 32, ease: "linear", repeat: Infinity }}
        >
          <Row />
          <Row />
          <Row />
          <Row />
        </motion.div>
      </div>
    </section>
  );
}
