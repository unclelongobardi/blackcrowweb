"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";
import { IconArrow } from "./icons";

const LINKS = [
  { label: "HOME", href: "#home" },
  { label: "MARKETS", href: "#markets" },
  { label: "FEED", href: "#feed" },
  { label: "LEADERBOARD", href: "#leaderboard" },
  { label: "ABOUT", href: "#about" },
];

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
        <nav className="flex h-16 items-center justify-between">
          <a href="#home" className="text-foreground">
            <Logo />
          </a>

          <ul className="hidden items-center gap-9 lg:flex">
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
          </ul>

          <div className="flex items-center gap-3">
            <a
              href="#login"
              className="hidden rounded-lg border border-line px-4 py-2 text-[12px] font-semibold tracking-[0.12em] text-muted transition-colors hover:border-white/25 hover:text-foreground sm:block"
            >
              LOGIN
            </a>
            <a
              href="#join"
              className="group inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-[12px] font-bold tracking-[0.1em] text-black transition-transform hover:scale-[1.03]"
            >
              JOIN THE NETWORK
              <IconArrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>

            <button
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-foreground lg:hidden"
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
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden lg:hidden"
            >
              <div className="flex flex-col gap-1 pb-4 pt-2">
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
              </div>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
