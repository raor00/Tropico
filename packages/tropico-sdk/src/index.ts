/**
 * @tropico/sdk — Public API barrel
 */

// --- Client ---
export { TropicoClient } from "./client.js";

// --- Types ---
export type {
  BsXAmount,
  UsdcAmount,
  PegRate,
  MerchantId,
  OrderId,
  PagoMovilIntent,
  CheckoutOptions,
  CheckoutResult,
  ReserveAttestation,
  SolanaPayParams,
  TropicoClientConfig,
  TropicoNetwork,
} from "./types.js";

// --- Errors ---
export {
  TropicoError,
  BsXError,
  PagoMovilError,
  InvalidSolanaPayUrlError,
  InsufficientReservesError,
  ProtocolPausedError,
} from "./errors.js";

// --- BsX module ---
export {
  BsXModule,
  BSX_PROGRAM_ID,
  USDC_MINT,
  USDC_MINT_DEVNET,
  PROTOCOL_CONFIG_SEED,
  TREASURY_VAULT_SEED,
  RESERVES_ATTESTATION_SEED,
  getProtocolConfigPDA,
  getTreasuryVaultPDA,
  getReservesAttestationPDA,
} from "./bsx.js";

// --- Solana Pay ---
export { buildSolanaPayUrl, parseSolanaPayUrl } from "./solana-pay.js";

// --- Pago Móvil ---
export {
  VENEZUELAN_BANK_CODES,
  validatePagoMovilIntent,
  assertValidPagoMovilIntent,
  formatPagoMovilQR,
  parseSuiche7BQR,
} from "./pago-movil.js";
export type { PagoMovilValidationError, FormattedPagoMovilQR } from "./pago-movil.js";

// --- Merchant ---
export { MerchantModule } from "./merchant.js";
export type { ParsedQR, SettlementResult } from "./merchant.js";
