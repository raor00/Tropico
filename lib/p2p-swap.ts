/**
 * Tropico P2P Bs↔USDC — matching aleatorio + liquidity pool fallback.
 *
 * CONCEPTO
 * Usuarios postean intents: "tengo Bs y quiero USDC" o "tengo USDC y quiero Bs".
 * El motor agrupa intents en epochs cortos (10 segundos), randomiza el orden
 * dentro del epoch, y matchea por equidad — NO FIFO, NO biggest-bid-first.
 * Cualquier usuario tiene la misma probabilidad de match independiente del monto.
 *
 * Si en un epoch no hay contraparte directa, se cubre con la **liquidity pool
 * de Bs** (treasury de Tropico que mantiene Bs líquidos para flujo constante).
 *
 * Carlos AI by Lumen monitorea cada epoch:
 *  - Detecta intents nuevos via webhook on-chain
 *  - Valida que el sender tenga el balance que dice tener
 *  - Ejecuta el match (firma con session key delegada en Q3)
 *  - Reporta al usuario por chat o push
 *  - Audita post-tx que ambos lados recibieron lo prometido
 *
 * Settlement target: <1 segundo después del cierre del epoch (10s + 1s = 11s
 * end-to-end típico para el peor caso).
 *
 * MVP demo: matching simulado client-side. Producción Q3: orderbook on-chain
 * con program Anchor mínimo (~150 LOC) o adapter sobre Squads escrow.
 */

import type { TokenSymbol } from "./tokens";

export type IntentSide = "sell-bs" | "buy-bs";
// "sell-bs" = tengo Bs, quiero USDC
// "buy-bs"  = tengo USDC, quiero Bs

export type SwapIntent = {
  /** ID único del intent (32 char base58) */
  id: string;
  /** Wallet del usuario */
  wallet: string;
  /** Lado del intent */
  side: IntentSide;
  /** Monto en Bs (si side=sell-bs) o en USDC (si side=buy-bs) */
  amount: number;
  /** Tasa máxima/mínima aceptada (Bs por USDC) — 0 = aceptar tasa de epoch */
  rateLimit: number;
  /** Timestamp ISO */
  createdAt: string;
  /** Estado */
  status: "pending" | "matched" | "settled" | "expired" | "cancelled";
  /** Match info (después de matching) */
  match?: {
    counterparty: "user" | "liquidity-pool";
    counterpartyId: string;
    epochId: string;
    rate: number;
    bsAmount: number;
    usdcAmount: number;
    settledAt: string;
    txSignature: string; // demo o real
  };
};

export type Epoch = {
  id: string;
  startedAt: string;
  closedAt?: string;
  intents: SwapIntent[];
  rate: number; // Bs/USDC del momento (snapshot)
  matches: Array<{
    intentA: string;
    intentB: string | "POOL";
    bsAmount: number;
    usdcAmount: number;
  }>;
};

const EPOCH_DURATION_MS = 10_000; // 10 segundos
const POOL_BS_LIQUIDITY = 50_000_000; // Bs disponibles en pool — mock MVP
const POOL_USDC_LIQUIDITY = 10_000; // USDC disponibles en pool — mock MVP

/* ─────────────────────────────────────────────────────────── */
/* Matching engine                                              */
/* ─────────────────────────────────────────────────────────── */

/**
 * Cierra un epoch: randomiza intents, intenta matching peer-to-peer,
 * cubre el resto con liquidity pool. Devuelve el resumen.
 *
 * Algoritmo de fairness:
 * 1. Shuffle Fisher-Yates con seed pública (block hash del epoch close)
 * 2. Iterar en orden randomizado
 * 3. Para cada intent, buscar contraparte del lado opuesto que matche
 *    rate (si rateLimit > 0) y monto compatible
 * 4. Match parcial permitido (un sell-bs de 1M Bs puede matchear con
 *    múltiples buy-bs de 100k Bs cada uno)
 * 5. Lo que no matchea peer-to-peer va al pool si hay liquidez
 * 6. Lo que no cubre el pool queda pending para el próximo epoch
 */
