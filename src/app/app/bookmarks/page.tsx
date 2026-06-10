"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useApi } from "@/lib/useApi";
import PostCard from "@/components/app/PostCard";
import { IconBookmark } from "@/components/icons";
import type { Post } from "@/lib/types";

export default function BookmarksPage() {
  const api = useApi();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{ posts: Post[] }>("/api/bookmarks");
      setPosts(data.posts);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-2xl border-x border-line min-h-screen">
      <header className="border-b border-line px-5 py-4">
        <h1 className="font-display text-xl font-extrabold tracking-tight">Bookmarks</h1>
        <p className="mt-1 text-[13px] text-faint">Posts you saved from the War Room.</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-foreground" />
        </div>
      ) : posts.length === 0 ? (
        <div className="px-5 py-20 text-center">
          <IconBookmark className="mx-auto h-8 w-8 text-faint" />
          <p className="mt-3 text-[15px] font-bold text-foreground">No bookmarks yet</p>
          <p className="mt-1 text-[13px] text-faint">Tap the bookmark icon on any post to save it here.</p>
          <Link href="/app" className="mt-4 inline-block text-[13px] font-semibold text-bull hover:underline">
            Go to War Room →
          </Link>
        </div>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} onReply={load} />)
      )}
    </div>
  );
}
