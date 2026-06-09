"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useApi } from "@/lib/useApi";
import { useAppContext } from "@/components/app/appContext";
import CreatePost from "@/components/app/CreatePost";
import PostCard from "@/components/app/PostCard";
import CreateBountyModal from "@/components/app/CreateBountyModal";
import OpenBountiesSidebar from "@/components/app/OpenBountiesSidebar";
import AllBountiesSidebar from "@/components/app/AllBountiesSidebar";
import type { Bounty, Market, Post } from "@/lib/types";

export default function HomePage() {
  const api = useApi();
  const { refreshMe } = useAppContext();
  const composeRef = useRef<HTMLDivElement>(null);
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [attachedBounty, setAttachedBounty] = useState<Bounty | null>(null);
  const [selectedBountyId, setSelectedBountyId] = useState<string | null>(null);

  const loadFeed = useCallback(async () => {
    const data = await api<{ posts: Post[] }>("/api/feed");
    setPosts(data.posts);
  }, [api]);

  useEffect(() => {
    (async () => {
      try {
        const [b, m] = await Promise.all([
          api<{ bounties: Bounty[] }>("/api/bounties"),
          api<{ markets: Market[] }>("/api/markets?limit=8&mode=exploitable"),
        ]);
        setBounties(b.bounties);
        setMarkets(m.markets);
        await loadFeed();
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [api, loadFeed]);

  async function createPost(
    content: string,
    sentiment: "bullish" | "bearish" | "neutral",
    bountyId?: string | null,
  ) {
    await api("/api/feed", {
      method: "POST",
      body: JSON.stringify({ content, sentiment, bounty_id: bountyId ?? null }),
    });
    await loadFeed();
    await refreshMe();
    setAttachedBounty(null);
    setSelectedBountyId(null);
  }

  function handleBountyUpdate(updated: Bounty) {
    setBounties((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    if (attachedBounty?.id === updated.id) setAttachedBounty(updated);
  }

  function handleBountyCreated(b: Bounty) {
    setShowCreate(false);
    setBounties((prev) => [b, ...prev]);
  }

  function handleSelectBounty(b: Bounty) {
    setSelectedBountyId(b.id);
    setAttachedBounty(b);
  }

  function handleShareToWarRoom(b: Bounty) {
    setSelectedBountyId(b.id);
    setAttachedBounty(b);
    composeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const openCount = bounties.filter((b) => b.status === "open").length;

  return (
    <div className="mx-auto flex w-full max-w-[1400px]">
      <OpenBountiesSidebar
        bounties={bounties}
        openCount={openCount}
        onPostBounty={() => setShowCreate(true)}
      />

      <section className="min-h-screen min-w-0 flex-1 border-x border-line lg:max-w-[640px]">
        <div className="border-b border-line px-5 py-4">
          <h1 className="font-display text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            War Room
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            Drop intel, coordinate a play, or share a bounty with the crew.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-foreground" />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div ref={composeRef}>
              <CreatePost
                attachedBounty={attachedBounty}
                onClearBounty={() => {
                  setAttachedBounty(null);
                  setSelectedBountyId(null);
                }}
                onSubmit={createPost}
              />
            </div>
            {posts.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <p className="text-[15px] font-bold text-foreground">War room is empty</p>
                <p className="mt-2 text-[13px] text-faint">
                  Post intel here, or select a bounty on the right and hit &ldquo;Share to War Room&rdquo;.
                </p>
              </div>
            ) : (
              posts.map((p) => <PostCard key={p.id} post={p} />)
            )}
          </motion.div>
        )}
      </section>

      <AllBountiesSidebar
        bounties={bounties}
        markets={markets}
        selectedId={selectedBountyId}
        onSelect={handleSelectBounty}
        onShareToWarRoom={handleShareToWarRoom}
        onUpdate={handleBountyUpdate}
      />

      {showCreate && (
        <CreateBountyModal onClose={() => setShowCreate(false)} onCreated={handleBountyCreated} />
      )}
    </div>
  );
}
