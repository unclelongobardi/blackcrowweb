"use client";

import { usePrivy } from "@privy-io/react-auth";
import { uiBtnPrimary } from "@/lib/uiClasses";
import { IconArrow } from "@/components/icons";

export default function GuestLoginPrompt({
  title = "Connect to participate",
  message = "You're browsing as a guest. Connect a Solana wallet to post, vote, create bounties, and earn VEX.",
  compact = false,
}: {
  title?: string;
  message?: string;
  compact?: boolean;
}) {
  const { login, ready } = usePrivy();

  return (
    <div
      className={`rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 to-background ${
        compact ? "p-4" : "p-6 sm:p-8"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Guest access</p>
      <h2 className={`mt-2 font-display font-extrabold tracking-tight text-foreground ${compact ? "text-lg" : "text-xl sm:text-2xl"}`}>
        {title}
      </h2>
      <p className={`mt-2 text-muted ${compact ? "text-[13px]" : "text-sm"}`}>{message}</p>
      <button
        type="button"
        onClick={login}
        disabled={!ready}
        className={`${uiBtnPrimary} group mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[12px] font-bold tracking-[0.08em] disabled:opacity-60`}
      >
        LOG IN
        <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
}
