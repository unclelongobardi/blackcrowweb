"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets as useSolanaWallets } from "@privy-io/react-auth/solana";
import { motion } from "framer-motion";
import { useApi } from "@/lib/useApi";
import { DEFAULT_AVATAR_ID, type AvatarId } from "@/lib/avatars";
import { IconArrow } from "@/components/icons";
import Logo from "@/components/Logo";
import Avatar from "@/components/app/Avatar";
import AvatarPicker, { type AvatarMode } from "@/components/app/AvatarPicker";

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const api = useApi();
  const { logout, getAccessToken } = usePrivy();
  const { wallets } = useSolanaWallets();
  const [codename, setCodename] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarMode, setAvatarMode] = useState<AvatarMode>("preset");
  const [avatarId, setAvatarId] = useState<AvatarId>(DEFAULT_AVATAR_ID);
  const [customPreview, setCustomPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadAvatar(file: File) {
    setUploading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: token ? { authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      setCustomPreview(data.avatar_url);
      setAvatarMode("custom");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api("/api/onboarding", {
        method: "POST",
        body: JSON.stringify({
          codename,
          display_name: displayName,
          bio,
          avatar_seed: avatarMode === "preset" ? avatarId : undefined,
          avatar_mode: avatarMode,
          wallet_address: wallets[0]?.address,
        }),
      });
      await onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const previewSeed = avatarMode === "preset" ? avatarId : "custom";
  const previewUrl = avatarMode === "custom" ? customPreview : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 px-6 py-8 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="glass my-auto w-full max-w-lg rounded-2xl p-7"
      >
        <Logo />
        <p className="mt-6 text-[11px] font-semibold tracking-[0.2em] text-faint">ALMOST IN</p>
        <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight">Set up your profile</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          Upload a photo or pick an avatar, then choose your codename for the War Room.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="flex items-center gap-4 rounded-xl border border-line bg-surface/30 px-4 py-3">
            <Avatar seed={previewSeed} avatarUrl={previewUrl} label={codename || "you"} size={52} />
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-foreground">{codename || "your_codename"}</p>
              <p className="text-[11px] text-faint">Preview</p>
            </div>
          </div>

          <AvatarPicker
            mode={avatarMode}
            value={avatarId}
            customPreview={customPreview}
            onModeChange={setAvatarMode}
            onChange={setAvatarId}
            onUpload={uploadAvatar}
            uploading={uploading}
          />

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-faint">Codename</label>
            <input
              value={codename}
              onChange={(e) => setCodename(e.target.value)}
              placeholder="night_raven"
              className="mt-1 w-full rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-foreground placeholder:text-faint outline-none focus:border-white/25"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-faint">Display name (optional)</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="The Nightjar"
              className="mt-1 w-full rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-foreground placeholder:text-faint outline-none focus:border-white/25"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-faint">Bio (optional)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Narratives are cheap. I buy them in bulk."
              rows={2}
              className="mt-1 w-full resize-none rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-foreground placeholder:text-faint outline-none focus:border-white/25"
            />
          </div>

          {error && <p className="text-[12px] text-bear">{error}</p>}

          <button
            type="submit"
            disabled={loading || uploading}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3.5 text-[13px] font-bold tracking-[0.06em] text-black transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {loading ? "ENLISTING…" : "ENTER THE NETWORK"}
            <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            type="button"
            onClick={() => logout()}
            className="w-full text-center text-[12px] text-faint transition-colors hover:text-muted"
          >
            Abort
          </button>
        </form>
      </motion.div>
    </div>
  );
}
