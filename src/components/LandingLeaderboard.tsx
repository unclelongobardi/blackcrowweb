"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { IconRoost } from "./icons";

const TOP = [
  { rank: 1, name: "night_owl", feathers: 2840 },
  { rank: 2, name: "macro_marauder", feathers: 2210 },
  { rank: 3, name: "thin_book_hunter", feathers: 1985 },
];

export default function LandingLeaderboard() {
  return (
    <section id="leaderboard" className="scroll-mt-24 border-t border-line px-6 py-20 lg:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-label">The Roost</p>
            <h2 className="font-display text-2xl font-extrabold tracking-tight">LEADERBOARD</h2>
            <p className="mt-2 max-w-lg text-[13px] text-faint">
              Feathers rank your influence — bounties posted, intel dropped, cabals led.
            </p>
          </div>
          <Link
            href="/app/leaderboard"
            className="rounded-xl border border-line px-4 py-2.5 text-[12px] font-bold text-muted transition-colors hover:border-bull/40 hover:text-foreground"
          >
            FULL RANKINGS →
          </Link>
        </div>

        <div className="mt-8 space-y-2">
          {TOP.map((row, i) => (
            <motion.div
              key={row.name}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center justify-between rounded-xl border border-line bg-surface/30 px-4 py-3.5"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-bull/15 font-mono text-[12px] font-bold text-bull">
                  #{row.rank}
                </span>
                <span className="font-semibold text-foreground">@{row.name}</span>
              </div>
              <span className="inline-flex items-center gap-1.5 font-mono text-[13px] font-bold text-bull">
                <IconRoost className="h-4 w-4" />
                {row.feathers.toLocaleString()}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
