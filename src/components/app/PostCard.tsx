"use client";

import Link from "next/link";
import { useState } from "react";
import Avatar from "./Avatar";
import UserName from "./UserName";
import { useApi } from "@/lib/useApi";
import { timeAgo, compactNumber, pct } from "@/lib/format";
import { lamportsToSol } from "@/lib/solanaFormat";
import SolAmount from "./SolAmount";
import { IconComment, IconRepeat, IconHeart, IconViews, IconBookmark, IconDots } from "@/components/icons";
import type { Post } from "@/lib/types";

const SENTIMENT = {
  bullish: "text-bull",
  bearish: "text-bear",
  neutral: "text-faint",
} as const;

const SENTIMENT_LABEL = {
  bullish: "Bullish",
  bearish: "Bearish",
  neutral: "Neutral",
} as const;

// Stable pseudo-engagement so demo posts look alive (purely cosmetic).
function seedNum(id: string, salt: number, max: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % max;
}

export default function PostCard({
  post,
  onBountyClick,
}: {
  post: Post;
  onBountyClick?: () => void;
}) {
  const api = useApi();
  const baseLikes = 80 + seedNum(post.id, 7, 360);
  const [score, setScore] = useState(post.score ?? 0);
  const [liked, setLiked] = useState((post.my_vote ?? 0) === 1);
  const [bookmarked, setBookmarked] = useState(false);
  const [pending, setPending] = useState(false);

  const reposts = 20 + seedNum(post.id, 3, 120);
  const views = 1200 + seedNum(post.id, 11, 8000);
  const comments = post.reply_count ?? seedNum(post.id, 5, 40);
  const likes = baseLikes + Math.max(0, score) + (liked ? 1 : 0);

  async function toggleLike() {
    if (pending) return;
    setPending(true);
    const next = !liked;
    setLiked(next);
    setScore((s) => s + (next ? 1 : -1));
    try {
      const data = await api<{ score: number; my_vote: number }>(`/api/posts/${post.id}/vote`, {
        method: "POST",
        body: JSON.stringify({ value: 1 }),
      });
      setScore(data.score);
      setLiked(data.my_vote === 1);
    } catch {
      setLiked(!next);
      setScore((s) => s + (next ? -1 : 1));
    } finally {
      setPending(false);
    }
  }

  return (
    <article className="cursor-pointer border-b border-line px-4 py-3.5 transition-colors hover:bg-white/[0.015] sm:px-5">
      <div className="flex gap-3">
        {post.author?.codename ? (
          <Link href={`/app/u/${post.author.codename}`}>
            <Avatar
              seed={post.author.avatar_seed}
              label={post.author.codename}
              size={42}
              verified={post.author.is_verified || post.author.codename === "blackcrow_official"}
            />
          </Link>
        ) : (
          <Avatar seed={post.author?.avatar_seed} label={post.author?.codename} size={42} />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {post.author?.codename ? (
              <UserName
                codename={post.author.codename}
                displayName={post.author.display_name}
                verified={post.author.is_verified || post.author.codename === "blackcrow_official"}
                className="truncate text-[14px]"
              />
            ) : (
              <span className="truncate text-[14px] font-semibold text-foreground">anon</span>
            )}
            <span className="text-faint">·</span>
            <span className="text-[13px] text-faint">{timeAgo(post.created_at)}</span>
            {post.sentiment !== "neutral" && (
              <span className={`ml-auto text-[12px] font-semibold ${SENTIMENT[post.sentiment]}`}>
                {SENTIMENT_LABEL[post.sentiment]}
              </span>
            )}
          </div>

          <p className="mt-0.5 whitespace-pre-wrap text-[14.5px] leading-relaxed text-foreground/90">
            {post.content}
          </p>

          {post.market && (
            <div className="mt-2.5 flex items-center gap-2.5 rounded-xl border border-line bg-surface/40 px-3.5 py-2.5">
              <span className="text-base">📊</span>
              <span className="min-w-0 flex-1 truncate text-[13px] text-muted">{post.market.question}</span>
              {post.market.yes_price != null && (
                <span className="font-mono text-[13px] font-bold text-bull">
                  {Math.round(post.market.yes_price * 100)}%
                </span>
              )}
            </div>
          )}

          {post.bounty && (
            <a
              href={`#bounty-${post.bounty.id}`}
              onClick={(e) => {
                if (onBountyClick && window.matchMedia("(max-width: 1023px)").matches) {
                  e.preventDefault();
                  onBountyClick();
                  requestAnimationFrame(() => {
                    document.getElementById(`bounty-${post.bounty!.id}`)?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  });
                }
              }}
              className="mt-2.5 block rounded-xl border border-bull/20 bg-bull/5 px-3.5 py-2.5 transition-colors hover:bg-bull/10"
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-bull">Bounty</p>
              <p className="mt-0.5 text-[13px] font-semibold text-foreground">{post.bounty.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-muted">
                <SolAmount
                  amount={lamportsToSol(post.bounty.reward_sol_lamports)}
                  className="font-mono font-bold text-bull"
                  iconClassName="h-3 w-3"
                />
                {post.bounty.market?.yes_price != null && (
                  <span>Market YES {pct(post.bounty.market.yes_price)}</span>
                )}
                <span className="capitalize">{post.bounty.status}</span>
              </div>
            </a>
          )}

          <div className="mt-3 flex items-center justify-between pr-1 text-faint">
            <Action icon={<IconComment className="h-[17px] w-[17px]" />} value={comments} hover="hover:text-sky-400" />
            <Action icon={<IconRepeat className="h-[17px] w-[17px]" />} value={reposts} hover="hover:text-bull" />
            <button
              onClick={toggleLike}
              className={`group flex items-center gap-1.5 text-[12.5px] transition-colors hover:text-bear ${
                liked ? "text-bear" : ""
              }`}
            >
              <IconHeart className="h-[17px] w-[17px]" />
              {compactNumber(likes)}
            </button>
            <Action icon={<IconViews className="h-[17px] w-[17px]" />} value={views} hover="hover:text-foreground" />
            <div className="flex items-center gap-1">
              <button
                onClick={() => setBookmarked((b) => !b)}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/[0.05] hover:text-foreground ${
                  bookmarked ? "text-bull" : ""
                }`}
              >
                <IconBookmark className="h-[17px] w-[17px]" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/[0.05] hover:text-foreground">
                <IconDots className="h-[17px] w-[17px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function Action({ icon, value, hover }: { icon: React.ReactNode; value: number; hover: string }) {
  return (
    <button className={`flex items-center gap-1.5 text-[12.5px] transition-colors ${hover}`}>
      {icon}
      {compactNumber(value)}
    </button>
  );
}
