"use client";

import Link from "next/link";
import BountyCard from "./BountyCard";
import { lamportsToSol } from "@/lib/solanaFormat";
import { uiBtnPrimary, uiRow } from "@/lib/uiClasses";
import Avatar from "./Avatar";
import SolAmount from "./SolAmount";
import type { Bounty } from "@/lib/types";

export default function MobileBountiesPanel({
  bounties,
  openCount,
  selectedId,
  onPostBounty,
  onSelect,
  onShareToWarRoom,
  onUpdate,
}: {
  bounties: Bounty[];
  openCount: number;
  selectedId?: string | null;
  onPostBounty: () => void;
  onSelect: (b: Bounty) => void;
  onShareToWarRoom: (b: Bounty) => void;
  onUpdate: (b: Bounty) => void;
}) {
  const open = bounties.filter((b) => b.status === "open");

  return (
    <div className="pb-6">
      <div className="border-b border-line p-4">
        <h2 className="font-display text-lg font-extrabold tracking-tight text-foreground">Bounties</h2>
        <p className="mt-1 text-[12px] text-muted">
          Post jobs, accept work, and boost pools — same flow as desktop.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onPostBounty}
            className={`${uiBtnPrimary} min-h-11 flex-1 rounded-xl bg-foreground px-4 py-3 text-[12px] font-bold text-black`}
          >
            + POST A BOUNTY
          </button>
          <Link
            href="/app/bounties"
            className="ui-nav flex min-h-11 flex-1 items-center justify-center rounded-xl border border-bull/30 bg-bull/5 px-4 py-3 text-center text-[12px] font-bold text-bull"
          >
            BROWSE ALL
          </Link>
          <Link
            href="/app/markets"
            className="ui-nav flex min-h-11 flex-1 items-center justify-center rounded-xl border border-line px-4 py-3 text-center text-[12px] font-semibold text-foreground"
          >
            THIN MARKETS
          </Link>
        </div>
        {openCount > 0 && (
          <p className="mt-2.5 text-[11px] text-faint">
            <span className="font-mono font-semibold text-foreground">{openCount}</span> open now
          </p>
        )}
      </div>

      {open.length > 0 && (
        <div className="border-b border-line">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="section-label">Open bounties</h3>
            <span className="font-mono text-[11px] text-faint">{open.length}</span>
          </div>
          <ul className="divide-y divide-line">
            {open.map((b) => {
              const creator = b.creator;
              const verified =
                creator?.is_verified || creator?.codename === "blackcrow_official";
              return (
                <li key={b.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(b);
                      document.getElementById(`bounty-${b.id}`)?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`${uiRow} w-full px-4 py-3.5 text-left hover:bg-white/[0.03]`}
                  >
                    {creator ? (
                      <div className="mb-2 flex items-center gap-2">
                        <Avatar
                          seed={b.is_official ? "blackcrow_official" : creator.avatar_seed}
                          label={b.is_official ? "blackcrow_official" : creator.codename}
                          size={24}
                          verified={verified}
                        />
                        <span className="truncate text-[11px] font-semibold text-foreground">
                          {b.is_official ? "blackcrow_official" : creator.display_name || creator.codename}
                        </span>
                      </div>
                    ) : null}
                    <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-foreground">
                      {b.title}
                    </p>
                    <SolAmount
                      amount={lamportsToSol(b.reward_sol_lamports)}
                      className="mt-1.5 font-mono text-[11px] font-bold text-muted"
                      iconClassName="h-3.5 w-3.5"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="section-label">All bounties</h3>
          <span className="font-mono text-[11px] text-faint">{bounties.length}</span>
        </div>
        {bounties.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line px-4 py-10 text-center">
            <p className="text-[14px] font-bold text-foreground">No bounties yet</p>
            <p className="mt-2 text-[12px] text-faint">Post the first job or pick a thin market.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bounties.map((b) => (
              <div key={b.id} id={`bounty-${b.id}`} className="scroll-mt-32">
                <BountyCard
                  bounty={b}
                  onUpdate={onUpdate}
                  compact
                  selected={selectedId === b.id}
                  onSelect={() => onSelect(b)}
                  onShareToWarRoom={() => onShareToWarRoom(b)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
