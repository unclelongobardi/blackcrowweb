"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useApi } from "@/lib/useApi";
import Avatar from "@/components/app/Avatar";
import { useAppContext } from "@/components/app/appContext";
import type { Cabal, CabalKind, CabalVisibility } from "@/lib/types";

const KIND_LABEL: Record<CabalKind, string> = {
  tipsters: "Tipsters",
  manipulation: "MARKET OPS",
  discussion: "Discussion",
};

export default function CabalsPage() {
  const api = useApi();
  const { refreshMe } = useAppContext();
  const [cabals, setCabals] = useState<Cabal[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState("all");
  const [visFilter, setVisFilter] = useState("all");

  async function load() {
    const params = new URLSearchParams();
    if (kindFilter !== "all") params.set("kind", kindFilter);
    if (visFilter !== "all") params.set("visibility", visFilter);
    const q = params.toString() ? `?${params}` : "";
    const data = await api<{ cabals: Cabal[] }>(`/api/cabals${q}`);
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
  }, [kindFilter, visFilter]);

  async function join(slug: string) {
    setBusy(slug);
    try {
      const res = await api<{ joined: boolean; requested: boolean }>(`/api/cabals/${slug}/join`, {
        method: "POST",
      });
      await load();
      await refreshMe();
      if (res.requested) alert("Join request sent to the cabal leader.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">CABALS</h1>
          <p className="text-[13px] text-faint">
            Groups for tipsters, market manipulation, or open discussion. Public or private.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="rounded-lg bg-foreground px-4 py-2 text-[12px] font-bold tracking-wide text-black"
        >
          + CREATE CABAL
        </button>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "manipulation", "tipsters", "discussion"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setKindFilter(k)}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-bold ${
              kindFilter === k ? "bg-foreground text-black" : "border border-line text-muted"
            }`}
          >
            {k === "all" ? "ALL TYPES" : KIND_LABEL[k].toUpperCase()}
          </button>
        ))}
        <button
          onClick={() => setVisFilter(visFilter === "public" ? "all" : "public")}
          className={`rounded-lg px-3 py-1.5 text-[11px] font-bold ${
            visFilter === "public" ? "bg-foreground text-black" : "border border-line text-muted"
          }`}
        >
          PUBLIC ONLY
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-foreground" />
        </div>
      ) : cabals.length === 0 ? (
        <p className="py-16 text-center text-[13px] text-faint">No cabals yet. Create the first one.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cabals.map((c) => (
            <div key={c.id} className="glass glass-hover rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <Avatar seed={c.emblem_seed} label={c.name} size={44} />
                <div className="min-w-0 flex-1">
                  <Link href={`/app/cabals/${c.slug}`} className="truncate text-[15px] font-bold hover:underline">
                    {c.name}
                  </Link>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-bold uppercase text-faint">
                      {c.kind ? KIND_LABEL[c.kind] : "Group"}
                    </span>
                    <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-bold uppercase text-faint">
                      {c.visibility === "private" ? "Private" : "Public"}
                    </span>
                  </div>
                </div>
              </div>
              {c.motto && <p className="mt-3 text-[13px] italic text-muted">"{c.motto}"</p>}
              <p className="mt-2 text-[11px] text-faint">{c.member_count ?? 0} members</p>
              <button
                onClick={() => join(c.slug)}
                disabled={busy === c.slug}
                className={`mt-4 w-full rounded-lg px-3 py-2 text-[12px] font-semibold ${
                  c.is_member
                    ? "border border-line text-muted"
                    : c.pending_request
                      ? "border border-bull/30 text-bull"
                      : "bg-foreground text-black"
                }`}
              >
                {busy === c.slug
                  ? "…"
                  : c.is_member
                    ? "LEAVE"
                    : c.pending_request
                      ? "REQUEST PENDING"
                      : c.visibility === "private"
                        ? "REQUEST TO JOIN"
                        : "JOIN"}
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
  const [kind, setKind] = useState<CabalKind>("discussion");
  const [visibility, setVisibility] = useState<CabalVisibility>("public");
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
        body: JSON.stringify({ name, motto, description, kind, visibility }),
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">
      <div className="glass max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl p-6">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-faint">CREATE CABAL</p>
        <div className="mt-4 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Cabal name" className="w-full rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm outline-none" />
          <input value={motto} onChange={(e) => setMotto(e.target.value)} placeholder="Motto" className="w-full rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm outline-none" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this group for?" rows={3} className="w-full resize-none rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm outline-none" />
          <div>
            <p className="mb-2 text-[11px] font-bold text-faint">TYPE</p>
            <div className="flex gap-2">
              {(["tipsters", "manipulation", "discussion"] as const).map((k) => (
                <button key={k} onClick={() => setKind(k)} className={`flex-1 rounded-lg border px-2 py-2 text-[10px] font-bold ${kind === k ? "border-foreground/40 bg-white/10" : "border-line text-faint"}`}>
                  {KIND_LABEL[k].toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-bold text-faint">VISIBILITY</p>
            <div className="flex gap-2">
              {(["public", "private"] as const).map((v) => (
                <button key={v} onClick={() => setVisibility(v)} className={`flex-1 rounded-lg border px-2 py-2 text-[10px] font-bold ${visibility === v ? "border-foreground/40 bg-white/10" : "border-line text-faint"}`}>
                  {v.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-[12px] text-bear">{error}</p>}
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-line px-4 py-3 text-[13px] font-semibold text-muted">Cancel</button>
          <button onClick={create} disabled={loading} className="flex-1 rounded-xl bg-foreground px-4 py-3 text-[13px] font-bold text-black disabled:opacity-60">
            {loading ? "…" : "CREATE"}
          </button>
        </div>
      </div>
    </div>
  );
}
