/** Selectable profile avatars — id stored in profiles.avatar_seed */

export type AvatarId =
  | "av1"
  | "av2"
  | "av3"
  | "av4"
  | "av5"
  | "av6"
  | "av7"
  | "av8"
  | "av9"
  | "av10"
  | "av11"
  | "av12";

export const DEFAULT_AVATAR_ID: AvatarId = "av1";

export const PROFILE_AVATARS: { id: AvatarId; label: string; src: string }[] = [
  { id: "av1", label: "Night ops", src: "/images/avatars/av1.png" },
  { id: "av2", label: "Signal", src: "/images/avatars/av2.png" },
  { id: "av3", label: "Ghost", src: "/images/avatars/av3.png" },
  { id: "av4", label: "Cipher", src: "/images/avatars/av4.png" },
  { id: "av5", label: "Oracle", src: "/images/avatars/av5.png" },
  { id: "av6", label: "Phantom", src: "/images/avatars/av6.png" },
  { id: "av7", label: "Raven", src: "/images/avatars/av7.svg" },
  { id: "av8", label: "Glitch", src: "/images/avatars/av8.svg" },
  { id: "av9", label: "Wire", src: "/images/avatars/av9.svg" },
  { id: "av10", label: "Cold", src: "/images/avatars/av10.svg" },
  { id: "av11", label: "Pulse", src: "/images/avatars/av11.svg" },
  { id: "av12", label: "Static", src: "/images/avatars/av12.svg" },
];

const AVATAR_ID_SET = new Set<string>(PROFILE_AVATARS.map((a) => a.id));

export function isAvatarId(value: string | null | undefined): value is AvatarId {
  return Boolean(value && AVATAR_ID_SET.has(value));
}

export function avatarSrcById(id: AvatarId): string {
  return PROFILE_AVATARS.find((a) => a.id === id)!.src;
}

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
  return Math.abs(h);
}

/** Map legacy random seeds to a stable picker avatar. */
export function resolveAvatarId(seed: string | null | undefined): AvatarId {
  if (isAvatarId(seed)) return seed;
  const s = seed || "crow";
  return PROFILE_AVATARS[hash(s) % PROFILE_AVATARS.length]!.id;
}

export function avatarImageUrl(
  seed: string | null | undefined,
  avatarUrl?: string | null,
): string {
  if (avatarUrl) return avatarUrl;
  if (seed === "blackcrow_official" || seed === "blackcrow") {
    return "/images/blackcrow-official.png";
  }
  if (isAvatarId(seed)) return avatarSrcById(seed);
  return avatarSrcById(resolveAvatarId(seed));
}
