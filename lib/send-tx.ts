/**
 * Send onchain — transfer SPL token (USDC) o SOL nativo a otra wallet.
 *
 * Usa @solana/web3.js + @solana/spl-token para construir, firmar y broadcast.
 * Funciona con cualquier Keypair (local wallet desbloqueada o dev wallet).
 *
 * AML: aplica checkPerTx ($5k max) antes de firmar.
 */

import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { TOKENS, type TokenSymbol } from "./tokens";
import { getActiveRpcUrl, getActiveCluster } from "./cluster";
import { checkPerTx, recordMovedUsd } from "./aml";

// USDC mints — devnet es distinto de mainnet
const USDC_DEVNET_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

export type SendResult = {
  ok: true;
  signature: string;
  cluster: string;
  explorer: string;
} | {
  ok: false;
  error: string;
};

/** Validar pubkey base58 */
export function isValidPubkey(s: string): boolean {
  try {
    new PublicKey(s);
    return true;
  } catch {
    return false;
  }
}

/**
 * Envía SOL nativo de una wallet a otra.
 */
export async function sendSol(
  fromKeypair: Keypair,
  toPubkey: string,
  amountSol: number
): Promise<SendResult> {
  try {
    if (!isValidPubkey(toPubkey)) {
      return { ok: false, error: "Pubkey destino inválida" };
    }
    // AML check (aprox USD: 1 SOL ≈ $180 mock)
    const usdEstimate = amountSol * 180;
    const aml = checkPerTx(usdEstimate);
    if (!aml.ok) {
      return { ok: false, error: `${aml.message} ${aml.suggested}` };
    }

    const conn = new Connection(getActiveRpcUrl(), "confirmed");
    const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL);

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: new PublicKey(toPubkey),
        lamports,
      })
    );

    const { blockhash } = await conn.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = fromKeypair.publicKey;
    tx.sign(fromKeypair);

    const sig = await conn.sendRawTransaction(tx.serialize());
    await conn.confirmTransaction(sig, "confirmed");

    recordMovedUsd(usdEstimate);
    const cluster = getActiveCluster();
    return {
      ok: true,
      signature: sig,
      cluster,
      explorer: `https://solscan.io/tx/${sig}${cluster === "devnet" ? "?cluster=devnet" : ""}`,
    };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/**
 * Envía un SPL token (USDC, USDT, etc.) de una wallet a otra.
 * Crea ATA destino si no existe (paga el sender).
 */
export async function sendSplToken(
  fromKeypair: Keypair,
  toPubkey: string,
  tokenSymbol: TokenSymbol,
  amount: number
): Promise<SendResult> {
  try {
    if (!isValidPubkey(toPubkey)) {
      return { ok: false, error: "Pubkey destino inválida" };
    }
    if (tokenSymbol === "SOL") {
      return sendSol(fromKeypair, toPubkey, amount);
    }

    // Mint correcto según cluster (USDC tiene mint distinto en devnet)
    const cluster = getActiveCluster();
    let mintAddress = TOKENS[tokenSymbol].mint;
    if (tokenSymbol === "USDC" && cluster === "devnet") {
      mintAddress = USDC_DEVNET_MINT;
    }

    const decimals = TOKENS[tokenSymbol].decimals;
    const usdEstimate = tokenSymbol === "USDC" || tokenSymbol === "USDT" ? amount : amount; // placeholder
    const aml = checkPerTx(usdEstimate);
    if (!aml.ok) {
      return { ok: false, error: `${aml.message} ${aml.suggested}` };
    }

    const conn = new Connection(getActiveRpcUrl(), "confirmed");
    const mint = new PublicKey(mintAddress);
    const toPub = new PublicKey(toPubkey);

    const fromAta = await getAssociatedTokenAddress(mint, fromKeypair.publicKey);
    const toAta = await getAssociatedTokenAddress(mint, toPub);

    const tx = new Transaction();

    // Verificar si la ATA destino existe; si no, crearla
    const toAtaInfo = await conn.getAccountInfo(toAta);
    if (!toAtaInfo) {
      tx.add(
        createAssociatedTokenAccountInstruction(
          fromKeypair.publicKey, // payer
          toAta,
          toPub,
          mint
        )
      );
    }

    // Transfer instruction
    const lamports = BigInt(Math.floor(amount * 10 ** decimals));
    tx.add(
      createTransferInstruction(
        fromAta,
        toAta,
        fromKeypair.publicKey,
        lamports,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    const { blockhash } = await conn.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = fromKeypair.publicKey;
    tx.sign(fromKeypair);

    const sig = await conn.sendRawTransaction(tx.serialize());
    await conn.confirmTransaction(sig, "confirmed");

    recordMovedUsd(usdEstimate);
    return {
      ok: true,
      signature: sig,
      cluster,
      explorer: `https://solscan.io/tx/${sig}${cluster === "devnet" ? "?cluster=devnet" : ""}`,
    };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
