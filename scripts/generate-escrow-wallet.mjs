/**
 * Generate a dedicated Solana keypair for the custodial escrow wallet.
 * Usage:
 *   node scripts/generate-escrow-wallet.mjs           # print only
 *   node scripts/generate-escrow-wallet.mjs --write   # append to .env.local if missing
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

const write = process.argv.includes("--write");
const kp = Keypair.generate();
const address = kp.publicKey.toBase58();
const secret = bs58.encode(kp.secretKey);

console.log("Generated escrow keypair");
console.log("  ESCROW_WALLET_ADDRESS=" + address);
console.log("  ESCROW_WALLET_SECRET_KEY=" + secret);

if (!write) {
  console.log("\nAdd these to .env.local and Vercel (server-only). Re-run with --write to append locally.");
  process.exit(0);
}

const envPath = ".env.local";
const block = `
# ---- Solana escrow (generated ${new Date().toISOString()}) ----
ESCROW_WALLET_ADDRESS=${address}
ESCROW_WALLET_SECRET_KEY=${secret}
SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
`;

let existing = "";
if (existsSync(envPath)) {
  existing = readFileSync(envPath, "utf8");
  if (existing.includes("ESCROW_WALLET_SECRET_KEY=") || existing.includes("ESCROW_WALLET_ADDRESS=")) {
    console.error("\n.env.local already has escrow vars — not overwriting. Remove them first or set manually.");
    process.exit(1);
  }
}

writeFileSync(envPath, existing.trimEnd() + block, "utf8");
console.log("\nAppended escrow block to .env.local (devnet). Fund the address with devnet SOL for payouts.");
