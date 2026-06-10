"use client";

import Link from "next/link";
import BountyCard from "./BountyCard";
import WorldCupBountiesButton from "./WorldCupBountiesButton";
import { lamportsToSol } from "@/lib/solanaFormat";
import SolAmount from "./SolAmount";
import type { Bounty } from "@/lib/types";

export const WORLD_CUP_COLLECTION = "world_cup";

export function isWorldCupBounty(b: Bounty): boolean {
  return b.collection === WORLD_CUP_COLLECTION;
}

export function splitWorldCupBounties(bounties: Bounty[]) {
  const worldCup = bounties
    .filter(isWorldCupBounty)
    .sort((a, b) => b.reward_sol_lamports - a.reward_sol_lamports);
  const rest = bounties.filter((b) => !isWorldCupBounty(b));
  return { worldCup, rest };
}

export function WorldCupBountiesCompact({
  bounties,
  limit = 5,
}: {
  bounties: Bounty[];
  limit?: number;
}) {
  const { worldCup } = splitWorldCupBounties(bounties);
  if (!worldCup.length) return null;

  return (
    <div className="border-b border-line">
      <div className="px-3 py-3">
        <WorldCupBountiesButton />
      </div>
      <ul className="divide-y divide-line">
        {worldCup.slice(0, limit).map((b) => (
          <li key={b.id}>
            <Link
              href={`/app/bounties#bounty-${b.id}`}
              className="block px-4 py-3 hover:bg-white/[0.03]"
            >
              <p className="line-clamp-2 text-[12px] font-semibold text-foreground">{b.title}</p>
              <p className="mt-1 flex items-center gap-1.5 text-[10px] text-bull">
                <SolAmount amount={lamportsToSol(b.reward_sol_lamports)} iconClassName="h-3 w-3" />
                <span className="text-faint">· open</span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
      {worldCup.length > limit && (
        <Link
          href="/app/bounties#world-cup-bounties"
          className="block px-4 py-2.5 text-center text-[10px] font-bold text-bull hover:bg-white/[0.02]"
        >
          VIEW ALL {worldCup.length} →
        </Link>
      )}
    </div>
  );
}

export default function WorldCupBountiesSection({
  bounties,
  onUpdate,
  onShare,
  compact,
}: {
  bounties: Bounty[];
  onUpdate: (b: Bounty) => void;
  onShare?: (b: Bounty) => void;
  compact?: boolean;
}) {
  const { worldCup } = splitWorldCupBounties(bounties);
  if (!worldCup.length) return null;

  const poolSol = worldCup.reduce((s, b) => s + b.reward_sol_lamports, 0);

  return (
    <section id="world-cup-bounties" className="scroll-mt-24">
      <div className={compact ? "space-y-4" : "space-y-5"}>
        <WorldCupBountiesButton className="mx-auto max-w-3xl" />

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface/30 px-4 py-3 sm:px-5">
          <p className="max-w-xl text-[13px] leading-relaxed text-muted">
            Secondary Polymarket books you can actually move — FOX broadcast mentions, stadium
            spectacle, and co-host narrative ops at USA 2026 matches.
          </p>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-faint">Total pool</p>
            <SolAmount
              amount={lamportsToSol(poolSol)}
              className="font-mono text-lg font-bold text-bull"
              iconClassName="h-4 w-4"
            />
            <p className="mt-1 text-[10px] text-faint">{worldCup.length} open jobs</p>
          </div>
        </div>

        <div className={`grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>
          {worldCup.map((b) => (
            <div key={b.id} id={`bounty-${b.id}`} className="scroll-mt-24">
              <BountyCard
                bounty={b}
                onUpdate={onUpdate}
                onShareToWarRoom={onShare ? () => onShare(b) : undefined}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
