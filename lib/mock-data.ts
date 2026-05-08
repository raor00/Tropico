/**
 * Datos mock para demo sin wallet conectada.
 *
 * En cuanto el usuario tenga API keys (Privy + Helius), estos mocks se
 * reemplazan por lecturas reales de balances vía `lib/balances.ts`.
 *
 * Mantener números realistas para no romper la inmersión del demo.
 */

import type { TokenSymbol } from "./tokens";

export type MockBalance = {
  symbol: TokenSymbol;
  amount: number; // human readable
  valueUSD: number; // valor actual en USD
  cambio24h: number; // % cambio 24h
};

export const MOCK_BALANCES: MockBalance[] = [
  { symbol: "USDC", amount: 247.30, valueUSD: 247.30, cambio24h: 0 },
  { symbol: "SOL", amount: 0.428, valueUSD: 64.20, cambio24h: 2.4 },
  { symbol: "JTO", amount: 12.5, valueUSD: 28.75, cambio24h: -1.2 },
  { symbol: "mSOL", amount: 0.05, valueUSD: 8.40, cambio24h: 1.8 },
];

export const MOCK_PORTFOLIO = {
  total: MOCK_BALANCES.reduce((acc, b) => acc + b.valueUSD, 0), // $348.65
  yieldGanadoSemana: 0.48,
  yieldGanadoMes: 2.05,
  apyActual: 5.2,
  walletAddress: "7xKXt3...kJh92",
  ultimaActividad: Date.now() - 1000 * 60 * 30, // hace 30 min
};

export const MOCK_CASHBACK_PENDIENTE = {
  total: 3.20,
  comerciosCount: 4,
  ultimoCobro: Date.now() - 1000 * 60 * 60 * 6, // hace 6h
};

export const MOCK_NEXT_DCA = {
  monto: 50,
  tokenDestino: "SOL" as const,
  proximaEjecucion: nextMonday10am(),
};

function nextMonday10am(): number {
  const now = new Date();
  const day = now.getDay();
  const daysUntilMonday = (8 - day) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilMonday);
  next.setHours(10, 0, 0, 0);
  return next.getTime();
}
