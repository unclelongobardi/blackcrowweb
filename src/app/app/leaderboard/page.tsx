"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useApi } from "@/lib/useApi";
import { compactNumber } from "@/lib/format";
import { uiNav, uiRow } from "@/lib/uiClasses";
import Avatar from "@/components/app/Avatar";
import { IconChevronDown, IconFeather } from "@/components/icons";

type Operative = {
  id: string;
  codename: string;
  display_name: string | null;
  avatar_seed: string | null;
  influence: number;
  is_verified?: boolean;
};
type CabalRow = {
  id: string;
  slug: string;
  name: string;
  motto: string | null;
  emblem_seed: string | null;
  member_count: number;
};

const EARN_RULES = [
  {
    action: "Post in the War Room",
    feathers: "+2",
    detail: "Every intel drop, thesis, or coordination post on the feed.",
  },
  {
    action: "Found a cabal",
    feathers: "+20",
    detail: "One-time bonus when you create a public or private group.",
  },
  {
    action: "Post a bounty (goes live)",
    feathers: "Variable",
    detail: "When you deposit SOL and the bounty opens: initial SOL × 5 Feathers (max 300).",
  },
  {
    action: "Complete a bounty",
    feathers: "Variable",
    detail: "When the creator approves your proof: total pool SOL × 10 Feathers (max 500).",
  },
  {
    action: "Add SOL to someone's pool",
    feathers: "0",
    detail: "Boost the reward pool with SOL. Only the original creator approves or rejects proof.",
  },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bull/15 font-mono text-[12px] font-bold text-bull">
        1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 font-mono text-[12px] font-bold text-foreground">
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 font-mono text-[12px] font-bold text-muted">
        3
      </span>
    );
  }
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center font-mono text-[12px] font-bold text-faint">
      {rank}
    </span>
  );
}

