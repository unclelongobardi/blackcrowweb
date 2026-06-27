"use client";

import CopyButton from "@/components/CopyButton";
import {
  DEXSCREENER_URL,
  PUMP_FUN_URL,
  SOLSCAN_TOKEN_URL,
  TOKEN_CA,
  TOKEN_SYMBOL,
} from "@/lib/links";

type Variant = "header" | "inline" | "panel";

export default function TokenCaChip({
  variant = "header",
  className = "",
  label = "CA",
}: {
  variant?: Variant;
  className?: string;
  label?: string;
}) {
  if (!TOKEN_CA) {
    return null;
  }

  if (variant === "panel") {
    return (
      <div className={`rounded-xl border border-line bg-surface/40 p-4 ${className}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-bold tracking-[0.14em] text-faint">${TOKEN_SYMBOL} CONTRACT (CA)</p>
          <CopyButton value={TOKEN_CA} label="Copy CA" />
        </div>
        <p className="mt-2 break-all font-mono text-[12px] leading-relaxed text-foreground">{TOKEN_CA}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={PUMP_FUN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-line px-3 py-1.5 text-[11px] font-semibold text-muted hover:border-primary/30 hover:text-foreground"
          >
            Pump.fun →
          </a>
          <a
            href={DEXSCREENER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-line px-3 py-1.5 text-[11px] font-semibold text-muted hover:border-primary/30 hover:text-foreground"
          >
            Dexscreener →
          </a>
          <a
            href={SOLSCAN_TOKEN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-line px-3 py-1.5 text-[11px] font-semibold text-muted hover:border-primary/30 hover:text-foreground"
          >
            Solscan →
          </a>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`flex items-center justify-between gap-3 rounded-lg border border-line bg-surface/30 px-3 py-2.5 ${className}`}>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-faint">{label} · ${TOKEN_SYMBOL}</p>
          <p className="truncate font-mono text-[11px] text-muted">{TOKEN_CA}</p>
        </div>
        <CopyButton value={TOKEN_CA} />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-xl border border-line bg-surface/40 px-2 py-1.5 ${className}`}
      title="Token contract address"
    >
      <span className="text-[10px] font-bold tracking-wide text-faint">{label}</span>
      <span className="max-w-[120px] truncate font-mono text-[10px] text-muted xl:max-w-[160px]">{TOKEN_CA}</span>
      <CopyButton value={TOKEN_CA} label="Copy" />
    </div>
  );
}
