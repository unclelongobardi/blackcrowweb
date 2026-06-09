export function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString();
}

export function compactNumber(n: number | null | undefined): string {
  if (n == null) return "—";
  return Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function pct(price: number | null | undefined): string {
  if (price == null || Number.isNaN(price)) return "—";
  return `${Math.round(price * 100)}%`;
}

export function shortLabel(q: string, max = 26): string {
  const clean = q.replace(/\?+$/, "?").trim();
  return clean.length > max ? clean.slice(0, max).trimEnd() + "…" : clean;
}
