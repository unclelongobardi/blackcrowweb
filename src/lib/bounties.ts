import { query, queryOne } from "./db";
import { helperInfluenceFromLamports } from "./bountyInfluence";
import { canContributeToPool } from "./bountyRules";
import type { Bounty, BountyContribution, Profile, Market } from "./types";

export { canContributeToPool };

const BOUNTY_SELECT = `
  select b.*,
    row_to_json(creator.*) as creator,
    row_to_json(helper.*) as helper,
    row_to_json(m.*) as market,
    (select count(*)::int from bounty_contributions bc where bc.bounty_id = b.id) as contribution_count,
    (select coalesce(sum(lamports), 0)::bigint from bounty_contributions bc where bc.bounty_id = b.id) as contributions_lamports
  from bounties b
  left join profiles creator on creator.id = b.created_by
  left join profiles helper on helper.id = b.helper_id
  left join markets m on m.id = b.market_id
`;

export async function getBountyById(id: string, myId?: string | null): Promise<Bounty | null> {
  const row = await queryOne<
    Bounty & { creator: Profile | null; helper: Profile | null; market: Market | null }
  >(`${BOUNTY_SELECT} where b.id = $1`, [id]);
  if (!row) return null;

  const contributions = await query<BountyContribution & { contributor: Profile | null }>(
    `select bc.*, row_to_json(p.*) as contributor
       from bounty_contributions bc
       left join profiles p on p.id = bc.profile_id
       where bc.bounty_id = $1
       order by bc.created_at desc
       limit 20`,
    [id],
  );

  return attachRole({ ...row, contributions }, myId);
}

export async function listBounties(
  myId?: string | null,
  status?: string,
): Promise<Bounty[]> {
  const params: unknown[] = [];
  let where = "where b.status not in ('cancelled', 'funding')";
  if (status) {
    params.push(status);
    where = `where b.status = $${params.length}`;
  }
  const rows = await query<
    Bounty & { creator: Profile | null; helper: Profile | null; market: Market | null }
  >(`${BOUNTY_SELECT} ${where} order by b.reward_sol_lamports desc, b.created_at desc`, params);
  return rows.map((r) => attachRole(r, myId));
}

function attachRole(
  b: Bounty & { creator?: Profile | null; helper?: Profile | null; market?: Market | null },
  myId?: string | null,
): Bounty {
  let my_role: Bounty["my_role"] = null;
  if (myId) {
    if (b.created_by === myId) my_role = "creator";
    else if (b.helper_id === myId) my_role = "helper";
  }
  return {
    ...b,
    my_role,
    reward_influence: helperInfluenceFromLamports(b.reward_sol_lamports),
    contributions_lamports: Number(b.contributions_lamports ?? 0),
    contribution_count: Number(b.contribution_count ?? 0),
  };
}
