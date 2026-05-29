"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/lib/useApi";
import { compactNumber } from "@/lib/format";
import Avatar from "@/components/app/Avatar";

type Operative = { id: string; codename: string; display_name: string | null; avatar_seed: string | null; influence: number };
type CabalRow = { id: string; slug: string; name: string; motto: string | null; emblem_seed: string | null; member_count: number };

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
        <h1 className="font-display text-2xl font-extrabold tracking-tight">THE ROOST</h1>
        <p className="text-[13px] text-faint">The most influential crows and the cabals they fly with.</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
          <div className="glass rounded-2xl">
            <h2 className="border-b border-line px-5 py-3 text-[11px] font-bold tracking-[0.16em] text-muted">
              TOP OPERATIVES
            </h2>
            <div className="divide-y divide-line">
              {operatives.map((o, i) => (
                <div key={o.id} className="flex items-center gap-3 px-5 py-3">
                  <span
                    className={`w-6 text-center font-mono text-[13px] font-bold ${
                      i === 0 ? "text-bull" : i < 3 ? "text-foreground" : "text-faint"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <Avatar seed={o.avatar_seed} label={o.codename} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-foreground">{o.codename}</p>
                    {o.display_name && <p className="truncate text-[11px] text-faint">{o.display_name}</p>}
                  </div>
                  <span className="font-mono text-[13px] font-bold text-bull">
                    {compactNumber(o.influence)} ⚑
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl">
            <h2 className="border-b border-line px-5 py-3 text-[11px] font-bold tracking-[0.16em] text-muted">
              TOP CABALS
            </h2>
            <div className="divide-y divide-line">
              {cabals.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="w-6 text-center font-mono text-[13px] font-bold text-faint">{i + 1}</span>
                  <Avatar seed={c.emblem_seed} label={c.name} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-foreground">{c.name}</p>
                    {c.motto && <p className="truncate text-[11px] italic text-faint">{c.motto}</p>}
                  </div>
                  <span className="font-mono text-[12px] font-bold text-foreground">{c.member_count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
