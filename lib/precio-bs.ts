/**
 * Fetch + cache de la tasa USD/VES.
 *
 * Fuente: ve.dolarapi.com — comunidad, devuelve oficial (BCV) y paralelo.
 * Tropico usa el paralelo porque es la realidad para el venezolano que ahorra.
 *
 * Esto se llama desde el API route /api/precio-bs (no exponer cache server-only al client).
 */

const DOLARAPI_URL = "https://ve.dolarapi.com/v1/dolares";

export type PrecioBs = {
  /** Tasa paralelo (la realidad VE) */
  usdToBs: number;
  /** Tasa BCV oficial (referencia) */
  usdToBsOficial: number | null;
  fuente: "ve.dolarapi.com" | "fallback";
  fetchedAt: number; // epoch ms
};

const FALLBACK: PrecioBs = {
  usdToBs: 650, // último valor conocido — actualizar manualmente si hace falta
  usdToBsOficial: 500,
  fuente: "fallback",
  fetchedAt: 0,
};

let cache: PrecioBs | null = null;
const CACHE_MS = 60_000; // 1 min — la tasa no cambia tan rápido como para refrescar cada 30s

type DolarApiEntry = {
  moneda: string;
  fuente: "oficial" | "paralelo";
  nombre: string;
  promedio: number | null;
  compra: number | null;
  venta: number | null;
  fechaActualizacion: string;
};

export async function fetchPrecioBs(): Promise<PrecioBs> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_MS) {
    return cache;
  }

  try {
    const res = await fetch(DOLARAPI_URL, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);

    const data = (await res.json()) as DolarApiEntry[];
    const paralelo = data.find((d) => d.fuente === "paralelo");
    const oficial = data.find((d) => d.fuente === "oficial");

    const paraleloRate = paralelo?.promedio ?? paralelo?.venta ?? paralelo?.compra;
    const oficialRate = oficial?.promedio ?? oficial?.venta ?? oficial?.compra;

    if (typeof paraleloRate !== "number" || paraleloRate <= 0) {
      throw new Error("invalid paralelo rate");
    }

    cache = {
      usdToBs: paraleloRate,
      usdToBsOficial: typeof oficialRate === "number" ? oficialRate : null,
      fuente: "ve.dolarapi.com",
      fetchedAt: Date.now(),
    };
    return cache;
  } catch {
    if (cache) return cache;
    return FALLBACK;
  }
}

export function usdToBs(usd: number, rate: PrecioBs): number {
  if (!Number.isFinite(usd)) return 0;
  return usd * rate.usdToBs;
}

export function bsToUsd(bs: number, rate: PrecioBs): number {
  if (!Number.isFinite(bs) || rate.usdToBs <= 0) return 0;
  return bs / rate.usdToBs;
}
