"use client";

import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useAppContext } from "./appContext";
import TokenCaChip from "@/components/TokenCaChip";
import { uiBtnPrimary } from "@/lib/uiClasses";
import { IconArrow } from "@/components/icons";

export default function GuestBanner() {
  const { isGuest, exitGuestMode } = useAppContext();
  const { login, ready } = usePrivy();

  if (!isGuest) return null;

  return (
    <div className="border-b border-primary/20 bg-gradient-to-r from-primary/[0.08] via-primary/[0.04] to-background px-3 py-2.5 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Guest access</p>
          <p className="mt-0.5 text-[13px] text-foreground sm:text-sm">
            Browse the platform without a wallet. Connect to post, trade bounties, and earn{" "}
            <span className="font-semibold">VALORE score</span>.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <TokenCaChip className="hidden md:flex" />
          <button
            type="button"
            onClick={login}
            disabled={!ready}
            className={`${uiBtnPrimary} group inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[11px] font-bold tracking-[0.08em] disabled:opacity-60 sm:text-[12px]`}
          >
            LOG IN
            <IconArrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
          <Link
            href="/"
            onClick={exitGuestMode}
            className="rounded-xl border border-line px-3 py-2 text-[11px] font-semibold text-muted transition-colors hover:border-primary/25 hover:text-foreground sm:text-[12px]"
          >
            Exit guest
          </Link>
        </div>
      </div>
    </div>
  );
}
