const NFTS = [
  "/images/avatars/av1.png",
  "/images/avatars/av2.png",
  "/images/avatars/av3.png",
  "/images/avatars/av4.png",
  "/images/avatars/av5.png",
  "/images/avatars/av6.png",
];

const OFFICIAL = "/images/blackcrow-official.png";

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
  return Math.abs(h);
}

function isOfficial(seed: string): boolean {
  return seed === "blackcrow_official" || seed === "blackcrow";
}

function avatarSrc(seed: string): string {
  if (isOfficial(seed)) return OFFICIAL;
  return NFTS[hash(seed) % NFTS.length];
}

export default function Avatar({
  seed,
  label,
  size = 36,
  className = "",
  verified,
}: {
  seed?: string | null;
  label?: string | null;
  size?: number;
  className?: string;
  verified?: boolean;
}) {
  const s = seed || label || "crow";
  const src = avatarSrc(s);
  const official = isOfficial(s);

  return (
    <span className="relative inline-flex shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={label ?? ""}
        loading="lazy"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={`rounded-full ring-1 ring-white/10 ${
          official ? "bg-white object-contain p-1" : "bg-surface object-cover"
        } ${className}`}
      />
      {verified && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-sky-500 ring-2 ring-background">
          <svg className="h-2 w-2 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </span>
      )}
    </span>
  );
}