function AccordionSection({
  title,
  summary,
  defaultOpen = false,
  children,
}: {
  title: string;
  summary: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`${uiNav} flex w-full items-start gap-3 px-4 py-3.5 text-left sm:px-5 sm:py-4`}
        aria-expanded={open}
      >
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bull/10 text-bull">
          <IconFeather className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold text-foreground">{title}</span>
          <span className="mt-0.5 block text-[12px] leading-relaxed text-faint">{summary}</span>
        </span>
        <IconChevronDown
          className={`mt-1 h-5 w-5 shrink-0 text-faint transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-line px-4 pb-4 pt-3 sm:px-5 sm:pb-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const api = useApi();
  const [operatives, setOperatives] = useState<Operative[]>([]);
  const [cabals, setCabals] = useState<CabalRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api<{ operatives: Operative[]; cabals: CabalRow[] }>("/api/leaderboard");
        setOperatives(data.operatives);
        setCabals(data.cabals);
      } finally {
        setLoading(false);
      }
    })();
  }, [api]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 sm:px-5 sm:py-6">
      <header className="mb-5 sm:mb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-[1.65rem]">The Roost</h1>
        <p className="mt-1 max-w-lg text-[13px] leading-relaxed text-muted sm:text-[14px]">
          Live rankings — then expand below if you want the full Feathers breakdown.
        </p>
      </header>

      {/* Rankings first */}
      {loading ? (
        <div className="flex justify-center py-16 sm:py-20">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-[1.25fr_1fr]">
          <div className="glass min-w-0 rounded-2xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
              <h2 className="section-label">Top operatives</h2>
              <span className="font-mono text-[11px] text-faint">{operatives.length} ranked</span>
            </div>
            <div className="max-h-[min(420px,55vh)] divide-y divide-line overflow-y-auto">
              {operatives.length === 0 ? (
                <p className="px-5 py-10 text-center text-[13px] text-faint">No operatives yet.</p>
              ) : (
                operatives.map((o, i) => (
                  <Link
                    key={o.id}
                    href={`/app/u/${o.codename}`}
                    className={`${uiRow} flex items-center gap-3 px-4 py-3 sm:px-5 hover:bg-white/[0.02]`}
                  >
                    <RankBadge rank={i + 1} />
                    <Avatar
                      seed={o.avatar_seed}
                      label={o.codename}
                      size={36}
                      verified={o.is_verified || o.codename === "blackcrow_official"}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-foreground">{o.codename}</p>
                      {o.display_name && (
                        <p className="truncate text-[11px] text-faint">{o.display_name}</p>
                      )}
                    </div>
                    <span className="flex shrink-0 items-center gap-1 font-mono text-[13px] font-bold text-bull">
                      {compactNumber(o.influence)}
                      <IconFeather className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="glass min-w-0 rounded-2xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
              <h2 className="section-label">Top cabals</h2>
              <span className="text-[11px] text-faint">by members</span>
            </div>
            <div className="max-h-[min(420px,55vh)] divide-y divide-line overflow-y-auto">
              {cabals.length === 0 ? (
                <p className="px-5 py-10 text-center text-[13px] text-faint">No cabals yet.</p>
              ) : (
                cabals.map((c, i) => (
                  <Link
                    key={c.id}
                    href={`/app/cabals/${c.slug}`}
                    className={`${uiRow} flex items-center gap-3 px-4 py-3 sm:px-5 hover:bg-white/[0.02]`}
                  >
                    <RankBadge rank={i + 1} />
                    <Avatar seed={c.emblem_seed} label={c.name} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-foreground">{c.name}</p>
                      {c.motto && <p className="truncate text-[11px] italic text-faint">{c.motto}</p>}
                    </div>
                    <span className="shrink-0 rounded-lg bg-white/5 px-2 py-1 font-mono text-[11px] font-bold text-foreground">
                      {c.member_count}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Collapsible guides */}
      <section className="mt-6 space-y-3 sm:mt-8">
        <p className="section-label px-1">How it works</p>

        <AccordionSection
          title="What are Feathers?"
          summary="Reputation points on the leaderboard — separate from SOL bounties."
        >
          <p className="text-[13px] leading-relaxed text-muted">
            Feathers measure activity and influence on BLACKCROW. SOL in bounties is real money in escrow;
            Feathers are status, rank, and visibility on The Roost and in search.
          </p>
        </AccordionSection>

        <AccordionSection
          title="How to earn Feathers"
          summary="War Room posts, cabals, bounties, and more."
        >
          <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
            {EARN_RULES.map((rule) => (
              <div
                key={rule.action}
                className="rounded-xl border border-line/80 bg-black/20 px-3.5 py-3 sm:px-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[12.5px] font-semibold leading-snug text-foreground sm:text-[13px]">
                    {rule.action}
                  </p>
                  <span className="shrink-0 font-mono text-[12px] font-bold text-bull">{rule.feathers}</span>
                </div>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-faint">{rule.detail}</p>
              </div>
            ))}
          </div>
        </AccordionSection>

        <AccordionSection
          title="Bounty pools, rank & cabals"
          summary="Who decides payouts, pool math, and how cabals are ranked."
        >
          <ul className="space-y-3 text-[12.5px] leading-relaxed text-muted sm:text-[13px]">
            <li>
              <span className="font-semibold text-foreground">Your rank</span> — position vs everyone by total
              Feathers. Feathers do not decay today.
            </li>
            <li>
              <span className="font-semibold text-foreground">Bounty pool</span> — anyone can add SOL while a bounty
              is open or in progress. Helper payout and helper Feathers scale with the full pool. Only the creator
              approves or rejects proof.
            </li>
            <li>
              <span className="font-semibold text-foreground">Example</span> — post 1 SOL → up to 5 Feathers when
              live. Others add 0.5 SOL → pool is 1.5 SOL. Helper gets 1.5 SOL + up to 15 Feathers on approval.
            </li>
            <li>
              <span className="font-semibold text-foreground">Cabals</span> — ranked by member count, not Feathers.
              A large cabal does not mean high individual scores.
            </li>
          </ul>
        </AccordionSection>
      </section>
    </div>
  );
}
