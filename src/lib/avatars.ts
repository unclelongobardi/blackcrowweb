/** Selectable compact profile avatars. The id is stored in profiles.avatar_seed. */

type NormalAvatarNo =
  | "01"
  | "02"
  | "03"
  | "04"
  | "05"
  | "06"
  | "07"
  | "08"
  | "09"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15"
  | "16"
  | "17"
  | "18"
  | "19"
  | "20"
  | "21"
  | "22"
  | "23"
  | "24"
  | "25";

type VipAvatarNo =
  | "01"
  | "02"
  | "03"
  | "04"
  | "05"
  | "06"
  | "07"
  | "08"
  | "09"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15";

type ElectionAvatarNo = "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10";

export type AvatarId =
  | `gloria-normal-${NormalAvatarNo}`
  | `gloria-vip-${VipAvatarNo}`
  | `gloria-election-${ElectionAvatarNo}`;

export type AvatarTier = "normal" | "vip";
export type AvatarCollection = "core" | "election";

export type ProfileAvatar = {
  id: AvatarId;
  label: string;
  src: string;
  tier: AvatarTier;
  collection: AvatarCollection;
};

export const DEFAULT_AVATAR_ID: AvatarId = "gloria-normal-01";

const NORMAL_LABELS = [
  "Signal Bomber",
  "Utility Analyst",
  "Code Jacket",
  "Platinum Trader",
  "Field Scout",
  "Protocol Vest",
  "Yellow Trim",
  "Quant Coat",
  "Data Beanie",
  "Security Lead",
  "Chore Jacket",
  "Community Lead",
  "Varsity Signal",
  "Product Desk",
  "DAO Moderator",
  "Governance Coat",
  "Liquidity Hunter",
  "Market Maker",
  "Chart Reader",
  "Protocol Hoodie",
  "Prediction Desk",
  "Alpha Jacket",
  "Macro Coat",
  "Risk Manager",
  "Tech Vest",
] as const;

const VIP_LABELS = [
  "Black Tie",
  "Velvet Founder",
  "Obsidian Coat",
  "Ivory Venture",
  "Dark Pool",
  "Private Alpha",
  "Emerald Signal",
  "OTC Desk",
  "Vault Keeper",
  "Burgundy Elite",
  "Protocol Patron",
  "Treasury Lead",
  "Arbitrage Suit",
  "Cabal Leader",
  "Cape Operator",
] as const;

const ELECTION_LABELS = [
  "Ballot Jacket",
  "Checkmark Tee",
  "Vote Mark",
  "Ballot Blazer",
  "Gold Check",
  "Vote Shield",
  "Burgundy Ballot",
  "Green Ballot",
  "Navy Check",
  "Cream Ballot",
] as const;

function makeAvatars(
  kind: "normal" | "vip" | "election",
  labels: readonly string[],
): ProfileAvatar[] {
  return labels.map((label, index) => {
    const no = String(index + 1).padStart(2, "0");
    const id = `gloria-${kind}-${no}` as AvatarId;
    return {
      id,
      label,
      src: `/images/avatars/presets/${kind}/${id}.png`,
      tier: kind === "vip" ? "vip" : "normal",
      collection: kind === "election" ? "election" : "core",
    };
  });
}

export const PROFILE_AVATARS: ProfileAvatar[] = [
  ...makeAvatars("normal", NORMAL_LABELS),
  ...makeAvatars("vip", VIP_LABELS),
  ...makeAvatars("election", ELECTION_LABELS),
];

const AVATAR_BY_ID = new Map(PROFILE_AVATARS.map((avatar) => [avatar.id, avatar]));
const AVATAR_ID_SET = new Set<string>(PROFILE_AVATARS.map((avatar) => avatar.id));

const LEGACY_AVATAR_MAP: Record<string, AvatarId> = {
  av1: "gloria-normal-01",
  av2: "gloria-normal-02",
  av3: "gloria-normal-03",
  av4: "gloria-normal-04",
  av5: "gloria-normal-05",
  av6: "gloria-normal-06",
  av7: "gloria-normal-07",
  av8: "gloria-normal-08",
  av9: "gloria-normal-09",
  av10: "gloria-normal-10",
  av11: "gloria-normal-11",
  av12: "gloria-normal-12",
};

export function isAvatarId(value: string | null | undefined): value is AvatarId {
  return Boolean(value && AVATAR_ID_SET.has(value));
}

export function avatarSrcById(id: AvatarId): string {
  return AVATAR_BY_ID.get(id)?.src ?? AVATAR_BY_ID.get(DEFAULT_AVATAR_ID)!.src;
}

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
  return Math.abs(h);
}

/** Map legacy/random seeds to a stable picker avatar. */
export function resolveAvatarId(seed: string | null | undefined): AvatarId {
  if (isAvatarId(seed)) return seed;
  if (seed?.startsWith("vlre-")) {
    const gloriaId = seed.replace(/^vlre-/, "gloria-");
    if (isAvatarId(gloriaId)) return gloriaId;
  }
  if (seed && LEGACY_AVATAR_MAP[seed]) return LEGACY_AVATAR_MAP[seed];
  const s = seed || "gloria";
  return PROFILE_AVATARS[hash(s) % PROFILE_AVATARS.length]!.id;
}

export function avatarImageUrl(
  seed: string | null | undefined,
  avatarUrl?: string | null,
): string {
  if (avatarUrl) return avatarUrl;
  if (
    seed === "gloria_official" ||
    seed === "gloria" ||
    seed === "valore_official" ||
    seed === "valore"
  ) {
    return "/images/gloria-official.png";
  }
  return avatarSrcById(resolveAvatarId(seed));
}
