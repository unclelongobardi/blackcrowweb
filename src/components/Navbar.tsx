"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";
import AuthControls from "./AuthControls";
import CopyButton from "./CopyButton";
import { IconTwitterX } from "./icons";
import { TWITTER_URL } from "@/lib/links";

const LINKS = [
  { label: "HOME", href: "#home" },
  { label: "FEED", href: "#feed" },
  { label: "LEADERBOARD", href: "#leaderboard" },
  { label: "ABOUT", href: "#about" },
] as const;

const DOCS_HREF = "/docs";

const TOKEN_CA = process.env.NEXT_PUBLIC_TOKEN_CA?.trim() ?? "";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={`mx-auto transition-all duration-500 ${
          scrolled
            ? "mt-3 max-w-6xl rounded-2xl glass px-4 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)]"
            : "mt-0 max-w-7xl border-b border-line/60 bg-transparent px-6"
        }`}
      >
        <nav className="flex h-16 items-center justify-between gap-3">
          <a href="#home" className="shrink-0 text-foreground">
            <Logo showText={false} />
          </a>

          <ul className="hidden items-center gap-7 xl:flex">
            {LINKS.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="group relative text-[12px] font-medium tracking-[0.14em] text-muted transition-colors hover:text-foreground"
                >
                  {l.label}
                  <span className="absolute -bottom-1.5 left-1/2 h-px w-0 -translate-x-1/2 bg-foreground transition-all duration-300 group-hover:w-full" />
                </a>
              </li>
            ))}
            <li>
              <Link
                href={DOCS_HREF}
                className="group relative text-[12px] font-medium tracking-[0.14em] text-muted transition-colors hover:text-foreground"
              >
                DOCS
                <span className="absolute -bottom-1.5 left-1/2 h-px w-0 -translate-x-1/2 bg-foreground transition-all duration-300 group-hover:w-full" />
              </Link>
            </li>
          </ul>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
            <div
              className="hidden items-center gap-2 rounded-xl border border-line bg-surface/40 px-2 py-1.5 lg:flex"
              title="Token contract address"
            >
              <span className="text-[10px] font-bold tracking-wide text-faint">CA</span>
              {TOKEN_CA ? (
                <>
                  <span className="max-w-[120px] truncate font-mono text-[10px] text-muted xl:max-w-[160px]">
                    {TOKEN_CA}
                  </span>
                  <CopyButton value={TOKEN_CA} label="Copy" />
                </>
              ) : (
                <span className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-faint">TBA</span>
              )}
            </div>

            <a
              href={TWITTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="ui-nav hidden h-9 w-9 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:border-white/25 hover:text-foreground sm:flex"
            >
              <IconTwitterX className="h-4 w-4" />
            </a>

            <AuthControls />

            <button
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line text-foreground xl:hidden"
            >
              <span className="relative flex h-4 w-5 flex-col justify-between">
                <span className={`h-0.5 w-full bg-current transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`} />
                <span className={`h-0.5 w-full bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
                <span className={`h-0.5 w-full bg-current transition-transform ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden xl:hidden"
            >
              <div className="flex flex-col gap-1 border-t border-line pb-4 pt-2">
                {LINKS.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-[13px] font-medium tracking-[0.12em] text-muted hover:bg-white/5 hover:text-foreground"
                  >
                    {l.label}
                  </a>
                ))}
                <Link
                  href={DOCS_HREF}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-[13px] font-medium tracking-[0.12em] text-muted hover:bg-white/5 hover:text-foreground"
                >
                  DOCS
                </Link>
                <div className="mt-2 flex items-center justify-between rounded-lg border border-line bg-surface/30 px-3 py-2.5">
                  <div>
                    <p className="text-[10px] font-bold text-faint">CA</p>
                    <p className="font-mono text-[11px] text-muted">{TOKEN_CA || "TBA"}</p>
                  </div>
                  {TOKEN_CA && <CopyButton value={TOKEN_CA} />}
                </div>
                <a
                  href={TWITTER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] text-muted hover:bg-white/5 hover:text-foreground"
                >
                  <IconTwitterX className="h-4 w-4" /> X / Twitter
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
