"use client";

import { useState } from "react";
import { useApi } from "@/lib/useApi";
import type { Post } from "@/lib/types";

export default function PostPoll({
  postId,
  poll,
  onUpdate,
}: {
  postId: string;
  poll: NonNullable<Post["poll"]>;
  onUpdate: (poll: NonNullable<Post["poll"]>) => void;
}) {
  const api = useApi();
  const [busy, setBusy] = useState(false);

  async function vote(index: number) {
    if (busy) return;
    setBusy(true);
    try {
      const data = await api<{ option_index: number; counts: number[] }>(
        `/api/posts/${postId}/poll-vote`,
        { method: "POST", body: JSON.stringify({ option_index: index }) },
      );
      onUpdate({
        ...poll,
        counts: data.counts,
        my_option: data.option_index,
        total: data.counts.reduce((a, b) => a + b, 0),
      });
    } finally {
      setBusy(false);
    }
  }

  const total = poll.total || poll.counts.reduce((a, b) => a + b, 0);

  return (
    <div className="mt-2.5 space-y-1.5 rounded-xl border border-line bg-surface/40 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-faint">Poll · {total} vote{total === 1 ? "" : "s"}</p>
      {poll.options.map((opt, i) => {
        const count = poll.counts[i] ?? 0;
        const pctVal = total > 0 ? Math.round((count / total) * 100) : 0;
        const selected = poll.my_option === i;
        return (
          <button
            key={i}
            type="button"
            disabled={busy}
            onClick={() => vote(i)}
            className={`relative w-full overflow-hidden rounded-lg border px-3 py-2 text-left transition-colors ${
              selected ? "border-bull/40 bg-bull/10" : "border-line bg-surface/30 hover:border-black/15"
            }`}
          >
            {total > 0 && (
              <span
                className="absolute inset-y-0 left-0 bg-bull/15 transition-all"
                style={{ width: `${pctVal}%` }}
              />
            )}
            <span className="relative flex items-center justify-between gap-2 text-[13px]">
              <span className="font-medium text-foreground">{opt}</span>
              <span className="font-mono text-[11px] text-muted">{total > 0 ? `${pctVal}%` : "—"}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
