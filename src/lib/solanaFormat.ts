import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export function lamportsToSol(lamports: number | bigint): string {
  const n = Number(lamports) / LAMPORTS_PER_SOL;
  return n >= 1 ? n.toFixed(2) : n.toFixed(4);
}

export function solToLamports(sol: number): bigint {
  return BigInt(Math.round(sol * LAMPORTS_PER_SOL));
}
