"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import Logo from "@/components/Logo";
import Avatar from "./Avatar";
import Onboarding from "./Onboarding";
import { AppContext, type Me } from "./appContext";
import { useApi } from "@/lib/useApi";
import {
  IconFeed,
  IconGrid,
  IconBolt,
  IconUsers,
  IconTrophy,
  IconWallet,
  IconUser,
  IconArrow,
} from "@/components/icons";

const NAV = [
  { label: "War Room", href: "/app", icon: IconFeed },
  { label: "Markets", href: "/app/markets", icon: IconGrid },
  { label: "Operations", href: "/app/operations", icon: IconBolt },
  { label: "Cabals", href: "/app/cabals", icon: IconUsers },
  { label: "The Roost", href: "/app/leaderboard", icon: IconTrophy },
  { label: "Bounties", href: "/app/rewards", icon: IconWallet },
  { label: "Profile", href: "/app/profile", icon: IconUser },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, login, logout } = usePrivy();
  const api = useApi();
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      const data = await api<Me>("/api/me");
      setMe(data);
    } catch {
      setMe(null);
    } finally {
      setLoadingMe(false);
    }
  }, [api]);

  useEffect(() => {
    if (ready && authenticated) {
      refreshMe();
    } else if (ready && !authenticated) {
      setLoadingMe(false);
    }
  }, [ready, authenticated, refreshMe]);

  if (!ready || (authenticated && loadingMe)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-foreground" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="bg-grid bg-grid-fade flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Logo />
        <h1 className="mt-8 font-display text-4xl font-extrabold tracking-tight">THE NETWORK IS PRIVATE</h1>
        <p className="mt-3 max-w-sm text-sm text-muted">
          Connect a Solana wallet (Phantom or Solflare) to enter the war room.
        </p>
        <div className="mt-7 flex gap-3">
          <button
            onClick={login}
            className="group inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-[13px] font-bold tracking-[0.08em] text-black transition-transform hover:scale-[1.03]"
          >
            CONNECT WALLET
            <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
          <Link
            href="/"
            className="inline-flex items-center rounded-xl border border-line px-6 py-3.5 text-[13px] font-semibold text-foreground transition-colors hover:border-white/25"
          >
            Back home
          </Link>
        </div>
      </div>
    );
  }

  const needsOnboarding = me && !me.profile.is_onboarded;

  return (
    <AppContext.Provider value={{ me, refreshMe }}>
      {needsOnboarding && <Onboarding onDone={refreshMe} />}
      <div className="flex min-h-screen bg-background">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line p-4 lg:flex">
          <Link href="/" className="mb-6 px-2 text-foreground">
            <Logo />
          </Link>
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => {
              const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                    active
                      ? "bg-white/[0.06] text-foreground"
                      : "text-faint hover:bg-white/[0.03] hover:text-muted"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {me && (
            <div className="mt-auto rounded-xl border border-line bg-surface/40 p-3">
              <div className="flex items-center gap-2.5">
                <Avatar seed={me.profile.avatar_seed} label={me.profile.codename} size={36} />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-foreground">{me.profile.codename}</p>
                  <p className="text-[11px] text-faint">Rank #{me.stats.rank}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-lg bg-surface px-3 py-2">
                <span className="text-[11px] tracking-wide text-faint">FEATHERS</span>
                <span className="font-mono text-[13px] font-bold text-bull">
                  {me.profile.influence.toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => logout()}
                className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-[11px] font-semibold tracking-wide text-bear transition-colors hover:border-bear/40 hover:bg-bear/10"
              >
                LOG OUT
              </button>
            </div>
          )}
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile top bar */}
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
            <Link href="/" className="text-foreground">
              <Logo />
            </Link>
            {me && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[12px] font-bold text-bull">
                  {me.profile.influence.toLocaleString()}
                </span>
                <Avatar seed={me.profile.avatar_seed} label={me.profile.codename} size={30} />
              </div>
            )}
          </div>

          {/* Mobile nav */}
          <div className="flex gap-1 overflow-x-auto border-b border-line px-3 py-2 lg:hidden">
            {NAV.map((item) => {
              const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[12px] font-medium ${
                    active ? "bg-white/[0.06] text-foreground" : "text-faint"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </AppContext.Provider>
  );
}
