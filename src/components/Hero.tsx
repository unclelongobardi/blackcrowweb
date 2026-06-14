"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { GUEST_APP_HREF } from "@/lib/guestMode";
import { VEXORA_LOGO_SRC } from "@/lib/links";
import { uiBtnPrimary } from "@/lib/uiClasses";
import { IconArrow } from "./icons";
import OnlineCounter from "./OnlineCounter";
import TokenCaChip from "./TokenCaChip";

const ease = [0.16, 1, 0.3, 1] as const;

const AVATAR_IMAGES = [
  "/images/avatars/av1.png",
  "/images/avatars/av2.png",
  "/images/avatars/av3.png",
  "/images/avatars/av4.png",
  "/images/avatars/av5.png",
  "/images/avatars/av6.png",
];

function HeroLogoMark() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.15, ease }}
      className="relative mx-auto flex w-full max-w-[min(92vw,520px)] items-center justify-center lg:max-w-none lg:h-full"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[min(88vw,440px)] w-[min(88vw,440px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-[90px]" />
      <div className="pointer-events-none absolute left-1/2 top-[54%] h-[min(56vw,300px)] w-[min(56vw,300px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.08] blur-[70px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[min(74vw,390px)] w-[min(74vw,390px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[min(62vw,330px)] w-[min(62vw,330px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary/15" />

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 px-4 py-8 sm:px-8 lg:py-0"
      >
        <Image
          src={VEXORA_LOGO_SRC}
          alt="VEXORA"
          width={520}
          height={520}
          priority
          className="h-auto w-[min(76vw,440px)] object-contain drop-shadow-[0_32px_64px_rgba(22,82,240,0.16)] lg:w-[min(36vw,480px)] xl:w-[min(34vw,520px)]"
        />
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
  const { ready, authenticated, login } = usePrivy();

  return (
    <section id="home" className="relative overflow-hidden pt-24 sm:pt-28 lg:pt-0">
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade opacity-70" />
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[480px] w-[480px] rounded-full bg-primary/8 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-20 h-[420px] w-[420px] rounded-full bg-primary/5 blur-[120px]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 pb-12 lg:h-[calc(100svh-3rem)] lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-8 lg:pb-0 lg:pt-16">
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
                  No wallet · explore the full platform · markets, bounties & cabals
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

        <div className="relative lg:self-stretch lg:-mr-2 xl:-mr-8">
          <HeroLogoMark />
        </div>
      </div>
    </section>
  );
}
