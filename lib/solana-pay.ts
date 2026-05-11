/**
 * Helpers de Solana Pay para Tropico.
 *
 * Generación de URLs `solana:` para cobros y envíos, generación de QR codes,
 * y polling stub para el listener de pagos (en demo, simulado).
 *
 * Spec oficial: https://docs.solanapay.com
 */

import { TOKENS, type TokenSymbol } from "./tokens";

export type SolanaPayUrlInput = {
  recipient: string; // pubkey base58
  amount: number; // human readable
  tokenSymbol?: TokenSymbol; // default USDC; si es SOL nativo, omitir
  reference?: string; // pubkey base58 — para tracking
  label?: string;
  message?: string;
};

/**
 * Genera una URL Solana Pay según el estándar.
 * Para SPL tokens (USDC, USDT, etc.) incluye el parámetro `spl-token`.
 * Para SOL nativo, lo omite.
 */
export function buildSolanaPayUrl(input: SolanaPayUrlInput): string {
  const symbol = input.tokenSymbol ?? "USDC";
  const url = new URL(`solana:${input.recipient}`);
  url.searchParams.set("amount", String(input.amount));
  if (symbol !== "SOL") {
    url.searchParams.set("spl-token", TOKENS[symbol].mint);
  }
  if (input.reference) {
    url.searchParams.set("reference", input.reference);
  }
  if (input.label) {
    url.searchParams.set("label", input.label);
  }
  if (input.message) {
    url.searchParams.set("message", input.message);
  }
  return url.toString();
}

/**
 * Genera una "reference" pubkey-style aleatoria.
 * Para producción usar `Keypair.generate().publicKey.toBase58()`.
 * Para demo es solo un ID único en formato base58-like.
 */
export function generateReference(): string {
  // 32 chars base58-like (suficiente para demo, no seguro para producción)
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let s = "";
  for (let i = 0; i < 32; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

/**
 * Helper para construir el deep link de WhatsApp con el recibo.
 */
export function whatsappShareUrl(message: string, url?: string): string {
  const text = url ? `${message}\n\n${url}` : message;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Wallet de demo del merchant (placeholder para que /cobrar funcione sin Privy).
 * En producción se reemplaza por la pubkey del wallet conectado.
 */
export const DEMO_MERCHANT_WALLET = "G4BPreo5Sbcr9WDf7ykzJ3yHMBMNHwWacYYxzSs4GSJB";
