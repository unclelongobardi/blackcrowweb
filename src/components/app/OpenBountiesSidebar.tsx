"use client";

import Link from "next/link";
import { lamportsToSol } from "@/lib/solanaFormat";
import SolAmount from "./SolAmount";
import { uiBtnPrimary, uiRow } from "@/lib/uiClasses";
import Avatar from "./Avatar";
import type { Bounty } from "@/lib/types";

export default function OpenBountiesSidebar({
  bounties,
  openCount,
  onPostBounty,
}: {
  bounties: Bounty[];
  openCount: number;
  onPostBounty: () => void;
}) {
  const open = bounties.filter((b) => b.status === "open");

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[252px] shrink-0 flex-col border-r border-line bg-surface/20 lg:flex">
      <div className="border-b border-line p-4">
        <h2 className="font-display text-lg font-extrabold tracking-tight text-foreground">Bounties</h2>
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
          Pick a job from the menu, accept it, submit proof when the poster approves.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={onPostBounty}
            className={`${uiBtnPrimary} rounded-xl bg-foreground px-4 py-2.5 text-[11px] font-bold text-black`}
          >
            + POST A BOUNTY
          </button>
          <Link
            href="/app/markets"
            className="ui-nav rounded-xl border border-line px-4 py-2.5 text-center text-[11px] font-semibold text-foreground hover:border-white/25"
          >
            FIND THIN MARKETS
          </Link>
        </div>
        {openCount > 0 && (
          <p className="mt-2.5 text-[11px] text-faint">
            <span className="font-mono font-semibold text-foreground">{openCount}</span> open now
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h3 className="section-label">Open bounties</h3>
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
                    href={`/app/bounties#bounty-${b.id}`}
                    className={`${uiRow} block px-4 py-3 hover:bg-white/[0.03]`}
                  >
                    {creator ? (
                      <div className="mb-2 flex items-center gap-2">
                        <Avatar
                          seed={b.is_official ? "blackcrow_official" : creator.avatar_seed}
                          label={b.is_official ? "blackcrow_official" : creator.codename}
                          size={22}
                          verified={verified}
                        />
                        <span className="truncate text-[11px] font-semibold text-foreground">
                          {b.is_official ? "blackcrow_official" : creator.display_name || creator.codename}
                        </span>
                      </div>
                    ) : (
                      <p className="mb-2 text-[11px] text-faint">Unknown creator</p>
                    )}
                    <p className="line-clamp-2 text-[12.5px] font-semibold leading-snug text-foreground">
                      {b.title}
                    </p>
                    <SolAmount
                      amount={lamportsToSol(b.reward_sol_lamports)}
                      className="mt-1.5 font-mono text-[11px] font-bold text-muted"
                      iconClassName="h-3 w-3"
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      <div className="border-t border-line p-3">
        <Link
          href="/app/bounties"
          className="ui-nav mb-2 block rounded-lg border border-bull/30 bg-bull/5 px-3 py-2 text-center text-[11px] font-bold text-bull hover:bg-bull/10"
        >
          Browse all bounties →
        </Link>
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
