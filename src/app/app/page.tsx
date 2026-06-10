"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useApi } from "@/lib/useApi";
import { useAppContext } from "@/components/app/appContext";
import CreatePost from "@/components/app/CreatePost";
import PostCard from "@/components/app/PostCard";
import CreateBountyModal from "@/components/app/CreateBountyModal";
import OpenBountiesSidebar from "@/components/app/OpenBountiesSidebar";
import AllBountiesSidebar from "@/components/app/AllBountiesSidebar";
import MobileBountiesPanel from "@/components/app/MobileBountiesPanel";
import RightPanel from "@/components/app/RightPanel";
import type { Bounty, Market, Post } from "@/lib/types";

type MobileTab = "war" | "bounties" | "thin";

const MOBILE_TABS: { id: MobileTab; label: string }[] = [
  { id: "war", label: "Home" },
  { id: "bounties", label: "Bounties" },
  { id: "thin", label: "Thin books" },
];

export default function HomePage() {
  const api = useApi();
  const router = useRouter();
  const { refreshMe } = useAppContext();
  const composeRef = useRef<HTMLDivElement>(null);
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [attachedBounty, setAttachedBounty] = useState<Bounty | null>(null);
  const [selectedBountyId, setSelectedBountyId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("war");

  const loadFeed = useCallback(async () => {
    try {
      setFeedError(null);
      const data = await api<{ posts: Post[] }>("/api/feed");
      setPosts(data.posts);
    } catch (err) {
      setFeedError(err instanceof Error ? err.message : "Could not load posts.");
    }
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
      } catch {
        /* non-fatal */
      }
      await loadFeed();
      setLoading(false);
    })();
  }, [api, loadFeed]);

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") loadFeed();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [loadFeed]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#bounty-") && window.matchMedia("(max-width: 1023px)").matches) {
      setMobileTab("bounties");
      requestAnimationFrame(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, []);

  useEffect(() => {
    if (!bounties.length) return;
    const shareId = new URLSearchParams(window.location.search).get("shareBounty");
    if (!shareId) return;
    const b = bounties.find((x) => x.id === shareId);
    if (b) {
      setAttachedBounty(b);
      setSelectedBountyId(b.id);
      setMobileTab("war");
      window.history.replaceState({}, "", "/app");
      requestAnimationFrame(() => {
        composeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [bounties]);

  async function createPost(
    content: string,
    sentiment: "bullish" | "bearish" | "neutral",
    opts?: {
      bountyId?: string | null;
      cabalId?: string | null;
      marketId?: string | null;
      market?: Market | null;
      imageUrl?: string | null;
      pollOptions?: string[];
      threadParts?: string[];
    },
  ) {
    await api("/api/feed", {
      method: "POST",
      body: JSON.stringify({
        content,
        sentiment,
        bounty_id: opts?.bountyId ?? null,
        cabal_id: opts?.cabalId ?? null,
        market_id: opts?.marketId ?? null,
        market: opts?.market ?? null,
        image_url: opts?.imageUrl ?? null,
        poll_options: opts?.pollOptions,
        thread_parts: opts?.threadParts,
      }),
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
    router.push(`/app/bounties?status=funding#bounty-${b.id}`);
  }

  function handleSelectBounty(b: Bounty) {
    setSelectedBountyId(b.id);
    setAttachedBounty(b);
  }

  function handleShareToWarRoom(b: Bounty) {
    setSelectedBountyId(b.id);
    setAttachedBounty(b);
    setMobileTab("war");
    requestAnimationFrame(() => {
      composeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const openCount = bounties.filter((b) => b.status === "open").length;

  return (
    <div className="mx-auto flex w-full max-w-[1400px]">
      <OpenBountiesSidebar
        bounties={bounties}
        openCount={openCount}
        onPostBounty={() => setShowCreate(true)}
      />

      <div className="min-w-0 flex-1">
        <div className="sticky top-16 z-20 border-b border-line bg-background/90 backdrop-blur-xl lg:hidden">
          <div className="flex">
            {MOBILE_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setMobileTab(t.id)}
                className={`ui-press min-h-11 flex-1 px-2 py-3 text-[11px] font-bold tracking-wide sm:text-[12px] ${
                  mobileTab === t.id
                    ? "border-b-2 border-bull text-foreground"
                    : "text-faint hover:text-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <section
          className={`min-h-screen min-w-0 border-x border-line lg:max-w-[640px] ${
            mobileTab !== "war" ? "max-lg:hidden" : ""
          }`}
        >
          <div className="border-b border-line px-4 py-4 sm:px-5">
            <h1 className="font-display text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              Home
            </h1>
            <p className="mt-1 text-[13px] text-muted">
              See what&apos;s happening — post your take, attach a bounty, or coordinate a play.
            </p>
          </div>

          {feedError && (
            <div className="border-b border-line px-4 py-3 sm:px-5">
              <p className="text-[12px] text-bear">{feedError}</p>
              <button
                type="button"
                onClick={() => loadFeed()}
                className="mt-2 text-[11px] font-semibold text-bull hover:underline"
              >
                Retry
              </button>
            </div>
          )}

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
                <div className="px-4 py-14 text-center sm:px-5">
                  <p className="text-[15px] font-bold text-foreground">Nothing to see here — yet</p>
                  <p className="mt-2 text-[13px] text-faint lg:hidden">
                    Post something, or open Bounties, pick a job, and hit &ldquo;Post to Home&rdquo;.
                  </p>
                  <p className="mt-2 hidden text-[13px] text-faint lg:block">
                    Post something, or select a bounty on the right and hit &ldquo;Post to Home&rdquo;.
                  </p>
                </div>
              ) : (
                posts.map((p) => <PostCard key={p.id} post={p} onBountyClick={() => setMobileTab("bounties")} onReply={loadFeed} />)
              )}
            </motion.div>
          )}
        </section>

        <section className={`lg:hidden ${mobileTab !== "bounties" ? "hidden" : "block"}`}>
          <MobileBountiesPanel
            bounties={bounties}
            openCount={openCount}
            selectedId={selectedBountyId}
            onPostBounty={() => setShowCreate(true)}
            onSelect={handleSelectBounty}
            onShareToWarRoom={handleShareToWarRoom}
            onUpdate={handleBountyUpdate}
          />
        </section>

        <section className={`px-4 py-4 lg:hidden ${mobileTab !== "thin" ? "hidden" : "block"}`}>
          <RightPanel markets={markets} />
        </section>
      </div>

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
