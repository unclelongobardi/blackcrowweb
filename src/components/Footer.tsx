"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Logo from "./Logo";
import { IconArrow, IconTwitterX, IconDexscreener } from "./icons";
import TokenCaChip from "./TokenCaChip";
import { TWITTER_URL, DEXSCREENER_URL } from "@/lib/links";
import { uiBtnPrimary } from "@/lib/uiClasses";

const ease = [0.16, 1, 0.3, 1] as const;

const SOCIALS = [
  {
    label: "X (Twitter)",
    href: TWITTER_URL,
    render: () => <IconTwitterX className="h-[18px] w-[18px]" />,
  },
  {
    label: "Dexscreener",
    href: DEXSCREENER_URL,
    render: () => <IconDexscreener className="h-[18px] w-[18px] rounded-sm" />,
  },
] as const;

export default function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <footer id="join" className="relative scroll-mt-24 overflow-hidden border-t border-line">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.18] [mask-image:radial-gradient(ellipse_60%_120%_at_10%_100%,#000_10%,transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-32 left-0 h-72 w-72 rounded-full bg-sky-500/[0.04] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
          className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <Logo className="text-foreground" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Coordinate market plays, fund bounties in SOL, and rank on Leaderboard.
            </p>
            <TokenCaChip variant="panel" className="mt-5 max-w-md" />
          </div>

          <div className="w-full max-w-md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email) setSent(true);
              }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 rounded-xl border border-line bg-surface/60 px-4 py-3.5 text-sm text-foreground placeholder:text-faint outline-none transition-colors focus:border-black/20"
              />
              <button
                type="submit"
                className={`${uiBtnPrimary} group inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-[13px] font-bold tracking-[0.06em] transition-transform hover:scale-[1.03]`}
              >
                {sent ? "JOINED" : "JOIN THE NETWORK"}
                <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
            <div className="mt-4 flex items-center gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-foreground transition-colors hover:border-black/20 hover:text-bull"
                >
                  {s.render()}
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
          <p className="text-[11px] tracking-[0.12em] text-faint">
            © 2026 VEXORA NETWORK. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-7 text-[11px] font-medium tracking-[0.12em] text-faint">
            <Link href="/terms" className="transition-colors hover:text-foreground">
              TERMS
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              PRIVACY
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
