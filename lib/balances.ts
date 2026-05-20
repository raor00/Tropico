/**
 * Balances on-chain reales vía Helius RPC (o cualquier RPC público).
 *
 * Lee SOL nativo + SPL tokens del wallet activo. No depende de Privy ni Anchor.
 * Solo JSON-RPC standard de Solana.
 */

import { TOKENS, type TokenSymbol } from "./tokens";
import { getActiveRpcUrl, getActiveCluster } from "./cluster";

// Devnet USDC mint es DIFERENTE de mainnet
const USDC_DEVNET_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

export type WalletBalances = {
  sol: number;
  usdc: number;
  usdt: number;
  jup: number;
  jto: number;
  msol: number;
  kmno: number;
  ray: number;
  bonk: number;
  tropi: number;
  // valor total estimado en USD
  totalUsd: number;
  // raw map
  raw: Record<string, number>;
};

/** Devuelve balance SOL en human readable (no lamports) */
export async function fetchSolBalance(pubkey: string): Promise<number> {
  try {
    const res = await fetch(getActiveRpcUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [pubkey],
      }),
    });
    const data = await res.json();
    return (data.result?.value ?? 0) / 1e9;
  } catch (e) {
    console.error("[balances] getBalance failed:", e);
    return 0;
  }
}

/** Devuelve balance de un SPL token específico (uiAmount human readable) */
export async function fetchSplBalance(
  pubkey: string,
  mint: string
): Promise<number> {
  try {
    const res = await fetch(getActiveRpcUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenAccountsByOwner",
        params: [pubkey, { mint }, { encoding: "jsonParsed" }],
      }),
    });
    const data = await res.json();
    const accounts = data.result?.value ?? [];
    if (accounts.length === 0) return 0;
    // Sumar todos los token accounts del mismo mint
    let total = 0;
    for (const acc of accounts) {
      const ta = acc.account?.data?.parsed?.info?.tokenAmount;
      total += Number(ta?.uiAmountString ?? ta?.uiAmount ?? 0);
    }
    return total;
  } catch (e) {
    console.error(`[balances] getTokenAccountsByOwner ${mint} failed:`, e);
    return 0;
  }
}

// SPL Token program (clásico). Token-2022 usa otro programId — fuera de scope demo.
const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

/**
 * Lee TODOS los token accounts del owner en UNA sola llamada RPC
 * (getTokenAccountsByOwner por programId) y devuelve mint → uiAmount.
 * Evita N llamadas (una por mint), que era el cuello de botella de carga.
 */
async function fetchAllTokenAmounts(
  pubkey: string
): Promise<Record<string, number>> {
  try {
    const res = await fetch(getActiveRpcUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenAccountsByOwner",
        params: [
          pubkey,
          { programId: TOKEN_PROGRAM_ID },
          { encoding: "jsonParsed" },
        ],
      }),
    });
    const data = await res.json();
    const accounts = data.result?.value ?? [];
    const byMint: Record<string, number> = {};
    for (const acc of accounts) {
      const info = acc.account?.data?.parsed?.info;
      const mint = info?.mint;
      if (!mint) continue;
      const ta = info.tokenAmount;
      const amount = Number(ta?.uiAmountString ?? ta?.uiAmount ?? 0);
      byMint[mint] = (byMint[mint] ?? 0) + amount;
    }
    return byMint;
  } catch (e) {
    console.error("[balances] getTokenAccountsByOwner failed:", e);
    return {};
  }
}

/** Lee TODOS los balances de los tokens curados */
export async function fetchAllBalances(
  pubkey: string
): Promise<WalletBalances> {
  // En devnet USDC tiene mint DISTINTO al mainnet — usar el correcto
  const cluster = getActiveCluster();
  const usdcMint = cluster === "devnet" ? USDC_DEVNET_MINT : TOKENS.USDC.mint;

  // Tokens del catálogo Tropico (excepto SOL que es nativo)
  const splTokens: { symbol: TokenSymbol; mint: string }[] = [
    { symbol: "USDC", mint: usdcMint },
    { symbol: "USDT", mint: TOKENS.USDT.mint },
    { symbol: "JUP", mint: TOKENS.JUP.mint },
    { symbol: "JTO", mint: TOKENS.JTO.mint },
    { symbol: "mSOL", mint: TOKENS.mSOL.mint },
    { symbol: "KMNO", mint: TOKENS.KMNO.mint },
    { symbol: "RAY", mint: TOKENS.RAY.mint },
    { symbol: "BONK", mint: TOKENS.BONK.mint },
  ];

  // TROPI test token solo existe en devnet (mint nuestro)
  if (cluster === "devnet") {
    splTokens.push({ symbol: "TROPI", mint: TOKENS.TROPI.mint });
  }

  // 2 RPC calls totales: SOL nativo + todos los SPL en una sola query.
  const [sol, amountsByMint] = await Promise.all([
    fetchSolBalance(pubkey),
    fetchAllTokenAmounts(pubkey),
  ]);

  const raw: Record<string, number> = { SOL: sol };
  splTokens.forEach((t) => {
    raw[t.symbol] = amountsByMint[t.mint] ?? 0;
  });

  // Estimación USD muy básica — para demo. Producción: Jupiter Price API.
  const usdEstimates: Record<string, number> = {
    SOL: 180,
    USDC: 1,
    USDT: 1,
    JUP: 0.85,
    JTO: 3.2,
    mSOL: 200,
    KMNO: 0.08,
    RAY: 4.5,
    BONK: 0.000020,
    TROPI: 0, // devnet test token, sin precio mainnet
  };

  let totalUsd = 0;
  for (const [sym, amount] of Object.entries(raw)) {
    totalUsd += amount * (usdEstimates[sym] ?? 0);
  }

  return {
    sol,
    usdc: raw.USDC,
    usdt: raw.USDT,
    jup: raw.JUP,
    jto: raw.JTO,
    msol: raw.mSOL,
    kmno: raw.KMNO,
    ray: raw.RAY,
    bonk: raw.BONK,
    tropi: raw.TROPI ?? 0,
    totalUsd,
    raw,
  };
}

/** Estado vacío para placeholder mientras carga */
export const EMPTY_BALANCES: WalletBalances = {
  sol: 0,
  usdc: 0,
  usdt: 0,
  jup: 0,
  jto: 0,
  msol: 0,
  kmno: 0,
  ray: 0,
  bonk: 0,
  tropi: 0,
  totalUsd: 0,
  raw: {},
};
