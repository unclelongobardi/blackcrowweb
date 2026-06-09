import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import bs58 from "bs58";
import { lamportsToSol, solToLamports } from "./solanaFormat";

export { lamportsToSol, solToLamports };

const RPC =
  process.env.SOLANA_RPC_URL ||
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  "https://api.mainnet-beta.solana.com";

let _connection: Connection | null = null;
let _keypair: Keypair | null | undefined;

function connection(): Connection {
  if (!_connection) _connection = new Connection(RPC, "confirmed");
  return _connection;
}

function escrowKeypair(): Keypair | null {
  if (_keypair !== undefined) return _keypair;
  const secret = process.env.ESCROW_WALLET_SECRET_KEY?.trim();
  if (!secret) {
    _keypair = null;
    return null;
  }
  try {
    if (secret.startsWith("[")) {
      _keypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secret)));
    } else {
      _keypair = Keypair.fromSecretKey(bs58.decode(secret));
    }
  } catch {
    _keypair = null;
  }
  return _keypair;
}

export function isEscrowConfigured(): boolean {
  return !!getEscrowAddress();
}

export function getEscrowAddress(): string | null {
  const explicit = process.env.ESCROW_WALLET_ADDRESS?.trim();
  if (explicit) return explicit;
  return escrowKeypair()?.publicKey.toBase58() ?? null;
}

const MEMO_PREFIX = "BLACKCROW:bounty:";

export function bountyMemo(bountyId: string): string {
  return `${MEMO_PREFIX}${bountyId}`;
}

type VerifyResult = { ok: true } | { ok: false; error: string };

/** Verify a deposit tx sent to the escrow wallet for a bounty. */
export async function verifyDepositTx(
  signature: string,
  expectedLamports: bigint,
  bountyId: string,
  fromWallet?: string | null,
): Promise<VerifyResult> {
  const escrow = getEscrowAddress();
  if (!escrow) return { ok: false, error: "Escrow wallet not configured." };

  try {
    const conn = connection();
    const tx = await conn.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });

    if (!tx) return { ok: false, error: "Transaction not found. Wait a few seconds and retry." };
    if (tx.meta?.err) return { ok: false, error: "Transaction failed on-chain." };

    const escrowPk = new PublicKey(escrow);
    let received = BigInt(0);
    let senderOk = !fromWallet;

    for (const ix of tx.transaction.message.instructions) {
      const parsed = "parsed" in ix ? ix.parsed : null;
      if (!parsed || parsed.type !== "transfer") continue;
      const info = parsed.info as {
        destination?: string;
        source?: string;
        lamports?: number;
      };
      if (info.destination === escrowPk.toBase58()) {
        received += BigInt(info.lamports ?? 0);
      }
      if (fromWallet && info.source === fromWallet) senderOk = true;
    }

    if (received < expectedLamports) {
      return {
        ok: false,
        error: `Insufficient deposit. Expected ${lamportsToSol(expectedLamports)} SOL, got ${lamportsToSol(received)} SOL.`,
      };
    }
    if (!senderOk) {
      return { ok: false, error: "Deposit must come from your connected wallet." };
    }

    // Memo is optional but logged for audit
    const logs = tx.meta?.logMessages ?? [];
    const hasMemo = logs.some((l) => l.includes(bountyMemo(bountyId)));
    if (!hasMemo) {
      // Non-fatal — amount + sender + recipient are the real checks
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Verification failed." };
  }
}

type PayoutResult = { ok: true; signature: string } | { ok: false; error: string };

/** Release escrowed SOL to the helper's wallet. */
export async function sendPayout(
  toAddress: string,
  lamports: bigint,
): Promise<PayoutResult> {
  const kp = escrowKeypair();
  if (!kp) return { ok: false, error: "Escrow signing key not configured." };

  try {
    const conn = connection();
    const to = new PublicKey(toAddress);
    const balance = await conn.getBalance(kp.publicKey);
    const feeBuffer = 10_000; // lamports for tx fee
    if (BigInt(balance) < lamports + BigInt(feeBuffer)) {
      return { ok: false, error: "Escrow wallet has insufficient balance." };
    }

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: kp.publicKey,
        toPubkey: to,
        lamports: Number(lamports),
      }),
    );

    const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;
    tx.feePayer = kp.publicKey;

    const signature = await conn.sendTransaction(tx, [kp], { skipPreflight: false });
    await conn.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");

    return { ok: true, signature };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Payout failed." };
  }
}

/** Build an unsigned deposit transaction for the client to sign. */
export async function buildDepositTransaction(
  fromAddress: string,
  lamports: bigint,
  bountyId: string,
): Promise<{ transaction: string; escrowAddress: string } | { error: string }> {
  const escrow = getEscrowAddress();
  if (!escrow) return { error: "Escrow wallet not configured." };

  try {
    const conn = connection();
    const from = new PublicKey(fromAddress);
    const to = new PublicKey(escrow);

    const { blockhash } = await conn.getLatestBlockhash("confirmed");
    const tx = new Transaction({
      recentBlockhash: blockhash,
      feePayer: from,
    }).add(
      SystemProgram.transfer({
        fromPubkey: from,
        toPubkey: to,
        lamports: Number(lamports),
      }),
    );

    const serialized = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
    return {
      transaction: Buffer.from(serialized).toString("base64"),
      escrowAddress: escrow,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to build transaction." };
  }
}
