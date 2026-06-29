import { query, queryOne } from "./db";
import { helperInfluenceFromLamports } from "./bountyInfluence";
import { canContributeToPool } from "./bountyRules";
import { fetchPolymarketMarketsByIds } from "./polymarket";
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

type BountyRow = Bounty & { creator: Profile | null; helper: Profile | null; market: Market | null };

async function refreshLinkedMarkets<T extends BountyRow>(rows: T[]): Promise<T[]> {
  const ids = [...new Set(rows.map((r) => r.market_id).filter((id): id is string => !!id))];
  if (!ids.length) return rows;

  try {
    const liveMarkets = await fetchPolymarketMarketsByIds(ids);
    if (!liveMarkets.length) return rows;

    const values: string[] = [];
    const params: unknown[] = [];
    liveMarkets.forEach((m, i) => {
      const b = i * 10;
      values.push(
        `($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5},$${b + 6},$${b + 7},$${b + 8},$${b + 9},$${b + 10}, now())`,
      );
      params.push(
        m.id, m.slug, m.question, m.category, m.image,
        m.yes_price, m.no_price, m.volume, m.end_date, m.url,
      );
    });

    await query(
      `insert into markets (id, slug, question, category, image, yes_price, no_price, volume, end_date, url, last_synced)
       values ${values.join(",")}
       on conflict (id) do update set
         slug = excluded.slug,
         question = excluded.question,
         category = excluded.category,
         image = excluded.image,
         yes_price = excluded.yes_price,
         no_price = excluded.no_price,
         volume = excluded.volume,
         end_date = excluded.end_date,
         url = excluded.url,
         last_synced = now()`,
      params,
    );

    const liveById = new Map(liveMarkets.map((m) => [m.id, m]));
    return rows.map((row) => {
      const live = row.market_id ? liveById.get(row.market_id) : null;
      return live ? { ...row, market: live } : row;
    });
  } catch {
    return rows;
  }
}

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
  let row = await queryOne<BountyRow>(`${BOUNTY_SELECT} where b.id = $1`, [id]);
  if (!row) return null;
  [row] = await refreshLinkedMarkets([row]);

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
  let where: string;
  const allowedStatuses = new Set(["open", "assigned", "submitted", "paid", "expired", "funding"]);
  if (status) {
    if (!allowedStatuses.has(status)) {
      return [];
    }
    if (status === "funding") {
      if (!myId) return [];
      params.push(status, myId);
      where = "where b.status = $1 and b.created_by = $2";
    } else {
      params.push(status);
      where = `where b.status = $${params.length}`;
    }
  } else if (myId) {
    params.push(myId);
    where = `where b.status not in ('cancelled', 'expired')
      and (b.status != 'funding' or b.created_by = $1)`;
  } else {
    where = "where b.status not in ('cancelled', 'funding', 'expired')";
  }
  const rows = await query<
    BountyRow
  >(`${BOUNTY_SELECT} ${where} order by b.reward_sol_lamports desc, b.created_at desc`, params);

  const refreshedRows = await refreshLinkedMarkets(rows);
  const participantsByBounty = await loadParticipantsForBounties(refreshedRows.map((r) => r.id));
  return refreshedRows.map((r) =>
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
