import { query, queryOne } from "./db";
import { helperInfluenceFromLamports } from "./bountyInfluence";
import { canContributeToPool } from "./bountyRules";
import type { Bounty, BountyContribution, BountyParticipant, BountyProofMedia, Profile, Market } from "./types";

export { canContributeToPool };

const BOUNTY_SELECT = `
  select b.*,
    row_to_json(creator.*) as creator,
    row_to_json(helper.*) as helper,
    row_to_json(m.*) as market,
    (select count(*)::int from bounty_contributions bc where bc.bounty_id = b.id) as contribution_count,
    (select coalesce(sum(lamports), 0)::bigint from bounty_contributions bc where bc.bounty_id = b.id) as contributions_lamports,
    (select count(*)::int from bounty_participants bp where bp.bounty_id = b.id) as participant_count
  from bounties b
  left join profiles creator on creator.id = b.created_by
  left join profiles helper on helper.id = b.helper_id
  left join markets m on m.id = b.market_id
`;

export async function expireStaleBounties(): Promise<void> {
  await query(
    `update bounties set status = 'expired'
     where expires_at is not null
       and expires_at < now()
       and status in ('open', 'assigned')`,
  );
}

async function loadParticipants(bountyId: string): Promise<BountyParticipant[]> {
  const rows = await query<BountyParticipant & { profile: Profile | null; proof_media: unknown }>(
    `select bp.*, row_to_json(p.*) as profile
       from bounty_participants bp
       left join profiles p on p.id = bp.profile_id
       where bp.bounty_id = $1
       order by bp.submitted_at desc nulls last, bp.joined_at asc`,
    [bountyId],
  );
  return rows.map(normalizeParticipant);
}

function normalizeParticipant(
  row: BountyParticipant & { proof_media: unknown },
): BountyParticipant {
  const media = Array.isArray(row.proof_media) ? row.proof_media : [];
  return {
    ...row,
    proof_media: media.filter(
      (m): m is BountyProofMedia =>
        !!m &&
        typeof m === "object" &&
        "url" in m &&
        typeof (m as BountyProofMedia).url === "string",
    ),
  };
}

export async function getBountyById(id: string, myId?: string | null): Promise<Bounty | null> {
  await expireStaleBounties();
  const row = await queryOne<
    Bounty & { creator: Profile | null; helper: Profile | null; market: Market | null }
  >(`${BOUNTY_SELECT} where b.id = $1`, [id]);
  if (!row) return null;

  const [contributions, participants] = await Promise.all([
    query<BountyContribution & { contributor: Profile | null }>(
      `select bc.*, row_to_json(p.*) as contributor
         from bounty_contributions bc
         left join profiles p on p.id = bc.profile_id
         where bc.bounty_id = $1
         order by bc.created_at desc
         limit 20`,
      [id],
    ),
    loadParticipants(id),
  ]);

  return attachRole({ ...row, contributions, participants }, myId);
}

async function loadParticipantsForBounties(ids: string[]): Promise<Map<string, BountyParticipant[]>> {
  const map = new Map<string, BountyParticipant[]>();
  if (!ids.length) return map;

  const rows = await query<BountyParticipant & { profile: Profile | null; proof_media: unknown }>(
    `select bp.*, row_to_json(p.*) as profile
       from bounty_participants bp
       left join profiles p on p.id = bp.profile_id
       where bp.bounty_id = any($1::uuid[])
       order by bp.submitted_at desc nulls last, bp.joined_at asc`,
    [ids],
  );

  for (const row of rows) {
    const list = map.get(row.bounty_id) ?? [];
    list.push(normalizeParticipant(row));
    map.set(row.bounty_id, list);
  }
  return map;
}

export async function listBounties(
  myId?: string | null,
  status?: string,
): Promise<Bounty[]> {
  await expireStaleBounties();
  const params: unknown[] = [];
  let where = "where b.status not in ('cancelled', 'funding', 'expired')";
  const allowedStatuses = new Set(["open", "assigned", "submitted", "paid", "expired"]);
  if (status) {
    if (!allowedStatuses.has(status)) {
      return [];
    }
    params.push(status);
    where = `where b.status = $${params.length}`;
  }
  const rows = await query<
    Bounty & { creator: Profile | null; helper: Profile | null; market: Market | null }
  >(`${BOUNTY_SELECT} ${where} order by b.reward_sol_lamports desc, b.created_at desc`, params);

  const participantsByBounty = await loadParticipantsForBounties(rows.map((r) => r.id));
  return rows.map((r) =>
    attachRole({ ...r, participants: participantsByBounty.get(r.id) ?? [] }, myId),
  );
}

function attachRole(
  b: Bounty & {
    creator?: Profile | null;
    helper?: Profile | null;
    market?: Market | null;
    participants?: BountyParticipant[];
  },
  myId?: string | null,
): Bounty {
  let my_role: Bounty["my_role"] = null;
  let my_participant: BountyParticipant | null = null;

  if (myId) {
    if (b.created_by === myId) my_role = "creator";
    else if (b.helper_id === myId) my_role = "helper";
    const mine = b.participants?.find((p) => p.profile_id === myId);
    if (mine) {
      my_participant = mine;
      if (!my_role) my_role = "helper";
    }
  }

  const pendingSubmissions = b.participants?.filter((p) => p.status === "submitted").length ?? 0;

  return {
    ...b,
    my_role,
    my_participant,
    reward_influence: helperInfluenceFromLamports(b.reward_sol_lamports),
    contributions_lamports: Number(b.contributions_lamports ?? 0),
    contribution_count: Number(b.contribution_count ?? 0),
    participant_count: Number(b.participant_count ?? b.participants?.length ?? 0),
    status:
      pendingSubmissions > 0 && b.status !== "paid" && b.status !== "expired"
        ? "submitted"
        : b.status,
  };
}
