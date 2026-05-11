# Tropico — packages workspace

Shared packages published from this monorepo.

| Package | Description | Status |
|---------|-------------|--------|
| [`@tropico/sdk`](./tropico-sdk) | Merchant integration SDK — Solana Pay + Pago Móvil VE + BsX | ✅ shipped |
| `@tropico/core` | Core protocol primitives and on-chain types | 📋 planned |
| `@tropico/lumen` | Lumen AI capabilities (extracted from `lumen-capabilities/`) | 📋 planned |
| `@tropico/payments` | Payment flow abstractions (checkout, settlement, receipts) | 📋 planned |
| `@tropico/swap` | USDC ↔ BsX swap helpers and price feeds | 📋 planned |

---

To build a package locally:

```bash
cd packages/tropico-sdk
npm run build
```
