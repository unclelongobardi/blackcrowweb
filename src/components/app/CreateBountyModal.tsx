"use client";

import { useState } from "react";
import { useApi } from "@/lib/useApi";
import { IconSolana } from "@/components/icons";
import type { Bounty, Market } from "@/lib/types";

export default function CreateBountyModal({
  market,
  onClose,
  onCreated,
}: {
  market?: Market | null;
  onClose: () => void;
  onCreated: (b: Bounty) => void;
}) {
  const api = useApi();
  const [title, setTitle] = useState(market ? `Move: ${market.question.slice(0, 60)}` : "");
  const [description, setDescription] = useState("");
  const [task, setTask] = useState("");
  const [rewardSol, setRewardSol] = useState("0.5");
  const [kind, setKind] = useState<"action" | "intel" | "coord">("action");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setLoading(true);
    setError(null);
    try {
      const data = await api<{ bounty: Bounty }>("/api/bounties", {
        method: "POST",
        body: JSON.stringify({
          title,
          description: description || null,
          task,
          reward_sol: Number(rewardSol),
          kind,
          market: market ?? null,
        }),
      });
      onCreated(data.bounty);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">
      <div className="glass max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl p-6">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-faint">POST A BOUNTY</p>
        <p className="mt-1 text-[13px] text-muted">
          Lock <IconSolana className="inline h-3.5 w-3.5 align-[-2px]" /> in a bounty. Someone does the job. You approve → they get paid.
        </p>

        {market && (
          <div className="mt-3 rounded-lg border border-line bg-surface/40 px-3 py-2">
            <p className="line-clamp-2 text-[12px] text-foreground">🎯 {market.question}</p>
            {market.end_date && (
              <p className="mt-1 text-[10px] text-faint">
                Expires with market · {new Date(market.end_date).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        <div className="mt-4 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Bounty title"
            className="w-full rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-foreground placeholder:text-faint outline-none focus:border-white/25"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short pitch — why this matters"
            rows={2}
            className="w-full resize-none rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-foreground placeholder:text-faint outline-none focus:border-white/25"
          />
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="What must they do? e.g. Heat the thermometer at Central Park, post photo proof"
            rows={3}
            className="w-full resize-none rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-foreground placeholder:text-faint outline-none focus:border-white/25"
          />
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="100"
              value={rewardSol}
              onChange={(e) => setRewardSol(e.target.value)}
              className="flex-1 rounded-xl border border-line bg-surface/60 px-4 py-3 font-mono text-sm text-foreground outline-none focus:border-white/25"
            />
            <span className="flex items-center px-3">
              <IconSolana className="h-5 w-5" aria-label="Solana" />
            </span>
          </div>
          <div className="flex gap-2">
            {(["action", "intel", "coord"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={`flex-1 rounded-lg border px-2 py-2 text-[11px] font-bold tracking-wide ${
                  kind === k ? "border-foreground/40 bg-white/10 text-foreground" : "border-line text-faint"
                }`}
              >
                {k.toUpperCase()}
              </button>
            ))}
          </div>
          {error && <p className="text-[12px] text-bear">{error}</p>}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-line px-4 py-3 text-[13px] font-semibold text-muted"
          >
            Cancel
          </button>
          <button
            onClick={create}
            disabled={loading}
            className="flex-1 rounded-xl bg-foreground px-4 py-3 text-[13px] font-bold text-black disabled:opacity-60"
          >
            {loading ? "…" : "CREATE & FUND"}
          </button>
        </div>
      </div>
    </div>
  );
}
