"use client";

import { motion } from "framer-motion";
import Logo from "./Logo";
import { shortLabel } from "@/lib/format";
import type { Market } from "@/lib/types";
import {
  IconFeed,
  IconGrid,
  IconPlus,
  IconWallet,
  IconBell,
  IconChart2,
  IconUser,
  IconUsers,
  IconSettings,
  IconComment,
  IconRepeat,
  IconHeart,
  IconDots,
} from "./icons";

const ease = [0.16, 1, 0.3, 1] as const;

const NAV = [
  { label: "Home", icon: IconFeed, active: true },
  { label: "Markets", icon: IconGrid },
  { label: "Operations", icon: IconPlus },
  { label: "Cabals", icon: IconUsers },
  { label: "Leaderboard", icon: IconChart2 },
  { label: "Bounties", icon: IconWallet },
  { label: "Notifications", icon: IconBell },
  { label: "Profile", icon: IconUser },
  { label: "Settings", icon: IconSettings },
];

const FEED = [
  {
    name: "GloriaTrader",
    handle: "@insider_gloria",
    time: "2m",
    sentiment: "Bullish",
    bull: true,
    color: "from-sky-400/40 to-cyan-600/40",
    text: "Heard something big about $NVDA earnings.",
    sub: "Load up or fade?",
    stats: { c: 24, r: 87, l: 312 },
  },
  {
    name: "SilentOracle",
    handle: "@0xOracle",
    time: "5m",
    sentiment: "Bearish",
    bull: false,
    color: "from-fuchsia-500/40 to-purple-700/40",
    text: "Government shutdown = markets will melt.",
    sub: "Lock it in.",
    stats: { c: 15, r: 43, l: 198 },
  },
  {
    name: "MarketMaven",
    handle: "@market_maven",
    time: "7m",
    sentiment: "Bullish",
    bull: true,
    color: "from-amber-500/40 to-orange-700/40",
    text: "Altseason is a narrative.",
    sub: "But narratives move millions.",
    stats: { c: 12, r: 56, l: 205 },
  },
];

const FALLBACK_MARKETS = [
  { name: "Live market feed unavailable", sub: "Reconnect to Polymarket to refresh", val: "—", up: false },
];

export default function Dashboard({ markets = [] }: { markets?: Market[] }) {
  const live = markets.filter((m) => m.yes_price != null);
  const marketList =
    live.length >= 5
      ? live.slice(0, 5).map((m) => {
          const yes = Math.round((m.yes_price ?? 0) * 100);
          return {
            name: shortLabel(m.question, 30),
            sub: m.category || "Live on Polymarket",
            val: `${yes}%`,
            up: yes >= 50,
          };
        })
      : FALLBACK_MARKETS;

  return (
    <section id="feed" className="relative scroll-mt-24 px-6 py-20 lg:py-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/10 to-transparent" />

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="glass overflow-hidden rounded-2xl shadow-[0_40px_120px_-50px_rgba(0,0,0,0.12)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1.4fr_1fr]">
            {/* Sidebar */}
            <aside className="hidden flex-col gap-1 border-r border-line p-4 lg:flex">
              <div className="mb-4 px-2 text-foreground">
                <Logo showText={false} />
              </div>
              {NAV.map((item) => (
                <button
                  key={item.label}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                    item.active
                      ? "bg-black/[0.05] text-foreground"
                      : "text-faint hover:bg-black/[0.04] hover:text-muted"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
              <button className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 text-[12px] font-semibold tracking-wide text-foreground transition-colors hover:border-black/20">
                <IconWallet className="h-4 w-4" />
                Connect Wallet
              </button>
            </aside>

            {/* Feed */}
            <div className="border-line lg:border-r">
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <h3 className="text-[12px] font-bold tracking-[0.18em] text-muted">HOME FEED</h3>
                <button className="flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-[11px] font-medium text-muted transition-colors hover:text-foreground">
                  Trending
                  <span className="text-faint">▾</span>
                </button>
              </div>

              <div className="divide-y divide-line">
                {FEED.map((post, i) => (
                  <motion.article
                    key={post.handle}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08, ease }}
                    className="group px-5 py-4 transition-colors hover:bg-black/[0.03]"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`h-9 w-9 shrink-0 rounded-full bg-gradient-to-br ${post.color} ring-1 ring-black/10`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-foreground">{post.name}</span>
                          <span className="truncate text-[12px] text-faint">{post.handle}</span>
                          <span className="text-faint">·</span>
                          <span className="text-[12px] text-faint">{post.time}</span>
                          <span
                            className={`ml-auto rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide ${
                              post.bull
                                ? "bg-bull/10 text-bull"
                                : "bg-bear/10 text-bear"
                            }`}
                          >
                            {post.sentiment}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[13.5px] leading-snug text-foreground/90">{post.text}</p>
                        <p className="text-[13px] text-muted">{post.sub}</p>
                        <div className="mt-3 flex items-center gap-6 text-faint">
                          <span className="flex items-center gap-1.5 text-[12px] transition-colors hover:text-foreground">
                            <IconComment className="h-3.5 w-3.5" /> {post.stats.c}
                          </span>
                          <span className="flex items-center gap-1.5 text-[12px] transition-colors hover:text-bull">
                            <IconRepeat className="h-3.5 w-3.5" /> {post.stats.r}
                          </span>
                          <span className="flex items-center gap-1.5 text-[12px] transition-colors hover:text-bear">
                            <IconHeart className="h-3.5 w-3.5" /> {post.stats.l}
                          </span>
                          <IconDots className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>

            {/* Trending markets */}
            <div>
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <h3 className="text-[12px] font-bold tracking-[0.18em] text-muted">TARGET MARKETS</h3>
                <a href="#markets" className="text-[11px] font-medium text-muted transition-colors hover:text-foreground">
                  View all
                </a>
              </div>
              <div className="flex flex-col">
                {marketList.map((m, i) => (
                  <motion.button
                    key={m.name}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.06, ease }}
                    className="group flex items-center gap-3 border-b border-line px-5 py-3.5 text-left transition-colors hover:bg-black/[0.03]"
                  >
                    <span className="text-base">{m.up ? "🔥" : "⚡"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-foreground">{m.name}</p>
                      <p className="text-[11px] text-faint">{m.sub}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono text-sm font-bold ${m.up ? "text-bull" : "text-bear"}`}>{m.val}</p>
                      <p className="text-[10px] font-semibold tracking-wider text-faint">YES</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
