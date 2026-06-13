"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useApi } from "@/lib/useApi";
import Avatar from "@/components/app/Avatar";
import PostCard from "@/components/app/PostCard";
import type { Post, Profile } from "@/lib/types";

type ProfileData = {
  profile: Profile;
  stats: {
    posts: number;
    cabals: number;
    bounties_posted: number;
    bounties_done: number;
    followers: number;
    following: number;
    rank: number;
  };
  posts: Post[];
  is_following: boolean;
  is_self: boolean;
};

export default function PublicProfilePage() {
  const api = useApi();
  const params = useParams();
  const codename = params.codename as string;
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api<ProfileData>(`/api/profiles/${codename}`);
        setData(res);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [api, codename]);

  async function toggleFollow() {
    if (!data) return;
    setBusy(true);
    try {
      const res = await api<{ following: boolean }>(`/api/follows/${codename}`, { method: "POST" });
      setData({
        ...data,
        is_following: res.following,
        stats: {
          ...data.stats,
          followers: data.stats.followers + (res.following ? 1 : -1),
        },
      });
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-foreground" />
      </div>
    );
  }

  if (!data) {
    return <p className="py-20 text-center text-[13px] text-faint">User not found.</p>;
  }

  const { profile, stats, posts, is_following, is_self } = data;
  const verified = profile.is_verified || profile.codename === "blackcrow_official";

  return (
    <div className="mx-auto max-w-2xl px-5 py-6">
      <div className="glass rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <Avatar seed={profile.avatar_seed} avatarUrl={profile.avatar_url} label={profile.codename} size={72} verified={verified} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-extrabold">{profile.display_name || profile.codename}</h1>
              {verified && (
                <svg className="h-5 w-5 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </div>
            <p className="text-[13px] text-faint">@{profile.codename}</p>
            {profile.bio && <p className="mt-2 text-[13px] leading-relaxed text-muted">{profile.bio}</p>}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {[
            ["⚑", stats.rank, "Rank"],
            ["Posts", stats.posts, ""],
            ["Cabals", stats.cabals, ""],
            ["Bounties", stats.bounties_posted, "Posted"],
            ["Done", stats.bounties_done, "Paid"],
            ["Fans", stats.followers, ""],
          ].map(([label, val, sub], i) => (
            <div key={i} className="rounded-lg border border-line bg-surface/40 px-2 py-2 text-center">
              <p className="font-mono text-sm font-bold">{val}</p>
              <p className="text-[10px] text-faint">{sub || label}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          {is_self ? (
            <Link
              href="/app/profile"
              className="flex-1 rounded-xl bg-foreground px-4 py-2.5 text-center text-[12px] font-bold text-background"
            >
              EDIT PROFILE
            </Link>
          ) : (
            <>
              <button
                onClick={toggleFollow}
                disabled={busy}
                className={`flex-1 rounded-xl px-4 py-2.5 text-[12px] font-bold ${
                  is_following ? "border border-line text-muted" : "bg-foreground text-background"
                }`}
              >
                {is_following ? "FOLLOWING" : "FOLLOW"}
              </button>
              <Link
                href={`/app/messages?to=${profile.codename}`}
                className="flex-1 rounded-xl border border-line px-4 py-2.5 text-center text-[12px] font-bold text-foreground hover:border-black/20"
              >
                Message
              </Link>
            </>
          )}
        </div>
      </div>

      <h2 className="mt-8 mb-4 text-[11px] font-bold tracking-[0.16em] text-muted">RECENT POSTS</h2>
      {posts.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-faint">No posts yet.</p>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} />)
      )}
    </div>
  );
}
