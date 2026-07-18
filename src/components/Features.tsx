"use client";

import { motion } from "framer-motion";
import type { ComponentType } from "react";
import {
  IconOperator,
  IconCabal,
  IconSolana,
  IconWarRoom,
  IconGloria,
} from "./icons";

const ease = [0.16, 1, 0.3, 1] as const;

const FEATURES = [
  {
    icon: IconOperator,
    title: "STAY ANONYMOUS",
    desc: "Phantom or Solflare only. No email signup—pick a codename, set an avatar, and operate from a wallet address.",
  },
  {
    icon: IconCabal,
    title: "FIND YOUR PEOPLE",
    desc: "Join cabals by type: tipsters, MARKET OPS, or discussion. Public groups or private rooms with leader approval.",
  },
  {
    icon: IconSolana,
    title: "MOVE MARKETS TOGETHER",
    desc: "Post bounties with SOL in escrow, let others boost the pool, and hit thin-book Polymarket markets flagged on-platform.",
  },
  {
    icon: IconWarRoom,
    title: "POST YOUR TAKES",
    desc: "Home feed with bullish / bearish / neutral tags. Attach open bounties to posts and coordinate from one thread.",
  },
  {
    icon: IconGloria,
    title: "GET CLOUT",
    desc: "Stack GLORIA score from intel, bounty work, and cabals you found. Climb Leaderboard—reputation separate from SOL payouts.",
  },
] as const;

function FeatureIcon({ icon: Icon }: { icon: ComponentType<{ className?: string }> }) {
  return <Icon className="mb-4 block h-6 w-6 shrink-0 text-bull" />;
}

export default function Features() {
  return (
    <section id="about" className="relative scroll-mt-24 px-6 py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade opacity-30" />
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="section-label">WHAT IS THIS, EXACTLY?</p>
          <h2 className="mt-4 font-display text-[clamp(1.2rem,2.2vw,1.75rem)] font-extrabold leading-snug tracking-tight text-foreground">
            A SOCIAL NETWORK FOR PEOPLE WHO DON&apos;T WANT TO PLAY THE GAME.
          </h2>
          <p className="mt-2 font-display text-[clamp(1rem,1.8vw,1.35rem)] font-bold tracking-tight text-muted">
            THEY WANT TO OWN IT.
          </p>
          <p className="mx-auto mt-5 max-w-lg text-[14px] leading-relaxed text-faint">
            Connect a Solana wallet, open Home, and run coordinated plays on prediction
            markets—bounties in SOL, cabals for alignment, GLORIA score for rank.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:mt-14 lg:grid-cols-5">
          {FEATURES.map((f, i) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.06, ease }}
              className="glass glass-hover group relative flex flex-col overflow-hidden rounded-2xl border border-line/80 p-5 sm:p-5"
            >
              <FeatureIcon icon={f.icon} />
              <h3 className="text-[11px] font-bold tracking-[0.12em] text-foreground">{f.title}</h3>
              <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-muted">{f.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
