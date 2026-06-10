/**
 * Smoke-check escrow configuration and on-chain balance.
 * Usage: node scripts/escrow-smoke.mjs
 */
import { readFileSync } from "node:fs";
import { Connection, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

function loadEnvLocal() {
  try {
    const txt = readFileSync(".env.local", "utf8");
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* optional */
  }
}

loadEnvLocal();

const RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const network = process.env.SOLANA_NETWORK || "devnet";
const secret = process.env.ESCROW_WALLET_SECRET_KEY?.trim();
const explicit = process.env.ESCROW_WALLET_ADDRESS?.trim();

let address = explicit || null;
if (!address && secret) {
  try {
    const bytes = secret.startsWith("[")
      ? Uint8Array.from(JSON.parse(secret))
      : bs58.decode(secret);
    const { Keypair } = await import("@solana/web3.js");
    address = Keypair.fromSecretKey(bytes).publicKey.toBase58();
  } catch (e) {
    console.error("Invalid ESCROW_WALLET_SECRET_KEY:", e.message);
    process.exit(1);
  }
}

if (!address) {
  console.error("Escrow not configured. Set ESCROW_WALLET_ADDRESS or ESCROW_WALLET_SECRET_KEY in .env.local");
  process.exit(1);
}

const conn = new Connection(RPC, "confirmed");
const balance = await conn.getBalance(new PublicKey(address));

console.log("Escrow smoke check");
console.log("  network:", network);
console.log("  rpc:", RPC);
console.log("  address:", address);
console.log("  balance:", (balance / 1e9).toFixed(4), "SOL");
console.log("  signing:", secret ? "yes" : "no (address only — payouts disabled)");
console.log(balance > 0 ? "OK — escrow reachable" : "WARN — escrow balance is 0");
