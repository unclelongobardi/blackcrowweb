"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import Logo from "@/components/Logo";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Onboarding from "./Onboarding";
import { AppContext, type Me } from "./appContext";
import { useApi } from "@/lib/useApi";
import { uiNav, uiBtnPrimary } from "@/lib/uiClasses";
import {
  IconArrow,
  IconTarget,
  IconGrid,
  IconCabal,
  IconRoost,
  IconMail,
  IconBell,
} from "@/components/icons";

const MOBILE_NAV = [
  { label: "Hub", href: "/app", icon: IconTarget },
  { label: "Markets", href: "/app/markets", icon: IconGrid },
  { label: "Cabals", href: "/app/cabals", icon: IconCabal },
  { label: "Roost", href: "/app/leaderboard", icon: IconRoost },
  { label: "Msgs", href: "/app/messages", icon: IconMail },
  { label: "Alerts", href: "/app/notifications", icon: IconBell },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, login } = usePrivy();
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
    if (ready && authenticated) refreshMe();
    else if (ready && !authenticated) setLoadingMe(false);
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
        <h1 className="mt-8 font-display text-2xl font-extrabold tracking-tight sm:text-4xl">
          MEMBERS ONLY (KIND OF)
        </h1>
        <p className="mt-3 max-w-sm text-sm text-muted">
          Connect a Solana wallet (Phantom or Solflare) to get in. No email, no
          name, no awkward small talk.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={login}
            className={`${uiBtnPrimary} group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-[13px] font-bold text-black`}
          >
            CONNECT WALLET
            <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line px-6 py-3.5 text-[13px] font-semibold text-foreground transition-colors hover:border-white/25"
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
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
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
