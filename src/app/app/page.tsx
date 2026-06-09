"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useApi } from "@/lib/useApi";
import { useAppContext } from "@/components/app/appContext";
import CreatePost from "@/components/app/CreatePost";
import PostCard from "@/components/app/PostCard";
import MarketPostCard from "@/components/app/MarketPostCard";
import RightPanel from "@/components/app/RightPanel";
import { IconChevronDown, IconFilter } from "@/components/icons";
import type { Market, Post } from "@/lib/types";

type Operative = { id: string; codename: string; display_name?: string | null; avatar_seed: string | null; influence: number };

const TABS = ["For You", "Following", "Trending", "Signals", "Insights"];

export default function HomePage() {
  const api = useApi();
  const { refreshMe } = useAppContext();
  const [posts, setPosts] = useState<Post[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [operatives, setOperatives] = useState<Operative[]>([]);
  const [tab, setTab] = useState("For You");
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
          api<{ markets: Market[] }>("/api/markets?limit=8&mode=exploitable"),
          api<{ operatives: Operative[] }>("/api/leaderboard"),
        ]);
        setMarkets(m.markets);
        setOperatives(lb.operatives);
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

  const featuredMarket = markets[0];

  return (
    <div className="mx-auto flex w-full max-w-[1180px]">
      {/* Center feed */}
      <section className="min-h-screen min-w-0 flex-1 border-x border-line lg:max-w-[636px]">
        {/* Tabs */}
        <div className="sticky top-16 z-30 border-b border-line bg-background/70 backdrop-blur-xl">
          <div className="flex items-center justify-between px-2">
            <div className="flex overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`relative whitespace-nowrap px-4 py-3.5 text-[13.5px] font-medium transition-colors ${
                    tab === t ? "text-foreground" : "text-faint hover:text-muted"
                  }`}
                >
                  {t}
                  {tab === t && (
                    <motion.span
                      layoutId="tab-underline"
                      className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-bull"
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-1 pr-2">
              <button className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-muted transition-colors hover:text-foreground">
                Latest <IconChevronDown className="h-3.5 w-3.5 text-faint" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/[0.05] hover:text-foreground">
                <IconFilter className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <CreatePost onSubmit={createPost} />

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-foreground" />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            {posts.map((p, i) => (
              <div key={p.id}>
                <PostCard post={p} />
                {i === 2 && featuredMarket && <MarketPostCard market={featuredMarket} />}
              </div>
            ))}
            {posts.length <= 2 && featuredMarket && <MarketPostCard market={featuredMarket} />}
            {posts.length === 0 && (
              <p className="px-5 py-16 text-center text-[13px] text-faint">
                No transmissions yet. Be the first to drop intel.
              </p>
            )}
          </motion.div>
        )}
      </section>

      <RightPanel markets={markets} operatives={operatives} />
    </div>
  );
}
