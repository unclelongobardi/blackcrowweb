"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Sparkline from "./Sparkline";
import { BULL_COLOR, BEAR_COLOR } from "@/lib/colors";
import { genSpark } from "@/lib/spark";
import { compactNumber, pct } from "@/lib/format";
import { IconFlame, IconGrid } from "@/components/icons";
import type { Market } from "@/lib/types";

function daysUntil(iso: string | null): string | null {
  if (!iso) return null;
  const end = new Date(iso).getTime();
  if (Number.isNaN(end)) return null;
  const days = Math.ceil((end - Date.now()) / 86400000);
  if (days < 0) return "Ended";
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  return `${days}d left`;
}

function tierLabel(tier: Market["liquidity_tier"]): string {
  if (tier === "thin") return "Thin book";
  if (tier === "thick") return "Thick";
  return "Medium";
}

export default function MarketCard({
  market,
  maxVolume,
  index = 0,
  onPostBounty,
}: {
  market: Market;
  maxVolume: number;
  index?: number;
  onPostBounty: (m: Market) => void;
}) {
  const yes = market.yes_price != null ? Math.round(market.yes_price * 100) : 50;
  const no = market.no_price != null ? Math.round(market.no_price * 100) : 100 - yes;
  const vol = market.volume ?? 0;
  const volPct = maxVolume > 0 ? Math.max(8, Math.round((vol / maxVolume) * 100)) : 8;
  const contested = Math.round(Math.abs(50 - yes));
  const exploit = market.exploit_score != null ? Math.max(0, Math.min(100, 100 - market.exploit_score * 2)) : null;
  const ends = daysUntil(market.end_date);
  const up = yes >= 50;
  const spark = genSpark(market.id, 24, up ? 0.04 : -0.04);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.35), duration: 0.35 }}
      className="glass glass-hover group flex flex-col overflow-hidden rounded-2xl"
    >
      {market.image && (
        <div className="relative h-28 overflow-hidden border-b border-line bg-surface/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={market.image}
            alt=""
            className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-2 left-3 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground backdrop-blur-sm">
              {market.category ?? "Market"}
            </span>
            {market.liquidity_tier === "thin" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-bull/20 px-2 py-0.5 text-[10px] font-bold text-bull backdrop-blur-sm">
                <IconFlame className="h-3 w-3" /> THIN
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        {!market.image && (
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-faint">
              {market.category ?? "Market"}
            </span>
            {market.liquidity_tier === "thin" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-bull/10 px-2 py-0.5 text-[10px] font-bold text-bull">
                <IconFlame className="h-3 w-3" /> THIN
              </span>
            )}
            <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-mono text-muted">
              {tierLabel(market.liquidity_tier)}
            </span>
          </div>
        )}

        <h2 className="line-clamp-3 min-h-[3.25rem] text-[14px] font-bold leading-snug tracking-tight text-foreground">
          {market.question}
        </h2>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Sparkline data={spark} width={140} height={36} color={up ? BULL_COLOR : BEAR_COLOR} fill />
            <p className="mt-1.5 font-mono text-[10px] text-faint">24h implied move</p>
          </div>
          <div className="shrink-0 text-right">
            <p className={`font-mono text-2xl font-bold leading-none ${up ? "text-bull" : "text-bear"}`}>{yes}%</p>
            <p className="text-[10px] font-semibold tracking-wide text-faint">YES</p>
          </div>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
          <div className="flex h-full">
            <div className="bg-bull/80 transition-all" style={{ width: `${yes}%` }} />
            <div className="bg-bear/70 transition-all" style={{ width: `${no}%` }} />
          </div>
        </div>
        <div className="mt-1 flex justify-between font-mono text-[10px] text-faint">
          <span className="text-bull">YES {pct(market.yes_price)}</span>
          <span className="text-bear">NO {no}%</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-surface/30 px-3 py-2">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-faint">Volume</p>
            <p className="mt-0.5 font-mono text-[13px] font-bold text-foreground">${compactNumber(vol)}</p>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-bull/60" style={{ width: `${volPct}%` }} />
            </div>
          </div>
          {market.volume_24hr != null && market.volume_24hr > 0 ? (
            <div className="rounded-xl border border-line bg-surface/30 px-3 py-2">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-faint">24h vol</p>
              <p className="mt-0.5 font-mono text-[13px] font-bold text-foreground">${compactNumber(market.volume_24hr)}</p>
            </div>
          ) : null}
          <div className="rounded-xl border border-line bg-surface/30 px-3 py-2">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-faint">Edge</p>
            <p className="mt-0.5 font-mono text-[13px] font-bold text-foreground">{contested}pt split</p>
            {exploit != null && (
              <p className="mt-1 text-[10px] text-muted">
                Op score <span className="font-mono font-bold text-bull">{exploit.toFixed(0)}</span>/100
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-faint">
          {ends && (
            <span className="rounded-md bg-white/5 px-2 py-0.5 font-mono">{ends}</span>
          )}
          {market.liquidity_tier && (
            <span className="inline-flex items-center gap-1">
              <IconGrid className="h-3 w-3" /> {tierLabel(market.liquidity_tier)}
            </span>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => onPostBounty(market)}
            className="ui-btn flex-1 rounded-xl bg-foreground px-3 py-2.5 text-[11px] font-bold tracking-wide text-black"
          >
            POST BOUNTY
          </button>
          {market.url && (
            <Link
              href={market.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ui-nav rounded-xl border border-line px-3 py-2.5 text-[11px] font-semibold text-muted hover:border-white/25 hover:text-foreground"
            >
              PM →
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}