export function closeEpoch(
  epoch: Epoch,
  poolBsAvailable: number = POOL_BS_LIQUIDITY,
  poolUsdcAvailable: number = POOL_USDC_LIQUIDITY,
  rngSeed?: string
): Epoch {
  const rate = epoch.rate;
  const intents = [...epoch.intents].filter((i) => i.status === "pending");

  // 1. Shuffle Fisher-Yates con seed pública para reproducibilidad on-chain
  const shuffled = shuffleWithSeed(intents, rngSeed ?? defaultSeed());

  // 2. Separar por lado
  const sellBs = shuffled.filter((i) => i.side === "sell-bs");
  const buyBs = shuffled.filter((i) => i.side === "buy-bs");

  const matches: Epoch["matches"] = [];

  // 3. Match peer-to-peer iterando intents random
  for (const intentA of sellBs) {
    if (intentA.status !== "pending") continue;

    let bsRemaining = intentA.amount;

    for (const intentB of buyBs) {
      if (intentB.status !== "pending" || bsRemaining <= 0) continue;

      const bsNeeded = intentB.amount * rate; // USDC * rate = Bs equivalente

      // ¿Las rates son compatibles?
      if (
        intentA.rateLimit > 0 &&
        rate < intentA.rateLimit
      )
        continue; // sell-bs quería más Bs por USDC, no acepta este rate
      if (
        intentB.rateLimit > 0 &&
        rate > intentB.rateLimit
      )
        continue; // buy-bs no quería pagar tantos Bs por USDC

      const bsToMatch = Math.min(bsRemaining, bsNeeded);
      const usdcToMatch = bsToMatch / rate;

      matches.push({
        intentA: intentA.id,
        intentB: intentB.id,
        bsAmount: bsToMatch,
        usdcAmount: usdcToMatch,
      });

      bsRemaining -= bsToMatch;
      const bsConsumed = (intentB.amount * rate - bsNeeded + bsToMatch);
      intentB.amount = (bsNeeded - bsToMatch) / rate;

      if (intentB.amount <= 0.01) {
        intentB.status = "matched";
      }
    }

    if (bsRemaining <= 0.01) {
      intentA.status = "matched";
      intentA.amount = 0;
    } else {
      intentA.amount = bsRemaining; // queda parcial pendiente
    }
  }

  // 4. Cubrir pendientes con liquidity pool
  for (const intent of [...sellBs, ...buyBs]) {
    if (intent.status !== "pending" || intent.amount <= 0) continue;

    if (intent.side === "sell-bs") {
      // pool da USDC, recibe Bs
      const usdcNeeded = intent.amount / rate;
      if (poolUsdcAvailable >= usdcNeeded) {
        matches.push({
          intentA: intent.id,
          intentB: "POOL",
          bsAmount: intent.amount,
          usdcAmount: usdcNeeded,
        });
        poolUsdcAvailable -= usdcNeeded;
        intent.status = "matched";
      }
    } else {
      // pool da Bs, recibe USDC
      const bsNeeded = intent.amount * rate;
      if (poolBsAvailable >= bsNeeded) {
        matches.push({
          intentA: intent.id,
          intentB: "POOL",
          bsAmount: bsNeeded,
          usdcAmount: intent.amount,
        });
        poolBsAvailable -= bsNeeded;
        intent.status = "matched";
      }
    }
  }

  return {
    ...epoch,
    closedAt: new Date().toISOString(),
    matches,
    intents: shuffled,
  };
}

/* ─────────────────────────────────────────────────────────── */
/* Helpers                                                      */
/* ─────────────────────────────────────────────────────────── */

function shuffleWithSeed<T>(arr: T[], seed: string): T[] {
  const out = [...arr];
  let h = hashString(seed);
  for (let i = out.length - 1; i > 0; i--) {
    h = (h * 1664525 + 1013904223) >>> 0;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h = (h ^ s.charCodeAt(i)) >>> 0;
    h = (h * 16777619) >>> 0;
  }
  return h;
}

function defaultSeed(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/** Genera ID base58-like 32 char */
export function generateIntentId(): string {
  const chars =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let s = "";
  for (let i = 0; i < 32; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

/* ─────────────────────────────────────────────────────────── */
/* Pool state — mock MVP en localStorage. Producción: PDA      */
/* ─────────────────────────────────────────────────────────── */

const POOL_STORAGE = "tropico:p2p-pool:v1";

export type PoolState = {
  bsAvailable: number;
  usdcAvailable: number;
  totalVolumeUsdc: number;
  totalSwapsCount: number;
};

export function getPoolState(): PoolState {
  if (typeof window === "undefined") {
    return defaultPoolState();
  }
  const raw = localStorage.getItem(POOL_STORAGE);
  if (!raw) return defaultPoolState();
  try {
    return JSON.parse(raw) as PoolState;
  } catch {
    return defaultPoolState();
  }
}

function defaultPoolState(): PoolState {
  return {
    bsAvailable: POOL_BS_LIQUIDITY,
    usdcAvailable: POOL_USDC_LIQUIDITY,
    totalVolumeUsdc: 0,
    totalSwapsCount: 0,
  };
}

export const P2P_CONFIG = {
  EPOCH_DURATION_MS,
  POOL_BS_LIQUIDITY,
  POOL_USDC_LIQUIDITY,
} as const;
