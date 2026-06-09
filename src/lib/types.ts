export type Profile = {
  id: string;
  privy_did: string;
  wallet_address: string | null;
  codename: string;
  display_name: string | null;
  bio: string | null;
  avatar_seed: string | null;
  influence: number;
  is_onboarded: boolean;
  is_verified?: boolean;
  created_at: string;
};

export type CabalKind = "tipsters" | "manipulation" | "discussion";
export type CabalVisibility = "public" | "private";

export type Cabal = {
  id: string;
  slug: string;
  name: string;
  motto: string | null;
  description: string | null;
  emblem_seed: string | null;
  created_by: string | null;
  created_at: string;
  visibility?: CabalVisibility;
  kind?: CabalKind;
  member_count?: number;
  is_member?: boolean;
  pending_request?: boolean;
  is_leader?: boolean;
};

export type DmConversation = {
  id: string;
  updated_at: string;
  other: Profile;
  last_body: string | null;
  last_at: string | null;
  unread: boolean;
};

export type DmMessage = {
  id: string;
  conversation_id?: string;
  sender_id: string;
  body: string;
  created_at: string;
  sender?: Profile | null;
};

export type Market = {
  id: string;
  slug: string | null;
  question: string;
  category: string | null;
  image: string | null;
  yes_price: number | null;
  no_price: number | null;
  volume: number | null;
  end_date: string | null;
  url: string | null;
  last_synced?: string;
  exploit_score?: number;
  liquidity_tier?: "thin" | "medium" | "thick";
};

export type Operation = {
  id: string;
  market_id: string | null;
  cabal_id: string | null;
  created_by: string | null;
  title: string;
  thesis: string | null;
  target_side: "YES" | "NO";
  status: "planning" | "active" | "closed";
  starts_at: string;
  ends_at: string | null;
  created_at: string;
  market?: Market | null;
  cabal?: Cabal | null;
  author?: Profile | null;
  member_count?: number;
  my_joined?: boolean;
};

export type Post = {
  id: string;
  author_id: string | null;
  market_id: string | null;
  operation_id: string | null;
  parent_id: string | null;
  content: string;
  sentiment: "bullish" | "bearish" | "neutral";
  created_at: string;
  author?: Profile | null;
  market?: Market | null;
  score?: number;
  reply_count?: number;
  my_vote?: number;
};

export type BountyStatus =
  | "funding"
  | "open"
  | "assigned"
  | "submitted"
  | "paid"
  | "cancelled";

export type Bounty = {
  id: string;
  created_by: string | null;
  market_id: string | null;
  title: string;
  description: string | null;
  task: string | null;
  reward_sol_lamports: number;
  reward_influence: number;
  kind: "action" | "intel" | "coord";
  status: BountyStatus;
  helper_id: string | null;
  proof: string | null;
  deposit_tx: string | null;
  payout_tx: string | null;
  creator_wallet: string | null;
  helper_wallet: string | null;
  created_at: string;
  funded_at: string | null;
  assigned_at: string | null;
  submitted_at: string | null;
  paid_at: string | null;
  creator?: Profile | null;
  helper?: Profile | null;
  market?: Market | null;
  my_role?: "creator" | "helper" | null;
  is_official?: boolean;
};

export type Notification = {
  id: string;
  profile_id: string;
  type: string;
  body: string;
  link: string | null;
  read: boolean;
  created_at: string;
};
