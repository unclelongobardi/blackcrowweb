"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets as useSolanaWallets } from "@privy-io/react-auth/solana";
import { motion } from "framer-motion";
import { useApi } from "@/lib/useApi";
import { IconArrow } from "@/components/icons";
import Logo from "@/components/Logo";

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const api = useApi();
  const { logout } = usePrivy();
  const { wallets } = useSolanaWallets();
  const [codename, setCodename] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="glass w-full max-w-md rounded-2xl p-7"
      >
        <Logo />
        <p className="mt-6 text-[11px] font-semibold tracking-[0.2em] text-faint">ALMOST IN</p>
        <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight">Pick a codename</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          No real names here. Choose the handle everyone will @ when your call
          prints (or when it very much doesn&apos;t).
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
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
            disabled={loading}
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
