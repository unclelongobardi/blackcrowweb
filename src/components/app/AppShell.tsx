"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import Logo from "@/components/Logo";
import Avatar from "./Avatar";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Onboarding from "./Onboarding";
import { AppContext, type Me } from "./appContext";
import { useApi } from "@/lib/useApi";
import { IconArrow, IconHome, IconGrid, IconTrophy, IconUser } from "@/components/icons";

const MOBILE_NAV = [
  { label: "Bounties", href: "/app", icon: IconHome },
  { label: "Markets", href: "/app/markets", icon: IconGrid },
  { label: "Ops", href: "/app/operations", icon: IconTrophy },
  { label: "Profile", href: "/app/profile", icon: IconUser },
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
        <h1 className="mt-8 font-display text-4xl font-extrabold tracking-tight">MEMBERS ONLY (KIND OF)</h1>
        <p className="mt-3 max-w-sm text-sm text-muted">
          Connect a Solana wallet (Phantom or Solflare) to get in. No email, no
          name, no awkward small talk.
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
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 pb-20 lg:pb-0">{children}</main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-line bg-background/90 px-2 py-2 backdrop-blur-xl lg:hidden">
        {MOBILE_NAV.map((item) => {
          const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-[10px] ${
                active ? "text-foreground" : "text-faint"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        <Avatar seed={me?.profile.avatar_seed} label={me?.profile.codename} size={26} />
      </nav>
    </AppContext.Provider>
  );
}
