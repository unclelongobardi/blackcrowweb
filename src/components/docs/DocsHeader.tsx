"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import AuthControls from "@/components/AuthControls";
import TokenCaChip from "@/components/TokenCaChip";
import { IconTwitterX, IconArrow } from "@/components/icons";
import { TWITTER_URL } from "@/lib/links";

export default function DocsHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-foreground">
            <Logo showText={false} />
          </Link>
          <span className="hidden h-4 w-px bg-line sm:block" />
          <span className="hidden text-[12px] font-bold tracking-[0.14em] text-muted sm:block">DOCS</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <TokenCaChip className="hidden shrink-0 md:flex" />

          {TWITTER_URL && (
            <a
              href={TWITTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="ui-nav hidden h-9 w-9 items-center justify-center rounded-lg border border-line text-muted hover:text-foreground sm:flex"
            >
              <IconTwitterX className="h-4 w-4" />
            </a>
          )}

          <Link
            href="/"
            className="hidden items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[11px] font-semibold text-muted transition-colors hover:text-foreground md:inline-flex"
          >
            <IconArrow className="h-3.5 w-3.5 rotate-180" />
            Home
          </Link>

          <AuthControls />
        </div>
      </div>
    </header>
  );
}
