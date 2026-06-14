import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import bs58 from "bs58";
import { sumActiveBountyLiability } from "./escrowLedger";
import { getSolanaNetwork, getSolanaRpcUrl } from "./solanaExplorer";
import { lamportsToSol, solToLamports } from "./solanaFormat";

export { lamportsToSol, solToLamports };

const RPC = getSolanaRpcUrl();

const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
const FEE_BUFFER_LAMPORTS = BigInt(10_000);

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

export function isEscrowSigningConfigured(): boolean {
  return !!escrowKeypair();
}

export function canOperateEscrow(): boolean {
  return isEscrowConfigured() && isEscrowSigningConfigured();
}

export function getEscrowAddress(): string | null {
  const kp = escrowKeypair();
  const explicit = process.env.ESCROW_WALLET_ADDRESS?.trim();
  if (explicit && kp && explicit !== kp.publicKey.toBase58()) {
    console.error("[escrow] ESCROW_WALLET_ADDRESS does not match signing keypair");
    return null;
  }
  if (explicit) return explicit;
  return kp?.publicKey.toBase58() ?? null;
}

const MEMO_PREFIX = "VEXORA:bounty:";
const LEGACY_MEMO_PREFIX = "BLACKCROW:bounty:";

export function bountyMemo(bountyId: string): string {
  return `${MEMO_PREFIX}${bountyId}`;
}

function isExpectedBountyMemo(memo: string, bountyId: string): boolean {
  return memo === bountyMemo(bountyId) || memo === `${LEGACY_MEMO_PREFIX}${bountyId}`;
}

export type EscrowStatus = {
  configured: boolean;
  signingConfigured: boolean;
  address: string | null;
  balanceLamports: string | null;
  balanceSol: string | null;
  network: string;
  activeLiabilityLamports: string | null;
  activeLiabilitySol: string | null;
};

export async function getEscrowStatus(): Promise<EscrowStatus> {
  const address = getEscrowAddress();
  const signingConfigured = isEscrowSigningConfigured();
  const network = getSolanaNetwork();

  if (!address) {
    return {
      configured: false,
      signingConfigured,
      address: null,
      balanceLamports: null,
      balanceSol: null,
      network,
      activeLiabilityLamports: null,
      activeLiabilitySol: null,
    };
  }

  let balanceLamports: bigint | null = null;
  try {
    const balance = await connection().getBalance(new PublicKey(address));
    balanceLamports = BigInt(balance);
  } catch {
    balanceLamports = null;
  }

  let liability = BigInt(0);
  try {
    liability = await sumActiveBountyLiability();
  } catch {
    liability = BigInt(0);
  }

  return {
    configured: true,
    signingConfigured,
    address,
    balanceLamports: balanceLamports != null ? balanceLamports.toString() : null,
    balanceSol: balanceLamports != null ? lamportsToSol(balanceLamports) : null,
    network,
    activeLiabilityLamports: liability.toString(),
    activeLiabilitySol: lamportsToSol(liability),
  };
}

function lamportsToTransferAmount(lamports: bigint): number {
  if (lamports > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error("Lamport amount exceeds safe transfer limit.");
  }
  return Number(lamports);
}

function memoInstruction(signer: PublicKey, memo: string): TransactionInstruction {
  return new TransactionInstruction({
    keys: [{ pubkey: signer, isSigner: true, isWritable: false }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memo, "utf8"),
  });
}

export type VerifyDepositResult =
  | { ok: true; receivedLamports: bigint }
  | { ok: false; error: string };

function collectTransferLamports(
  tx: NonNullable<Awaited<ReturnType<Connection["getParsedTransaction"]>>>,
  escrowPk: PublicKey,
  fromWallet: string | null | undefined,
): { received: bigint; senderOk: boolean } {
  let received = BigInt(0);
  let senderOk = !fromWallet;

  const processIx = (ix: unknown) => {
    if (!ix || typeof ix !== "object") return;
    const parsed =
      "parsed" in ix && ix.parsed
        ? (ix.parsed as { type?: string; info?: Record<string, unknown> })
        : null;
    if (!parsed || parsed.type !== "transfer") return;
    const info = parsed.info ?? {};
    const destination = info.destination as string | undefined;
    const source = info.source as string | undefined;
    const lamports = info.lamports as number | undefined;
    if (destination === escrowPk.toBase58()) {
      received += BigInt(lamports ?? 0);
    }
    if (fromWallet && source === fromWallet) senderOk = true;
  };

  for (const ix of tx.transaction.message.instructions) {
    processIx(ix);
  }

  const inner = tx.meta?.innerInstructions ?? [];
  for (const group of inner) {
    for (const ix of group.instructions) {
      processIx(ix);
    }
  }

  return { received, senderOk };
}

