"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { IconArrow } from "./icons";

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
      <div className={`glass glass-hover ${float} rounded-xl p-3 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.95)]`}>
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

const AVATAR_COLORS = [
  "from-emerald-500/40 to-teal-700/40",
  "from-fuchsia-500/40 to-purple-700/40",
  "from-sky-500/40 to-blue-700/40",
  "from-amber-500/40 to-orange-700/40",
  "from-rose-500/40 to-red-700/40",
];

export default function Hero() {
  const { ready, authenticated, login } = usePrivy();

  return (
    <section id="home" className="relative overflow-hidden pt-32 sm:pt-36 lg:pt-40">
      {/* Animated background grid */}
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade opacity-70" />
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[480px] w-[480px] rounded-full bg-emerald-500/5 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-20 h-[420px] w-[420px] rounded-full bg-white/[0.03] blur-[120px]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-6 lg:pb-28">
        {/* LEFT */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-bull animate-pulse-dot" />
            <span className="text-[11px] font-medium tracking-[0.14em] text-muted">
              LIVE PREDICTION MARKETS
            </span>
          </motion.div>

          <h1 className="font-display text-[clamp(2.6rem,7vw,5.2rem)] font-extrabold leading-[0.92] tracking-tight">
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05, ease }}
              className="block text-foreground text-glow"
            >
              PREDICT CHAOS.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease }}
              className="block text-foreground text-glow"
            >
              MOVE MARKETS.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease }}
              className="block bg-gradient-to-r from-neutral-600 to-neutral-400 bg-clip-text text-transparent"
            >
              STAY ANONYMOUS.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease }}
            className="mt-6 max-w-md border-l border-line pl-4 text-sm leading-relaxed tracking-wide text-muted"
          >
            THE FIRST SOCIAL NETWORK FOR
            <br />
            COMPLETELY UNQUALIFIED MARKET MANIPULATORS.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            {authenticated ? (
              <Link
                href="/account"
                className="group inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-[13px] font-bold tracking-[0.08em] text-black transition-transform hover:scale-[1.03]"
              >
                ENTER THE NETWORK
                <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <button
                onClick={() => login()}
                disabled={!ready}
                className="group inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-[13px] font-bold tracking-[0.08em] text-black transition-transform hover:scale-[1.03] disabled:opacity-60"
              >
                JOIN THE NETWORK
                <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            )}
            <a
              href="#markets"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface/40 px-6 py-3.5 text-[13px] font-semibold tracking-[0.08em] text-foreground transition-colors hover:border-white/25 hover:bg-surface"
            >
              EXPLORE MARKETS
            </a>
          </motion.div>

          {/* Avatars + counter */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55, ease }}
            className="mt-9 flex items-center gap-4"
          >
            <div className="flex -space-x-2.5">
              {AVATAR_COLORS.map((c, i) => (
                <div
                  key={i}
                  className={`h-9 w-9 rounded-full border-2 border-background bg-gradient-to-br ${c} ring-1 ring-white/10`}
                />
              ))}
            </div>
            <div>
              <p className="font-mono text-base font-bold leading-none text-foreground">10,892</p>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] tracking-[0.12em] text-faint">
                <span className="h-1.5 w-1.5 rounded-full bg-bull animate-pulse-dot" />
                DEGENS ONLINE
              </p>
            </div>
          </motion.div>
        </div>

        {/* RIGHT — raven + floating cards */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease }}
            className="relative mx-auto aspect-square w-full max-w-[560px]"
          >
            <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-background via-transparent to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/3 bg-gradient-to-t from-background to-transparent" />
            <Image
              src="/images/raven-hero.png"
              alt="BLACKCROW raven"
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 560px"
              className="object-contain object-center"
            />
          </motion.div>

          <StatCard
            className="left-2 top-6 sm:left-4"
            label="Fed rate cut · May 2025?"
            yes="42%"
            no="58%"
            delay={0.7}
          />
          <StatCard
            className="right-0 top-0"
            label="Smelldown"
            yes="78%"
            delay={0.85}
            float="animate-float-slow"
          />
          <StatCard
            className="bottom-4 right-2 sm:right-6"
            label="Bitcoin ATH this week?"
            yes="63%"
            no="37%"
            delay={1}
          />
        </div>
      </div>
    </section>
  );
}
