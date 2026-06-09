"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useApi } from "@/lib/useApi";
import { useAppContext } from "@/components/app/appContext";
import CreatePost from "@/components/app/CreatePost";
import PostCard from "@/components/app/PostCard";
import BountyCard from "@/components/app/BountyCard";
import CreateBountyModal from "@/components/app/CreateBountyModal";
import RightPanel from "@/components/app/RightPanel";
import type { Bounty, Market, Post } from "@/lib/types";

type Tab = "bounties" | "feed";

export default function HomePage() {
  const api = useApi();
  const { refreshMe } = useAppContext();
  const [tab, setTab] = useState<Tab>("bounties");
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const loadFeed = useCallback(async () => {
    const data = await api<{ posts: Post[] }>("/api/feed");
    setPosts(data.posts);
  }, [api]);

  useEffect(() => {
    (async () => {
      try {
        const [b, m] = await Promise.all([
          api<{ bounties: Bounty[] }>("/api/bounties"),
          api<{ markets: Market[] }>("/api/markets?limit=6&mode=exploitable"),
        ]);
        setBounties(b.bounties);
        setMarkets(m.markets);
        if (tab === "feed") await loadFeed();
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [api, tab, loadFeed]);

  useEffect(() => {
    if (tab === "feed" && !loading) loadFeed();
  }, [tab, loading, loadFeed]);

  async function createPost(content: string, sentiment: "bullish" | "bearish" | "neutral") {
    await api("/api/feed", { method: "POST", body: JSON.stringify({ content, sentiment }) });
    await loadFeed();
    await refreshMe();
  }

  function handleBountyUpdate(updated: Bounty) {
    setBounties((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }

  function handleBountyCreated(b: Bounty) {
    setShowCreate(false);
    setBounties((prev) => [b, ...prev]);
    setTab("bounties");
  }

  const openCount = bounties.filter((b) => b.status === "open").length;

  return (
    <div className="mx-auto flex w-full max-w-[1180px]">
      <section className="min-h-screen min-w-0 flex-1 border-x border-line lg:max-w-[636px]">
        {/* Hero */}
        <div className="border-b border-line px-5 py-6">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-bull">GET PAID IN SOL</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-foreground">
            Open bounties
          </h1>
          <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted">
            BlackCrow posts official jobs on real Polymarket markets — SOL in escrow.
            Accept one, do the work, get paid when approved.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-xl bg-foreground px-5 py-2.5 text-[12px] font-bold tracking-wide text-black transition-transform hover:scale-[1.02]"
            >
              + POST A BOUNTY
            </button>
            <Link
              href="/app/markets"
              className="rounded-xl border border-line px-5 py-2.5 text-[12px] font-semibold text-foreground transition-colors hover:border-white/25"
            >
              FIND THIN MARKETS
            </Link>
          </div>
          {openCount > 0 && (
            <p className="mt-3 text-[12px] text-faint">
              <span className="font-mono font-bold text-bull">{openCount}</span> bounty
              {openCount === 1 ? "" : "ies"} open right now
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="sticky top-16 z-30 border-b border-line bg-background/70 backdrop-blur-xl">
          <div className="flex">
            {(
              [
                ["bounties", "Open Bounties"],
                ["feed", "War Room"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`relative px-5 py-3.5 text-[13.5px] font-medium transition-colors ${
                  tab === id ? "text-foreground" : "text-faint hover:text-muted"
                }`}
              >
                {label}
                {tab === id && (
                  <motion.span
                    layoutId="hub-tab"
                    className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-bull"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-foreground" />
          </div>
        ) : tab === "bounties" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">
            {bounties.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line px-6 py-14 text-center">
                <p className="text-[15px] font-bold text-foreground">No open bounties yet</p>
                <p className="mt-2 text-[13px] text-faint">
                  Be the first. Pick a thin market, describe the job, lock SOL in escrow.
                </p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="mt-5 rounded-xl bg-foreground px-6 py-3 text-[12px] font-bold text-black"
                >
                  POST THE FIRST BOUNTY
                </button>
              </div>
            ) : (
              bounties.map((b) => (
                <BountyCard key={b.id} bounty={b} onUpdate={handleBountyUpdate} />
              ))
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CreatePost onSubmit={createPost} />
            {posts.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <p className="text-[15px] font-bold text-foreground">War room is empty</p>
                <p className="mt-2 text-[13px] text-faint">
                  Drop intel, coordinate a play, or hype an operation. First post sets the tone.
                </p>
              </div>
            ) : (
              posts.map((p) => <PostCard key={p.id} post={p} />)
            )}
          </motion.div>
        )}
      </section>

      <RightPanel markets={markets} bounties={bounties} />
      {showCreate && (
        <CreateBountyModal onClose={() => setShowCreate(false)} onCreated={handleBountyCreated} />
      )}
    </div>
  );
}