/** Verify a deposit tx sent to the escrow wallet for a bounty. */
export async function verifyDepositTx(
  signature: string,
  expectedLamports: bigint,
  bountyId: string,
  fromWallet?: string | null,
): Promise<VerifyDepositResult> {
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
    const { received, senderOk } = collectTransferLamports(tx, escrowPk, fromWallet);

    if (received !== expectedLamports) {
      return {
        ok: false,
        error: `Deposit amount mismatch. Expected ${lamportsToSol(expectedLamports)} SOL, got ${lamportsToSol(received)} SOL.`,
      };
    }
    if (!senderOk) {
      return { ok: false, error: "Deposit must come from your connected wallet." };
    }

    const memo = bountyMemo(bountyId);
    const legacyMemo = `${LEGACY_MEMO_PREFIX}${bountyId}`;
    const logs = tx.meta?.logMessages ?? [];
    let memoOk = logs.some((l) => l.includes(memo) || l.includes(legacyMemo));
    if (!memoOk) {
      for (const ix of tx.transaction.message.instructions) {
        if (!("programId" in ix) || !ix.programId.equals(MEMO_PROGRAM_ID)) continue;
        if ("data" in ix && typeof ix.data === "string") {
          const text = Buffer.from(ix.data, "base64").toString("utf8");
          if (isExpectedBountyMemo(text, bountyId)) memoOk = true;
        }
      }
    }
    if (!memoOk) {
      return {
        ok: false,
        error: "Deposit memo missing. Rebuild the transaction from the app and try again.",
      };
    }

    return { ok: true, receivedLamports: received };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Verification failed." };
  }
}

type TransferResult = { ok: true; signature: string } | { ok: false; error: string };

async function sendEscrowTransfer(toAddress: string, lamports: bigint): Promise<TransferResult> {
  const kp = escrowKeypair();
  if (!kp) return { ok: false, error: "Escrow signing key not configured." };

  try {
    const conn = connection();
    const to = new PublicKey(toAddress);
    const balance = await conn.getBalance(kp.publicKey);
    if (BigInt(balance) < lamports + FEE_BUFFER_LAMPORTS) {
      return { ok: false, error: "Escrow wallet has insufficient balance." };
    }

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: kp.publicKey,
        toPubkey: to,
        lamports: lamportsToTransferAmount(lamports),
      }),
    );

    const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;
    tx.feePayer = kp.publicKey;

    const signature = await conn.sendTransaction(tx, [kp], { skipPreflight: false });
    await conn.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");

    return { ok: true, signature };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Transfer failed." };
  }
}

/** Release escrowed SOL to the helper's wallet. */
export async function sendPayout(toAddress: string, lamports: bigint): Promise<TransferResult> {
  return sendEscrowTransfer(toAddress, lamports);
}

/** Return escrowed SOL to a wallet (cancel / refund). */
export async function sendRefund(toAddress: string, lamports: bigint): Promise<TransferResult> {
  return sendEscrowTransfer(toAddress, lamports);
}

export async function getEscrowBalanceLamports(): Promise<bigint | null> {
  const address = getEscrowAddress();
  if (!address) return null;
  try {
    const balance = await connection().getBalance(new PublicKey(address));
    return BigInt(balance);
  } catch {
    return null;
  }
}

export async function ensureEscrowCanPay(lamports: bigint): Promise<TransferResult | { ok: true }> {
  const balance = await getEscrowBalanceLamports();
  if (balance == null) return { ok: false, error: "Could not read escrow balance." };
  if (balance < lamports + FEE_BUFFER_LAMPORTS) {
    return { ok: false, error: "Escrow wallet has insufficient balance for this payout." };
  }
  return { ok: true };
}

/** Build an unsigned deposit transaction for the client to sign. */
export async function buildDepositTransaction(
  fromAddress: string,
  lamports: bigint,
  bountyId: string,
): Promise<{ transaction: string; escrowAddress: string; memo: string } | { error: string }> {
  const escrow = getEscrowAddress();
  if (!escrow) return { error: "Escrow wallet not configured." };

  try {
    const conn = connection();
    const from = new PublicKey(fromAddress);
    const to = new PublicKey(escrow);
    const memo = bountyMemo(bountyId);

    const { blockhash } = await conn.getLatestBlockhash("confirmed");
    const tx = new Transaction({
      recentBlockhash: blockhash,
      feePayer: from,
    })
      .add(
        SystemProgram.transfer({
          fromPubkey: from,
          toPubkey: to,
          lamports: lamportsToTransferAmount(lamports),
        }),
      )
      .add(memoInstruction(from, memo));

    const serialized = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
    return {
      transaction: Buffer.from(serialized).toString("base64"),
      escrowAddress: escrow,
      memo,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to build transaction." };
  }
}
