"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useWallets as useSolanaWallets } from "@privy-io/react-auth/solana";
import { useApi } from "@/lib/useApi";
import { canAcceptBounty, canContributeToPool, expiresInLabel, isBountyExpired } from "@/lib/bountyRules";
import { creatorPostInfluenceFromLamports, helperInfluenceFromLamports } from "@/lib/bountyInfluence";
import { lamportsToSol } from "@/lib/solanaFormat";
import { useSolanaDeposit } from "@/lib/solanaClient";
import { pct } from "@/lib/format";
import { uiBtnPrimary } from "@/lib/uiClasses";
import SolAmount from "./SolAmount";
import Avatar from "./Avatar";
import { IconFeather, IconSolana } from "@/components/icons";
import type { Bounty, BountyParticipant, BountyProofMedia } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  funding: "Awaiting deposit",
  open: "Open",
  assigned: "In progress",
  submitted: "Proofs to review",
  paid: "Paid",
  cancelled: "Cancelled",
  expired: "Expired",
};

const KIND_LABEL: Record<string, string> = {
  action: "Field op",
  intel: "Intel",
  coord: "Coordination",
};

function ProofMediaGrid({ media }: { media: BountyProofMedia[] }) {
  if (!media.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {media.map((m, i) =>
        m.type === "video" && !m.url.startsWith("data:") ? (
          <a
            key={i}
            href={m.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-line bg-surface/50 px-3 py-2 text-[11px] text-bull hover:underline"
          >
            Watch video →
          </a>
        ) : m.type === "video" ? (
          <video key={i} src={m.url} controls className="max-h-40 max-w-full rounded-lg border border-line" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={m.url} alt="" className="max-h-40 max-w-[160px] rounded-lg border border-line object-cover" />
        ),
      )}
    </div>
  );
}

function ParticipantProof({
  participant,
  onApprove,
  onReject,
  busy,
}: {
  participant: BountyParticipant;
  onApprove: () => void;
  onReject: () => void;
  busy: boolean;
}) {
  return (
    <div className="rounded-xl border border-bull/20 bg-bull/5 p-3">
      <div className="flex items-center gap-2">
        {participant.profile && (
          <Avatar
            seed={participant.profile.avatar_seed}
            avatarUrl={participant.profile.avatar_url}
            label={participant.profile.codename}
            size={28}
            verified={participant.profile.is_verified}
          />
        )}
        <Link href={`/app/u/${participant.profile?.codename}`} className="text-[12px] font-semibold hover:text-bull">
          @{participant.profile?.codename ?? "…"}
        </Link>
      </div>
      {participant.proof_text && (
        <p className="mt-2 whitespace-pre-wrap text-[12px] text-foreground">{participant.proof_text}</p>
      )}
      <ProofMediaGrid media={participant.proof_media ?? []} />
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onApprove}
          disabled={busy}
          className={`${uiBtnPrimary} flex-1 rounded-lg bg-bull px-3 py-2 text-[11px] font-bold text-black disabled:opacity-60`}
        >
          Approve & pay pool
        </button>
        <button
          type="button"
          onClick={onReject}
          disabled={busy}
          className="ui-btn flex-1 rounded-lg border border-line px-3 py-2 text-[11px] font-semibold text-muted disabled:opacity-60"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

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
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [proof, setProof] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [media, setMedia] = useState<BountyProofMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [contribAmount, setContribAmount] = useState("0.1");
  const [error, setError] = useState<string | null>(null);

  const sol = lamportsToSol(bounty.reward_sol_lamports);
  const role = bounty.my_role;
  const myParticipant = bounty.my_participant;
  const expired = isBountyExpired(bounty) || bounty.status === "expired";
  const expiryLabel = expiresInLabel(bounty.expires_at);
  const isWorldCup = bounty.collection === "world_cup";
  const isOfficial =
    bounty.is_official ||
    bounty.creator?.codename === "blackcrow_official" ||
    bounty.creator?.codename === "blackcrow";
  const pendingSubmissions =
    bounty.participants?.filter((p) => p.status === "submitted") ?? [];
  const canApprove = role === "creator" && pendingSubmissions.length > 0 && bounty.status !== "paid";
  const poolOpen = canContributeToPool(bounty.status, bounty.is_official, bounty.expires_at);
  const canJoin = canAcceptBounty(bounty) && !myParticipant && role !== "creator";
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
      api<{ bounty?: Bounty }>(`/api/bounties/${bounty.id}/accept`, { method: "POST" }),
    );
    if (res?.bounty) onUpdate(res.bounty);
  }

  async function uploadMedia(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api<{ type: "image" | "video"; url: string }>("/api/bounties/proof-media", {
        method: "POST",
        body: form,
      });
      setMedia((prev) => [...prev, { type: res.type, url: res.url }].slice(0, 6));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function submitProof() {
    const res = await run(() =>
      api<{ bounty?: Bounty }>(`/api/bounties/${bounty.id}/submit`, {
        method: "POST",
        body: JSON.stringify({ proof, media, video_url: videoUrl || undefined }),
      }),
    );
    if (res?.bounty) {
      setProof("");
      setMedia([]);
      setVideoUrl("");
      onUpdate(res.bounty);
    }
  }

  async function approveParticipant(participantId: string) {
    const res = await run(() =>
      api<{ bounty?: Bounty; payout_tx: string }>(`/api/bounties/${bounty.id}/approve`, {
        method: "POST",
        body: JSON.stringify({ participant_id: participantId }),
      }),
    );
    if (res?.bounty) onUpdate(res.bounty);
    else if (res) onUpdate({ ...bounty, status: "paid", payout_tx: res.payout_tx });
  }

  async function rejectParticipant(participantId: string) {
    const res = await run(() =>
      api<{ bounty?: Bounty }>(`/api/bounties/${bounty.id}/reject`, {
        method: "POST",
        body: JSON.stringify({ participant_id: participantId, reason: "Needs better proof." }),
      }),
    );
    if (res?.bounty) onUpdate(res.bounty);
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
                avatarUrl={bounty.creator.avatar_url}
                label={bounty.creator.codename}
                size={20}
                verified={bounty.creator.is_verified || bounty.creator.codename === "blackcrow_official"}
              />
              <span className="text-[10px] font-semibold text-foreground">blackcrow_official</span>
            </Link>
          )}
          {isWorldCup && (
            <span className="rounded-md bg-bull/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-bull">
              WC SPECIAL
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
                  : expired
                    ? "bg-bear/10 text-bear"
                    : "bg-white/5 text-faint"
            }`}
          >
            {expired ? "Expired" : (STATUS_LABEL[bounty.status] ?? bounty.status)}
          </span>
          {expiryLabel && !expired && (
            <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-faint">
              {expiryLabel}
            </span>
          )}
          {(bounty.participant_count ?? 0) > 0 && (
            <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-faint">
              {bounty.participant_count} joined
            </span>
          )}
        </div>
        <div className="text-right">
          <SolAmount amount={sol} className="font-mono text-lg font-bold text-bull" iconClassName="h-4 w-4" />
          <p className="flex items-center justify-end gap-1 text-[10px] text-faint">
            {!isOfficial && (
              <>
                +{helperFeathers}
                <IconFeather className="h-3 w-3 text-bull" /> winner
              </>
            )}
          </p>
        </div>
      </div>

      {!isOfficial && bounty.status !== "funding" && (
        <p className="mt-2 text-[11px] text-faint">
          Reward pool
          {othersSol ? (
            <>
              {" · +"}
              <SolAmount amount={othersSol} className="font-mono text-faint" iconClassName="h-3 w-3" />
              {` boosted by ${bounty.contribution_count ?? 0} contributor(s)`}
            </>
          ) : (
            " · anyone can boost with SOL"
          )}
          {role === "creator" && pendingSubmissions.length > 0 && " · you pick who gets paid"}
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

      {bounty.expires_at && (
        <p className="mt-2 text-[10px] text-faint">
          Deadline: {new Date(bounty.expires_at).toLocaleString()}
          {bounty.market?.end_date ? " (linked to market close)" : ""}
        </p>
      )}

      {bounty.contributions && bounty.contributions.length > 0 && (
        <div className="mt-3 rounded-lg border border-line bg-surface/30 px-3 py-2">
          <p className="section-label">Pool boosts</p>
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

      {bounty.participants && bounty.participants.length > 0 && role !== "creator" && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {bounty.participants.slice(0, 6).map((p) => (
            <span
              key={p.id}
              className={`rounded-md px-2 py-0.5 text-[10px] ${
                p.status === "submitted" ? "bg-bull/10 text-bull" : "bg-white/5 text-faint"
              }`}
            >
              @{p.profile?.codename ?? "…"}
              {p.status === "submitted" ? " · proof in" : p.status === "approved" ? " · paid" : ""}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 text-[11px] text-faint">
        {bounty.creator && (
          <Link href={`/app/u/${bounty.creator.codename}`} className="flex items-center gap-1 hover:text-foreground">
            <Avatar
              seed={bounty.creator.avatar_seed}
              avatarUrl={bounty.creator.avatar_url}
              label={bounty.creator.codename}
              size={18}
              verified={bounty.creator.is_verified || bounty.creator.codename === "blackcrow_official"}
            />
            {bounty.creator.codename}
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
          POST TO HOME
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
          <div className="rounded-xl border border-bull/20 bg-bull/5 p-3">
            <p className="text-[11px] font-semibold text-foreground">Boost the reward pool</p>
            <p className="mt-1 text-[10px] leading-relaxed text-faint">
              Add SOL so the winner earns more. Only {bounty.creator?.codename ?? "the creator"} decides who fulfilled
              the job and gets paid.
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
            Others can boost your pool with <IconSolana className="inline h-3 w-3 align-[-2px]" /> while this is open.
            You approve who fulfilled the job and receives the full pool.
          </div>
        )}

        {canJoin && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              accept();
            }}
            disabled={busy}
            className={`${uiBtnPrimary} rounded-lg bg-foreground px-4 py-2.5 text-[12px] font-bold text-black disabled:opacity-60`}
          >
            {busy ? "…" : "JOIN CHALLENGE"}
          </button>
        )}

        {myParticipant?.status === "submitted" && (
          <p className="rounded-lg border border-line bg-surface/40 px-3 py-2 text-[11px] text-muted">
            Your proof is under review. The creator will approve or reject.
          </p>
        )}

        {myParticipant && (myParticipant.status === "accepted" || myParticipant.status === "rejected") && !expired && (
          <>
            <p className="text-[11px] font-semibold text-muted">Submit your proof</p>
            <textarea
              value={proof}
              onChange={(e) => setProof(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="What you did, links, context…"
              rows={3}
              className="w-full resize-none rounded-xl border border-line bg-surface/60 px-3 py-2 text-[12px] text-foreground placeholder:text-faint outline-none focus:border-white/25"
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/mp4,video/webm"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadMedia(f);
                e.target.value = "";
              }}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileRef.current?.click();
                }}
                disabled={uploading || media.length >= 6}
                className="rounded-lg border border-line px-3 py-2 text-[11px] font-semibold text-muted disabled:opacity-50"
              >
                {uploading ? "Uploading…" : "Add photo / video"}
              </button>
              <input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Or paste video URL"
                className="min-w-0 flex-1 rounded-lg border border-line bg-surface/60 px-3 py-2 text-[11px] outline-none"
              />
            </div>
            {media.length > 0 && <ProofMediaGrid media={media} />}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                submitProof();
              }}
              disabled={busy || uploading || (proof.length < 10 && media.length === 0 && !videoUrl)}
              className={`${uiBtnPrimary} rounded-lg bg-foreground px-4 py-2.5 text-[12px] font-bold text-black disabled:opacity-60`}
            >
              {busy ? "…" : "SUBMIT PROOF"}
            </button>
          </>
        )}

        {canApprove && (
          <div className="space-y-3">
            <p className="text-[11px] font-semibold text-muted">
              Review proofs ({pendingSubmissions.length}) — pick who gets the pool
            </p>
            {pendingSubmissions.map((p) => (
              <ParticipantProof
                key={p.id}
                participant={p}
                busy={busy}
                onApprove={() => approveParticipant(p.id)}
                onReject={() => rejectParticipant(p.id)}
              />
            ))}
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
