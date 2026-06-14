"use client";

import { useState } from "react";
import { useWallets as useSolanaWallets } from "@privy-io/react-auth/solana";
import { MAX_BOUNTY_REWARD_SOL, MIN_BOUNTY_REWARD_SOL } from "@/lib/bountyRules";
import { useApi } from "@/lib/useApi";
import { IconSolana } from "@/components/icons";
import type { Bounty, Market } from "@/lib/types";
import { uiBtnPrimary } from "@/lib/uiClasses";

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
  const { wallets } = useSolanaWallets();
  const wallet = wallets[0];
  const [title, setTitle] = useState(market ? `Move: ${market.question.slice(0, 60)}` : "");
  const [description, setDescription] = useState("");
  const [task, setTask] = useState("");
  const [rewardSol, setRewardSol] = useState("0.5");
  const [kind, setKind] = useState<"action" | "intel" | "coord">("action");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!wallet?.address) {
      setError("Connect your Solana wallet before posting a bounty.");
      return;
    }
    if (title.trim().length < 4) {
      setError("Title must be at least 4 characters.");
      return;
    }
    if (task.trim().length < 10) {
      setError("Describe what the helper must do (10+ characters).");
      return;
    }
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm">
      <div className="glass max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl p-6">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-faint">POST A BOUNTY</p>
        <p className="mt-1 text-[13px] text-muted">
          Create the job first, then deposit SOL to publish it. After that you can post it to Home.
        </p>
        {!wallet?.address && (
          <p className="mt-2 rounded-lg border border-bear/30 bg-bear/10 px-3 py-2 text-[11px] text-bear">
            Connect your Solana wallet to continue.
          </p>
        )}

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
            className="w-full rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-foreground placeholder:text-faint outline-none focus:border-black/20"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short pitch — why this matters"
            rows={2}
            className="w-full resize-none rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-foreground placeholder:text-faint outline-none focus:border-black/20"
          />
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="What must they do? e.g. Heat the thermometer at Central Park, post photo proof"
            rows={3}
            className="w-full resize-none rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-foreground placeholder:text-faint outline-none focus:border-black/20"
          />
          <div className="flex gap-2">
            <input
              type="number"
              step="0.00001"
              min={MIN_BOUNTY_REWARD_SOL}
              max={MAX_BOUNTY_REWARD_SOL}
              value={rewardSol}
              onChange={(e) => setRewardSol(e.target.value)}
              className="flex-1 rounded-xl border border-line bg-surface/60 px-4 py-3 font-mono text-sm text-foreground outline-none focus:border-black/20"
            />
            <span className="flex items-center px-3">
              <IconSolana className="h-5 w-5" aria-label="Solana" />
            </span>
          </div>
          <p className="text-[11px] text-faint">
            Min {MIN_BOUNTY_REWARD_SOL} · max {MAX_BOUNTY_REWARD_SOL} SOL
          </p>
          <div className="flex gap-2">
            {(["action", "intel", "coord"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={`flex-1 rounded-lg border px-2 py-2 text-[11px] font-bold tracking-wide ${
                  kind === k ? "border-foreground/40 bg-black/[0.06] text-foreground" : "border-line text-faint"
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
            disabled={loading || !wallet?.address}
            className={`${uiBtnPrimary} flex-1 rounded-xl px-4 py-3 text-[13px] font-bold disabled:opacity-60`}
          >
            {loading ? "…" : "CREATE BOUNTY"}
          </button>
        </div>
      </div>
    </div>
  );
}
