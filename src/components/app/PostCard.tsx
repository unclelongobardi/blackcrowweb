"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import UserName from "./UserName";
import { useApi } from "@/lib/useApi";
import { useGuestGuard } from "@/hooks/useGuestGuard";
import { useAppContext } from "./appContext";
import { timeAgo, compactNumber, pct } from "@/lib/format";
import { lamportsToSol } from "@/lib/solanaFormat";
import SolAmount from "./SolAmount";
import PostPoll from "./PostPoll";
import { IconComment, IconRepeat, IconHeart, IconViews, IconBookmark, IconDots, IconThread, IconShare } from "@/components/icons";
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

export default function PostCard({
  post,
  onBountyClick,
  onReply,
}: {
  post: Post;
  onBountyClick?: () => void;
  onReply?: () => void;
}) {
  const api = useApi();
  const { me } = useAppContext();
  const { blocked, requireAuth } = useGuestGuard();
  const viewedRef = useRef(false);

  const [likeCount, setLikeCount] = useState(post.like_count ?? Math.max(0, post.score ?? 0));
  const [liked, setLiked] = useState((post.my_vote ?? 0) === 1);
  const [repostCount, setRepostCount] = useState(post.repost_count ?? 0);
  const [reposted, setReposted] = useState(!!post.my_reposted);
  const [viewCount, setViewCount] = useState(post.view_count ?? 0);
  const [bookmarked, setBookmarked] = useState(!!post.my_bookmarked);
  const [replyCount, setReplyCount] = useState(post.reply_count ?? 0);
  const [pending, setPending] = useState(false);

  const [poll, setPoll] = useState(post.poll ?? null);
  const [threadOpen, setThreadOpen] = useState(false);
  const [threadReplies, setThreadReplies] = useState<Post[]>(post.thread_preview ?? []);
  const [loadingThread, setLoadingThread] = useState(false);

  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState<Post[]>([]);
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyBusy, setReplyBusy] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isThreadPost = post.kind === "thread";
  const commentCount = isThreadPost ? 0 : replyCount;

  useEffect(() => {
    if (viewedRef.current || blocked) return;
    viewedRef.current = true;
    void api<{ view_count: number }>(`/api/posts/${post.id}/view`, { method: "POST" })
      .then((d) => setViewCount(d.view_count))
      .catch(() => {});
  }, [api, post.id, blocked]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  async function loadThread() {
    if (loadingThread) return;
    setLoadingThread(true);
    try {
      const data = await api<{ replies: Post[] }>(`/api/posts/${post.id}/replies`);
      setThreadReplies(data.replies);
      setThreadOpen(true);
    } finally {
      setLoadingThread(false);
    }
  }

  async function loadReplies() {
    if (loadingReplies) return;
    setLoadingReplies(true);
    try {
      const data = await api<{ replies: Post[] }>(`/api/posts/${post.id}/replies`);
      setReplies(data.replies.filter((r) => r.kind !== "thread"));
      setRepliesOpen(true);
    } finally {
      setLoadingReplies(false);
    }
  }

  async function toggleLike() {
    if (!requireAuth()) return;
    if (pending) return;
    setPending(true);
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    try {
      const data = await api<{ like_count: number; my_vote: number }>(`/api/posts/${post.id}/vote`, {
        method: "POST",
        body: JSON.stringify({ value: next ? 1 : 0 }),
      });
      setLikeCount(data.like_count);
      setLiked(data.my_vote === 1);
    } catch {
      setLiked(!next);
      setLikeCount((c) => c + (next ? -1 : 1));
    } finally {
      setPending(false);
    }
  }

  async function toggleRepost() {
    if (!requireAuth()) return;
    if (pending) return;
    setPending(true);
    const next = !reposted;
    setReposted(next);
    setRepostCount((c) => c + (next ? 1 : -1));
    try {
      const data = await api<{ repost_count: number; my_reposted: boolean }>(
        `/api/posts/${post.id}/repost`,
        { method: "POST" },
      );
      setRepostCount(data.repost_count);
      setReposted(data.my_reposted);
    } catch {
      setReposted(!next);
      setRepostCount((c) => c + (next ? -1 : 1));
    } finally {
      setPending(false);
    }
  }

  async function toggleBookmark() {
    if (!requireAuth()) return;
    if (pending) return;
    setPending(true);
    const next = !bookmarked;
    setBookmarked(next);
    try {
      const data = await api<{ my_bookmarked: boolean }>(`/api/posts/${post.id}/bookmark`, {
        method: "POST",
      });
      setBookmarked(data.my_bookmarked);
    } catch {
      setBookmarked(!next);
    } finally {
      setPending(false);
    }
  }

  async function submitReply() {
    if (!requireAuth()) return;
    const text = replyText.trim();
    if (!text || replyBusy) return;
    setReplyBusy(true);
    try {
      const data = await api<{ post: Post }>("/api/feed", {
        method: "POST",
        body: JSON.stringify({
          content: text,
          sentiment: post.sentiment,
          parent_id: post.id,
          cabal_id: post.cabal_id ?? null,
        }),
      });
      setReplies((prev) => [...prev, data.post]);
      setReplyCount((c) => c + 1);
      setReplyText("");
      setRepliesOpen(true);
      setReplyOpen(false);
      onReply?.();
    } finally {
      setReplyBusy(false);
    }
  }

  async function copyLink() {
    const url = `${window.location.origin}/app#post-${post.id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setMenuOpen(false);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <article id={`post-${post.id}`} className="scroll-mt-24 border-b border-line px-4 py-3.5 transition-colors hover:bg-black/[0.03] sm:px-5">
      {reposted && (
        <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-muted">
          <IconRepeat className="h-3.5 w-3.5 text-bull" /> You reposted
        </p>
      )}
      <div className="flex gap-3">
        {post.author?.codename ? (
          <Link href={`/app/u/${post.author.codename}`}>
            <Avatar
              seed={post.author.avatar_seed}
              avatarUrl={post.author.avatar_url}
              label={post.author.codename}
              size={42}
              verified={post.author.is_verified || post.author.codename === "gloria_official"}
            />
          </Link>
        ) : (
          <Avatar seed={post.author?.avatar_seed} avatarUrl={post.author?.avatar_url} label={post.author?.codename} size={42} />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {post.author?.codename ? (
              <UserName
                codename={post.author.codename}
                displayName={post.author.display_name}
                verified={post.author.is_verified || post.author.codename === "gloria_official"}
                className="truncate text-[14px]"
              />
            ) : (
              <span className="truncate text-[14px] font-semibold text-foreground">anon</span>
            )}
            <span className="text-faint">·</span>
            <span className="text-[13px] text-faint">{timeAgo(post.created_at)}</span>
            {post.cabal?.name && (
              <Link
                href={`/app/cabals/${post.cabal.slug}`}
                className="rounded-md bg-black/[0.04] px-1.5 py-0.5 text-[10px] font-semibold text-bull hover:bg-bull/10"
              >
                {post.cabal.name}
              </Link>
            )}
            {isThreadPost && (
              <span className="inline-flex items-center gap-1 rounded-md bg-black/[0.04] px-1.5 py-0.5 text-[10px] font-semibold text-bull">
                <IconThread className="h-3 w-3" /> Thread
              </span>
            )}
            {post.sentiment !== "neutral" && (
              <span className={`ml-auto text-[12px] font-semibold ${SENTIMENT[post.sentiment]}`}>
                {SENTIMENT_LABEL[post.sentiment]}
              </span>
            )}
          </div>

          <p className="mt-0.5 whitespace-pre-wrap text-[14.5px] leading-relaxed text-foreground/90">{post.content}</p>

          {post.image_url && (
            <div className="mt-2.5 overflow-hidden rounded-xl border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.image_url} alt="" className="max-h-80 w-full object-cover" />
            </div>
          )}

          {poll && <PostPoll postId={post.id} poll={poll} onUpdate={setPoll} />}

          {isThreadPost && (post.reply_count ?? 0) > 0 && (
            <div className="mt-2.5">
              {!threadOpen && threadReplies.length > 0 && (
                <div className="space-y-2 border-l-2 border-line pl-3">
                  {threadReplies.map((r) => (
                    <p key={r.id} className="text-[12px] text-muted">{r.content}</p>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => (threadOpen ? setThreadOpen(false) : loadThread())}
                className="mt-1 text-[12px] font-semibold text-bull hover:underline"
              >
                {loadingThread ? "Loading…" : threadOpen ? "Hide thread" : `Show full thread (${post.reply_count} parts)`}
              </button>
              {threadOpen && (
                <div className="mt-2 space-y-3 border-l-2 border-bull/30 pl-3">
                  {threadReplies.map((r, i) => (
                    <div key={r.id}>
                      <p className="text-[10px] font-mono text-faint">{i + 2}/{threadReplies.length + 1}</p>
                      <p className="text-[13px] leading-relaxed text-foreground/90">{r.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {post.market && (
            <div className="mt-2.5 flex items-center gap-2.5 rounded-xl border border-line bg-surface/40 px-3.5 py-2.5">
              <span className="text-base">📊</span>
              <span className="min-w-0 flex-1 truncate text-[13px] text-muted">{post.market.question}</span>
              {post.market.yes_price != null && (
                <span className="font-mono text-[13px] font-bold text-bull">{Math.round(post.market.yes_price * 100)}%</span>
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
                    document.getElementById(`bounty-${post.bounty!.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  });
                }
              }}
              className="mt-2.5 block rounded-xl border border-bull/20 bg-bull/5 px-3.5 py-2.5 transition-colors hover:bg-bull/10"
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-bull">Bounty</p>
              <p className="mt-0.5 text-[13px] font-semibold text-foreground">{post.bounty.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-muted">
                <SolAmount amount={lamportsToSol(post.bounty.reward_sol_lamports)} className="font-mono font-bold text-bull" iconClassName="h-3 w-3" />
                {post.bounty.market?.yes_price != null && <span>Market YES {pct(post.bounty.market.yes_price)}</span>}
                <span className="capitalize">{post.bounty.status}</span>
              </div>
            </a>
          )}

          <div className="mt-3 flex items-center justify-between pr-1 text-faint">
            <button
              type="button"
              onClick={() => {
                setReplyOpen((v) => !v);
                if (!repliesOpen && commentCount > 0) void loadReplies();
              }}
              className="flex items-center gap-1.5 text-[12.5px] transition-colors hover:text-sky-400"
            >
              <IconComment className="h-[17px] w-[17px]" />
              {commentCount > 0 ? compactNumber(commentCount) : ""}
            </button>

            <button
              type="button"
              onClick={toggleRepost}
              disabled={pending}
              className={`flex items-center gap-1.5 text-[12.5px] transition-colors hover:text-bull ${reposted ? "text-bull" : ""}`}
            >
              <IconRepeat className="h-[17px] w-[17px]" />
              {repostCount > 0 ? compactNumber(repostCount) : ""}
            </button>

            <button
              type="button"
              onClick={toggleLike}
              disabled={pending}
              className={`flex items-center gap-1.5 text-[12.5px] transition-colors hover:text-bear ${liked ? "text-bear" : ""}`}
            >
              <IconHeart className={`h-[17px] w-[17px] ${liked ? "fill-current" : ""}`} />
              {likeCount > 0 ? compactNumber(likeCount) : ""}
            </button>

            <span className="flex items-center gap-1.5 text-[12.5px] text-faint">
              <IconViews className="h-[17px] w-[17px]" />
              {viewCount > 0 ? compactNumber(viewCount) : ""}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleBookmark}
                disabled={pending}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/[0.05] hover:text-foreground ${
                  bookmarked ? "text-bull" : ""
                }`}
                title={bookmarked ? "Remove bookmark" : "Bookmark"}
              >
                <IconBookmark className={`h-[17px] w-[17px] ${bookmarked ? "fill-current" : ""}`} />
              </button>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/[0.05] hover:text-foreground"
                >
                  <IconDots className="h-[17px] w-[17px]" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 z-30 mt-1 min-w-[140px] overflow-hidden rounded-xl border border-line bg-surface shadow-xl">
                    <button
                      type="button"
                      onClick={copyLink}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-muted hover:bg-black/[0.05] hover:text-foreground"
                    >
                      <IconShare className="h-3.5 w-3.5" />
                      {copied ? "Copied!" : "Copy link"}
                    </button>
                    {me?.profile.id === post.author_id && (
                      <Link
                        href={`/app/u/${post.author?.codename}`}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-muted hover:bg-black/[0.05] hover:text-foreground"
                        onClick={() => setMenuOpen(false)}
                      >
                        View profile
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {replyOpen && !isThreadPost && (
            <div className="mt-3 flex gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply…"
                rows={2}
                maxLength={600}
                className="min-w-0 flex-1 resize-none rounded-xl border border-line bg-surface/40 px-3 py-2 text-[13px] outline-none focus:border-bull/40"
              />
              <button
                type="button"
                onClick={submitReply}
                disabled={!replyText.trim() || replyBusy}
                className="self-end rounded-lg px-4 py-2 text-[12px] font-bold disabled:opacity-40"
              >
                {replyBusy ? "…" : "Reply"}
              </button>
            </div>
          )}

          {repliesOpen && replies.length > 0 && !isThreadPost && (
            <div className="mt-3 space-y-3 border-l-2 border-line pl-3">
              {replies.map((r) => (
                <div key={r.id} className="flex gap-2">
                  <Avatar seed={r.author?.avatar_seed} avatarUrl={r.author?.avatar_url} label={r.author?.codename} size={28} />
                  <div className="min-w-0">
                    <UserName
                      codename={r.author?.codename ?? "anon"}
                      displayName={r.author?.display_name}
                      verified={r.author?.is_verified}
                      className="text-[12px]"
                      link={Boolean(r.author?.codename)}
                    />
                    <p className="text-[13px] text-muted">{r.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!replyOpen && commentCount > 0 && !isThreadPost && (
            <button
              type="button"
              onClick={() => (repliesOpen ? setRepliesOpen(false) : loadReplies())}
              className="mt-2 text-[12px] font-semibold text-bull hover:underline"
            >
              {loadingReplies ? "Loading…" : repliesOpen ? "Hide replies" : `View ${commentCount} repl${commentCount === 1 ? "y" : "ies"}`}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
