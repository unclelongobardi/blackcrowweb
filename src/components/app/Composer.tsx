"use client";

import { useState } from "react";
import Avatar from "./Avatar";
import { useAppContext } from "./appContext";

const SENTIMENTS = [
  { id: "bullish", label: "Bullish", cls: "data-[on=true]:bg-bull/15 data-[on=true]:text-bull" },
  { id: "bearish", label: "Bearish", cls: "data-[on=true]:bg-bear/15 data-[on=true]:text-bear" },
  { id: "neutral", label: "Intel", cls: "data-[on=true]:bg-white/10 data-[on=true]:text-foreground" },
] as const;

type Sentiment = (typeof SENTIMENTS)[number]["id"];

export default function Composer({
  onSubmit,
  placeholder = "Drop intel, rally the flock, or start a debate…",
}: {
  onSubmit: (content: string, sentiment: Sentiment) => Promise<void>;
  placeholder?: string;
}) {
  const { me } = useAppContext();
  const [content, setContent] = useState("");
  const [sentiment, setSentiment] = useState<Sentiment>("neutral");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!content.trim() || loading) return;
    setLoading(true);
    try {
      await onSubmit(content.trim(), sentiment);
      setContent("");
      setSentiment("neutral");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-3 border-b border-line px-5 py-4">
      <Avatar seed={me?.profile.avatar_seed} label={me?.profile.codename} size={40} />
      <div className="min-w-0 flex-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={2}
          maxLength={600}
          className="w-full resize-none bg-transparent text-[14px] text-foreground placeholder:text-faint outline-none"
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="flex gap-1.5">
            {SENTIMENTS.map((s) => (
              <button
                key={s.id}
                data-on={sentiment === s.id}
                onClick={() => setSentiment(s.id)}
                className={`rounded-md border border-line px-2.5 py-1 text-[11px] font-medium text-faint transition-colors hover:text-muted ${s.cls}`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <button
            onClick={submit}
            disabled={!content.trim() || loading}
            className="rounded-lg bg-foreground px-4 py-2 text-[12px] font-bold tracking-wide text-black transition-transform hover:scale-[1.03] disabled:opacity-40"
          >
            {loading ? "POSTING…" : "POST"}
          </button>
        </div>
      </div>
    </div>
  );
}
