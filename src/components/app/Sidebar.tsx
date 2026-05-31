"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets as useSolanaWallets } from "@privy-io/react-auth/solana";
import Logo from "@/components/Logo";
import Sparkline from "./Sparkline";
import { genSpark } from "@/lib/spark";
import { truncateAddress } from "@/lib/user";
import {
  IconHome,
  IconFeed,
  IconGrid,
  IconPlus,
  IconChart2,
  IconBell,
  IconMail,
  IconTrophy,
  IconUsers,
  IconBookmark,
  IconSettings,
  IconWallet,
} from "@/components/icons";

const NAV = [
  { label: "Home", href: "/app", icon: IconHome },
  { label: "Feed", href: "/app/feed", icon: IconFeed },
  { label: "Markets", href: "/app/markets", icon: IconGrid },
  { label: "Create Market", href: "/app/create-market", icon: IconPlus },
  { label: "Portfolio", href: "/app/portfolio", icon: IconChart2 },
  { label: "Notifications", href: "/app/notifications", icon: IconBell, badge: 3 },
  { label: "Messages", href: "/app/messages", icon: IconMail },
  { label: "Leaderboard", href: "/app/leaderboard", icon: IconTrophy },
  { label: "Profiles", href: "/app/profile", icon: IconUsers },
  { label: "Bookmarks", href: "/app/bookmarks", icon: IconBookmark },
  { label: "Settings", href: "/app/settings", icon: IconSettings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { connectWallet } = usePrivy();
  const { wallets } = useSolanaWallets();
  const wallet = wallets[0]?.address;
  const spark = genSpark("portfolio", 30, 0.06);

  return (
    <aside className="sticky top-0 hidden h-screen w-[244px] shrink-0 flex-col border-r border-line bg-surface/30 lg:flex">
      <div className="flex h-16 items-center border-b border-line px-5 text-foreground">
        <Link href="/">
          <Logo />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
        {NAV.map((item) => {
          const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                active
                  ? "bg-white/[0.06] text-foreground"
                  : "text-muted hover:bg-white/[0.03] hover:text-foreground"
              }`}
            >
              <item.icon className={`h-[18px] w-[18px] ${active ? "text-foreground" : "text-faint group-hover:text-muted"}`} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-bull/20 px-1 text-[10px] font-bold text-bull">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Portfolio overview */}
      <div className="mx-3 mb-3 rounded-xl border border-line bg-surface/60 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">Portfolio Overview</p>
        <p className="mt-2 text-[11px] text-faint">Total Value</p>
        <p className="font-mono text-[22px] font-bold leading-tight text-foreground">$24,392.21</p>
        <p className="text-[12px] font-semibold text-bull">+18.47% <span className="text-faint font-normal">All Time</span></p>
        <div className="my-3">
          <Sparkline data={spark} width={196} height={42} color="#22c55e" fill strokeWidth={1.5} />
        </div>
        <div className="flex items-center justify-between border-t border-line pt-3">
          <div>
            <p className="text-[10px] text-faint">Buying Power</p>
            <p className="font-mono text-[13px] font-semibold text-foreground">$4,201.66</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-faint">Positions</p>
            <p className="font-mono text-[13px] font-semibold text-foreground">12</p>
          </div>
        </div>
      </div>

      <div className="px-3 pb-4">
        <button
          onClick={() => connectWallet()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3 py-3 text-[12.5px] font-semibold tracking-wide text-foreground transition-colors hover:border-white/25"
        >
          <IconWallet className="h-4 w-4" />
          {wallet ? truncateAddress(wallet, 4) : "Connect Wallet"}
        </button>
      </div>
    </aside>
  );
}
