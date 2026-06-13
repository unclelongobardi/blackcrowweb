"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { IconArrow } from "./icons";
import OnlineCounter from "./OnlineCounter";
import TokenCaChip from "./TokenCaChip";
import { pct, shortLabel } from "@/lib/format";
import type { Market } from "@/lib/types";

const ease = [0.16, 1, 0.3, 1] as const;

function StatCard({
  className,
  label,
  question,
  yes,
  no,
  delay,
  float = "animate-float",
}: {
  className: string;
  label: string;
  question?: string;
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
      <div className={`glass glass-hover ${float} rounded-xl p-3 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.1)]`}>
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-faint">{label}</p>
        {question && <p className="mt-0.5 max-w-[150px] text-[11px] font-medium text-muted">{question}</p>}
        <div className="mt-2 flex items-center gap-3">
          <div>
            <span className="font-mono text-lg font-bold text-bull">{yes}</span>
            <span className="ml-1 text-[9px] font-semibold tracking-wider text-faint">YES</span>
          </div>
          {no && (
            <div className="border-l border-line pl-3">
              <span className="font-mono text-lg font-bold text-bear">{no}</span>
              <span className="ml-1 text-[9px] font-semibold tracking-wider text-faint">NO</span>
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

const CARD_POS = [
  { className: "left-[-1%] bottom-[42%]", delay: 0.7, float: "animate-float" },
  { className: "right-[1%] bottom-[52%]", delay: 0.85, float: "animate-float-slow" },
  { className: "right-[15%] bottom-[10%]", delay: 1, float: "animate-float" },
];

export default function Hero({ markets = [] }: { markets?: Market[] }) {
  const { ready, authenticated, login } = usePrivy();

  const live = markets.filter((m) => m.yes_price != null).slice(0, 3);
  const cards =
    live.length === 3
      ? live.map((m) => ({
          label: shortLabel(m.question, 30),
          yes: pct(m.yes_price),
          no: pct(m.no_price ?? (m.yes_price != null ? 1 - m.yes_price : null)),
        }))
      : FALLBACK_CARDS;

  return (
    <section id="home" className="relative overflow-hidden pt-24 sm:pt-28 lg:pt-0">
      {/* Animated background grid */}
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade opacity-70" />
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[480px] w-[480px] rounded-full bg-sky-500/5 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-20 h-[420px] w-[420px] rounded-full bg-black/[0.03] blur-[120px]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 pb-12 lg:h-[calc(100svh-3rem)] lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-4 lg:pb-0 lg:pt-16">
        {/* LEFT */}
        <div className="lg:self-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-bull animate-pulse-dot" />
            <span className="text-[11px] font-medium tracking-[0.14em] text-muted">
              PREDICTION MARKETS · COORDINATED EXECUTION
            </span>
          </motion.div>

          <h1 className="font-display text-[clamp(1.75rem,3.6vw,3rem)] font-extrabold leading-[1.02] tracking-tight">
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
            className="mt-6 max-w-md border-l border-line pl-4 text-sm leading-relaxed tracking-wide text-muted"
          >
A social network to meet people obsessed with prediction markets —
            the kind who want to control the game, not be controlled by
            someone else&apos;s.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            {authenticated ? (
              <Link
                href="/app"
                className="group inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-[13px] font-bold tracking-[0.08em] text-background transition-transform hover:scale-[1.03]"
              >
                OPEN HOME
                <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <button
                onClick={() => login()}
                disabled={!ready}
                className="group inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-[13px] font-bold tracking-[0.08em] text-background transition-transform hover:scale-[1.03] disabled:opacity-60"
              >
                JOIN THE NETWORK
                <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            )}
            <Link
              href="/app/markets"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface/40 px-6 py-3.5 text-[13px] font-semibold tracking-[0.08em] text-foreground transition-colors hover:border-black/20 hover:bg-surface"
            >
              EXPLORE BLACKCROW
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease }}
            className="mt-5 max-w-md"
          >
            <TokenCaChip variant="panel" />
          </motion.div>

          {/* Avatars + counter */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55, ease }}
            className="mt-9 flex items-center gap-4"
          >
            <div className="flex -space-x-2.5">
              {AVATAR_IMAGES.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt=""
                  loading="lazy"
                  className="h-9 w-9 rounded-full border-2 border-background bg-surface object-cover ring-1 ring-black/10"
                />
              ))}
            </div>
            <OnlineCounter />
          </motion.div>
        </div>

        {/* RIGHT — raven + floating cards (in-flow, bottom-anchored to the ticker) */}
        <div className="relative mx-auto mt-6 w-full max-w-[560px] self-end lg:mx-0 lg:mt-0 lg:h-full lg:w-full lg:max-w-none lg:self-stretch lg:-mr-4 xl:-mr-16">
          <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease }}
            className="relative aspect-[3/2] w-full lg:aspect-auto lg:h-full"
          >
            {/* Soft glow behind the crow for depth */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[68%] w-[68%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/[0.04] blur-[120px]" />
            <Image
              src="/images/raven-hero-transparent.png"
              alt="BLACKCROW raven"
              fill
              priority
              sizes="(max-width: 1024px) 92vw, 56vw"
              className="object-contain object-bottom contrast-[1.06] saturate-[0.95] drop-shadow-[0_28px_56px_rgba(0,0,0,0.12)]"
            />
            {/* Grounding fade so the crow melts into the page */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/5 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </motion.div>

          {cards.map((c, i) => (
            <StatCard
              key={c.label + i}
              className={`hidden lg:block ${CARD_POS[i].className}`}
              label={c.label}
              yes={c.yes}
              no={c.no}
              delay={CARD_POS[i].delay}
              float={CARD_POS[i].float}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
