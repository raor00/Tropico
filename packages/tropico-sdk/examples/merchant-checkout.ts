/**
 * Example: Merchant Checkout
 *
 * Build a Solana Pay checkout URL for a 50 USDC order and print it.
 * Run with: npx ts-node --esm examples/merchant-checkout.ts
 */

import { TropicoClient } from "../src/index.js";

const client = new TropicoClient({
  rpcEndpoint: "https://api.devnet.solana.com",
  network: "devnet",
});

const checkout = client.merchant.createCheckout({
  merchantId: "acme-store",
  orderId: "ORD-2024-001",
  amountUsdc: 50,
  recipientPubkey: "Mer7GhjMAcEYTmpAcePtAgVgkLogo3ZgKHSPaC9Th", // replace with your wallet
  label: "Acme Store",
  message: "Order ORD-2024-001 — thanks for shopping!",
  pagoMovilFallback: {
    banco: "0134",
    telefono: "04141234567",
    cedula: "V12345678",
    monto: 1825.0, // ~50 USD at 36.5 Bs/USD
    ref: "ORD-2024-001",
    concepto: "Acme Store order",
  },
});

console.log("=== Tropico Checkout ===");
console.log("Solana Pay URL:", checkout.url);
console.log("QR data:", checkout.qr_data);
console.log("Expires at:", checkout.expires_at);
if (checkout.pagoMovil) {
  console.log("Pago Móvil fallback:", checkout.pagoMovil);
}
