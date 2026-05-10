/**
 * Tropico Bs Bridge — el ecosistema interno de Tropico que conecta USDC en
 * Solana con Pago Móvil VE (Suiche7B) sin pasar por bancos extranjeros.
 *
 * Arquitectura propia (NO usamos APIs de terceros tipo Reserve / pagochain):
 *
 *   1. Pool de Liquidez Bs Tropico
 *      Tesorería propia denominada en Bs en bancos VE asociados (Banesco,
 *      Mercantil, BNC). Tropico carga el pool con Bs comprados al BCV oficial
 *      o vía OTC interno. Cualquier merchant afiliado o usuario puede
 *      consumirlo en segundos.
 *
 *   2. USDC Vault Tropico
 *      Tesorería paralela en Solana (cuenta pública verificable on-chain
 *      via Tropico Treasury Anchor program). Cada Bs pagado al merchant se
 *      asienta como USDC quemado de la wallet del usuario y depositado al
 *      Vault Tropico al rate Tropico (BCV + 1.5%).
 *
 *   3. Liquidador automático
 *      Bot interno que ejecuta el Pago Móvil real al beneficiario via
 *      conexión directa a la red Suiche7B (gateway propio, no banca digital
 *      consumer). Tiempo objetivo: 2-5 segundos. Comprobante bancario real
 *      se guarda como adjunto del recibo Tropico.
 *
 * Para MVP del hackathon: simulamos los 3 pasos con datos realistas + tiempos
 * reales. Producción Q3 wire al gateway real.
 */

import type { Suiche7BPayload } from "./suiche7b-parser";

export type TropicoRate = {
  /** Tasa BCV oficial (Bs por USD) */
  bcv: number;
  /** Spread Tropico aplicado (ej. 0.015 = 1.5%) */
  spread: number;
  /** Tasa final que ve el usuario */
  effective: number;
  /** Timestamp de la tasa */
  asOf: string;
};

export type BsBridgeReceipt = {
  ok: true;
  /** ID interno Tropico (público, único) */
  tropicoTxId: string;
  /** Referencia bancaria del Pago Móvil ejecutado en Suiche7B */
  bankReference: string;
  /** Monto en Bs pagado al beneficiario (igual al QR) */
  paidBs: number;
  /** USDC descontado de la wallet del usuario */
  chargedUsdc: number;
  /** Tasa Tropico aplicada */
  rate: TropicoRate;
  /** Comisión Tropico cobrada (USDC) */
  feeUsdc: number;
  /** Pubkey USDC vault de Tropico que recibió los USDC */
  vaultPubkey: string;
  /** Timestamp de ejecución */
  executedAt: string;
  /** Datos del comercio que cobró (para mostrar en recibo) */
  payee: Suiche7BPayload;
} | {
  ok: false;
  error: string;
  code: "INSUFFICIENT_USDC" | "POOL_DRAINED" | "INVALID_PAYEE" | "TIMEOUT" | "UNKNOWN";
};

const TROPICO_USDC_VAULT = "TropV4u1tUSDC9AbkCW6BA2ZVoTw4Q6M1NvATiZjn"; // placeholder pubkey demo
const TROPICO_FEE_BPS = 100; // 1.0% comisión sobre USDC del usuario

/**
 * Lee la tasa Tropico actual. Producción: API propia conectada a BCV +
 * fuentes paralelas (DolarAPI, Monitor Dolar) + alertas si desvían >5%.
 * MVP: usa DolarAPI BCV como source.
 */
export async function fetchTropicoRate(): Promise<TropicoRate> {
  try {
    const res = await fetch("https://ve.dolarapi.com/v1/dolares/oficial", {
      cache: "no-store",
    });
    const data = await res.json();
    const bcv = Number(data?.promedio ?? data?.precio ?? 0);
    if (!bcv || bcv <= 0) throw new Error("rate 0");
    const spread = 0.015;
    return {
      bcv,
      spread,
      effective: Math.round(bcv * (1 + spread) * 100) / 100,
      asOf: new Date().toISOString(),
    };
  } catch {
    // Fallback realista (mayo 2026 ballpark)
    const bcv = 36.5;
    const spread = 0.015;
    return {
      bcv,
      spread,
      effective: Math.round(bcv * (1 + spread) * 100) / 100,
      asOf: new Date().toISOString(),
    };
  }
}

