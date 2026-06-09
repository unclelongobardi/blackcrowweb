import type { Bounty } from "./types";

export function canContributeToPool(status: Bounty["status"], isOfficial?: boolean): boolean {
  if (isOfficial) return false;
  return status === "open" || status === "assigned";
}
