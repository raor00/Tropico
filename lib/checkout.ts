/**
 * Tropico Pay — Layer de integración para plataformas externas.
 *
 * Permite que apps como delivery (Yummy Rides), e-commerce (PedidosYa),
 * SaaS, ticketing, etc. cobren en USDC sobre Solana usando Tropico como
 * gateway. Tres patrones soportados:
 *
 *  1. Solana Pay link — universal, sin SDK, abre cualquier wallet.
 *  2. Drop-in button — script JS embebido (`<script src=".../tropico-pay.js">`).
 *  3. REST API — server-to-server con webhook callback.
 *
 * Todas las integraciones devuelven el mismo resultado: una `reference` que
 * el partner usa para trackear el pago, y la URL Solana Pay que el cliente abre.
 */

import { buildSolanaPayUrl, generateReference } from "./solana-pay";
import type { TokenSymbol } from "./tokens";

export type CheckoutChannel =
  | "delivery"
  | "ecommerce"
  | "ticketing"
  | "saas"
  | "p2p"
  | "other";

export type CreateCheckoutInput = {
  /** Pubkey del wallet del merchant que recibe (base58) */
  merchantWallet: string;
  /** Monto a cobrar en token humano (ej. 12.50) */
  amount: number;
  /** Token a cobrar — default USDC */
  tokenSymbol?: TokenSymbol;
  /** ID del partner que integra (yummy, pedidos-ya, etc.) — usado en analytics */
  partnerId: string;
  /** ID del pedido en el sistema del partner — viaja como label */
  orderId: string;
  /** Canal/vertical — para routing y métricas */
  channel?: CheckoutChannel;
  /** URL del partner para redirect post-pago (success page) */
  redirectUrl?: string;
  /** URL del partner que recibe webhook on-chain confirm */
  webhookUrl?: string;
  /** Mensaje opcional al cliente (Solana Pay `message`) */
  message?: string;
};

export type CheckoutSession = {
  /** ID único de la sesión — el partner lo guarda */
  sessionId: string;
  /** Reference pubkey usado para findReference on-chain */
  reference: string;
  /** URL Solana Pay — `solana:...` — abrir en cualquier wallet */
  solanaPayUrl: string;
  /** URL al hosted checkout de Tropico (fallback si la wallet no soporta deeplink) */
  hostedCheckoutUrl: string;
  /** Cuándo expira (ISO 8601, default 15 min) */
  expiresAt: string;
  /** Comisión que cobrará Tropico al merchant (0.5% default) */
  feeBps: number;
  /** Monto que recibirá el merchant después de fee */
  merchantReceives: number;
  /** Eco del partner */
  partnerId: string;
  orderId: string;
};

const TROPICO_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://tropico.app";

const DEFAULT_FEE_BPS = 50; // 0.5% al merchant — política Tropico Pay

const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutos

/**
 * Crea una sesión de checkout. Server-side: NO genera signing,
 * solo arma URL + reference. El cliente firma desde su wallet.
 */
export function createCheckoutSession(
  input: CreateCheckoutInput
): CheckoutSession {
  const reference = generateReference();
  const sessionId = `tps_${reference.slice(0, 16)}`;
  const symbol = input.tokenSymbol ?? "USDC";
  const fee = (input.amount * DEFAULT_FEE_BPS) / 10000;
  const merchantReceives = +(input.amount - fee).toFixed(6);

  const solanaPayUrl = buildSolanaPayUrl({
    recipient: input.merchantWallet,
    amount: input.amount,
    tokenSymbol: symbol,
    reference,
    label: `${input.partnerId} · pedido ${input.orderId}`,
    message: input.message ?? `Pago Tropico Pay — ${input.partnerId}`,
  });

  const hostedCheckoutUrl =
    `${TROPICO_BASE_URL}/checkout?session=${sessionId}` +
    `&ref=${encodeURIComponent(reference)}` +
    `&amount=${input.amount}` +
    `&token=${symbol}` +
    `&merchant=${encodeURIComponent(input.merchantWallet)}` +
    `&partner=${encodeURIComponent(input.partnerId)}` +
    `&order=${encodeURIComponent(input.orderId)}` +
    (input.redirectUrl ? `&redirect=${encodeURIComponent(input.redirectUrl)}` : "");

  return {
    sessionId,
    reference,
    solanaPayUrl,
    hostedCheckoutUrl,
    expiresAt: new Date(Date.now() + DEFAULT_TTL_MS).toISOString(),
    feeBps: DEFAULT_FEE_BPS,
    merchantReceives,
    partnerId: input.partnerId,
    orderId: input.orderId,
  };
}

/**
 * Casos de uso típicos para mostrar en /integraciones — define los verticales
 * que el equipo de Tropico onboardea primero.
 */
export const INTEGRATION_USE_CASES = [
  {
    vertical: "Delivery",
    examples: ["Yummy Rides", "Apps de comida", "Mensajería local"],
    icon: "🛵",
    why: "El cliente paga en USDC al rider o restaurante directo. Settlement en 1 segundo. Sin chargebacks fraudulentos.",
    integration: "Drop-in button en el flow de pago",
  },
  {
    vertical: "E-commerce",
    examples: ["PedidosYa", "Tiendas online", "Marketplaces"],
    icon: "🛒",
    why: "Checkout USDC + redirect post-pago. El merchant recibe la plata sin intermediario bancario.",
    integration: "REST API + webhook on-chain confirm",
  },
  {
    vertical: "Ticketing y eventos",
    examples: ["Conciertos", "Boletería", "Bares"],
    icon: "🎫",
    why: "QR único por ticket. Validación on-chain en la puerta — imposible duplicar.",
    integration: "Solana Pay link directo",
  },
  {
    vertical: "SaaS y suscripciones",
    examples: ["Streaming", "Software", "Coworking"],
    icon: "💼",
    why: "Cobros recurrentes vía Modo Agente del usuario (Carlos firma con su permiso).",
    integration: "REST API + DCA agentic action",
  },
] as const;
