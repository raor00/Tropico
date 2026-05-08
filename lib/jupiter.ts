/**
 * Jupiter v6 Quote + Swap API client.
 *
 * Documentación: https://dev.jup.ag/docs/swap-api/
 *
 * Importante para Tropico:
 *  - Pasamos `platformFeeBps=50` (0.5% de comisión a Tropico).
 *  - El `feeAccount` debe ser una ATA propia (de Tropico) para el mint de SALIDA del swap.
 *    Por eso pre-creamos ATAs para varios mints comunes.
 *  - Para devnet, este endpoint NO funciona (Jupiter solo está en mainnet).
 *    Para demo final, NEXT_PUBLIC_SOLANA_CLUSTER=mainnet-beta.
 */

import { TOKENS } from "./tokens";

const JUPITER_QUOTE_URL = "https://lite-api.jup.ag/swap/v1/quote";
const JUPITER_SWAP_URL = "https://lite-api.jup.ag/swap/v1/swap";

const PLATFORM_FEE_BPS = 50; // 0.5%

export type JupiterQuote = {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: "ExactIn" | "ExactOut";
  slippageBps: number;
  platformFee?: { amount: string; feeBps: number } | null;
  priceImpactPct: string;
  routePlan: unknown[];
  contextSlot?: number;
  timeTaken?: number;
};

export type SwapTxResponse = {
  swapTransaction: string; // base64-encoded VersionedTransaction
  lastValidBlockHeight: number;
  prioritizationFeeLamports?: number;
};

/**
 * Mapa de mint → ATA de Tropico que recibe la fee.
 * Llenar en .env.local con NEXT_PUBLIC_TROPICO_FEE_ATA_USDC, _SOL, etc.
 * Si no hay ATA configurada para un mint específico, NO pasamos feeAccount
 * y Jupiter procesa el swap sin platform fee (no error, solo no cobramos).
 */
function getFeeAccountForMint(outputMint: string): string | undefined {
  const map: Record<string, string | undefined> = {
    [TOKENS.USDC.mint]: process.env.NEXT_PUBLIC_TROPICO_FEE_ATA_USDC,
    [TOKENS.SOL.mint]: process.env.NEXT_PUBLIC_TROPICO_FEE_ATA_SOL,
    [TOKENS.USDT.mint]: process.env.NEXT_PUBLIC_TROPICO_FEE_ATA_USDT,
  };
  return map[outputMint];
}

export async function getQuote(args: {
  inputMint: string;
  outputMint: string;
  amount: bigint | string;
  slippageBps?: number;
}): Promise<JupiterQuote> {
  const params = new URLSearchParams({
    inputMint: args.inputMint,
    outputMint: args.outputMint,
    amount: args.amount.toString(),
    slippageBps: String(args.slippageBps ?? 50),
    platformFeeBps: String(PLATFORM_FEE_BPS),
    swapMode: "ExactIn",
  });

  const url = `${JUPITER_QUOTE_URL}?${params.toString()}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Jupiter quote failed (${res.status}): ${body}`);
  }
  return res.json();
}

export async function buildSwapTransaction(args: {
  quote: JupiterQuote;
  userPublicKey: string;
  /** Auto-cierra el WSOL ATA después del swap si el output es SOL nativo (true por defecto) */
  wrapAndUnwrapSol?: boolean;
}): Promise<SwapTxResponse> {
  const feeAccount = getFeeAccountForMint(args.quote.outputMint);

  const body = {
    quoteResponse: args.quote,
    userPublicKey: args.userPublicKey,
    wrapAndUnwrapSol: args.wrapAndUnwrapSol ?? true,
    dynamicComputeUnitLimit: true,
    prioritizationFeeLamports: "auto",
    ...(feeAccount ? { feeAccount } : {}),
  };

  const res = await fetch(JUPITER_SWAP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Jupiter swap build failed (${res.status}): ${text}`);
  }
  return res.json();
}

/**
 * Calcula el precio efectivo (output / input) para mostrar al usuario.
 * Útil para mostrar "1 SOL = 142.31 USDC" en la UI.
 */
export function computePrice(
  quote: JupiterQuote,
  inputDecimals: number,
  outputDecimals: number
): number {
  const inHuman = Number(quote.inAmount) / 10 ** inputDecimals;
  const outHuman = Number(quote.outAmount) / 10 ** outputDecimals;
  if (inHuman === 0) return 0;
  return outHuman / inHuman;
}

/**
 * Calcula la comisión de Tropico en valor humano del token de salida.
 */
export function computePlatformFee(
  quote: JupiterQuote,
  outputDecimals: number
): number {
  if (!quote.platformFee?.amount) return 0;
  return Number(quote.platformFee.amount) / 10 ** outputDecimals;
}
