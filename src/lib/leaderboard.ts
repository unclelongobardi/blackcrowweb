import { isDbConfigured, query } from "@/lib/db";

export type LeaderboardOperative = {
  id: string;
  codename: string;
  display_name: string | null;
  avatar_seed: string | null;
  influence: number;
  is_verified: boolean;
};

export async function fetchTopOperatives(limit = 10): Promise<LeaderboardOperative[]> {
  if (!isDbConfigured()) return [];

  return query<LeaderboardOperative>(
    `select id, codename, display_name, avatar_seed, influence,
            coalesce(is_verified, false) as is_verified
       from profiles
      order by influence desc, created_at asc
      limit $1`,
    [limit],
  );
}
