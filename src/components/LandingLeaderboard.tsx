"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Avatar from "@/components/app/Avatar";
import { compactNumber } from "@/lib/format";
import type { LeaderboardOperative } from "@/lib/leaderboard";
import { IconRank, IconVlre } from "./icons";
import { guestHref } from "@/lib/guestMode";
import { uiBtnPrimary } from "@/lib/uiClasses";

const ease = [0.16, 1, 0.3, 1] as const;

const EXPLAIN = [
  {
    title: "Reputation score",
    body: "VLRE track verified activity on the network: Home posts, bounties funded and completed, cabals founded.",
  },
  {
    title: "Live rankings",
    body: "Every onboarded operator competes on the same table. Rank updates as actions are recorded—no manual resets.",
  },
  {
    title: "Not your payout",
    body: "Bounty rewards settle in SOL on-chain. VLRE are status: they control visibility on Leaderboard and in search.",
  },
] as const;

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bull/15 font-mono text-[12px] font-bold text-bull">
        1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/[0.06] font-mono text-[12px] font-bold text-foreground">
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/[0.04] font-mono text-[12px] font-bold text-muted">
        3
      </span>
    );
  }
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center font-mono text-[12px] font-bold text-faint">
      {rank}
    </span>
  );
}

function PodiumCard({ operative, rank }: { operative: LeaderboardOperative; rank: 1 | 2 | 3 }) {
  const isFirst = rank === 1;
  const verified = operative.is_verified || operative.codename === "valore_official";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: rank === 1 ? 0.1 : rank === 2 ? 0 : 0.05, ease }}
      className={`flex flex-col items-center text-center ${isFirst ? "order-2 lg:-mt-4" : rank === 2 ? "order-1" : "order-3"}`}
    >
      <Link
        href={`/app/u/${operative.codename}`}
        className="group flex w-full max-w-[168px] flex-col items-center rounded-2xl border border-line bg-surface/40 px-4 py-5 transition-colors hover:border-bull/30 hover:bg-surface/60"
      >
        <span
          className={`mb-3 flex items-center justify-center rounded-full font-mono text-[11px] font-bold ${
            isFirst ? "h-7 w-7 bg-bull/15 text-bull" : "h-6 w-6 bg-black/[0.06] text-muted"
          }`}
        >
          #{rank}
        </span>
        <Avatar
          seed={operative.avatar_seed}
          avatarUrl={operative.avatar_url}
          label={operative.codename}
          size={isFirst ? 72 : 56}
          verified={verified}
        />
        <p className="mt-3 truncate max-w-full text-[13px] font-semibold text-foreground group-hover:text-bull">
          @{operative.codename}
        </p>
        {operative.display_name && (
          <p className="mt-0.5 truncate max-w-full text-[11px] text-faint">{operative.display_name}</p>
        )}
        <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-[13px] font-bold text-bull">
          {compactNumber(operative.influence)}
          <IconVlre className="h-3.5 w-3.5" />
        </span>
      </Link>
    </motion.div>
  );
}

function OperativeRow({ operative, rank }: { operative: LeaderboardOperative; rank: number }) {
  const verified = operative.is_verified || operative.codename === "valore_official";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(rank * 0.04, 0.32), ease }}
    >
      <Link
        href={`/app/u/${operative.codename}`}
        className="flex items-center gap-3 rounded-xl border border-line bg-surface/30 px-4 py-3.5 transition-colors hover:border-bull/25 hover:bg-surface/50"
      >
        <RankBadge rank={rank} />
        <Avatar seed={operative.avatar_seed} avatarUrl={operative.avatar_url} label={operative.codename} size={40} verified={verified} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-foreground">@{operative.codename}</p>
          {operative.display_name && (
            <p className="truncate text-[11px] text-faint">{operative.display_name}</p>
          )}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[13px] font-bold text-bull">
          {compactNumber(operative.influence)}
          <IconVlre className="h-3.5 w-3.5" />
        </span>
      </Link>
    </motion.div>
  );
}

export default function LandingLeaderboard({ operatives }: { operatives: LeaderboardOperative[] }) {
  const top3 = operatives.slice(0, 3);
  const rest = operatives.slice(3);

  return (
    <section id="leaderboard" className="scroll-mt-24 border-t border-line px-6 py-20 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14 lg:items-start">
          {/* Explanation */}
          <div>
            <p className="section-label">Leaderboard</p>
            <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">LEADERBOARD</h2>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted">
              Leaderboard ranks operators by <strong className="font-semibold text-foreground">VLRE</strong>—an
              on-platform reputation score built from real activity. It is the public record of who is moving markets,
              funding bounties, and running cabals.
            </p>

            <div className="mt-8 space-y-3">
              {EXPLAIN.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.06, ease }}
                  className="rounded-xl border border-line bg-surface/25 px-4 py-3.5"
                >
                  <p className="text-[12px] font-bold uppercase tracking-wide text-foreground/90">{item.title}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-faint">{item.body}</p>
                </motion.div>
              ))}
            </div>

            <Link
              href={guestHref("/app/leaderboard")}
              className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-xl border border-line px-5 py-2.5 text-[12px] font-bold text-muted transition-colors hover:border-bull/40 hover:text-foreground"
            >
              <IconRank className="h-4 w-4 text-bull" />
              VIEW FULL RANKINGS
            </Link>
          </div>

          {/* Live rankings */}
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Top operatives</p>
                <p className="mt-0.5 text-[12px] text-muted">
                  {operatives.length > 0
                    ? `${operatives.length} ranked on the network`
                    : "No operators ranked yet"}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-bull/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-bull">
                <span className="h-1.5 w-1.5 rounded-full bg-bull animate-pulse-dot" />
                Live
              </span>
            </div>

            {operatives.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface/20 px-6 py-14 text-center">
                <p className="text-[15px] font-semibold text-foreground">Rankings start with the first operator</p>
                <p className="mx-auto mt-2 max-w-xs text-[13px] text-faint">
                  Connect a wallet, post intel, or fund a bounty to appear on Leaderboard.
                </p>
                <Link
                  href={guestHref("/app")}
                  className={`${uiBtnPrimary} mt-5 inline-flex min-h-11 items-center rounded-xl px-6 py-2.5 text-[12px] font-bold`}
                >
                  ENTER VALORE
                </Link>
              </div>
            ) : (
              <>
                {top3.length >= 3 && (
                  <div className="mt-6 grid grid-cols-3 items-end gap-2 sm:gap-3">
                    <PodiumCard operative={top3[1]} rank={2} />
                    <PodiumCard operative={top3[0]} rank={1} />
                    <PodiumCard operative={top3[2]} rank={3} />
                  </div>
                )}

                <div className={`space-y-2 ${top3.length >= 3 ? "mt-4" : "mt-6"}`}>
                  {(top3.length < 3 ? operatives : rest).map((o, i) => (
                    <OperativeRow
                      key={o.id}
                      operative={o}
                      rank={top3.length < 3 ? i + 1 : i + 4}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
