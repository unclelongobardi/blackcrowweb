"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { GUEST_APP_HREF } from "@/lib/guestMode";
import { uiBtnPrimary } from "@/lib/uiClasses";
import { IconArrow } from "./icons";
import OnlineCounter from "./OnlineCounter";
import TokenCaChip from "./TokenCaChip";
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
  staticCard = false,
}: {
  className?: string;
  label: string;
  yes: string;
  no?: string;
  delay: number;
  float?: string;
  staticCard?: boolean;
}) {
  const inner = (
    <div className={`glass glass-hover ${float} rounded-xl border border-primary/10 p-3 shadow-[0_24px_60px_-30px_rgba(22,82,240,0.15)]`}>
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-faint">{label}</p>
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
  );

  if (staticCard) return inner;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease }}
      className={`absolute z-20 ${className ?? ""}`}
    >
      {inner}
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
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade opacity-70" />
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[480px] w-[480px] rounded-full bg-primary/8 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-20 h-[420px] w-[420px] rounded-full bg-primary/5 blur-[120px]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 pb-12 lg:h-[calc(100svh-3rem)] lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-4 lg:pb-0 lg:pt-16">
        <div className="lg:self-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
            <span className="text-[11px] font-medium tracking-[0.14em] text-muted">
              VEXORA NETWORK · PREDICTION MARKETS
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
              className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
            >
              START YOUR CABAL.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease }}
            className="mt-6 max-w-md border-l border-primary/20 pl-4 text-sm leading-relaxed tracking-wide text-muted"
          >
            A social network to meet people obsessed with prediction markets — the kind who want to control the game,
            not be controlled by someone else&apos;s.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease }}
            className="mt-8 flex flex-col gap-4"
          >
            <Link
              href={GUEST_APP_HREF}
              className={`${uiBtnPrimary} group relative inline-flex w-full max-w-md flex-col items-start gap-1 overflow-hidden rounded-2xl px-6 py-4 text-left shadow-[0_24px_60px_-24px_rgba(22,82,240,0.65)] ring-2 ring-primary/25 ring-offset-2 ring-offset-background transition-transform hover:scale-[1.02] sm:flex-row sm:items-center sm:gap-3 sm:py-4`}
            >
              <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/15 blur-2xl" />
              <span className="relative flex flex-1 flex-col">
                <span className="flex items-center gap-2 text-[14px] font-bold tracking-[0.12em] sm:text-[15px]">
                  EXPLORE AS GUEST
                  <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="mt-1 text-[11px] font-medium tracking-wide text-white/85">
                  No wallet · explore the full app · see before you buy $VEXORA
                </span>
              </span>
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              {authenticated ? (
                <Link
                  href="/app"
                  className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface/40 px-6 py-3.5 text-[13px] font-semibold tracking-[0.08em] text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
                >
                  OPEN HOME
                  <IconArrow className="h-4 w-4" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => login()}
                  disabled={!ready}
                  className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface/40 px-6 py-3.5 text-[13px] font-semibold tracking-[0.08em] text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 disabled:opacity-60"
                >
                  CONNECT WALLET
                </button>
              )}
              <Link
                href={GUEST_APP_HREF}
                className="text-[12px] font-semibold tracking-[0.08em] text-primary transition-colors hover:text-primary-hover"
              >
                Jump to markets →
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease }}
            className="mt-5 max-w-md"
          >
            <TokenCaChip variant="panel" />
          </motion.div>

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
                  className="h-9 w-9 rounded-full border-2 border-background bg-surface object-cover ring-1 ring-primary/10"
                />
              ))}
            </div>
            <OnlineCounter />
          </motion.div>
        </div>

        <div className="relative mx-auto mt-6 w-full max-w-[560px] self-end lg:mx-0 lg:mt-0 lg:h-full lg:w-full lg:max-w-none lg:self-stretch lg:-mr-4 xl:-mr-16">
          <motion.div
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease }}
            className="relative aspect-[4/3] w-full lg:aspect-auto lg:h-full"
          >
            <div className="absolute inset-0 rounded-[2rem] border border-primary/10 bg-gradient-to-br from-primary/8 via-background to-primary/5" />
            <div className="absolute inset-0 rounded-[2rem] bg-grid opacity-40 [mask-image:radial-gradient(ellipse_80%_70%_at_50%_50%,#000_40%,transparent_100%)]" />

            <div className="absolute left-[10%] top-[12%] h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
            <div className="absolute bottom-[18%] right-[12%] h-32 w-32 rounded-full bg-primary/15 blur-3xl" />

            <div className="relative flex h-full flex-col justify-end gap-3 p-5 sm:p-6 lg:hidden">
              {cards.map((c, i) => (
                <motion.div
                  key={c.label + i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.08, ease }}
                >
                  <StatCard label={c.label} yes={c.yes} no={c.no} delay={0} staticCard />
                </motion.div>
              ))}
            </div>

            {cards.map((c, i) => (
              <StatCard
                key={`desktop-${c.label}-${i}`}
                className={`hidden lg:block ${CARD_POS[i].className}`}
                label={c.label}
                yes={c.yes}
                no={c.no}
                delay={CARD_POS[i].delay}
                float={CARD_POS[i].float}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
