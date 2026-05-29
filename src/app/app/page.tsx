"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useApi } from "@/lib/useApi";
import { compactNumber, pct } from "@/lib/format";
import Composer from "@/components/app/Composer";
import PostCard from "@/components/app/PostCard";
import Avatar from "@/components/app/Avatar";
import { useAppContext } from "@/components/app/appContext";
import type { Market, Post } from "@/lib/types";

type Operative = { id: string; codename: string; avatar_seed: string | null; influence: number };

export default function WarRoomPage() {
  const api = useApi();
  const { refreshMe } = useAppContext();
  const [posts, setPosts] = useState<Post[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [operatives, setOperatives] = useState<Operative[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    const data = await api<{ posts: Post[] }>("/api/feed");
    setPosts(data.posts);
  }, [api]);

  useEffect(() => {
    (async () => {
      try {
        await loadFeed();
        const [m, lb] = await Promise.all([
          api<{ markets: Market[] }>("/api/markets?limit=6"),
          api<{ operatives: Operative[] }>("/api/leaderboard"),
        ]);
        setMarkets(m.markets.slice(0, 6));
        setOperatives(lb.operatives.slice(0, 5));
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [api, loadFeed]);

  async function createPost(content: string, sentiment: "bullish" | "bearish" | "neutral") {
    await api("/api/feed", { method: "POST", body: JSON.stringify({ content, sentiment }) });
    await loadFeed();
    await refreshMe();
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-0 lg:grid-cols-[1fr_320px]">
      {/* Feed */}
      <section className="border-line lg:border-r">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-background/80 px-5 py-4 backdrop-blur">
          <div>
            <h1 className="font-display text-xl font-extrabold tracking-tight">WAR ROOM</h1>
            <p className="text-[12px] text-faint">Where the flock coordinates the next move.</p>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] tracking-wide text-faint">
            <span className="h-1.5 w-1.5 rounded-full bg-bull animate-pulse-dot" /> LIVE
          </span>
        </header>

        <Composer onSubmit={createPost} />

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <p className="px-5 py-16 text-center text-[13px] text-faint">
            No transmissions yet. Be the first to drop intel.
          </p>
        ) : (
          <div className="divide-y divide-line">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </section>

      {/* Right rail */}
      <aside className="hidden flex-col gap-4 p-4 lg:flex">
        <div className="glass rounded-xl">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-[11px] font-bold tracking-[0.16em] text-muted">TARGET MARKETS</h2>
            <Link href="/app/markets" className="text-[11px] text-faint hover:text-foreground">
              All
            </Link>
          </div>
          <div className="divide-y divide-line">
            {markets.map((m) => (
              <Link
                key={m.id}
                href="/app/markets"
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02]"
              >
                <span className="text-sm">🎯</span>
                <span className="min-w-0 flex-1 truncate text-[12px] text-foreground">{m.question}</span>
                <span className="font-mono text-[12px] font-bold text-bull">{pct(m.yes_price)}</span>
              </Link>
            ))}
            {markets.length === 0 && (
              <p className="px-4 py-4 text-[12px] text-faint">Markets loading…</p>
            )}
          </div>
        </div>

        <div className="glass rounded-xl">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-[11px] font-bold tracking-[0.16em] text-muted">TOP OPERATIVES</h2>
            <Link href="/app/leaderboard" className="text-[11px] text-faint hover:text-foreground">
              Roost
            </Link>
          </div>
          <div className="divide-y divide-line">
            {operatives.map((o, i) => (
              <div key={o.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="w-4 font-mono text-[12px] text-faint">{i + 1}</span>
                <Avatar seed={o.avatar_seed} label={o.codename} size={28} />
                <span className="min-w-0 flex-1 truncate text-[12px] text-foreground">{o.codename}</span>
                <span className="font-mono text-[12px] font-bold text-bull">{compactNumber(o.influence)}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
