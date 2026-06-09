"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets as useSolanaWallets } from "@privy-io/react-auth/solana";
import Logo from "@/components/Logo";
import { truncateAddress } from "@/lib/user";
import { uiNav, uiBtn } from "@/lib/uiClasses";
import {
  IconTarget,
  IconGrid,
  IconCabal,
  IconMail,
  IconBell,
  IconRoost,
  IconUser,
  IconWallet,
} from "@/components/icons";

const NAV = [
  { label: "Bounties", href: "/app", icon: IconTarget, primary: true },
  { label: "Markets", href: "/app/markets", icon: IconGrid },
  { label: "Cabals", href: "/app/cabals", icon: IconCabal },
  { label: "Messages", href: "/app/messages", icon: IconMail },
  { label: "Notifications", href: "/app/notifications", icon: IconBell },
  { label: "Leaderboard", href: "/app/leaderboard", icon: IconRoost },
  { label: "Profile", href: "/app/profile", icon: IconUser },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { connectWallet } = usePrivy();
  const { wallets } = useSolanaWallets();
  const wallet = wallets[0]?.address;

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
              className={`${uiNav} group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium ${
                active
                  ? "bg-white/[0.06] text-foreground"
                  : "text-muted hover:bg-white/[0.03] hover:text-foreground"
              }`}
            >
              <item.icon className={`h-[18px] w-[18px] ${active ? "text-foreground" : "text-faint group-hover:text-muted"}`} />
              <span className="flex-1">{item.label}</span>
              {item.primary && (
                <span className="rounded bg-bull/15 px-1.5 py-0.5 text-[9px] font-bold text-bull">SOL</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <button
          type="button"
          onClick={() => connectWallet()}
          className={`${uiBtn} flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3 py-3 text-[12.5px] font-semibold text-foreground hover:border-white/25`}
        >
          <IconWallet className="h-4 w-4" />
          {wallet ? truncateAddress(wallet, 4) : "Connect Wallet"}
        </button>
      </div>
    </aside>
  );
}
