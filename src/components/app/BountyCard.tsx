"use client";

import Link from "next/link";
import { useState } from "react";
import { useWallets as useSolanaWallets } from "@privy-io/react-auth/solana";
import { useApi } from "@/lib/useApi";
import { canContributeToPool } from "@/lib/bountyRules";
import { creatorPostInfluenceFromLamports, helperInfluenceFromLamports } from "@/lib/bountyInfluence";
import { lamportsToSol } from "@/lib/solanaFormat";
import { useSolanaDeposit } from "@/lib/solanaClient";
import { pct } from "@/lib/format";
import { uiBtnPrimary } from "@/lib/uiClasses";
import SolAmount from "./SolAmount";
import Avatar from "./Avatar";
import { IconFeather, IconSolana } from "@/components/icons";
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
  compact,
  selected,
  onSelect,
  onShareToWarRoom,
}: {
  bounty: Bounty;
  onUpdate: (b: Bounty) => void;
  compact?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  onShareToWarRoom?: () => void;
}) {
  const api = useApi();
  const { sendDeposit } = useSolanaDeposit();
  const { wallets } = useSolanaWallets();
  const wallet = wallets[0];
  const [busy, setBusy] = useState(false);
  const [proof, setProof] = useState("");
  const [contribAmount, setContribAmount] = useState("0.1");
  const [error, setError] = useState<string | null>(null);

  const sol = lamportsToSol(bounty.reward_sol_lamports);
  const role = bounty.my_role;
  const isOfficial =
    bounty.is_official ||
    bounty.creator?.codename === "blackcrow_official" ||
    bounty.creator?.codename === "blackcrow";
  const canApprove = bounty.status === "submitted" && role === "creator";
  const poolOpen = canContributeToPool(bounty.status, bounty.is_official);
  const helperFeathers = helperInfluenceFromLamports(bounty.reward_sol_lamports);
  const othersSol =
    bounty.contributions_lamports && bounty.contributions_lamports > 0
      ? lamportsToSol(bounty.contributions_lamports)
      : null;

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
    const res = await run(() =>
      api<{ creator_feathers?: number }>(`/api/bounties/${bounty.id}/fund`, {
        method: "POST",
        body: JSON.stringify({ tx_signature: sig }),
      }),
    );
    if (res) {
      onUpdate({
        ...bounty,
        status: "open",
        deposit_tx: sig,
        reward_influence: helperFeathers,
      });
    }
  }

  async function contribute() {
    if (!wallet) {
      setError("Connect your Solana wallet first.");
      return;
    }
    const amount = Number(contribAmount);
    if (!Number.isFinite(amount) || amount < 0.01) {
      setError("Minimum contribution is 0.01 SOL.");
      return;
    }
    const built = await run(() =>
      api<{ transaction: string }>(`/api/bounties/${bounty.id}/contribute/deposit-tx`, {
        method: "POST",
        body: JSON.stringify({ amount_sol: amount }),
      }),
    );
    if (!built) return;
    const sig = await run(() => sendDeposit(wallet, built.transaction));
    if (!sig) return;
    const res = await run(() =>
      api<{ bounty: Bounty }>(`/api/bounties/${bounty.id}/contribute`, {
        method: "POST",
        body: JSON.stringify({ tx_signature: sig, amount_sol: amount }),
      }),
    );
    if (res?.bounty) onUpdate(res.bounty);
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
    <div
      className={`glass glass-hover flex flex-col rounded-2xl ${compact ? "p-4 cursor-pointer" : "p-5"} ${
        selected ? "border border-bull/30" : ""
      }`}
      onClick={compact && onSelect ? onSelect : undefined}
      onKeyDown={
        compact && onSelect
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onSelect();
            }
          : undefined
      }
      role={compact && onSelect ? "button" : undefined}
      tabIndex={compact && onSelect ? 0 : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {isOfficial && bounty.creator && (
            <Link
              href={`/app/u/${bounty.creator.codename}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 rounded-md bg-white/5 py-0.5 pl-0.5 pr-2"
            >
              <Avatar
                seed={bounty.creator.avatar_seed}
                label={bounty.creator.codename}
                size={20}
                verified={bounty.creator.is_verified || bounty.creator.codename === "blackcrow_official"}
              />
              <span className="text-[10px] font-semibold text-foreground">blackcrow_official</span>
            </Link>
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
          <SolAmount amount={sol} className="font-mono text-lg font-bold text-bull" iconClassName="h-4 w-4" />
          <p className="flex items-center justify-end gap-1 text-[10px] text-faint">
            {!isOfficial && (
              <>
                +{helperFeathers}
                <IconFeather className="h-3 w-3 text-bull" /> helper
              </>
            )}
          </p>
        </div>
      </div>

      {!isOfficial && bounty.status !== "funding" && (
        <p className="mt-2 text-[11px] text-faint">
          Pool
          {othersSol ? (
            <>
              {" · +"}
              <SolAmount amount={othersSol} className="font-mono text-faint" iconClassName="h-3 w-3" />
              {` from ${bounty.contribution_count ?? 0} contributor(s)`}
            </>
          ) : (
            ""
          )}
          {role === "creator" && bounty.status === "submitted" && " · You decide approve/reject"}
        </p>
      )}

      <h2 className="mt-3 text-[15px] font-bold tracking-tight text-foreground">{bounty.title}</h2>
      {bounty.description && (
        <p className="mt-1 text-[13px] leading-relaxed text-muted">{bounty.description}</p>
      )}

      {bounty.task && (
        <div className="mt-3 rounded-lg border border-line bg-surface/40 px-3 py-2.5">
          <p className="section-label">The job</p>
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

      {bounty.contributions && bounty.contributions.length > 0 && (
        <div className="mt-3 rounded-lg border border-line bg-surface/30 px-3 py-2">
          <p className="section-label">Pool contributions</p>
          <div className="mt-2 space-y-1.5">
            {bounty.contributions.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center justify-between text-[11px]">
                {c.contributor ? (
                  <Link href={`/app/u/${c.contributor.codename}`} className="text-muted hover:text-foreground">
                    @{c.contributor.codename}
                  </Link>
                ) : (
                  <span className="text-faint">anon</span>
                )}
                <SolAmount amount={`+${lamportsToSol(c.lamports)}`} className="font-mono text-bull" iconClassName="h-3 w-3" />
              </div>
            ))}
          </div>
        </div>
      )}

      {bounty.proof && bounty.status !== "assigned" && (
        <div className="mt-3 rounded-lg border border-bull/20 bg-bull/5 px-3 py-2">
          <p className="section-label">Proof</p>
          <p className="mt-1 whitespace-pre-wrap text-[12px] text-foreground">{bounty.proof}</p>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 text-[11px] text-faint">
        {bounty.creator && (
          <Link href={`/app/u/${bounty.creator.codename}`} className="flex items-center gap-1 hover:text-foreground">
            <Avatar
              seed={bounty.creator.avatar_seed}
              label={bounty.creator.codename}
              size={18}
              verified={bounty.creator.is_verified || bounty.creator.codename === "blackcrow_official"}
            />
            {bounty.creator.codename}
          </Link>
        )}
        {bounty.helper && (
          <Link href={`/app/u/${bounty.helper.codename}`} className="flex items-center gap-1 hover:text-foreground">
            →{" "}
            <Avatar seed={bounty.helper.avatar_seed} label={bounty.helper.codename} size={18} />
            {bounty.helper.codename}
          </Link>
        )}
      </div>

      {error && <p className="mt-3 text-[12px] text-bear">{error}</p>}

      {onShareToWarRoom && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onShareToWarRoom();
          }}
          className="ui-btn mt-3 w-full rounded-lg border border-bull/30 bg-bull/5 px-3 py-2 text-[11px] font-bold text-bull hover:bg-bull/10"
        >
          SHARE TO WAR ROOM
        </button>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {bounty.status === "funding" && role === "creator" && (
          <>
            <p className="text-[11px] text-faint">
              Deposit to go live · earn up to {creatorPostInfluenceFromLamports(bounty.reward_sol_lamports)} Feathers
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fund();
              }}
              disabled={busy}
              className={`${uiBtnPrimary} rounded-lg bg-foreground px-4 py-2.5 text-[12px] font-bold text-black disabled:opacity-60`}
            >
              {busy ? "…" : (
                <>
                  DEPOSIT <SolAmount amount={sol} className="font-mono" iconClassName="h-3.5 w-3.5" /> TO ESCROW
                </>
              )}
            </button>
          </>
        )}

        {poolOpen && role !== "creator" && (
          <div className="rounded-xl border border-line bg-surface/30 p-3">
            <p className="text-[11px] font-semibold text-muted">Boost the pool</p>
            <p className="mt-1 text-[10px] leading-relaxed text-faint">
              Add to increase the reward. Only {bounty.creator?.codename ?? "the creator"} approves proof.
            </p>
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={contribAmount}
                onChange={(e) => setContribAmount(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-24 rounded-lg border border-line bg-surface/60 px-2 py-2 font-mono text-[12px] outline-none"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  contribute();
                }}
                disabled={busy}
                className={`${uiBtnPrimary} flex-1 rounded-lg bg-foreground px-3 py-2 text-[11px] font-bold text-black disabled:opacity-60`}
              >
                {busy ? "…" : (
                  <span className="inline-flex items-center justify-center gap-1">
                    ADD <IconSolana className="h-3.5 w-3.5" /> TO POOL
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {poolOpen && role === "creator" && (
          <div className="rounded-xl border border-dashed border-line px-3 py-2 text-[10px] text-faint">
            Others can add <IconSolana className="inline h-3 w-3 align-[-2px]" /> to your pool while this is open. You keep
            final approve/reject power.
          </div>
        )}

        {bounty.status === "open" && !role && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              accept();
            }}
            disabled={busy}
            className={`${uiBtnPrimary} rounded-lg bg-foreground px-4 py-2.5 text-[12px] font-bold text-black disabled:opacity-60`}
          >
            {busy ? "…" : "I'LL DO IT — ACCEPT BOUNTY"}
          </button>
        )}

        {bounty.status === "assigned" && role === "helper" && (
          <>
            <textarea
              value={proof}
              onChange={(e) => setProof(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Proof: links, photos, what you did…"
              rows={3}
              className="w-full resize-none rounded-xl border border-line bg-surface/60 px-3 py-2 text-[12px] text-foreground placeholder:text-faint outline-none focus:border-white/25"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                submitProof();
              }}
              disabled={busy || proof.length < 10}
              className={`${uiBtnPrimary} rounded-lg bg-foreground px-4 py-2.5 text-[12px] font-bold text-black disabled:opacity-60`}
            >
              {busy ? "…" : "SUBMIT PROOF"}
            </button>
          </>
        )}

        {canApprove && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                approve();
              }}
              disabled={busy}
              className={`${uiBtnPrimary} flex-1 rounded-lg bg-bull px-4 py-2.5 text-[12px] font-bold text-black disabled:opacity-60`}
            >
              {busy ? "…" : isOfficial ? (
                <span className="inline-flex items-center justify-center gap-1">
                  APPROVE & RELEASE <IconSolana className="h-3.5 w-3.5" />
                </span>
              ) : (
                "APPROVE & PAY POOL"
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                reject();
              }}
              disabled={busy}
              className="ui-btn flex-1 rounded-lg border border-line px-4 py-2.5 text-[12px] font-semibold text-muted disabled:opacity-60"
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
          <p className="text-center text-[11px] text-faint">Payout released</p>
        )}
      </div>
    </div>
  );
}
