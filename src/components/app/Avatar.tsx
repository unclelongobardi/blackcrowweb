"use client";

import { avatarImageUrl, isAvatarId, resolveAvatarId, type AvatarId } from "@/lib/avatars";

export default function Avatar({
  seed,
  avatarUrl,
  label,
  size = 36,
  className = "",
  verified,
}: {
  seed?: string | null;
  avatarUrl?: string | null;
  label?: string | null;
  size?: number;
  className?: string;
  verified?: boolean;
}) {
  const s = seed || label || "crow";
  const src = avatarImageUrl(s, avatarUrl);
  const official = s === "blackcrow_official" || s === "blackcrow";

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
        className={`rounded-full ring-1 ring-black/10 ${
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

export { isAvatarId, resolveAvatarId, type AvatarId };
