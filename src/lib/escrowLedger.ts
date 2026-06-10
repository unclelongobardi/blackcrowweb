import { query, queryOne } from "./db";

export type EscrowTxKind = "deposit" | "contribution" | "payout" | "refund";

export async function isEscrowTxSignatureUsed(signature: string): Promise<boolean> {
  const row = await queryOne<{ used: boolean }>(
    `select (
       exists (select 1 from escrow_transactions where tx_signature = $1)
       or exists (select 1 from bounties where deposit_tx = $1)
       or exists (select 1 from bounty_contributions where tx_signature = $1)
       or exists (select 1 from bounties where payout_tx = $1)
       or exists (select 1 from bounty_participants where payout_tx = $1)
     ) as used`,
    [signature],
  );
  return !!row?.used;
}

export async function recordEscrowTransaction(opts: {
  bountyId: string;
  kind: EscrowTxKind;
  txSignature: string;
  lamports: bigint | string | number;
  fromWallet?: string | null;
  toWallet?: string | null;
  profileId?: string | null;
}): Promise<void> {
  await query(
    `insert into escrow_transactions (bounty_id, kind, tx_signature, from_wallet, to_wallet, lamports, profile_id)
     values ($1, $2, $3, $4, $5, $6, $7)
     on conflict (tx_signature) do nothing`,
    [
      opts.bountyId,
      opts.kind,
      opts.txSignature,
      opts.fromWallet ?? null,
      opts.toWallet ?? null,
      BigInt(opts.lamports).toString(),
      opts.profileId ?? null,
    ],
  );
}

/** Sum of lamports locked in open/funded user bounties (for reconciliation hints). */
export async function sumActiveBountyLiability(): Promise<bigint> {
  const row = await queryOne<{ total: string | null }>(
    `select coalesce(sum(reward_sol_lamports), 0)::text as total
       from bounties
      where status in ('open', 'assigned', 'submitted')
        and deposit_tx is not null`,
  );
  return BigInt(row?.total ?? 0);
}
