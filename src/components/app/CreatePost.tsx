"use client";

import { useEffect, useState } from "react";
import Avatar from "./Avatar";
import { useAppContext } from "./appContext";
import { uiBtnPrimary, uiPress } from "@/lib/uiClasses";
import { lamportsToSol } from "@/lib/solanaFormat";
import { IconGrid, IconImage, IconPoll, IconThread, IconChevronDown } from "@/components/icons";
import type { Bounty } from "@/lib/types";

type Sentiment = "bullish" | "bearish" | "neutral";

const TYPES = [
  { id: "market", label: "Market", icon: IconGrid },
  { id: "image", label: "Image", icon: IconImage },
  { id: "poll", label: "Poll", icon: IconPoll },
  { id: "thread", label: "Thread", icon: IconThread },
];

const SENTIMENTS: { id: Sentiment; label: string; dot: string }[] = [
  { id: "bullish", label: "Bullish", dot: "bg-bull" },
  { id: "bearish", label: "Bearish", dot: "bg-bear" },
  { id: "neutral", label: "Neutral", dot: "bg-faint" },
];

export default function CreatePost({
  onSubmit,
  attachedBounty,
  onClearBounty,
}: {
  onSubmit: (content: string, sentiment: Sentiment, bountyId?: string | null) => Promise<void>;
  attachedBounty?: Bounty | null;
  onClearBounty?: () => void;
}) {
  const { me } = useAppContext();
  const [content, setContent] = useState("");
  const [sentiment, setSentiment] = useState<Sentiment>("neutral");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (attachedBounty && !content.trim()) {
      setContent(`Bounty: ${attachedBounty.title} — `);
    }
  }, [attachedBounty]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit() {
    if (!content.trim() || loading) return;
    setLoading(true);
    try {
      await onSubmit(content.trim(), sentiment, attachedBounty?.id ?? null);
      setContent("");
      setSentiment("neutral");
    } finally {
      setLoading(false);
    }
  }

  const active = SENTIMENTS.find((s) => s.id === sentiment)!;

  return (
    <div className="border-b border-line px-4 py-4 sm:px-5">
      <div className="flex gap-3">
        <Avatar seed={me?.profile.avatar_seed} label={me?.profile.codename} size={42} />
        <div className="min-w-0 flex-1">
          {attachedBounty && (
            <div className="mb-2 flex items-start justify-between gap-2 rounded-xl border border-bull/25 bg-bull/5 px-3 py-2">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-bull">Attached bounty</p>
                <p className="mt-0.5 truncate text-[13px] font-semibold text-foreground">
                  {attachedBounty.title}
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-muted">
                  {lamportsToSol(attachedBounty.reward_sol_lamports)} SOL · {attachedBounty.status}
                </p>
              </div>
              {onClearBounty && (
                <button
                  type="button"
                  onClick={onClearBounty}
                  className="shrink-0 text-[11px] font-semibold text-faint hover:text-foreground"
                >
                  Remove
                </button>
              )}
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            rows={2}
            maxLength={600}
            className="w-full resize-none bg-transparent pt-1.5 text-[15px] text-foreground placeholder:text-faint outline-none"
          />

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {TYPES.map((t) => (
              <button
                key={t.id}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-muted transition-colors hover:bg-white/[0.04] hover:text-foreground"
              >
                <t.icon className="h-4 w-4 text-bull/80" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2">
              <div className="hidden items-center gap-1 rounded-lg border border-line p-0.5 sm:flex">
                {SENTIMENTS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSentiment(s.id)}
                    title={s.label}
                    className={`${uiPress} flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium ${
                      sentiment === s.id ? "bg-white/[0.06] text-foreground" : "text-faint hover:text-muted"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    {s.id === sentiment ? s.label : ""}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[12px] font-medium text-muted transition-colors hover:text-foreground">
                <span className={`h-1.5 w-1.5 rounded-full ${active.dot}`} />
                Everyone
                <IconChevronDown className="h-3.5 w-3.5 text-faint" />
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!content.trim() || loading}
                className={`${uiBtnPrimary} rounded-lg bg-foreground px-5 py-2 text-[13px] font-bold text-black disabled:opacity-40`}
              >
                {loading ? "…" : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
