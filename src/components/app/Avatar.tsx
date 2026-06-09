const NFTS = [
  "/images/avatars/av1.png",
  "/images/avatars/av2.png",
  "/images/avatars/av3.png",
  "/images/avatars/av4.png",
  "/images/avatars/av5.png",
  "/images/avatars/av6.png",
];

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
  return Math.abs(h);
}

export default function Avatar({
  seed,
  label,
  size = 36,
  className = "",
}: {
  seed?: string | null;
  label?: string | null;
  size?: number;
  className?: string;
}) {
  const s = seed || label || "crow";
  const src = NFTS[hash(s) % NFTS.length];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={label ?? ""}
      loading="lazy"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`shrink-0 rounded-full bg-surface object-cover ring-1 ring-white/10 ${className}`}
    />
  );
}
