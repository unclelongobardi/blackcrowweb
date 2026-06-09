"use client";

import { useCallback, useEffect, useState } from "react";
import { useApi } from "@/lib/useApi";
import BountyCard from "@/components/app/BountyCard";
import CreateBountyModal from "@/components/app/CreateBountyModal";
import type { Bounty } from "@/lib/types";

type Tab = "browse" | "mine" | "create";

export default function RewardsPage() {
  const api = useApi();
  const [tab, setTab] = useState<Tab>("browse");
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const path = tab === "mine" ? "/api/bounties?mine=1" : "/api/bounties";
      const data = await api<{ bounties: Bounty[] }>(path);
      setBounties(data.bounties);
    } finally {
      setLoading(false);
    }
  }, [api, tab]);

  useEffect(() => {
    if (tab !== "create") load();
  }, [tab, load]);

  function handleCreated(b: Bounty) {
    setShowCreate(false);
    setTab("mine");
    setBounties((prev) => [b, ...prev]);
  }

  function handleUpdate(updated: Bounty) {
    setBounties((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-6">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">BOUNTIES</h1>
        <p className="mt-1 max-w-lg text-[13px] leading-relaxed text-faint">
          Pay someone in SOL to do the dirty work. Money sits in escrow until you approve their proof.
          No betting here — you coordinate, they execute, Polymarket is where the bets live.
        </p>
      </header>

      <div className="mb-6 flex gap-2">
        {(["browse", "mine", "create"] as const).map((t) => (
          <button
            key={t}
            onClick={() => (t === "create" ? setShowCreate(true) : setTab(t))}
            className={`rounded-lg px-4 py-2 text-[12px] font-bold tracking-wide transition-colors ${
              tab === t
                ? "bg-foreground text-black"
                : "border border-line text-muted hover:text-foreground"
            }`}
          >
            {t === "browse" ? "OPEN BOUNTIES" : t === "mine" ? "MY BOUNTIES" : "+ POST BOUNTY"}
          </button>
        ))}
      </div>

      {/* How it works */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
        {[
          ["1", "Post", "Set the job + SOL reward"],
          ["2", "Deposit", "SOL locked in escrow"],
          ["3", "Execute", "Someone accepts & does it"],
          ["4", "Approve", "You confirm → they get paid"],
        ].map(([n, title, desc]) => (
          <div key={n} className="rounded-xl border border-line bg-surface/40 px-3 py-3">
            <p className="font-mono text-[11px] font-bold text-bull">{n}</p>
            <p className="text-[12px] font-bold text-foreground">{title}</p>
            <p className="text-[11px] text-faint">{desc}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-foreground" />
        </div>
      ) : bounties.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[13px] text-faint">
            {tab === "mine" ? "You haven't posted or accepted any bounties yet." : "No open bounties right now."}
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 rounded-lg bg-foreground px-5 py-2.5 text-[12px] font-bold text-black"
          >
            POST THE FIRST ONE
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {bounties.map((b) => (
            <BountyCard key={b.id} bounty={b} onUpdate={handleUpdate} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateBountyModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
