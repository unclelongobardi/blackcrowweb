"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useApi } from "@/lib/useApi";
import { compactNumber, pct } from "@/lib/format";
import Avatar from "@/components/app/Avatar";
import type { Cabal, Market, Profile } from "@/lib/types";

function SearchContent() {
  const api = useApi();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [markets, setMarkets] = useState<Market[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [cabals, setCabals] = useState<Cabal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) return;
    (async () => {
      setLoading(true);
      try {
        const data = await api<{ markets: Market[]; users: Profile[]; cabals: Cabal[] }>(
          `/api/search?q=${encodeURIComponent(q)}`,
        );
        setMarkets(data.markets);
        setUsers(data.users);
        setCabals(data.cabals);
      } finally {
        setLoading(false);
      }
    })();
  }, [api, q]);

  if (!q.trim()) {
    return <p className="py-16 text-center text-[13px] text-faint">Type something in the search bar above.</p>;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {users.length > 0 && (
        <section>
          <h2 className="mb-3 text-[11px] font-bold tracking-[0.16em] text-muted">USERS</h2>
          <div className="space-y-2">
            {users.map((u) => (
              <Link key={u.id} href={`/app/u/${u.codename}`} className="glass flex items-center gap-3 rounded-xl p-3 hover:bg-black/[0.03]">
                <Avatar seed={u.avatar_seed} avatarUrl={u.avatar_url} label={u.codename} size={40} verified={u.is_verified} />
                <div>
                  <p className="text-[14px] font-semibold">{u.display_name || u.codename}</p>
                  <p className="text-[12px] text-faint">@{u.codename} · {u.influence} ⚑</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {cabals.length > 0 && (
        <section>
          <h2 className="mb-3 text-[11px] font-bold tracking-[0.16em] text-muted">CABALS</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {cabals.map((c) => (
              <Link key={c.id} href={`/app/cabals/${c.slug}`} className="glass rounded-xl p-4 hover:bg-black/[0.03]">
                <p className="font-bold">{c.name}</p>
                <p className="text-[12px] text-faint">{c.member_count} members · {c.kind}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {markets.length > 0 && (
        <section>
          <h2 className="mb-3 text-[11px] font-bold tracking-[0.16em] text-muted">MARKETS</h2>
          <div className="space-y-2">
            {markets.map((m) => (
              <Link key={m.id} href={`/app/markets?q=${encodeURIComponent(m.question.slice(0, 40))}`} className="glass block rounded-xl p-4 hover:bg-black/[0.03]">
                <p className="text-[14px] font-medium">{m.question}</p>
                <p className="mt-1 text-[12px] text-faint">
                  {pct(m.yes_price)} YES · Vol {compactNumber(m.volume)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!users.length && !cabals.length && !markets.length && (
        <p className="py-12 text-center text-[13px] text-faint">No results for “{q}”.</p>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-6">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">SEARCH</h1>
      <Suspense fallback={<div className="py-20 text-center text-faint">Loading…</div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
