/**
 * Example: BsX → Pago Móvil Payout Flow
 *
 * Demonstrates the typed end-to-end flow at the SDK level:
 *   1. User holds BsX tokens (or USDC) in their Solana wallet
 *   2. Merchant presents a Pago Móvil intent (banco, telefono, cedula, monto)
 *   3. SDK validates the intent, builds the BsX burn instruction, and outputs
 *      the Pago Móvil QR for the liquidity pool to execute.
 *
 * No real RPC calls are made — this illustrates the types and flow only.
 */

import { PublicKey } from "@solana/web3.js";
import { TropicoClient, VENEZUELAN_BANK_CODES } from "../src/index.js";
import type { BsXAmount, PagoMovilIntent } from "../src/types.js";

// --- Step 1: Create client ---
const client = new TropicoClient({
  rpcEndpoint: "https://api.devnet.solana.com",
  network: "devnet",
});

// --- Step 2: Define the payout intent ---
const intent: PagoMovilIntent = {
  banco: "0134", // Banesco
  telefono: "04141234567",
  cedula: "V12345678",
  monto: 1825.0, // 50 USD worth at 36.5 Bs/USD
  ref: `TROP-${Date.now().toString(36).toUpperCase()}`,
  concepto: "BsX payout via Tropico",
};

// --- Step 3: Validate the intent ---
const errors = client.pagoMovil.validate(intent);
if (errors.length > 0) {
  console.error("Invalid intent:", errors);
  process.exit(1);
}

console.log("=== BsX → Pago Móvil Payout Flow ===");
console.log(`Bank: ${VENEZUELAN_BANK_CODES[intent.banco]} (${intent.banco})`);
console.log(`Phone: ${intent.telefono}`);
console.log(`Cédula: ${intent.cedula}`);
console.log(`Amount: ${intent.monto.toLocaleString("es-VE", { minimumFractionDigits: 2 })} Bs`);
console.log(`Reference: ${intent.ref}`);
console.log();

// --- Step 4: Build BsX burn instruction ---
// Approximate: 50 USDC → minted as BsX lamports at 1:1 with 6 decimals
const BSX_AMOUNT = 50_000_000 as BsXAmount;
const USER_PUBKEY = new PublicKey("USer111111111111111111111111111111111111111");

const burnInstructions = client.bsx.buildBurnIx({
  user: USER_PUBKEY,
  bsxAmount: BSX_AMOUNT,
});

console.log(`BsX burn instruction built (${burnInstructions.length} ix)`);
console.log("Program:", burnInstructions[0]?.programId.toBase58());
console.log();

// --- Step 5: Generate the Pago Móvil QR for the liquidity pool ---
const qr = client.pagoMovil.formatQR(intent);
console.log("=== Pago Móvil QR ===");
console.log("JSON format:", qr.json);
console.log("Suiche7B format:", qr.suiche7b);
console.log();
console.log(
  "Next step (prod): submit burnInstructions to Solana + send qr.suiche7b to Tropico liquidity pool gateway."
);
