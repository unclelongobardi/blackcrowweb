"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useGuestGuard } from "@/hooks/useGuestGuard";
import { uiBtnPrimary } from "@/lib/uiClasses";
import { IconArrow } from "@/components/icons";

export default function GuestBlockedModal({
  title = "Log in to continue",
  message = "Guest access is browse-only. Connect a wallet to use this feature.",
  onClose,
}: {
  title?: string;
  message?: string;
  onClose: () => void;
}) {
  const { login, ready } = usePrivy();
  const { isGuest } = useGuestGuard();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm">
      <div className="glass w-full max-w-md rounded-2xl p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          {isGuest ? "Guest access" : "Sign in required"}
        </p>
        <h2 className="mt-2 font-display text-xl font-extrabold tracking-tight text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={login}
            disabled={!ready}
            className={`${uiBtnPrimary} inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-[12px] font-bold tracking-[0.08em] disabled:opacity-60`}
          >
            LOG IN
            <IconArrow className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-line px-5 py-3 text-[12px] font-semibold text-muted transition-colors hover:border-primary/25 hover:text-foreground"
          >
            Keep browsing
          </button>
        </div>
      </div>
    </div>
  );
}