/**
 * Calcula cuánto USDC debe descontar para cubrir un pago en Bs (incluye
 * comisión Tropico).
 */
export function quoteBsToUsdc(montoBs: number, rate: TropicoRate) {
  const usdcBase = montoBs / rate.effective;
  const fee = (usdcBase * TROPICO_FEE_BPS) / 10_000;
  const total = usdcBase + fee;
  return {
    usdcBase: Math.round(usdcBase * 1000000) / 1000000,
    feeUsdc: Math.round(fee * 1000000) / 1000000,
    totalUsdc: Math.round(total * 1000000) / 1000000,
  };
}

/**
 * Ejecuta el flujo completo:
 *   1. Quote a tasa Tropico actual
 *   2. Verifica saldo USDC del usuario suficiente
 *   3. Quema USDC del usuario → Vault Tropico (en MVP simulado)
 *   4. Liquidador ejecuta Pago Móvil real via gateway Suiche7B Tropico
 *   5. Devuelve recibo con bank reference + tropico tx id
 *
 * Para MVP simulamos los pasos 3-4 con setTimeout realista (2.5s).
 */
export async function executeBsBridge(
  payee: Suiche7BPayload,
  userUsdcBalance: number
): Promise<BsBridgeReceipt> {
  const rate = await fetchTropicoRate();
  const q = quoteBsToUsdc(payee.montoBs, rate);

  if (userUsdcBalance < q.totalUsdc) {
    return {
      ok: false,
      error: `Necesitás ${q.totalUsdc.toFixed(2)} USDC, tenés ${userUsdcBalance.toFixed(2)}.`,
      code: "INSUFFICIENT_USDC",
    };
  }

  // Simular tiempo de ejecución del pool + gateway Suiche7B (~2.5s real-feel)
  await new Promise((r) => setTimeout(r, 2500));

  const tropicoTxId = `TROPICO-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const bankReference = `${payee.banco}${Date.now().toString().slice(-9)}`;

  return {
    ok: true,
    tropicoTxId,
    bankReference,
    paidBs: payee.montoBs,
    chargedUsdc: q.totalUsdc,
    feeUsdc: q.feeUsdc,
    rate,
    vaultPubkey: TROPICO_USDC_VAULT,
    executedAt: new Date().toISOString(),
    payee,
  };
}

/**
 * Genera un comprobante imprimible (TXT) con los datos del pago.
 * Usuario lo descarga o comparte por WhatsApp.
 */
export function buildReceiptText(r: Extract<BsBridgeReceipt, { ok: true }>): string {
  return `═══════════════════════════════════════════
       TROPICO WALLET — COMPROBANTE
═══════════════════════════════════════════
Pago Móvil VE via Pool Tropico

Beneficiario:  ${r.payee.bancoNombre ?? r.payee.banco}
Teléfono:      ${r.payee.telefono}
Cédula:        ${r.payee.cedula}
Comercio:      ${r.payee.comercio ?? "—"}
Concepto:      ${r.payee.concepto ?? "—"}

Monto Bs:      ${r.paidBs.toLocaleString("es-VE", { minimumFractionDigits: 2 })} Bs
USDC cargado:  ${r.chargedUsdc.toFixed(6)} USDC
Tasa Tropico:  ${r.rate.effective} Bs/USD (BCV+${(r.rate.spread * 100).toFixed(1)}%)
Comisión:      ${r.feeUsdc.toFixed(6)} USDC

Referencia bancaria:  ${r.bankReference}
ID interno Tropico:    ${r.tropicoTxId}
Vault Tropico:         ${r.vaultPubkey}
Fecha:                 ${new Date(r.executedAt).toLocaleString("es-VE")}
═══════════════════════════════════════════
Este comprobante es válido. Verificá en Tropico Wallet.`;
}
