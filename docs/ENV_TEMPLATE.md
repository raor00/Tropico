# Variables de entorno — `.env.local`

> El archivo `.env.local` está gitignored. Copia este bloque a `.env.local` en la raíz del repo y llena los valores reales. Las variables con prefijo `NEXT_PUBLIC_*` son visibles al cliente; las demás son SOLO server-side.

```bash
# ── Solana cluster ──────────────────────────────────────────────────
# "mainnet-beta" para producción · "devnet" para sandbox
NEXT_PUBLIC_SOLANA_CLUSTER=mainnet-beta

# RPC endpoint — recomendado Helius (más rápido + webhooks)
# Free tier en https://www.helius.dev
NEXT_PUBLIC_HELIUS_RPC=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY

# ── Privy embedded wallet (MPC 3-share) ────────────────────────────
# Sin esto, AuthCTA cae a modo "demo" (navega a /home con mocks)
# Crea app gratis en https://dashboard.privy.io
NEXT_PUBLIC_PRIVY_APP_ID=YOUR_PRIVY_APP_ID

# ── Treasury wallet de Tropico (recibe fees) ───────────────────────
# Generar pubkey con: solana-keygen new -o ~/.config/solana/tropico.json
# JAMÁS commitear la secret key. Solo el pubkey va al .env.
NEXT_PUBLIC_TROPICO_TREASURY=YOUR_TREASURY_PUBKEY

# ATAs del treasury para cada output token (Jupiter platformFee aterriza acá)
# Computar con getAssociatedTokenAddress(mint, treasury) o
# spl-token create-account <mint> --owner <treasury>
NEXT_PUBLIC_TROPICO_FEE_ATA_USDC=YOUR_USDC_ATA
NEXT_PUBLIC_TROPICO_FEE_ATA_USDT=YOUR_USDT_ATA
NEXT_PUBLIC_TROPICO_FEE_ATA_SOL=YOUR_WSOL_ATA

# ── Tropico Pay API (server-side, partners B2B) ────────────────────
# Generar: openssl rand -hex 32
TROPICO_PAY_API_KEY=
MERCHANT_WALLET=

# ── Base URL pública (usado en hostedCheckoutUrl) ──────────────────
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# ── Carlos AI (opcional MVP) ───────────────────────────────────────
DEEPSEEK_API_KEY=
GEMINI_API_KEY=

# ── Webhook signing secret (Tropico Pay → partners) ────────────────
TROPICO_WEBHOOK_SECRET=
```

## Cómo conseguir cada uno

| Var | Cómo |
|---|---|
| `NEXT_PUBLIC_HELIUS_RPC` | Sign up gratis en helius.dev → copia tu RPC URL con `?api-key=...` al final |
| `NEXT_PUBLIC_PRIVY_APP_ID` | Sign up en dashboard.privy.io → crea app → "App ID" en settings |
| `NEXT_PUBLIC_TROPICO_TREASURY` | `solana-keygen new -o ~/.config/solana/tropico.json` → `solana-keygen pubkey ~/.config/solana/tropico.json` |
| `NEXT_PUBLIC_TROPICO_FEE_ATA_*` | `spl-token create-account EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --owner <treasury-pubkey>` (USDC). Repite con USDT/wSOL mints. |
| `TROPICO_PAY_API_KEY` | `openssl rand -hex 32` |
| `DEEPSEEK_API_KEY` | platform.deepseek.com → API keys |
| `GEMINI_API_KEY` | aistudio.google.com → "Get API key" |

## Mínimo viable para correr la app

Solo estos 3 son **estrictamente necesarios** para arranque demo:

```bash
NEXT_PUBLIC_SOLANA_CLUSTER=mainnet-beta
NEXT_PUBLIC_HELIUS_RPC=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Sin Privy → wallet en modo demo (mock). Sin DeepSeek/Gemini → Carlos chat en modo mock. Sin treasury ATAs → Jupiter swap funciona pero el fee no llega a un ATA real (puedes correr quotes igual).
