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
import { uiBtnPrimary } from "@/lib/uiClasses";
import OpenBountiesSidebar from "@/components/app/OpenBountiesSidebar";
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
    <div className="mx-auto flex w-full max-w-[1280px]">
      <OpenBountiesSidebar bounties={bounties} />

      <section className="min-h-screen min-w-0 flex-1 border-x border-line lg:max-w-[640px]">
        <div className="border-b border-line px-5 py-5">
          <h1 className="font-display text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            Bounties
          </h1>
          <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-muted">
            Pick a job from the sidebar, accept it, submit proof — get paid in SOL when the poster approves.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className={`${uiBtnPrimary} rounded-xl bg-foreground px-5 py-2.5 text-[12px] font-bold text-black`}
            >
              + POST A BOUNTY
            </button>
            <Link
              href="/app/markets"
              className="ui-nav rounded-xl border border-line px-5 py-2.5 text-[12px] font-semibold text-foreground hover:border-white/25"
            >
              FIND THIN MARKETS
            </Link>
          </div>
          {openCount > 0 && (
            <p className="mt-3 text-[12px] text-faint">
              <span className="font-mono font-semibold text-foreground">{openCount}</span> open now
              {openCount > 0 && (
                <span className="hidden lg:inline"> — use the left menu to jump</span>
              )}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="sticky top-16 z-30 border-b border-line bg-background/70 backdrop-blur-xl">
          <div className="flex">
            {(
              [
                ["bounties", "All bounties"],
                ["feed", "War Room"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`ui-press relative px-5 py-3.5 text-[13.5px] font-medium ${
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
                  type="button"
                  onClick={() => setShowCreate(true)}
                  className={`${uiBtnPrimary} mt-5 rounded-xl bg-foreground px-6 py-3 text-[12px] font-bold text-black`}
                >
                  POST THE FIRST BOUNTY
                </button>
              </div>
            ) : (
              bounties.map((b) => (
                <div key={b.id} id={`bounty-${b.id}`} className="scroll-mt-36">
                  <BountyCard bounty={b} onUpdate={handleBountyUpdate} />
                </div>
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

      <RightPanel markets={markets} />
      {showCreate && (
        <CreateBountyModal onClose={() => setShowCreate(false)} onCreated={handleBountyCreated} />
      )}
    </div>
  );
}
