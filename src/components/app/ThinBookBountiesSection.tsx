"use client";

import Link from "next/link";
import BountyCard from "./BountyCard";
import { lamportsToSol, sumLamports } from "@/lib/solanaFormat";
import SolAmount from "./SolAmount";
import type { Bounty } from "@/lib/types";

export const THIN_BOOK_COLLECTION = "thin_book";

export function isThinBookBounty(b: Bounty): boolean {
  return b.collection === THIN_BOOK_COLLECTION;
}

export function splitThinBookBounties(bounties: Bounty[]) {
  const thinBook = bounties
    .filter(isThinBookBounty)
    .sort((a, b) => Number(BigInt(b.reward_sol_lamports) - BigInt(a.reward_sol_lamports)));
  const rest = bounties.filter((b) => !isThinBookBounty(b));
  return { thinBook, rest };
}

export function ThinBookBountiesCompact({
  bounties,
  limit = 5,
}: {
  bounties: Bounty[];
  limit?: number;
}) {
  const { thinBook } = splitThinBookBounties(bounties);
  if (!thinBook.length) return null;

  return (
    <div className="border-b border-line">
      <div className="border-b border-line px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-bull">Thin book ops</p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted">
          Official jobs on low-volume Polymarket books — weather buckets, mention markets, and daily
          crypto strikes.
        </p>
      </div>
      <ul className="divide-y divide-line">
        {thinBook.slice(0, limit).map((b) => (
          <li key={b.id}>
            <Link
              href={`/app/bounties#bounty-${b.id}`}
              className="block px-4 py-3 hover:bg-black/[0.04]"
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
      {thinBook.length > limit && (
        <Link
          href="/app/bounties#thin-book-bounties"
          className="block px-4 py-2.5 text-center text-[10px] font-bold text-bull hover:bg-black/[0.03]"
        >
          VIEW ALL {thinBook.length} →
        </Link>
      )}
    </div>
  );
}

export default function ThinBookBountiesSection({
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
  const { thinBook } = splitThinBookBounties(bounties);
  if (!thinBook.length) return null;

  const poolLamports = sumLamports(thinBook.map((b) => b.reward_sol_lamports));

  return (
    <section id="thin-book-bounties" className="scroll-mt-24">
      <div className={compact ? "space-y-4" : "space-y-5"}>
        <div className="rounded-2xl border border-bull/25 bg-gradient-to-br from-bull/[0.08] to-transparent px-5 py-4 sm:px-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-bull">Official · thin books</p>
          <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            Low-volume ops
          </h2>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted">
            Realistic SOL rewards on Polymarket books a single operator or small cabal can actually move —
            daily weather buckets, broadcast mention markets, and micro-cap crypto strikes.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface/30 px-4 py-3 sm:px-5">
          <p className="max-w-xl text-[13px] leading-relaxed text-muted">
            Rewards from 0.3 to 1.25 SOL. Pick a lane, execute the task, submit proof when the market
            resolves or your op lands.
          </p>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-faint">Total pool</p>
            <SolAmount
              amount={lamportsToSol(poolLamports)}
              className="font-mono text-lg font-bold text-bull"
              iconClassName="h-4 w-4"
            />
            <p className="mt-1 text-[10px] text-faint">{thinBook.length} open jobs</p>
            <Link
              href="/app/markets?sort=exploit"
              className="mt-2 inline-block text-[11px] font-semibold text-bull hover:underline"
            >
              Browse thin markets →
            </Link>
          </div>
        </div>

        <div className={`grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>
          {thinBook.map((b) => (
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
