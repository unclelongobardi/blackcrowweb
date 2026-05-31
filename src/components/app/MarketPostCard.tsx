"use client";

import Avatar from "./Avatar";
import Sparkline from "./Sparkline";
import { genSpark } from "@/lib/spark";
import { compactNumber } from "@/lib/format";
import { IconComment, IconRepeat, IconHeart, IconViews, IconBookmark, IconFlame } from "@/components/icons";
import type { Market } from "@/lib/types";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function MarketPostCard({
  market,
  authorName = "MacroMarauder",
  authorHandle = "macro_marauder",
  time = "10m",
}: {
  market: Market;
  authorName?: string;
  authorHandle?: string;
  time?: string;
}) {
  const yes = market.yes_price != null ? Math.round(market.yes_price * 100) : 63;
  const no = 100 - yes;
  const spark = genSpark(market.id, 36, 0.04);

  return (
    <article className="border-b border-line px-4 py-3.5 transition-colors hover:bg-white/[0.015] sm:px-5">
      <div className="flex items-center gap-2 text-[13px]">
        <Avatar seed={authorHandle} label={authorName} size={28} />
        <span className="text-faint">
          Market created by <span className="font-semibold text-muted">@{authorHandle}</span>
        </span>
        <span className="text-faint">· {time}</span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-bull/10 px-2 py-0.5 text-[10px] font-bold text-bull">
          <IconFlame className="h-3 w-3" /> Trending
        </span>
      </div>

      <div className="mt-3 rounded-2xl border border-line bg-surface/40 p-4">
        <h3 className="text-[16px] font-bold tracking-tight text-foreground">{market.question}</h3>

        <div className="mt-3 flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <Sparkline data={spark} width={360} height={92} color="#22c55e" fill strokeWidth={2} />
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-[28px] font-bold leading-none text-bull">{yes}%</p>
            <p className="text-[11px] font-semibold tracking-wide text-faint">YES</p>
            <p className="mt-2 font-mono text-[20px] font-bold leading-none text-bear">{no}%</p>
            <p className="text-[11px] font-semibold tracking-wide text-faint">NO</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
          <span className="font-mono text-[12px] text-muted">
            ${compactNumber(market.volume ?? 2400000)} Vol.
          </span>
          <span className="text-[12px] text-faint">Expires {fmtDate(market.end_date)}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between pr-1 text-faint">
        <button className="flex items-center gap-1.5 text-[12.5px] transition-colors hover:text-sky-400">
          <IconComment className="h-[17px] w-[17px]" /> 35
        </button>
        <button className="flex items-center gap-1.5 text-[12.5px] transition-colors hover:text-bull">
          <IconRepeat className="h-[17px] w-[17px]" /> 112
        </button>
        <button className="flex items-center gap-1.5 text-[12.5px] transition-colors hover:text-bear">
          <IconHeart className="h-[17px] w-[17px]" /> 278
        </button>
        <button className="flex items-center gap-1.5 text-[12.5px] transition-colors hover:text-foreground">
          <IconViews className="h-[17px] w-[17px]" /> 8.7K
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/[0.05] hover:text-foreground">
          <IconBookmark className="h-[17px] w-[17px]" />
        </button>
      </div>
    </article>
  );
}
