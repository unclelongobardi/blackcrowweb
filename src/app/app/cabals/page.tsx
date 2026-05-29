"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/lib/useApi";
import Avatar from "@/components/app/Avatar";
import { useAppContext } from "@/components/app/appContext";
import type { Cabal } from "@/lib/types";

export default function CabalsPage() {
  const api = useApi();
  const { refreshMe } = useAppContext();
  const [cabals, setCabals] = useState<Cabal[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const data = await api<{ cabals: Cabal[] }>("/api/cabals");
    setCabals(data.cabals);
  }

  useEffect(() => {
    (async () => {
      try {
        await load();
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function join(slug: string) {
    setBusy(slug);
    try {
      const res = await api<{ joined: boolean }>(`/api/cabals/${slug}/join`, { method: "POST" });
      setCabals((prev) =>
        prev.map((c) =>
          c.slug === slug ? { ...c, member_count: (c.member_count ?? 0) + (res.joined ? 1 : -1) } : c,
        ),
      );
      await refreshMe();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">CABALS</h1>
          <p className="text-[13px] text-faint">Squads that move as one shadow. Join one, or found your own.</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="rounded-lg bg-foreground px-4 py-2 text-[12px] font-bold tracking-wide text-black transition-transform hover:scale-[1.03]"
        >
          + FOUND CABAL
        </button>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cabals.map((c) => (
            <div key={c.id} className="glass glass-hover rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <Avatar seed={c.emblem_seed} label={c.name} size={44} />
                <div className="min-w-0">
                  <h2 className="truncate text-[15px] font-bold tracking-tight text-foreground">{c.name}</h2>
                  <p className="text-[11px] text-faint">{c.member_count ?? 0} operatives</p>
                </div>
              </div>
              {c.motto && <p className="mt-3 text-[13px] italic text-muted">“{c.motto}”</p>}
              {c.description && (
                <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-faint">{c.description}</p>
              )}
              <button
                onClick={() => join(c.slug)}
                disabled={busy === c.slug}
                className="mt-4 w-full rounded-lg border border-line px-3 py-2 text-[12px] font-semibold tracking-wide text-foreground transition-colors hover:border-white/25 disabled:opacity-60"
              >
                {busy === c.slug ? "…" : "JOIN / LEAVE"}
              </button>
            </div>
          ))}
        </div>
      )}

      {creating && (
        <CreateCabalModal
          onClose={() => setCreating(false)}
          onCreated={async () => {
            setCreating(false);
            await load();
            await refreshMe();
          }}
        />
      )}
    </div>
  );
}

function CreateCabalModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const api = useApi();
  const [name, setName] = useState("");
  const [motto, setMotto] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (name.trim().length < 3) {
      setError("Name must be at least 3 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api("/api/cabals", {
        method: "POST",
        body: JSON.stringify({ name, motto, description }),
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">
      <div className="glass w-full max-w-md rounded-2xl p-6">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-faint">FOUND A CABAL</p>
        <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight">Rally your flock</h2>
        <div className="mt-4 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Cabal name"
            className="w-full rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-foreground placeholder:text-faint outline-none focus:border-white/25"
          />
          <input
            value={motto}
            onChange={(e) => setMotto(e.target.value)}
            placeholder="Motto — we move as one shadow"
            className="w-full rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-foreground placeholder:text-faint outline-none focus:border-white/25"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this cabal specialize in?"
            rows={3}
            className="w-full resize-none rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-foreground placeholder:text-faint outline-none focus:border-white/25"
          />
          {error && <p className="text-[12px] text-bear">{error}</p>}
        </div>
        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-line px-4 py-3 text-[13px] font-semibold text-muted transition-colors hover:text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={create}
            disabled={loading}
            className="flex-1 rounded-xl bg-foreground px-4 py-3 text-[13px] font-bold text-black transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {loading ? "FOUNDING…" : "FOUND (+20 ⚑)"}
          </button>
        </div>
      </div>
    </div>
  );
}
