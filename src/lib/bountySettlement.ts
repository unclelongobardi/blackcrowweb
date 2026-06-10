import { query, queryOne } from "./db";

const PAYOUT_LOCK_PREFIX = "__payout_lock__";
const REFUND_LOCK_PREFIX = "__refund_lock__";

export function isSettlementLock(value: string | null | undefined): boolean {
  if (!value) return false;
  return value.startsWith(PAYOUT_LOCK_PREFIX) || value.startsWith(REFUND_LOCK_PREFIX);
}

/** Reserve a bounty for payout; blocks concurrent approve/cancel. */
export async function claimBountyForPayout(bountyId: string): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `update bounties set payout_tx = $2
       where id = $1
         and status in ('open', 'assigned', 'submitted', 'expired')
         and (payout_tx is null or payout_tx = '')
     returning id`,
    [bountyId, `${PAYOUT_LOCK_PREFIX}${Date.now()}`],
  );
  return !!row;
}

export async function releaseBountyPayoutLock(bountyId: string): Promise<void> {
  await query(
    `update bounties set payout_tx = null
       where id = $1 and payout_tx like $2`,
    [bountyId, `${PAYOUT_LOCK_PREFIX}%`],
  );
}

/** Reserve a bounty for refund; blocks concurrent approve/cancel. */
export async function claimBountyForRefund(bountyId: string): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `update bounties set payout_tx = $2
       where id = $1
         and status in ('open', 'assigned', 'submitted', 'expired')
         and (payout_tx is null or payout_tx = '')
     returning id`,
    [bountyId, `${REFUND_LOCK_PREFIX}${Date.now()}`],
  );
  return !!row;
}

export async function releaseBountyRefundLock(bountyId: string): Promise<void> {
  await query(
    `update bounties set payout_tx = null
       where id = $1 and payout_tx like $2`,
    [bountyId, `${REFUND_LOCK_PREFIX}%`],
  );
}

/** Idempotent recovery if payout succeeded on-chain but DB update failed. */
export async function getExistingPayoutSignature(bountyId: string): Promise<string | null> {
  const row = await queryOne<{ tx_signature: string }>(
    `select tx_signature from escrow_transactions
       where bounty_id = $1 and kind = 'payout'
       order by created_at desc limit 1`,
    [bountyId],
  );
  return row?.tx_signature ?? null;
}
