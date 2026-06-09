"use client";

import { Transaction } from "@solana/web3.js";
import bs58 from "bs58";
import {
  useSignAndSendTransaction,
  type ConnectedStandardSolanaWallet,
} from "@privy-io/react-auth/solana";

export function useSolanaDeposit() {
  const { signAndSendTransaction } = useSignAndSendTransaction();

  async function sendDeposit(
    wallet: ConnectedStandardSolanaWallet,
    base64Transaction: string,
  ): Promise<string> {
    const tx = Transaction.from(Buffer.from(base64Transaction, "base64"));
    const result = await signAndSendTransaction({
      wallet,
      transaction: tx.serialize({ requireAllSignatures: false, verifySignatures: false }),
    });
    return bs58.encode(result.signature);
  }

  return { sendDeposit };
}
