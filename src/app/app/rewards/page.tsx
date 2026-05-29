"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/lib/useApi";
import type { Bounty } from "@/lib/types";

const KIND_LABEL: Record<string, string> = {
  debate: "Debate",
  operation: "Operation",
  referral: "Recruit",
  intel: "Intel",
};

export default function RewardsPage() {
  const api = useApi();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api<{ bounties: Bounty[] }>("/api/bounties");
        setBounties(data.bounties);
      } finally {
        setLoading(false);
      }
    })();
  }, [api]);

  async function claim(b: Bounty) {
    setBusy(b.id);
    try {
      await api(`/api/bounties/${b.id}/claim`, { method: "POST", body: JSON.stringify({}) });
      setBounties((prev) => prev.map((x) => (x.id === b.id ? { ...x, claimed: true } : x)));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-6">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">BOUNTIES</h1>
        <p className="text-[13px] text-faint">
          Earn Feathers (⚑) for moving the network forward. Claims are reviewed by the council.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {bounties.map((b) => (
            <div key={b.id} className="glass glass-hover flex flex-col rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-faint">
                  {KIND_LABEL[b.kind] ?? b.kind}
                </span>
                <span className="font-mono text-sm font-bold text-bull">
                  +{b.reward_influence.toLocaleString()} ⚑
                </span>
              </div>
              <h2 className="mt-3 text-[15px] font-bold tracking-tight text-foreground">{b.title}</h2>
              {b.description && (
                <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-muted">{b.description}</p>
              )}
              <button
                onClick={() => claim(b)}
                disabled={busy === b.id || b.claimed}
                className="mt-4 rounded-lg border border-line px-3 py-2 text-[12px] font-semibold tracking-wide text-foreground transition-colors hover:border-white/25 disabled:opacity-50"
              >
                {b.claimed ? "CLAIM SUBMITTED" : busy === b.id ? "…" : "CLAIM BOUNTY"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
