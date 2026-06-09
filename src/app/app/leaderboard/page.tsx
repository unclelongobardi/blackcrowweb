"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useApi } from "@/lib/useApi";
import { compactNumber } from "@/lib/format";
import { uiRow } from "@/lib/uiClasses";
import Avatar from "@/components/app/Avatar";
import { IconFeather } from "@/components/icons";

type Operative = {
  id: string;
  codename: string;
  display_name: string | null;
  avatar_seed: string | null;
  influence: number;
  is_verified?: boolean;
};
type CabalRow = { id: string; slug: string; name: string; motto: string | null; emblem_seed: string | null; member_count: number };

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
    action: "Complete a bounty",
    feathers: "Variable",
    detail: "When the poster approves your proof, you earn Feathers on top of SOL. Amount = reward SOL × 10 (max 500 per bounty).",
  },
  {
    action: "Post a bounty",
    feathers: "0",
    detail: "Creators pay SOL to helpers — no Feathers for posting, but you build reputation when people take your jobs.",
  },
];

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
    <div className="mx-auto max-w-4xl px-5 py-6">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">The Roost</h1>
        <p className="mt-1 text-[14px] text-muted">
          Rankings for the most active crows and the cabals they run with.
        </p>
      </header>

      <section className="glass mb-6 rounded-2xl p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bull/10 text-bull">
            <IconFeather className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Feathers — how points work</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Feathers are your on-platform reputation. They are separate from SOL bounties: SOL is real money in
              escrow; Feathers are status, rank, and bragging rights on the leaderboard.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {EARN_RULES.map((rule) => (
            <div key={rule.action} className="rounded-xl border border-line bg-surface/40 px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-semibold text-foreground">{rule.action}</p>
                <span className="font-mono text-[13px] font-bold text-bull">{rule.feathers}</span>
              </div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-faint">{rule.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-2 rounded-xl border border-line/80 bg-black/20 px-4 py-3 text-[12.5px] leading-relaxed text-muted">
          <p>
            <span className="font-semibold text-foreground">Your rank</span> is your position vs everyone else by total
            Feathers. Higher rank = more visible on The Roost and in search.
          </p>
          <p>
            <span className="font-semibold text-foreground">Bounty math example:</span> a 1.25 SOL bounty pays the
            helper 1.25 SOL <em>and</em> up to 12 Feathers (1.25 × 10). A 50 SOL bounty caps at 500 Feathers.
          </p>
          <p>
            <span className="font-semibold text-foreground">Cabals below</span> are ranked by member count — not
            Feathers. A big cabal does not automatically mean high individual scores.
          </p>
          <p className="text-faint">Feathers never decay and are not lost today — only earned through activity.</p>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
          <div className="glass rounded-2xl">
            <h2 className="section-label border-b border-line px-5 py-3">Top operatives</h2>
            <div className="divide-y divide-line">
              {operatives.map((o, i) => (
                <Link
                  key={o.id}
                  href={`/app/u/${o.codename}`}
                  className={`${uiRow} flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02]`}
                >
                  <span
                    className={`w-6 text-center font-mono text-[13px] font-bold ${
                      i === 0 ? "text-bull" : i < 3 ? "text-foreground" : "text-faint"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <Avatar
                    seed={o.avatar_seed}
                    label={o.codename}
                    size={34}
                    verified={o.is_verified || o.codename === "blackcrow_official"}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-foreground">{o.codename}</p>
                    {o.display_name && <p className="truncate text-[11px] text-faint">{o.display_name}</p>}
                  </div>
                  <span className="flex items-center gap-1 font-mono text-[13px] font-bold text-bull">
                    {compactNumber(o.influence)}
                    <IconFeather className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl">
            <h2 className="section-label border-b border-line px-5 py-3">Top cabals</h2>
            <div className="divide-y divide-line">
              {cabals.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/app/cabals/${c.slug}`}
                  className={`${uiRow} flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02]`}
                >
                  <span className="w-6 text-center font-mono text-[13px] font-bold text-faint">{i + 1}</span>
                  <Avatar seed={c.emblem_seed} label={c.name} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-foreground">{c.name}</p>
                    {c.motto && <p className="truncate text-[11px] italic text-faint">{c.motto}</p>}
                  </div>
                  <span className="font-mono text-[12px] font-bold text-foreground">{c.member_count}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
