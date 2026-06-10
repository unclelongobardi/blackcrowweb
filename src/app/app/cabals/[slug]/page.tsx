"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useApi } from "@/lib/useApi";
import Avatar from "@/components/app/Avatar";
import PostCard from "@/components/app/PostCard";
import type { Cabal, Post, Profile } from "@/lib/types";

type MemberRow = { role: string; profile: Profile };
type RequestRow = { profile: Profile; created_at: string };

export default function CabalDetailPage() {
  const api = useApi();
  const params = useParams();
  const slug = params.slug as string;
  const [cabal, setCabal] = useState<(Cabal & { is_member?: boolean; is_leader?: boolean; members?: MemberRow[] }) | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api<{ cabal: Cabal & { members: MemberRow[] }; posts: Post[] }>(
          `/api/cabals/${slug}`,
        );
        setCabal(data.cabal);
        setPosts(data.posts);
        if (data.cabal.is_leader) {
          const req = await api<{ requests: RequestRow[] }>(`/api/cabals/${slug}/requests`);
          setRequests(req.requests);
        }
      } catch {
        setCabal(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [api, slug]);

  async function handleRequest(profileId: string, action: "approve" | "reject") {
    await api(`/api/cabals/${slug}/requests`, {
      method: "POST",
      body: JSON.stringify({ profile_id: profileId, action }),
    });
    setRequests((prev) => prev.filter((r) => r.profile.id !== profileId));
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-foreground" />
      </div>
    );
  }

  if (!cabal) {
    return (
      <div className="px-5 py-20 text-center">
        <p className="text-[13px] text-faint">Cabal not found or private.</p>
        <Link href="/app/cabals" className="mt-4 inline-block text-bull hover:underline">← Back</Link>
      </div>
    );
  }

  const isOfficial = cabal.slug === "blackcrow-official";

  return (
    <div className="mx-auto max-w-3xl px-5 py-6">
      <Link href="/app/cabals" className="text-[12px] text-faint hover:text-muted">← All cabals</Link>
      <div className={`mt-4 rounded-2xl p-6 ${isOfficial ? "border border-bull/30 bg-gradient-to-br from-bull/10 via-surface/40 to-surface/20" : "glass"}`}>
        {isOfficial && (
          <span className="mb-3 inline-flex items-center rounded-full bg-bull/15 px-2.5 py-0.5 text-[9px] font-bold tracking-[0.14em] text-bull">
            OFFICIAL BLACKCROW CABAL
          </span>
        )}
        <div className="flex items-center gap-4">
          <Avatar seed={cabal.emblem_seed} label={cabal.name} size={56} />
          <div>
            <h1 className="font-display text-2xl font-extrabold">{cabal.name}</h1>
            <p className="text-[12px] text-faint">
              {cabal.member_count} members · {cabal.kind} · {cabal.visibility}
            </p>
          </div>
        </div>
        {cabal.motto && <p className="mt-4 text-[14px] italic text-muted">"{cabal.motto}"</p>}
        {cabal.description && <p className="mt-2 text-[13px] text-faint">{cabal.description}</p>}
      </div>

      {cabal.is_leader && requests.length > 0 && (
        <div className="mt-6 glass rounded-2xl p-4">
          <h2 className="text-[11px] font-bold tracking-[0.16em] text-muted">JOIN REQUESTS</h2>
          {requests.map((r) => (
            <div key={r.profile.id} className="mt-3 flex items-center justify-between">
              <Link href={`/app/u/${r.profile.codename}`} className="flex items-center gap-2">
                <Avatar seed={r.profile.avatar_seed} avatarUrl={r.profile.avatar_url} label={r.profile.codename} size={28} />
                <span className="text-[13px] font-semibold">@{r.profile.codename}</span>
              </Link>
              <div className="flex gap-2">
                <button onClick={() => handleRequest(r.profile.id, "approve")} className="rounded-lg bg-bull px-3 py-1 text-[11px] font-bold text-black">APPROVE</button>
                <button onClick={() => handleRequest(r.profile.id, "reject")} className="rounded-lg border border-line px-3 py-1 text-[11px] text-muted">REJECT</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-8 mb-3 text-[11px] font-bold tracking-[0.16em] text-muted">MEMBERS</h2>
      <div className="flex flex-wrap gap-3">
        {(cabal.members ?? []).map((m) => (
          <Link key={m.profile.id} href={`/app/u/${m.profile.codename}`} className="glass flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-white/[0.02]">
            <Avatar seed={m.profile.avatar_seed} avatarUrl={m.profile.avatar_url} label={m.profile.codename} size={28} verified={m.profile.is_verified} />
            <span className="text-[12px]">@{m.profile.codename}</span>
            {m.role === "leader" && <span className="text-[10px] text-bull">leader</span>}
          </Link>
        ))}
      </div>

      {cabal.is_member && (
        <>
          <h2 className="mt-8 mb-3 text-[11px] font-bold tracking-[0.16em] text-muted">WAR ROOM FEED</h2>
          {posts.length === 0 ? (
            <p className="text-[13px] text-faint">No posts from members yet.</p>
          ) : (
            posts.map((p) => <PostCard key={p.id} post={p} />)
          )}
        </>
      )}
    </div>
  );
}
