"use client";

import Link from "next/link";
import { lamportsToSol } from "@/lib/solanaFormat";
import { uiRow } from "@/lib/uiClasses";
import Avatar from "./Avatar";
import type { Bounty } from "@/lib/types";

export default function OpenBountiesSidebar({ bounties }: { bounties: Bounty[] }) {
  const open = bounties.filter((b) => b.status === "open");

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[252px] shrink-0 flex-col border-r border-line bg-surface/20 lg:flex">
      <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
        <h2 className="section-label">Open bounties</h2>
        <span className="font-mono text-[11px] text-faint">{open.length}</span>
      </div>

      <nav className="flex-1 overflow-y-auto">
        {open.length === 0 ? (
          <p className="px-4 py-6 text-[12px] leading-relaxed text-faint">
            Nothing open.{" "}
            <Link href="/app/markets" className="text-foreground underline-offset-2 hover:underline">
              Find a market
            </Link>
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {open.map((b) => {
              const creator = b.creator;
              const verified =
                creator?.is_verified || creator?.codename === "blackcrow_official";

              return (
                <li key={b.id}>
                  <a
                    href={`#bounty-${b.id}`}
                    className={`${uiRow} block px-4 py-3 hover:bg-white/[0.03]`}
                  >
                    {creator ? (
                      <div className="mb-2 flex items-center gap-2">
                        <Avatar
                          seed={creator.avatar_seed}
                          label={creator.codename}
                          size={22}
                          verified={verified}
                        />
                        <span className="truncate text-[11px] font-semibold text-foreground">
                          {creator.display_name || creator.codename}
                        </span>
                        {b.is_official && (
                          <span className="shrink-0 rounded bg-white/5 px-1 py-0.5 text-[8px] font-bold uppercase text-faint">
                            Official
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="mb-2 text-[11px] text-faint">Unknown creator</p>
                    )}
                    <p className="line-clamp-2 text-[12.5px] font-semibold leading-snug text-foreground">
                      {b.title}
                    </p>
                    <p className="mt-1.5 font-mono text-[11px] font-bold text-muted">
                      {lamportsToSol(b.reward_sol_lamports)} SOL
                    </p>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      <div className="border-t border-line p-3">
        <Link
          href="/app/markets"
          className="ui-nav block rounded-lg border border-line px-3 py-2 text-center text-[11px] font-semibold text-muted hover:border-white/20 hover:text-foreground"
        >
          Browse markets →
        </Link>
      </div>
    </aside>
  );
}
