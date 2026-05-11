/**
 * @tropico/sdk — Merchant-facing checkout and settlement helpers
 */

import type {
  BsXAmount,
  CheckoutOptions,
  CheckoutResult,
  UsdcAmount,
} from "./types.js";
import { buildSolanaPayUrl, parseSolanaPayUrl } from "./solana-pay.js";
import { parseSuiche7BQR, formatPagoMovilQR, assertValidPagoMovilIntent } from "./pago-movil.js";
import type { PagoMovilIntent } from "./types.js";

// USDC mint on mainnet-beta (kept inline to avoid extra imports)
const DEFAULT_USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export type ParsedQR =
  | { type: "solana_pay"; payload: ReturnType<typeof parseSolanaPayUrl> }
  | { type: "pago_movil"; payload: PagoMovilIntent }
  | { type: "unknown"; raw: string };

export type SettlementResult = {
  settled: boolean;
  amount: BsXAmount | UsdcAmount;
  settledAt: number;
};

export class MerchantModule {
  private readonly usdcMint: string;

  constructor(usdcMint: string = DEFAULT_USDC_MINT) {
    this.usdcMint = usdcMint;
  }

  /**
   * Create a Solana Pay checkout URL with an optional Pago Móvil fallback.
   *
   * The returned `qr_data` is the canonical string to encode into a QR code
   * (always the Solana Pay URL — point-of-sale scanners prefer this).
   */
  createCheckout(options: CheckoutOptions): CheckoutResult {
    const {
      orderId,
      amountUsdc,
      recipientPubkey,
      pagoMovilFallback,
      label,
      message,
      expiresInSeconds = 900,
    } = options;

    if (pagoMovilFallback) {
      assertValidPagoMovilIntent(pagoMovilFallback);
    }

    const url = buildSolanaPayUrl({
      recipient: recipientPubkey,
      amount: amountUsdc,
      splToken: this.usdcMint,
      reference: orderId,
      label: label ?? "Tropico Checkout",
      message: message ?? `Order ${orderId}`,
    });

    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

    const result: CheckoutResult = {
      url,
      qr_data: url,
      expires_at: expiresAt,
    };

    if (pagoMovilFallback) {
      result.pagoMovil = pagoMovilFallback;
    }

    return result;
  }

  /**
   * Parse a QR code string, dispatching to the correct sub-parser.
   *
   * Tries Solana Pay first, then Suiche7B/Pago Móvil, then falls back to
   * `unknown` so callers can handle gracefully.
   */
  parseQR(qrData: string): ParsedQR {
    if (!qrData || typeof qrData !== "string") {
      return { type: "unknown", raw: qrData };
    }

    // Try Solana Pay
    if (qrData.trimStart().startsWith("solana:")) {
      try {
        const payload = parseSolanaPayUrl(qrData.trim());
        return { type: "solana_pay", payload };
      } catch {
        // fall through
      }
    }

    // Try Pago Móvil / Suiche7B
    const pagoMovilPayload = parseSuiche7BQR(qrData);
    if (pagoMovilPayload !== null) {
      return { type: "pago_movil", payload: pagoMovilPayload };
    }

    return { type: "unknown", raw: qrData };
  }

  /**
   * Verify that a given Solana transaction settled payment for an order.
   *
   * TODO: Implement real on-chain verification:
   *   1. Fetch the transaction by signature
   *   2. Parse the token transfer instructions
   *   3. Verify recipient, amount, and the `reference` field matches orderId
   *   4. Cross-check against the BsX protocol if BsX was used instead of USDC
   */
  async verifySettlement(
    _orderId: string,
    _txSignature: string
  ): Promise<SettlementResult> {
    // TODO: implement real on-chain verification (see JSDoc above)
    return Promise.resolve({
      settled: true,
      amount: 50_000_000 as UsdcAmount, // 50 USDC stub
      settledAt: Date.now(),
    });
  }

  /**
   * Build a Pago Móvil QR for display alongside the Solana Pay QR.
   * Useful for merchants who want to offer both payment rails.
   */
  buildPagoMovilQR(intent: PagoMovilIntent): ReturnType<typeof formatPagoMovilQR> {
    assertValidPagoMovilIntent(intent);
    return formatPagoMovilQR(intent);
  }
}
