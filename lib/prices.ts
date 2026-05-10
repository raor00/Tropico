/**
 * Precios on-chain en vivo via Jupiter Price API v3.
 *
 * Endpoint: https://lite-api.jup.ag/price/v3?ids=<mint1,mint2,...>
 * Free tier, sin API key. Devuelve usdPrice + priceChange24h.
 *
 * Caché en memoria 60s para no spamear el endpoint en re-renders.
 * Si Jupiter falla, fallback a precios estimados estáticos.
 */

import { TOKENS, TOKEN_LIST, type TokenSymbol } from "./tokens";

export type TokenPrice = {
  /** Precio actual en USD */
  usd: number;
  /** % cambio 24h (signed: -2.3 = bajó 2.3%) */
  change24h: number;
};

type Cached = {
  data: Record<string, TokenPrice>;
  ts: number;
};

const CACHE_TTL_MS = 60_000;
let cache: Cached | null = null;

const FALLBACK_PRICES: Record<TokenSymbol, TokenPrice> = {
  SOL: { usd: 180, change24h: 0 },
  USDC: { usd: 1, change24h: 0 },
  USDT: { usd: 1, change24h: 0 },
  JUP: { usd: 0.85, change24h: 0 },
  JTO: { usd: 3.2, change24h: 0 },
  mSOL: { usd: 200, change24h: 0 },
  KMNO: { usd: 0.08, change24h: 0 },
  RAY: { usd: 4.5, change24h: 0 },
  BONK: { usd: 0.000020, change24h: 0 },
  TROPI: { usd: 0, change24h: 0 },
};

/**
 * Devuelve precios live por mint. Llama Jupiter v3 con todos los mints del
 * catálogo. Cachea 60s. Devuelve fallback estático si la API falla.
 */
export async function fetchPrices(): Promise<Record<TokenSymbol, TokenPrice>> {
  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    return mapByMintToBySymbol(cache.data);
  }

  const mints = TOKEN_LIST.map((t) => t.mint).join(",");
  const url = `https://lite-api.jup.ag/price/v3?ids=${mints}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      // Next.js: revalidate cada 60s server-side
      next: { revalidate: 60 } as RequestInit["next"],
    });
    if (!res.ok) throw new Error(`Jupiter ${res.status}`);
    const json = (await res.json()) as Record<
      string,
      { usdPrice?: number; priceChange24h?: number }
    >;

    const byMint: Record<string, TokenPrice> = {};
    for (const [mint, val] of Object.entries(json)) {
      byMint[mint] = {
        usd: Number(val?.usdPrice ?? 0),
        change24h: Number(val?.priceChange24h ?? 0),
      };
    }
    cache = { data: byMint, ts: Date.now() };
    return mapByMintToBySymbol(byMint);
  } catch (e) {
    console.warn("[prices] Jupiter v3 failed, usando fallback:", e);
    return { ...FALLBACK_PRICES };
  }
}

function mapByMintToBySymbol(
  byMint: Record<string, TokenPrice>
): Record<TokenSymbol, TokenPrice> {
  const result = { ...FALLBACK_PRICES };
  for (const t of TOKEN_LIST) {
    const price = byMint[t.mint];
    if (price && price.usd > 0) {
      result[t.symbol] = price;
    }
  }
  return result;
}

/** Helper sync para componentes que ya tienen el resultado en estado */
export function getUsdPrice(
  prices: Record<TokenSymbol, TokenPrice>,
  symbol: TokenSymbol
): number {
  return prices[symbol]?.usd ?? FALLBACK_PRICES[symbol]?.usd ?? 0;
}

export function getChange24h(
  prices: Record<TokenSymbol, TokenPrice>,
  symbol: TokenSymbol
): number {
  return prices[symbol]?.change24h ?? 0;
}
