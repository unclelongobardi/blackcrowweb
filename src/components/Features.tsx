"use client";

import { motion } from "framer-motion";
import {
  IconSkull,
  IconChart,
  IconUsers,
  IconBolt,
  IconTrophy,
} from "./icons";

const ease = [0.16, 1, 0.3, 1] as const;

const FEATURES = [
  {
    icon: IconSkull,
    title: "ANONYMOUS BY DESIGN",
    desc: "No KYC. No real names. A Solana wallet and a codename are all you bring.",
  },
  {
    icon: IconUsers,
    title: "FORM CABALS",
    desc: "Band into squads that move as one shadow. Pool conviction and influence.",
  },
  {
    icon: IconBolt,
    title: "RUN OPERATIONS",
    desc: "Coordinate raids on live Polymarket markets. Pick a side and move the line.",
  },
  {
    icon: IconChart,
    title: "DEBATE & INFLUENCE",
    desc: "The war room is where narratives are forged. Attention is liquidity.",
  },
  {
    icon: IconTrophy,
    title: "EARN FEATHERS",
    desc: "Complete bounties, win operations, climb the Roost. Influence is the only currency.",
  },
];

export default function Features() {
  return (
    <section id="about" className="relative scroll-mt-24 px-6 py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade opacity-30" />
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-[12px] font-semibold tracking-[0.22em] text-faint">WHY JOIN BLACKCROW</p>
          <h2 className="mt-4 font-display text-[clamp(1.9rem,4.5vw,3.2rem)] font-extrabold leading-[1.02] tracking-tight">
            <span className="block text-foreground">INFORMATION IS POWER.</span>
            <span className="block">
              <span className="text-foreground">MANIPULATION IS </span>
              <span className="bg-gradient-to-r from-neutral-600 to-neutral-400 bg-clip-text text-transparent">
                AN ART.
              </span>
            </span>
          </h2>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease }}
              className="glass glass-hover group relative overflow-hidden rounded-2xl p-6"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/[0.03] blur-2xl transition-opacity duration-500 group-hover:bg-emerald-500/10" />
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface-2 text-foreground transition-colors group-hover:border-white/20 group-hover:text-bull">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-[12.5px] font-bold tracking-[0.1em] text-foreground">{f.title}</h3>
              <p className="mt-2.5 text-[13px] leading-relaxed text-muted">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
