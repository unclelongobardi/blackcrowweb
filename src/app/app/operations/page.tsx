"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/lib/useApi";
import { pct, timeAgo } from "@/lib/format";
import Avatar from "@/components/app/Avatar";
import { useAppContext } from "@/components/app/appContext";
import type { Operation } from "@/lib/types";

export default function OperationsPage() {
  const api = useApi();
  const { refreshMe } = useAppContext();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api<{ operations: Operation[] }>("/api/operations");
        setOperations(data.operations);
      } finally {
        setLoading(false);
      }
    })();
  }, [api]);

  async function join(op: Operation) {
    setJoining(op.id);
    try {
      const res = await api<{ joined: boolean }>(`/api/operations/${op.id}/join`, {
        method: "POST",
        body: JSON.stringify({ conviction: 75 }),
      });
      setOperations((prev) =>
        prev.map((o) =>
          o.id === op.id ? { ...o, member_count: (o.member_count ?? 0) + (res.joined ? 1 : -1) } : o,
        ),
      );
      await refreshMe();
    } finally {
      setJoining(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-6">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">OPERATIONS</h1>
        <p className="text-[13px] text-faint">
          Coordinated raids on live markets. Enlist, stack conviction, move the line.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-foreground" />
        </div>
      ) : operations.length === 0 ? (
        <p className="py-16 text-center text-[13px] text-faint">
          No active operations. Launch one from a target market.
        </p>
      ) : (
        <div className="space-y-4">
          {operations.map((op) => (
            <div key={op.id} className="glass glass-hover rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide ${
                        op.target_side === "YES" ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear"
                      }`}
                    >
                      PUSH {op.target_side}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        op.status === "active" ? "bg-white/10 text-foreground" : "bg-white/5 text-faint"
                      }`}
                    >
                      {op.status}
                    </span>
                    <span className="text-[11px] text-faint">{timeAgo(op.created_at)}</span>
                  </div>
                  <h2 className="mt-2 text-[16px] font-bold tracking-tight text-foreground">{op.title}</h2>
                  {op.thesis && <p className="mt-1 text-[13px] leading-relaxed text-muted">{op.thesis}</p>}
                </div>
                {op.market?.yes_price != null && (
                  <div className="shrink-0 rounded-lg border border-line bg-surface/40 px-3 py-2 text-center">
                    <p className="font-mono text-sm font-bold text-bull">{pct(op.market.yes_price)}</p>
                    <p className="text-[10px] tracking-wide text-faint">YES</p>
                  </div>
                )}
              </div>

              {op.market && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-line bg-surface/40 px-3 py-2">
                  <span>🎯</span>
                  <span className="truncate text-[12px] text-muted">{op.market.question}</span>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[12px] text-faint">
                  {op.author && (
                    <span className="flex items-center gap-1.5">
                      <Avatar seed={op.author.avatar_seed} label={op.author.codename} size={22} />
                      {op.author.codename}
                    </span>
                  )}
                  {op.cabal && <span>· {op.cabal.name}</span>}
                  <span>· {op.member_count ?? 0} operatives</span>
                </div>
                <button
                  onClick={() => join(op)}
                  disabled={joining === op.id}
                  className="rounded-lg bg-foreground px-4 py-2 text-[12px] font-bold tracking-wide text-black transition-transform hover:scale-[1.03] disabled:opacity-60"
                >
                  {joining === op.id ? "…" : "ENLIST"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
