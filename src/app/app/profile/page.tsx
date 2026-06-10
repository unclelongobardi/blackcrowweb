"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useApi } from "@/lib/useApi";
import { useAppContext } from "@/components/app/appContext";
import Avatar, { resolveAvatarId, type AvatarId } from "@/components/app/Avatar";
import AvatarPicker from "@/components/app/AvatarPicker";
import CopyButton from "@/components/CopyButton";
import { truncateAddress } from "@/lib/user";

export default function ProfilePage() {
  const api = useApi();
  const { me, refreshMe } = useAppContext();
  const [editing, setEditing] = useState(false);
  const [codename, setCodename] = useState(me?.profile.codename ?? "");
  const [displayName, setDisplayName] = useState(me?.profile.display_name ?? "");
  const [bio, setBio] = useState(me?.profile.bio ?? "");
  const [avatarId, setAvatarId] = useState<AvatarId>("av1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!me) return;
    setCodename(me.profile.codename);
    setDisplayName(me.profile.display_name ?? "");
    setBio(me.profile.bio ?? "");
    setAvatarId(resolveAvatarId(me.profile.avatar_seed));
  }, [me]);

  if (!me) return null;
  const p = me.profile;
  const verified = p.is_verified || p.codename === "blackcrow_official";

  async function save() {
    setLoading(true);
    setError(null);
    try {
      await api("/api/onboarding", {
        method: "POST",
        body: JSON.stringify({
          codename,
          display_name: displayName,
          bio,
          avatar_seed: avatarId,
        }),
      });
      await refreshMe();
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-6">
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <Avatar seed={editing ? avatarId : p.avatar_seed} label={p.codename} size={64} verified={verified} />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-extrabold tracking-tight">{p.display_name || p.codename}</h1>
            <p className="text-[13px] text-faint">@{p.codename}</p>
            <Link href={`/app/u/${p.codename}`} className="mt-1 inline-block text-[12px] text-bull hover:underline">
              View public profile →
            </Link>
          </div>
          <button
            onClick={() => setEditing((v) => !v)}
            className="rounded-lg border border-line px-4 py-2 text-[12px] font-semibold text-muted transition-colors hover:border-white/25 hover:text-foreground"
          >
            {editing ? "Close" : "Edit"}
          </button>
        </div>

        {p.bio && !editing && <p className="mt-4 text-[14px] leading-relaxed text-muted">{p.bio}</p>}

        {editing && (
          <div className="mt-5 space-y-4">
            <AvatarPicker value={avatarId} onChange={setAvatarId} />
            <input
              value={codename}
              onChange={(e) => setCodename(e.target.value)}
              placeholder="Codename"
              className="w-full rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-foreground outline-none focus:border-white/25"
            />
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display name"
              className="w-full rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-foreground outline-none focus:border-white/25"
            />
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Bio"
              rows={3}
              className="w-full resize-none rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-foreground outline-none focus:border-white/25"
            />
            {error && <p className="text-[12px] text-bear">{error}</p>}
            <button
              onClick={save}
              disabled={loading}
              className="rounded-xl bg-foreground px-5 py-3 text-[13px] font-bold text-black transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {loading ? "SAVING…" : "SAVE"}
            </button>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: "Feathers", value: p.influence.toLocaleString() },
            { label: "Rank", value: `#${me.stats.rank}` },
            { label: "Bounties", value: String(me.stats.bounties_posted) },
            { label: "Completed", value: String(me.stats.bounties_done) },
            { label: "Posts", value: String(me.stats.posts) },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-line bg-surface/40 p-3 text-center">
              <p className="font-mono text-lg font-bold text-foreground">{s.value}</p>
              <p className="mt-0.5 text-[11px] tracking-wide text-faint">{s.label}</p>
            </div>
          ))}
        </div>

        {p.wallet_address && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-line bg-surface/40 px-4 py-3">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-faint">Solana wallet</p>
              <code className="font-mono text-[13px] text-foreground">
                {truncateAddress(p.wallet_address, 6)}
              </code>
            </div>
            <CopyButton value={p.wallet_address} />
          </div>
        )}
      </div>
    </div>
  );
}
