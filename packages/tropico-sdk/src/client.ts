/**
 * @tropico/sdk — TropicoClient main entry point
 *
 * Instantiate once; access all SDK modules via typed namespaces.
 *
 * @example
 * ```ts
 * import { TropicoClient } from "@tropico/sdk";
 *
 * const client = new TropicoClient({
 *   rpcEndpoint: "https://api.mainnet-beta.solana.com",
 * });
 *
 * const checkout = client.merchant.createCheckout({
 *   merchantId: "acme",
 *   orderId: "ORD-001",
 *   amountUsdc: 50,
 *   recipientPubkey: "YourWalletPubkeyHere...",
 * });
 * ```
 */

import { Connection } from "@solana/web3.js";
import type { TropicoClientConfig } from "./types.js";
import { BsXModule } from "./bsx.js";
import { MerchantModule } from "./merchant.js";
import { buildSolanaPayUrl, parseSolanaPayUrl } from "./solana-pay.js";
import {
  validatePagoMovilIntent,
  formatPagoMovilQR,
  parseSuiche7BQR,
  assertValidPagoMovilIntent,
} from "./pago-movil.js";

export class TropicoClient {
  readonly config: TropicoClientConfig;
  readonly connection: Connection;

  private _bsx: BsXModule | undefined;
  private _merchant: MerchantModule | undefined;

  constructor(config: TropicoClientConfig) {
    this.config = config;
    this.connection = new Connection(config.rpcEndpoint, "confirmed");
  }

  /** BsX on-chain program interactions (mint, burn, attest, getReserves) */
  get bsx(): BsXModule {
    this._bsx ??= new BsXModule(this.connection, this.config);
    return this._bsx;
  }

  /** Merchant-facing checkout and settlement helpers */
  get merchant(): MerchantModule {
    this._merchant ??= new MerchantModule(
      this.config.network === "devnet"
        ? "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
        : "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
    );
    return this._merchant;
  }

  /** Solana Pay URL helpers — stateless, no connection needed */
  get solanaPay() {
    return {
      buildUrl: buildSolanaPayUrl,
      parseUrl: parseSolanaPayUrl,
    } as const;
  }

  /** Pago Móvil VE helpers — stateless, pure data transformation */
  get pagoMovil() {
    return {
      validate: validatePagoMovilIntent,
      assertValid: assertValidPagoMovilIntent,
      formatQR: formatPagoMovilQR,
      parseQR: parseSuiche7BQR,
    } as const;
  }
}
