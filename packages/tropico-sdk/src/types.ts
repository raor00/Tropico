/**
 * @tropico/sdk — Core shared types
 */

// --- Branded primitives ---

declare const _bsxBrand: unique symbol;
declare const _usdcBrand: unique symbol;

/** BsX token amount (lamports-equivalent, integer units) */
export type BsXAmount = number & { readonly [_bsxBrand]: true };
/** USDC amount in 6-decimal integer units (e.g. 1_000_000 = 1 USDC) */
export type UsdcAmount = number & { readonly [_usdcBrand]: true };

/** Bolívares per USD, scaled 1e6 (e.g. 36_500_000 = 36.5 Bs/USD) */
export type PegRate = number;

export type MerchantId = string;
export type OrderId = string;

// --- Pago Móvil VE ---

export type PagoMovilIntent = {
  /** 4-digit bank code (e.g. "0134" = Banesco) */
  banco: string;
  /** Mobile phone number (10 digits, e.g. "04141234567") */
  telefono: string;
  /** National ID (e.g. "V12345678") */
  cedula: string;
  /** Amount in Bolivares */
  monto: number;
  /** Optional payment reference */
  ref?: string;
  /** Optional concept / description */
  concepto?: string;
};

// --- Checkout ---

export type CheckoutOptions = {
  merchantId: MerchantId;
  orderId: OrderId;
  /** Amount in USDC (human-readable, e.g. 50.0) */
  amountUsdc: number;
  /** Recipient Solana wallet (base58) */
  recipientPubkey: string;
  /** Include Pago Movil fallback intent */
  pagoMovilFallback?: PagoMovilIntent;
  label?: string;
  message?: string;
  /** Seconds until checkout expires (default: 900) */
  expiresInSeconds?: number;
};

export type CheckoutResult = {
  /** Solana Pay URL (`solana:...`) */
  url: string;
  /** Raw data suitable for encoding into a QR code */
  qr_data: string;
  /** ISO timestamp when the checkout expires */
  expires_at: string;
  /** Pago Movil fallback (if requested) */
  pagoMovil?: PagoMovilIntent;
};

// --- Reserve Attestation ---

export type ReserveAttestation = {
  /** Total USDC in treasury vault (6-decimal integer units) */
  total_usdc: UsdcAmount;
  /** Total BsX minted (lamports) */
  total_bsx_supply: BsXAmount;
  /** Peg rate at time of attestation (Bs per USD, scaled 1e6) */
  peg_rate: PegRate;
  /** Unix timestamp of last attestation */
  attested_at: number;
  /** Collateralization ratio (total_usdc / total_bsx_supply expressed as BsX lamports → USDC) */
  ratio: number;
};

// --- Solana Pay ---

export type SolanaPayParams = {
  /** Recipient pubkey (base58) */
  recipient: string;
  /** Human-readable amount (e.g. 50.0 for 50 USDC) */
  amount: number;
  /** SPL token mint address (base58). Omit for native SOL. */
  splToken?: string;
  /** Reference pubkey for payment tracking (base58) */
  reference?: string;
  label?: string;
  message?: string;
  memo?: string;
};

// --- Client config ---

export type TropicoNetwork = "mainnet-beta" | "devnet" | "localnet";

export type TropicoClientConfig = {
  /** Solana RPC endpoint */
  rpcEndpoint: string;
  programIds?: {
    bsx?: string;
  };
  /** Authority pubkey used to verify reserve attestations */
  oracleAuthority?: string;
  network?: TropicoNetwork;
};
