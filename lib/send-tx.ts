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
 *
 * Pre-check: el sender necesita SOL para gas (~0.000005) Y para crear
 * ATA destino si no existe (~0.002 SOL rent exemption). Sin SOL falla
 * con error críptico de Solana — pre-validamos para dar mensaje claro.
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
    const usdEstimate = tokenSymbol === "USDC" || tokenSymbol === "USDT" ? amount : amount;
    const aml = checkPerTx(usdEstimate);
    if (!aml.ok) {
      return { ok: false, error: `${aml.message} ${aml.suggested}` };
    }

    const conn = new Connection(getActiveRpcUrl(), "confirmed");
    const mint = new PublicKey(mintAddress);
    const toPub = new PublicKey(toPubkey);

    // Pre-check SOL balance del sender (gas + posible rent ATA)
    const senderSolLamports = await conn.getBalance(fromKeypair.publicKey);
    const senderSol = senderSolLamports / LAMPORTS_PER_SOL;
    if (senderSol < 0.003) {
      const faucetCmd = `solana airdrop 2 ${fromKeypair.publicKey.toBase58()} --url ${cluster === "devnet" ? "devnet" : "mainnet-beta"}`;
      return {
        ok: false,
        error: `Tu wallet no tiene SOL para pagar gas (tienes ${senderSol.toFixed(6)} SOL, mínimo ~0.003 para crear ATA destino + gas). ${cluster === "devnet" ? `Pide airdrop con: ${faucetCmd}  o usa https://faucet.solana.com` : "Compra SOL en cualquier exchange y mándalo a tu pubkey antes de enviar."}`,
      };
    }

    const fromAta = await getAssociatedTokenAddress(mint, fromKeypair.publicKey);
    const toAta = await getAssociatedTokenAddress(mint, toPub);

    // Verificar que la ATA del sender existe (debería, si tiene saldo)
    const fromAtaInfo = await conn.getAccountInfo(fromAta);
    if (!fromAtaInfo) {
      return {
        ok: false,
        error: `Tu wallet no tiene cuenta de ${tokenSymbol} en ${cluster}. Recibe ${tokenSymbol} primero (faucet o transfer).`,
      };
    }

    const tx = new Transaction();
    // Crear ATA destino si no existe
    const toAtaInfo = await conn.getAccountInfo(toAta);
    if (!toAtaInfo) {
      tx.add(
        createAssociatedTokenAccountInstruction(
          fromKeypair.publicKey,
          toAta,
          toPub,
          mint
        )
      );
    }

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
    const msg = (e as Error).message;
    // Mejorar errores comunes de Solana
    if (msg.includes("found no record of a prior credit")) {
      return {
        ok: false,
        error: "Tu wallet no tiene SOL para pagar el gas + rent de la ATA destino. Pide airdrop devnet en https://faucet.solana.com (o solana airdrop 2 <pubkey> --url devnet).",
      };
    }
    if (msg.includes("InsufficientFundsForRent")) {
      return {
        ok: false,
        error: "Saldo SOL insuficiente para rent exemption (~0.002 SOL). Pide más SOL devnet.",
      };
    }
    return { ok: false, error: msg };
  }
}
