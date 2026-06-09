"use client";

import { useState } from "react";
import { useWallets as useSolanaWallets } from "@privy-io/react-auth/solana";
import { useApi } from "@/lib/useApi";
import { lamportsToSol } from "@/lib/solanaFormat";
import { useSolanaDeposit } from "@/lib/solanaClient";
import { pct } from "@/lib/format";
import Avatar from "./Avatar";
import type { Bounty } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  funding: "Awaiting deposit",
  open: "Open",
  assigned: "In progress",
  submitted: "Proof submitted",
  paid: "Paid",
  cancelled: "Cancelled",
};

const KIND_LABEL: Record<string, string> = {
  action: "Field op",
  intel: "Intel",
  coord: "Coordination",
};

export default function BountyCard({
  bounty,
  onUpdate,
}: {
  bounty: Bounty;
  onUpdate: (b: Bounty) => void;
}) {
  const api = useApi();
  const { sendDeposit } = useSolanaDeposit();
  const { wallets } = useSolanaWallets();
  const wallet = wallets[0];
  const [busy, setBusy] = useState(false);
  const [proof, setProof] = useState("");
  const [error, setError] = useState<string | null>(null);

  const sol = lamportsToSol(bounty.reward_sol_lamports);
  const role = bounty.my_role;
  const isOfficial = bounty.is_official || bounty.creator?.codename === "blackcrow";
  const canApprove =
    bounty.status === "submitted" && (role === "creator" || isOfficial);

  async function run<T>(fn: () => Promise<T>): Promise<T | null> {
    setBusy(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something failed.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function fund() {
    if (!wallet) {
      setError("Connect your Solana wallet first.");
      return;
    }
    const built = await run(() =>
      api<{ transaction: string }>(`/api/bounties/${bounty.id}/deposit-tx`, { method: "POST" }),
    );
    if (!built) return;
    const sig = await run(() => sendDeposit(wallet, built.transaction));
    if (!sig) return;
    await run(() =>
      api(`/api/bounties/${bounty.id}/fund`, {
        method: "POST",
        body: JSON.stringify({ tx_signature: sig }),
      }),
    );
    onUpdate({ ...bounty, status: "open", deposit_tx: sig });
  }

  async function accept() {
    const res = await run(() =>
      api<{ status: string }>(`/api/bounties/${bounty.id}/accept`, { method: "POST" }),
    );
    if (res) onUpdate({ ...bounty, status: "assigned", my_role: "helper" });
  }

  async function submitProof() {
    const res = await run(() =>
      api<{ status: string }>(`/api/bounties/${bounty.id}/submit`, {
        method: "POST",
        body: JSON.stringify({ proof }),
      }),
    );
    if (res) onUpdate({ ...bounty, status: "submitted", proof });
  }

  async function approve() {
    const res = await run(() =>
      api<{ payout_tx: string }>(`/api/bounties/${bounty.id}/approve`, { method: "POST" }),
    );
    if (res) onUpdate({ ...bounty, status: "paid", payout_tx: res.payout_tx });
  }

  async function reject() {
    const res = await run(() =>
      api(`/api/bounties/${bounty.id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: "Needs better proof." }),
      }),
    );
    if (res) onUpdate({ ...bounty, status: "assigned", proof: null });
  }

  return (
    <div className="glass glass-hover flex flex-col rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {isOfficial && (
            <span className="rounded-md bg-bull/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-bull">
              BlackCrow Official
            </span>
          )}
          <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-faint">
            {KIND_LABEL[bounty.kind] ?? bounty.kind}
          </span>
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide ${
              bounty.status === "open"
                ? "bg-bull/10 text-bull"
                : bounty.status === "paid"
                  ? "bg-white/10 text-foreground"
                  : "bg-white/5 text-faint"
            }`}
          >
            {STATUS_LABEL[bounty.status] ?? bounty.status}
          </span>
        </div>
        <div className="text-right">
          <p className="font-mono text-lg font-bold text-bull">{sol} SOL</p>
          <p className="text-[10px] text-faint">
            {isOfficial ? "In escrow" : `+${bounty.reward_influence} ⚑`}
          </p>
        </div>
      </div>

      <h2 className="mt-3 text-[15px] font-bold tracking-tight text-foreground">{bounty.title}</h2>
      {bounty.description && (
        <p className="mt-1 text-[13px] leading-relaxed text-muted">{bounty.description}</p>
      )}

      {bounty.task && (
        <div className="mt-3 rounded-lg border border-line bg-surface/40 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-faint">The job</p>
          <p className="mt-1 text-[12px] leading-relaxed text-foreground">{bounty.task}</p>
        </div>
      )}

      {bounty.market && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-line bg-surface/40 px-3 py-2">
          <span className="truncate text-[12px] text-muted">{bounty.market.question}</span>
          {bounty.market.yes_price != null && (
            <span className="shrink-0 font-mono text-[12px] font-bold text-bull">
              {pct(bounty.market.yes_price)} YES
            </span>
          )}
        </div>
      )}

      {bounty.proof && bounty.status !== "assigned" && (
        <div className="mt-3 rounded-lg border border-bull/20 bg-bull/5 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-faint">Proof</p>
          <p className="mt-1 whitespace-pre-wrap text-[12px] text-foreground">{bounty.proof}</p>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 text-[11px] text-faint">
        {bounty.creator && (
          <span className="flex items-center gap-1">
            <Avatar seed={bounty.creator.avatar_seed} label={bounty.creator.codename} size={18} />
            {bounty.creator.codename}
          </span>
        )}
        {bounty.helper && (
          <span className="flex items-center gap-1">
            → <Avatar seed={bounty.helper.avatar_seed} label={bounty.helper.codename} size={18} />
            {bounty.helper.codename}
          </span>
        )}
      </div>

      {error && <p className="mt-3 text-[12px] text-bear">{error}</p>}

      <div className="mt-4 flex flex-col gap-2">
        {bounty.status === "funding" && role === "creator" && (
          <button
            onClick={fund}
            disabled={busy}
            className="rounded-lg bg-foreground px-4 py-2.5 text-[12px] font-bold tracking-wide text-black disabled:opacity-60"
          >
            {busy ? "…" : `DEPOSIT ${sol} SOL TO ESCROW`}
          </button>
        )}

        {bounty.status === "open" && !role && (
          <button
            onClick={accept}
            disabled={busy}
            className="rounded-lg bg-foreground px-4 py-2.5 text-[12px] font-bold tracking-wide text-black disabled:opacity-60"
          >
            {busy ? "…" : "I'LL DO IT — ACCEPT BOUNTY"}
          </button>
        )}

        {bounty.status === "assigned" && role === "helper" && (
          <>
            <textarea
              value={proof}
              onChange={(e) => setProof(e.target.value)}
              placeholder="Proof: links, photos, what you did…"
              rows={3}
              className="w-full resize-none rounded-xl border border-line bg-surface/60 px-3 py-2 text-[12px] text-foreground placeholder:text-faint outline-none focus:border-white/25"
            />
            <button
              onClick={submitProof}
              disabled={busy || proof.length < 10}
              className="rounded-lg bg-foreground px-4 py-2.5 text-[12px] font-bold tracking-wide text-black disabled:opacity-60"
            >
              {busy ? "…" : "SUBMIT PROOF"}
            </button>
          </>
        )}

        {canApprove && (
          <div className="flex gap-2">
            <button
              onClick={approve}
              disabled={busy}
              className="flex-1 rounded-lg bg-bull px-4 py-2.5 text-[12px] font-bold tracking-wide text-black disabled:opacity-60"
            >
              {busy ? "…" : isOfficial ? "APPROVE & RELEASE SOL" : "APPROVE & PAY"}
            </button>
            <button
              onClick={reject}
              disabled={busy}
              className="flex-1 rounded-lg border border-line px-4 py-2.5 text-[12px] font-semibold text-muted disabled:opacity-60"
            >
              REJECT
            </button>
          </div>
        )}

        {bounty.status === "paid" && bounty.payout_tx && !bounty.payout_tx.startsWith("OFFICIAL_MANUAL") && (
          <a
            href={`https://solscan.io/tx/${bounty.payout_tx}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-[11px] text-bull hover:underline"
          >
            View payout on Solscan →
          </a>
        )}
        {bounty.status === "paid" && bounty.payout_tx?.startsWith("OFFICIAL_MANUAL") && (
          <p className="text-center text-[11px] text-faint">Official payout released</p>
        )}
      </div>
    </div>
  );
}
