"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { getUserHandle, getUserInitials } from "@/lib/user";
import { IconArrow, IconUser, IconChart2, IconWallet } from "./icons";

export default function AuthControls() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!ready) {
    return <div className="h-9 w-36 animate-pulse rounded-lg bg-white/[0.06]" />;
  }

  if (!authenticated) {
    return (
      <>
        <button
          onClick={login}
          className="hidden rounded-lg border border-line px-4 py-2 text-[12px] font-semibold tracking-[0.12em] text-muted transition-colors hover:border-white/25 hover:text-foreground sm:block"
        >
          LOGIN
        </button>
        <button
          onClick={login}
          className="group inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-[12px] font-bold tracking-[0.1em] text-black transition-transform hover:scale-[1.03]"
        >
          JOIN THE NETWORK
          <IconArrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-2 rounded-lg border border-line bg-surface/60 py-1.5 pl-1.5 pr-3 transition-colors hover:border-white/25"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-sky-400/50 to-cyan-600/50 text-[11px] font-bold text-white ring-1 ring-white/10">
          {getUserInitials(user)}
        </span>
        <span className="max-w-[120px] truncate text-[12px] font-medium text-foreground">
          {getUserHandle(user)}
        </span>
        <span className={`text-faint transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl glass p-1.5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.95)]">
          <div className="border-b border-line px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">Signed in as</p>
            <p className="mt-0.5 truncate text-[13px] font-medium text-foreground">{getUserHandle(user)}</p>
          </div>
          <Link
            href="/app"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-muted transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            <IconChart2 className="h-4 w-4" /> The Nest
          </Link>
          <Link
            href="/app/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-muted transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            <IconUser className="h-4 w-4" /> Profile
          </Link>
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-muted transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            <IconWallet className="h-4 w-4" /> Wallet
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="mt-1 flex w-full items-center gap-2.5 rounded-lg border-t border-line px-3 py-2.5 text-left text-[13px] text-bear transition-colors hover:bg-bear/10"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
