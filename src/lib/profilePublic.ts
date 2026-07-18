import type { Profile } from "./types";

/** Strip server-only identifiers from profiles returned to other users. */
export function toPublicProfile(profile: Profile, opts?: { isSelf?: boolean }): Profile {
  if (opts?.isSelf) return profile;
  return {
    ...profile,
    privy_did: "",
    wallet_address: null,
  };
}

export const PUBLIC_PROFILE_SQL =
  "id, codename, display_name, bio, avatar_seed, avatar_url, influence, is_onboarded, created_at, coalesce(is_verified, false) as is_verified, coalesce(is_ai, false) as is_ai";
