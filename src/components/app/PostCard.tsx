"use client";

import { useState } from "react";
import Avatar from "./Avatar";
import { useApi } from "@/lib/useApi";
import { timeAgo } from "@/lib/format";
import type { Post } from "@/lib/types";

const SENTIMENT = {
  bullish: { label: "Bullish", cls: "bg-bull/10 text-bull" },
  bearish: { label: "Bearish", cls: "bg-bear/10 text-bear" },
  neutral: { label: "Intel", cls: "bg-white/10 text-muted" },
} as const;

export default function PostCard({ post }: { post: Post }) {
  const api = useApi();
  const [score, setScore] = useState(post.score ?? 0);
  const [myVote, setMyVote] = useState(post.my_vote ?? 0);
  const [pending, setPending] = useState(false);
  const sentiment = SENTIMENT[post.sentiment] ?? SENTIMENT.neutral;

  async function vote(value: 1 | -1) {
    if (pending) return;
    setPending(true);
    const prevScore = score;
    const prevVote = myVote;
    // optimistic
    const nextVote = myVote === value ? 0 : value;
    setMyVote(nextVote);
    setScore(prevScore - prevVote + nextVote);
    try {
      const data = await api<{ score: number; my_vote: number }>(`/api/posts/${post.id}/vote`, {
        method: "POST",
        body: JSON.stringify({ value }),
      });
      setScore(data.score);
      setMyVote(data.my_vote);
    } catch {
      setScore(prevScore);
      setMyVote(prevVote);
    } finally {
      setPending(false);
    }
  }

  return (
    <article className="flex gap-3 px-5 py-4 transition-colors hover:bg-white/[0.02]">
      <Avatar seed={post.author?.avatar_seed} label={post.author?.codename} size={40} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-foreground">
            {post.author?.codename ?? "anon"}
          </span>
          <span className="text-faint">·</span>
          <span className="text-[12px] text-faint">{timeAgo(post.created_at)}</span>
          <span className={`ml-auto rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide ${sentiment.cls}`}>
            {sentiment.label}
          </span>
        </div>

        <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-snug text-foreground/90">{post.content}</p>

        {post.market && (
          <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-line bg-surface/40 px-3 py-2">
            <span className="text-base">🎯</span>
            <span className="truncate text-[12px] text-muted">{post.market.question}</span>
          </div>
        )}

        <div className="mt-3 flex items-center gap-5 text-faint">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => vote(1)}
              className={`rounded-md p-1 transition-colors hover:text-bull ${myVote === 1 ? "text-bull" : ""}`}
              aria-label="Upvote"
            >
              ▲
            </button>
            <span
              className={`min-w-5 text-center font-mono text-[12px] font-bold ${
                score > 0 ? "text-bull" : score < 0 ? "text-bear" : "text-muted"
              }`}
            >
              {score}
            </span>
            <button
              onClick={() => vote(-1)}
              className={`rounded-md p-1 transition-colors hover:text-bear ${myVote === -1 ? "text-bear" : ""}`}
              aria-label="Downvote"
            >
              ▼
            </button>
          </div>
          <span className="text-[12px]">{post.reply_count ?? 0} replies</span>
        </div>
      </div>
    </article>
  );
}
