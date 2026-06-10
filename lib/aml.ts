/**
 * AML — Anti Money Laundering limits (CLIENT-SIDE — NON-AUTHORITATIVE).
 *
 * This module is used for UX hints only (disable buttons, show warnings before
 * the user submits). It DOES NOT enforce limits — localStorage can be cleared
 * or bypassed by any caller.
 *
 * The authoritative enforcement happens server-side in lib/aml-server.ts,
 * which persists accumulated totals in Supabase and is called from every
 * checkout and payment API route.
 *
 * Tropico aplica límites HARD por transacción para prevenir lavado.
 * Si el usuario quiere mover más, debe dividir en N transacciones.
 *
 * Estos límites son política del producto MVP. En producción Q3 se ajustan
 * según jurisdicción (FATF, FinCEN, BCV) y nivel de KYC del usuario.
 */

export const AML_LIMITS = {
  /** Por transacción individual */
  PER_TX_USD: 5_000,
  /** Por usuario por día (acumulado) */
  PER_DAY_USD: 20_000,
  /** Por usuario por mes */
  PER_MONTH_USD: 100_000,
} as const;

export type AmlCheck =
  | { ok: true }
  | { ok: false; code: "exceeds_per_tx" | "exceeds_per_day" | "exceeds_per_month"; message: string; limit: number; suggested: string };

/**
 * Valida un monto contra el límite por transacción.
 * Si excede, devuelve el mensaje + sugerencia de dividir.
 */
export function checkPerTx(amountUsd: number): AmlCheck {
  if (amountUsd <= AML_LIMITS.PER_TX_USD) return { ok: true };
  const splits = Math.ceil(amountUsd / AML_LIMITS.PER_TX_USD);
  return {
    ok: false,
    code: "exceeds_per_tx",
    limit: AML_LIMITS.PER_TX_USD,
    message: `Excede el límite de $${AML_LIMITS.PER_TX_USD.toLocaleString()} por transacción.`,
    suggested: `Divide tu operación en ${splits} transacciones de hasta $${AML_LIMITS.PER_TX_USD.toLocaleString()} cada una. Esto es política anti-lavado de Tropico.`,
  };
}

/**
 * Valida acumulado del día. Necesita el total ya movido hoy (mock localStorage MVP).
 */
export function checkPerDay(amountUsd: number, alreadyTodayUsd: number): AmlCheck {
  const total = amountUsd + alreadyTodayUsd;
  if (total <= AML_LIMITS.PER_DAY_USD) return { ok: true };
  const remaining = Math.max(0, AML_LIMITS.PER_DAY_USD - alreadyTodayUsd);
  return {
    ok: false,
    code: "exceeds_per_day",
    limit: AML_LIMITS.PER_DAY_USD,
    message: `Excede el límite diario de $${AML_LIMITS.PER_DAY_USD.toLocaleString()}.`,
    suggested:
      remaining > 0
        ? `Hoy puedes mover hasta $${remaining.toLocaleString()} más. El resto se libera mañana.`
        : `Ya alcanzaste tu límite diario. Se reinicia a las 00:00 UTC.`,
  };
}

/** Lee acumulado del día desde localStorage (MVP — backend Q3) */
export function getTodayMovedUsd(): number {
  if (typeof window === "undefined") return 0;
  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = localStorage.getItem("tropico:aml:daily");
    if (!raw) return 0;
    const data = JSON.parse(raw) as { date: string; usd: number };
    return data.date === today ? data.usd : 0;
  } catch {
    return 0;
  }
}

/** Marca movimiento del día */
export function recordMovedUsd(amountUsd: number) {
  if (typeof window === "undefined") return;
  const today = new Date().toISOString().slice(0, 10);
  const current = getTodayMovedUsd();
  localStorage.setItem(
    "tropico:aml:daily",
    JSON.stringify({ date: today, usd: current + amountUsd })
  );
}
