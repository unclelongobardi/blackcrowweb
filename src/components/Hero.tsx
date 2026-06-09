"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { IconArrow } from "./icons";
import OnlineCounter from "./OnlineCounter";
import { pct, shortLabel } from "@/lib/format";
import type { Market } from "@/lib/types";

const ease = [0.16, 1, 0.3, 1] as const;

function StatCard({
  className,
  label,
  yes,
  no,
  delay,
  float = "animate-float",
}: {
  className: string;
  label: string;
  yes: string;
  no?: string;
  delay: number;
  float?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease }}
      className={`absolute z-20 ${className}`}
    >
      <div className={`glass glass-hover ${float} min-w-[150px] rounded-xl p-4 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.95)]`}>
        <p className="max-w-[180px] text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
          {label}
        </p>
        <div className="mt-2.5 flex items-center gap-4">
          <div>
            <span className="font-mono text-xl font-bold text-bull">{yes}</span>
            <span className="ml-1.5 text-[10px] font-semibold tracking-wider text-faint">YES</span>
          </div>
          {no && (
            <div className="border-l border-line pl-4">
              <span className="font-mono text-xl font-bold text-bear">{no}</span>
              <span className="ml-1.5 text-[10px] font-semibold tracking-wider text-faint">NO</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const AVATAR_IMAGES = [
  "/images/avatars/av1.png",
  "/images/avatars/av2.png",
  "/images/avatars/av3.png",
  "/images/avatars/av4.png",
  "/images/avatars/av5.png",
  "/images/avatars/av6.png",
];

const FALLBACK_CARDS = [
  { label: "Fed rate cut · 2026?", yes: "42%", no: "58%" },
  { label: "BTC new ATH this month?", yes: "78%", no: "22%" },
  { label: "Bitcoin above $150K in 2026?", yes: "63%", no: "37%" },
];

// Cards flank the centered crow: left mid, right top, right low.
const CARD_POS = [
  { className: "left-[2%] top-[18%] sm:left-[6%]", delay: 0.7, float: "animate-float" },
  { className: "right-[2%] top-[6%] sm:right-[5%]", delay: 0.85, float: "animate-float-slow" },
  { className: "bottom-[16%] right-[4%] sm:right-[8%]", delay: 1, float: "animate-float" },
];

export default function Hero({ markets = [] }: { markets?: Market[] }) {
  const { ready, authenticated, login } = usePrivy();

  const live = markets.filter((m) => m.yes_price != null).slice(0, 3);
  const cards =
    live.length === 3
      ? live.map((m) => ({
          label: shortLabel(m.question, 34),
          yes: pct(m.yes_price),
          no: pct(m.no_price ?? (m.yes_price != null ? 1 - m.yes_price : null)),
        }))
      : FALLBACK_CARDS;

  return (
    <section
      id="home"
      className="relative flex flex-col overflow-hidden pt-24 sm:pt-28 lg:h-[calc(100svh-3rem)] lg:min-h-[680px] lg:pt-28"
    >
      {/* Animated background grid */}
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade opacity-70" />
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[480px] w-[480px] rounded-full bg-emerald-500/5 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-20 h-[420px] w-[420px] rounded-full bg-white/[0.03] blur-[120px]" />

      {/* Centered copy above the crow */}
      <div className="relative z-20 mx-auto flex w-full max-w-4xl flex-col items-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-4 py-2"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-bull animate-pulse-dot" />
          <span className="text-[11px] font-medium tracking-[0.16em] text-muted">
            MAKE FRIENDS · MOVE MARKETS · LIVE
          </span>
        </motion.div>

        <h1 className="font-display text-[clamp(2.1rem,4.6vw,4rem)] font-extrabold leading-[1] tracking-tight">
          <motion.span
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease }}
            className="block text-foreground text-glow"
          >
            MANIPULATE MARKETS.
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
            className="block text-foreground text-glow"
          >
            EARN REWARDS.
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease }}
            className="block bg-gradient-to-r from-neutral-600 to-neutral-400 bg-clip-text text-transparent"
          >
            START YOUR CABAL.
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease }}
          className="mt-5 max-w-xl text-[15px] leading-relaxed tracking-wide text-muted"
        >
          A social network to meet people obsessed with prediction markets —
          the kind who want to control the game, not be controlled by someone
          else&apos;s.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease }}
          className="mt-7 flex flex-wrap items-center justify-center gap-3"
        >
          {authenticated ? (
            <Link
              href="/app"
              className="group inline-flex items-center gap-2 rounded-xl bg-foreground px-7 py-4 text-sm font-bold tracking-[0.08em] text-black transition-transform hover:scale-[1.03]"
            >
              ENTER THE NEST
              <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <button
              onClick={() => login()}
              disabled={!ready}
              className="group inline-flex items-center gap-2 rounded-xl bg-foreground px-7 py-4 text-sm font-bold tracking-[0.08em] text-black transition-transform hover:scale-[1.03] disabled:opacity-60"
            >
              JOIN THE NETWORK
              <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          )}
          <Link
            href="/app/markets"
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface/40 px-7 py-4 text-sm font-semibold tracking-[0.08em] text-foreground transition-colors hover:border-white/25 hover:bg-surface"
          >
            EXPLORE BLACKCROW
          </Link>
        </motion.div>

        {/* Avatars + live counter */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55, ease }}
          className="mt-7 flex items-center gap-4"
        >
          <div className="flex -space-x-2.5">
            {AVATAR_IMAGES.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt=""
                loading="lazy"
                className="h-9 w-9 rounded-full border-2 border-background bg-surface object-cover ring-1 ring-white/10"
              />
            ))}
          </div>
          <div className="text-left">
            <OnlineCounter />
          </div>
        </motion.div>
      </div>

      {/* Crow — the central axis, grounded on the ticker */}
      <div className="relative mx-auto mt-6 w-full max-w-[680px] flex-1 lg:mt-2 lg:max-w-[1000px]">
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease }}
          className="relative h-[340px] w-full sm:h-[420px] lg:h-full"
        >
          {/* Soft glow behind the crow for depth */}
          <div className="pointer-events-none absolute left-1/2 bottom-0 h-[80%] w-[70%] -translate-x-1/2 rounded-full bg-white/[0.05] blur-[120px]" />
          <Image
            src="/images/raven-hero-cutout.png"
            alt="BLACKCROW raven"
            fill
            priority
            sizes="(max-width: 1024px) 92vw, 1000px"
            className="object-contain object-bottom brightness-95 contrast-[1.08] saturate-[0.92] drop-shadow-[0_40px_80px_rgba(0,0,0,0.95)]"
          />
          {/* Grounding fade so the crow melts into the ticker */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/5 bg-gradient-to-t from-background via-background/70 to-transparent" />
          {/* Subtle side vignette to blend edges into the dark UI */}
          <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(5,5,6,0.55)_100%)]" />

          {cards.map((c, i) => (
            <StatCard
              key={c.label + i}
              className={CARD_POS[i].className}
              label={c.label}
              yes={c.yes}
              no={c.no}
              delay={CARD_POS[i].delay}
              float={CARD_POS[i].float}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
