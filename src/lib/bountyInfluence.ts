/** Feathers earned from SOL amount (helper payout / pool size). */
export function helperInfluenceFromLamports(lamports: number | bigint): number {
  const sol = Number(lamports) / 1e9;
  return Math.min(500, Math.round(sol * 10));
}

/** Feathers for the creator when their bounty goes live (based on initial deposit). */
export function creatorPostInfluenceFromLamports(lamports: number | bigint): number {
  const sol = Number(lamports) / 1e9;
  return Math.min(300, Math.round(sol * 5));
}
