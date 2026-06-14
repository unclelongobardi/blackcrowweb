"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi } from "@/lib/useApi";
import { useGuestGuard } from "@/hooks/useGuestGuard";
import BountyCard from "@/components/app/BountyCard";
import CreateBountyModal from "@/components/app/CreateBountyModal";
import ThinBookBountiesSection, { splitThinBookBounties } from "@/components/app/ThinBookBountiesSection";
import { IconTarget } from "@/components/icons";
import type { Bounty } from "@/lib/types";
import { uiBtnPrimary } from "@/lib/uiClasses";

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "funding", label: "Funding" },
  { id: "assigned", label: "In progress" },
  { id: "submitted", label: "Submitted" },
  { id: "paid", label: "Paid" },
] as const;

function BountiesContent() {
  const api = useApi();
  const router = useRouter();
  const { requireAuth } = useGuestGuard();
  const searchParams = useSearchParams();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const statusFilter = searchParams.get("status") ?? "all";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{ bounties: Bounty[] }>("/api/bounties");
      setBounties(data.bounties);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#bounty-")) return;
    const id = hash.replace("#bounty-", "");
    setExpandedId(id);
    requestAnimationFrame(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [bounties, statusFilter]);

  const { thinBook, rest } = useMemo(() => splitThinBookBounties(bounties), [bounties]);

  const filtered = useMemo(() => {
    const base = rest;
    if (statusFilter === "all") return base;
    return base.filter((b) => b.status === statusFilter);
  }, [rest, statusFilter]);

  const filteredThinBook = useMemo(() => {
    if (statusFilter === "all") return thinBook;
    return thinBook.filter((b) => b.status === statusFilter);
  }, [thinBook, statusFilter]);

  const openCount = bounties.filter((b) => b.status === "open").length;

  function setStatus(status: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (status === "all") p.delete("status");
    else p.set("status", status);
    router.push(`/app/bounties?${p.toString()}`);
  }

  function handleShareToWarRoom(b: Bounty) {
    router.push(`/app?shareBounty=${b.id}`);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-5">
      <header className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-label">SOL escrow jobs</p>
            <h1 className="font-display text-2xl font-extrabold tracking-tight">BOUNTIES</h1>
            <p className="mt-1 max-w-lg text-[13px] text-faint">
              Browse every open job with full details — reward, task, pool, proof flow, and actions.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/app"
              className="rounded-xl border border-line px-4 py-2.5 text-[11px] font-semibold text-muted hover:text-foreground"
            >
              ← Home
            </Link>
            <button
              type="button"
              onClick={() => requireAuth(() => setShowCreate(true))}
              className={`${uiBtnPrimary} rounded-xl px-4 py-2.5 text-[11px] font-bold`}
            >
              + POST BOUNTY
            </button>
          </div>
        </div>

        {!loading && (
          <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {[
              { label: "Total", value: String(bounties.length) },
              { label: "Open", value: String(openCount) },
              { label: "In progress", value: String(bounties.filter((b) => b.status === "assigned").length) },
              { label: "Paid", value: String(bounties.filter((b) => b.status === "paid").length) },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-line bg-surface/30 px-3 py-2.5 text-center">
                <p className="font-mono text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] uppercase tracking-wide text-faint">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </header>

      <div className="mb-5 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setStatus(f.id)}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-bold tracking-wide ${
              statusFilter === f.id ? "bg-bull text-white" : "border border-line text-muted hover:border-bull/30"
            }`}
          >
            {f.label.toUpperCase()}
          </button>
        ))}
      </div>

      {!loading && filteredThinBook.length > 0 && (
        <div className="mb-8">
          <ThinBookBountiesSection
            bounties={bounties}
            onUpdate={(updated) => setBounties((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))}
            onShare={handleShareToWarRoom}
          />
        </div>
      )}

      {!loading && filteredThinBook.length > 0 && rest.length > 0 && (
        <h2 className="mb-4 text-[11px] font-bold tracking-[0.18em] text-muted">COMMUNITY BOUNTIES</h2>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl border border-line bg-surface/30" />
          ))}
        </div>
      ) : filtered.length === 0 && filteredThinBook.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line py-20 text-center">
          <IconTarget className="mx-auto h-8 w-8 text-faint" />
          <p className="mt-3 text-[15px] font-bold text-foreground">No bounties here</p>
          <p className="mt-1 text-[13px] text-faint">Post the first job or check another filter.</p>
          <button
            type="button"
            onClick={() => requireAuth(() => setShowCreate(true))}
            className={`${uiBtnPrimary} mt-4 rounded-xl px-5 py-2.5 text-[12px] font-bold`}
          >
            POST A BOUNTY
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((b) => (
            <div
              key={b.id}
              id={`bounty-${b.id}`}
              className={`scroll-mt-24 ${expandedId === b.id ? "ring-1 ring-bull/30 rounded-2xl" : ""}`}
            >
              <BountyCard
                bounty={b}
                onUpdate={(updated) => setBounties((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))}
                onShareToWarRoom={() => handleShareToWarRoom(b)}
              />
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateBountyModal
          onClose={() => setShowCreate(false)}
          onCreated={(b) => {
            setShowCreate(false);
            setBounties((prev) => [b, ...prev]);
            setExpandedId(b.id);
            router.push(`/app/bounties?status=funding#bounty-${b.id}`);
          }}
        />
      )}
    </div>
  );
}

export default function BountiesPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-faint">Loading bounties…</div>}>
      <BountiesContent />
    </Suspense>
  );
}
