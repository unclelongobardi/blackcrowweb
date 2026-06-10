import type { Bounty } from "./types";

export function isBountyExpired(bounty: { expires_at?: string | null }): boolean {
  if (!bounty.expires_at) return false;
  return new Date(bounty.expires_at).getTime() <= Date.now();
}

export function canContributeToPool(
  status: Bounty["status"],
  isOfficial?: boolean,
  expiresAt?: string | null,
): boolean {
  if (isOfficial) return false;
  if (isBountyExpired({ expires_at: expiresAt })) return false;
  return status === "open" || status === "assigned";
}

export function canAcceptBounty(bounty: Pick<Bounty, "status" | "expires_at" | "deposit_tx">): boolean {
  if (isBountyExpired(bounty)) return false;
  if (!bounty.deposit_tx) return false;
  return bounty.status === "open" || bounty.status === "assigned";
}

export function expiresInLabel(expiresAt: string | null | undefined): string | null {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Expired";
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return `${days}d left`;
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 1) return `${hours}h left`;
  const mins = Math.max(1, Math.floor(ms / 60_000));
  return `${mins}m left`;
}
