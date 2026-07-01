"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import Logo from "@/components/Logo";
import TokenCaChip from "@/components/TokenCaChip";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Onboarding from "./Onboarding";
import GuestBanner from "./GuestBanner";
import { AppContext, type Me } from "./appContext";
import { useApi } from "@/lib/useApi";
import { GUEST_APP_HREF, readGuestMode, writeGuestMode } from "@/lib/guestMode";
import { uiNav, uiBtnPrimary } from "@/lib/uiClasses";
import {
  IconArrow,
  IconHome,
  IconGrid,
  IconCabal,
  IconRank,
  IconMail,
  IconBell,
} from "@/components/icons";

const MOBILE_NAV = [
  { label: "Home", href: "/app", icon: IconHome },
  { label: "Markets", href: "/app/markets", icon: IconGrid },
  { label: "Cabals", href: "/app/cabals", icon: IconCabal },
  { label: "Rank", href: "/app/leaderboard", icon: IconRank },
  { label: "Chat", href: "/app/messages", icon: IconMail },
  { label: "Alerts", href: "/app/notifications", icon: IconBell },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, login } = usePrivy();
  const api = useApi();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [me, setMe] = useState<Me | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [guestReady, setGuestReady] = useState(false);

  const enterGuestMode = useCallback(() => {
    writeGuestMode(true);
    setIsGuest(true);
  }, []);

  const exitGuestMode = useCallback(() => {
    writeGuestMode(false);
    setIsGuest(false);
  }, []);

  useEffect(() => {
    if (searchParams.get("guest") === "1") {
      writeGuestMode(true);
      setIsGuest(true);
      router.replace(pathname, { scroll: false });
    } else {
      setIsGuest(readGuestMode());
    }
    setGuestReady(true);
  }, [searchParams, pathname, router]);

  useEffect(() => {
    if (authenticated) {
      writeGuestMode(false);
      setIsGuest(false);
    }
  }, [authenticated]);

  const refreshMe = useCallback(async () => {
    setLoadingMe(true);
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const data = await api<Me>("/api/me");
        if (data.authenticated) {
          setMe(data);
          setLoadingMe(false);
          return;
        }
      } catch {
        /* Privy token may not be ready yet on cold load */
      }
      await new Promise((r) => setTimeout(r, 150 * (attempt + 1)));
    }
    setMe(null);
    setLoadingMe(false);
  }, [api]);

  useEffect(() => {
    if (ready && authenticated) refreshMe();
    else if (ready && !authenticated) setLoadingMe(false);
  }, [ready, authenticated, refreshMe]);

  const canEnterApp = authenticated || isGuest;

  if (!ready || !guestReady || (authenticated && loadingMe)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-foreground" />
      </div>
    );
  }

  if (!canEnterApp) {
    return (
      <div className="bg-grid bg-grid-fade flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Logo />
        <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
          Open platform access
        </p>
        <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-4xl">
          EXPLORE VALORE
        </h1>
        <p className="mt-3 max-w-md text-sm text-muted">
          Browse markets, bounties, cabals, and the feed as a guest — no wallet, no signup. Connect when you&apos;re
          ready to participate.
        </p>
        <div className="mt-8 flex w-full max-w-lg flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={GUEST_APP_HREF}
            onClick={enterGuestMode}
            className={`${uiBtnPrimary} group relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-2xl px-8 py-4 text-[13px] font-bold tracking-[0.1em] shadow-[0_20px_50px_-20px_rgba(22,82,240,0.55)] transition-transform hover:scale-[1.02]`}
          >
            <span className="pointer-events-none absolute inset-0 animate-pulse bg-white/10" />
            EXPLORE AS GUEST
            <IconArrow className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <button
            type="button"
            onClick={login}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-line px-8 py-4 text-[13px] font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
          >
            LOG IN
          </button>
        </div>
        <p className="mt-4 text-[11px] text-faint">Guest access is browse-only — connect to post, vote, and earn VALORE score.</p>
        <div className="mt-6 w-full max-w-md">
          <TokenCaChip variant="panel" />
        </div>
        <Link href="/" className="mt-6 text-[12px] font-medium text-muted transition-colors hover:text-foreground">
          ← Back to landing
        </Link>
      </div>
    );
  }

  const needsOnboarding = me && !me.profile.is_onboarded;

  return (
    <AppContext.Provider value={{ me, refreshMe, isGuest, enterGuestMode, exitGuestMode }}>
      {needsOnboarding && <Onboarding onDone={refreshMe} />}
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <GuestBanner />
          <TopBar />
          <main className="mobile-main-pad flex-1 lg:pb-0">{children}</main>
        </div>
      </div>

      <nav className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-line bg-background/95 backdrop-blur-xl lg:hidden">
        <div className="flex items-stretch justify-start gap-0.5 overflow-x-auto px-1 py-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {MOBILE_NAV.map((item) => {
            const active =
              item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${uiNav} flex min-h-11 min-w-[4.25rem] shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1.5 text-[9px] sm:min-w-[4.75rem] sm:text-[10px] ${
                  active ? "text-foreground" : "text-faint"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </AppContext.Provider>
  );
}
