/**
 * Formato venezolano-friendly: separador miles con punto, decimales con coma.
 * Ej: 1.234.567,89 Bs.
 *
 * Para USD usamos formato US estándar (1,234.56) por convención cripto.
 */

const VES_FORMATTER = new Intl.NumberFormat("es-VE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const USD_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const USD_COMPACT_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

const TOKEN_FORMATTER = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 6,
});

export function formatUSD(value: number, opts?: { compact?: boolean }): string {
  if (!Number.isFinite(value)) return "$—";
  if (opts?.compact && Math.abs(value) >= 10_000) {
    return USD_COMPACT_FORMATTER.format(value);
  }
  return USD_FORMATTER.format(value);
}

export function formatBs(value: number): string {
  if (!Number.isFinite(value)) return "Bs. —";
  return `Bs. ${VES_FORMATTER.format(value)}`;
}

export function formatTokenAmount(
  raw: bigint | number,
  decimals: number,
  opts?: { maxDigits?: number }
): string {
  const numeric = typeof raw === "bigint" ? Number(raw) / 10 ** decimals : raw;
  if (!Number.isFinite(numeric)) return "0";
  const max = opts?.maxDigits ?? 6;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: max,
  }).format(numeric);
}

export function shortAddress(address: string, chars = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

export function formatPercent(value: number, opts?: { signed?: boolean }): string {
  if (!Number.isFinite(value)) return "—";
  const sign = opts?.signed && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `hace ${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

/**
 * Convierte un raw amount (bigint/string del API) a número humano según decimales.
 */
export function rawToHuman(raw: string | bigint | number, decimals: number): number {
  const big = typeof raw === "bigint" ? raw : BigInt(raw);
  const divisor = 10 ** decimals;
  return Number(big) / divisor;
}

/**
 * Convierte un input humano (ej "0.5") a raw amount (en lamports/baseUnits) según decimales.
 * Ojo: para montos muy grandes, usar BigInt en el caller.
 */
export function humanToRaw(human: number, decimals: number): bigint {
  const factor = 10 ** decimals;
  return BigInt(Math.round(human * factor));
}
