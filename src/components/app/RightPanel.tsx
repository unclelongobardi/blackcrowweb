"use client";

import { useState } from "react";
import Avatar from "./Avatar";
import Sparkline from "./Sparkline";
import { genSpark } from "@/lib/spark";
import { compactNumber } from "@/lib/format";
import { IconFlame } from "@/components/icons";
import type { Market } from "@/lib/types";

type Operative = { id: string; codename: string; display_name?: string | null; avatar_seed: string | null; influence: number };

const TRENDING = [
  { tag: "NVDA", posts: 24500, change: 24, up: true },
  { tag: "CryptoCrash", posts: 18300, change: -12, up: false },
  { tag: "FedMeeting", posts: 12700, change: 7, up: true },
  { tag: "Altseason", posts: 9200, change: 31, up: true },
  { tag: "BlackRock", posts: 8100, change: 14, up: true },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-[11px] font-bold tracking-[0.16em] text-muted">{title}</h2>
        <button className="text-[11px] font-medium text-faint transition-colors hover:text-foreground">
          View all
        </button>
      </div>
      <div className="border-t border-line">{children}</div>
    </div>
  );
}

function shortName(q: string): string {
  return q.length > 26 ? q.slice(0, 26).trimEnd() + "…" : q;
}

export default function RightPanel({
  markets,
  operatives,
}: {
  markets: Market[];
  operatives: Operative[];
}) {
  const [followed, setFollowed] = useState<Record<string, boolean>>({});
  const watch = markets.slice(0, 5);
  const suggestions = operatives.slice(0, 3);

  return (
    <aside className="hidden w-[332px] shrink-0 flex-col gap-4 p-4 xl:flex">
      {/* Watchlist */}
      <Section title="MARKET WATCHLIST">
        <div className="divide-y divide-line">
          {watch.map((m) => {
            const yes = m.yes_price != null ? Math.round(m.yes_price * 100) : 50;
            const up = yes >= 50;
            return (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                <IconFlame className="h-4 w-4 shrink-0 text-amber-500/80" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold text-foreground">{shortName(m.question)}</p>
                  <p className="truncate text-[11px] text-faint">{m.category || "Live market"}</p>
                </div>
                <Sparkline data={genSpark(m.id, 20, up ? 0.05 : -0.05)} width={48} height={22} color={up ? "#22c55e" : "#f0506e"} />
                <div className="w-9 text-right">
                  <p className={`font-mono text-[13px] font-bold ${up ? "text-bull" : "text-bear"}`}>{yes}%</p>
                  <p className="text-[9px] tracking-wide text-faint">YES</p>
                </div>
              </div>
            );
          })}
          {watch.length === 0 && <p className="px-4 py-5 text-[12px] text-faint">Loading markets…</p>}
        </div>
      </Section>

      {/* Trending topics */}
      <Section title="TRENDING TOPICS">
        <div className="divide-y divide-line">
          {TRENDING.map((t) => (
            <button key={t.tag} className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-white/[0.02]">
              <div>
                <p className="text-[13px] font-semibold text-foreground">#{t.tag}</p>
                <p className="text-[11px] text-faint">{compactNumber(t.posts)} posts</p>
              </div>
              <span className={`font-mono text-[12px] font-semibold ${t.up ? "text-bull" : "text-bear"}`}>
                {t.up ? "▲" : "▼"} {Math.abs(t.change)}%
              </span>
            </button>
          ))}
        </div>
      </Section>

      {/* Who to follow */}
      <Section title="WHO TO FOLLOW">
        <div className="divide-y divide-line">
          {suggestions.map((o) => (
            <div key={o.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar seed={o.avatar_seed} label={o.codename} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-foreground">
                  {o.display_name || o.codename}
                </p>
                <p className="truncate text-[11px] text-faint">@{o.codename}</p>
              </div>
              <button
                onClick={() => setFollowed((f) => ({ ...f, [o.id]: !f[o.id] }))}
                className={`rounded-lg px-3 py-1.5 text-[12px] font-bold transition-transform hover:scale-[1.03] ${
                  followed[o.id]
                    ? "border border-line text-muted"
                    : "bg-foreground text-black"
                }`}
              >
                {followed[o.id] ? "Following" : "+ Follow"}
              </button>
            </div>
          ))}
          {suggestions.length === 0 && <p className="px-4 py-5 text-[12px] text-faint">Loading…</p>}
        </div>
      </Section>
    </aside>
  );
}
