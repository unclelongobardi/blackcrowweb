import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export function lamportsToSol(lamports: number | bigint | string): string {
  const n = Number(BigInt(lamports)) / LAMPORTS_PER_SOL;
  return n >= 1 ? n.toFixed(2) : n.toFixed(4);
}

export function sumLamports(values: Array<number | bigint | string>): bigint {
  return values.reduce<bigint>((sum, v) => sum + BigInt(v), BigInt(0));
}

export function solToLamports(sol: number): bigint {
  return BigInt(Math.round(sol * LAMPORTS_PER_SOL));
}
