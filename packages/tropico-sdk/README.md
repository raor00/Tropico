# @tropico/sdk

Merchant integration SDK for **Bolívares Onchain (BsX)** + **Pago Móvil VE** on Solana.

Built for the Colosseum hackathon — lets external merchants accept USDC via Solana Pay with automatic Pago Móvil fallback in minutes.

---

## Install

```bash
npm install @tropico/sdk @solana/web3.js @solana/spl-token @coral-xyz/anchor
```

---

## Quick start

```ts
import { TropicoClient } from "@tropico/sdk";

const client = new TropicoClient({
  rpcEndpoint: "https://api.mainnet-beta.solana.com",
  network: "mainnet-beta",
});

// Create a checkout for 50 USDC with a Pago Móvil fallback
const checkout = client.merchant.createCheckout({
  merchantId: "acme-store",
  orderId: "ORD-001",
  amountUsdc: 50,
  recipientPubkey: "YourWalletPubkeyHere...",
  label: "Acme Store",
  pagoMovilFallback: {
    banco: "0134",          // Banesco
    telefono: "04141234567",
    cedula: "V12345678",
    monto: 1825.0,          // Bs equivalent
    ref: "ORD-001",
  },
});

console.log(checkout.url);        // solana:...
console.log(checkout.qr_data);    // same URL, ready to QR-encode
console.log(checkout.expires_at); // ISO timestamp
console.log(checkout.pagoMovil);  // Pago Móvil fallback intent
```

---

## API reference

### `TropicoClient`

Main entry point. Takes a `TropicoClientConfig`.

| Namespace | Description |
|-----------|-------------|
| `client.merchant` | Checkout creation, QR parsing, settlement verification |
| `client.bsx` | On-chain BsX program interactions (mint, burn, attest, reserves) |
| `client.solanaPay` | Stateless Solana Pay URL builder + parser |
| `client.pagoMovil` | Pago Móvil VE validation, QR formatting, Suiche7B parsing |

---

### `client.merchant`

```ts
// Create a Solana Pay checkout URL
createCheckout(options: CheckoutOptions): CheckoutResult

// Parse any QR string (Solana Pay or Pago Móvil)
parseQR(qrData: string): ParsedQR

// Verify on-chain settlement (stub — see TODO in source)
verifySettlement(orderId: string, txSignature: string): Promise<SettlementResult>

// Build a Pago Móvil QR from an intent
buildPagoMovilQR(intent: PagoMovilIntent): FormattedPagoMovilQR
```

---

### `client.bsx`

```ts
getReserves(): Promise<ReserveAttestation>
getPegRate(): Promise<PegRate>
buildMintIx({ user, usdcAmount }): TransactionInstruction[]
buildBurnIx({ user, bsxAmount }): TransactionInstruction[]
buildAttestIx({ attester }): TransactionInstruction[]
```

---

### `client.solanaPay`

```ts
buildUrl(params: SolanaPayParams): string
parseUrl(url: string): SolanaPayParams   // throws InvalidSolanaPayUrlError
```

---

### `client.pagoMovil`

```ts
validate(intent: PagoMovilIntent): PagoMovilValidationError[]
assertValid(intent: PagoMovilIntent): void   // throws PagoMovilError
formatQR(intent: PagoMovilIntent): FormattedPagoMovilQR
parseQR(raw: string): PagoMovilIntent | null
```

---

### Errors

| Class | Code |
|-------|------|
| `TropicoError` | base class |
| `BsXError` | `BSX_ERROR` / `ACCOUNT_NOT_FOUND` |
| `PagoMovilError` | `PAGO_MOVIL_ERROR` |
| `InvalidSolanaPayUrlError` | `INVALID_SOLANA_PAY_URL` |
| `InsufficientReservesError` | `INSUFFICIENT_RESERVES` |
| `ProtocolPausedError` | `PROTOCOL_PAUSED` |

---

### Constants

```ts
import { BSX_PROGRAM_ID, VENEZUELAN_BANK_CODES, USDC_MINT } from "@tropico/sdk";
// or via sub-path:
import { VENEZUELAN_BANK_CODES } from "@tropico/sdk/pago-movil";
```

---

## Examples

See the [`examples/`](./examples) directory:

- `merchant-checkout.ts` — build and print a checkout URL
- `bsx-mint.ts` — build BsX mint instructions
- `pago-movil-payout.ts` — BsX → Pago Móvil payout flow at the type level

---

## Known stubs

- Anchor instruction discriminators in `bsx.ts` are zeroed — replace with `sha256("global:<method>")[0..8]` from the compiled IDL.
- `verifySettlement` always returns `{ settled: true }` — implement real on-chain verification.
- `getReserves` / `getPegRate` buffer decodes assume a fixed layout — validate against the final IDL.

---

## Publishing

```bash
cd packages/tropico-sdk
npm run build
npm publish --access public
```

Requires `@tropico` npm org access. Bump version in `package.json` before publishing.

---

## License

MIT — same as the Tropico monorepo root.
