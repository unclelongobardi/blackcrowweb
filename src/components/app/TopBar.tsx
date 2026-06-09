"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import Avatar from "./Avatar";
import { useAppContext } from "./appContext";
import { useApi } from "@/lib/useApi";
import { IconSearch, IconBell, IconMail, IconChevronDown } from "@/components/icons";

export default function TopBar() {
  const { me } = useAppContext();
  const { logout } = usePrivy();
  const api = useApi();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api<{ unread: number }>("/api/notifications");
        setUnread(data.unread);
      } catch {
        /* ignore */
      }
    })();
  }, [api]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function search(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/app/search?q=${encodeURIComponent(query.trim())}`);
  }

  const verified = me?.profile.is_verified || me?.profile.codename === "blackcrow_official";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-line bg-background/70 px-4 backdrop-blur-xl sm:px-6">
      <form onSubmit={search} className="relative flex-1 max-w-md">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search markets, users, cabals..."
          className="h-10 w-full rounded-xl border border-line bg-surface/60 pl-10 pr-4 text-[13px] text-foreground placeholder:text-faint outline-none transition-colors focus:border-white/20"
        />
      </form>

      <div className="ml-auto flex items-center gap-1.5">
        <Link
          href="/app/notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line text-muted transition-colors hover:border-white/20 hover:text-foreground"
        >
          <IconBell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-bear px-1 text-[9px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
        <Link
          href="/app/messages"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-muted transition-colors hover:border-white/20 hover:text-foreground"
        >
          <IconMail className="h-[18px] w-[18px]" />
        </Link>

        <div className="relative ml-1" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-line py-1.5 pl-1.5 pr-2.5 transition-colors hover:border-white/20"
          >
            <Avatar
              seed={me?.profile.avatar_seed}
              label={me?.profile.codename}
              size={30}
              verified={verified}
            />
            <div className="hidden text-left leading-tight sm:block">
              <p className="max-w-[110px] truncate text-[12px] font-semibold text-foreground">
                {me?.profile.display_name || me?.profile.codename || "anon"}
              </p>
              <p className="max-w-[110px] truncate text-[11px] text-faint">@{me?.profile.codename ?? "anon"}</p>
            </div>
            <IconChevronDown className={`h-4 w-4 text-faint transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute right-0 top-12 w-52 overflow-hidden rounded-xl glass p-1.5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.95)]">
              <Link href="/app/profile" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-[13px] text-muted hover:bg-white/[0.04] hover:text-foreground">
                Profile
              </Link>
              <Link href="/app/search" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-[13px] text-muted hover:bg-white/[0.04] hover:text-foreground">
                Search
              </Link>
              <Link href="/" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-[13px] text-muted hover:bg-white/[0.04] hover:text-foreground">
                Landing page
              </Link>
              <button
                onClick={() => { setOpen(false); logout(); }}
                className="mt-1 block w-full rounded-lg border-t border-line px-3 py-2.5 text-left text-[13px] text-bear hover:bg-bear/10"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
