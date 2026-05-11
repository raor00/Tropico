<!-- English summary for international judges — rest of this README is in Spanish -->
> **For international judges**: Tropico Wallet is a non-custodial financial app for Venezuela built on Solana. The Colosseum differential is **BsX** — the first sovereign-stable, USDC-backed, on-chain Bolívar primitive with cryptographic reserve attestation. The wallet wraps it with a Pago Móvil VE rail (Venezuela's dominant payment network, first Solana integration), offline payments via durable nonces, and Carlos AI (an agent built on the Lumen runtime) that understands commands like "cobrale 50 USDT a María en BsX". See [`docs/COLOSSEUM_SUBMISSION.md`](docs/COLOSSEUM_SUBMISSION.md) for the full submission.

---

[![Solana](https://img.shields.io/badge/Built_on-Solana-9945FF?logo=solana)](https://solana.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js)](https://nextjs.org)
[![Anchor](https://img.shields.io/badge/Anchor-0.30.1-512BD4)](https://www.anchor-lang.com)
[![Privy](https://img.shields.io/badge/Wallet-Privy_MPC-7C3AED)](https://privy.io)
[![License](https://img.shields.io/badge/License-MIT-14F195)](LICENSE)
[![Colosseum](https://img.shields.io/badge/Hackathon-Colosseum_2026-FFD166)](https://colosseum.org)
[![Made in Venezuela](https://img.shields.io/badge/Hecho_en-🇻🇪_Venezuela-EF476F)](#)
[![Dev3pack](https://img.shields.io/badge/Dev3pack_2026-%231_Venezuela_·_%2328_Global-FFD700)](https://hack.dev3pack.xyz/leaderboard)

# Tropico Wallet 🌴

> 🏆 **Dev3pack Global Hackathon 2026 — #1 Venezuela · #28 Global · #10 LatAm** (de 386 proyectos)

**La primera capa de moneda soberana-estable para Venezuela, construida en Solana.**

El diferencial de Colosseum es **BsX**: un token sintético que representa el bolívar venezolano, respaldado 1:1 en reservas USDC custodiadas on-chain por el programa `tropico_bs`, con atestación pública de reservas que cualquiera puede invocar y verificar en Solscan.

Tropico es la consumer app construida encima: nueve módulos que cubren el ciclo económico completo del venezolano — swap, QR merchant, yield, remesas, **Pago Móvil VE** (primer proyecto Solana con esta integración), y **Carlos AI** como copiloto financiero en español venezolano.

---

## Submisión Colosseum

**Founder**: Rafael Oviedo — solo founder, venezolano, 6 años cripto, 3 años software. Antecedente: Tropico fue **#1 Venezuela / #28 global / #10 LatAm** en Dev3pack 2026 (386 proyectos).

### Mapeo directo a los 6 criterios oficiales

| Criterio | Doc dedicado |
|---|---|
| 1. **Founder + Market Fit** | [`docs/TEAM.md`](docs/TEAM.md) · [`docs/FOUNDER_NARRATIVE.md`](docs/FOUNDER_NARRATIVE.md) |
| 2. **Insight** | [`docs/INSIGHT.md`](docs/INSIGHT.md) — validado contra el corpus oficial Colosseum (5.400+ proyectos) |
| 3. **Product + Execution** | [`docs/COLOSSEUM_SUBMISSION.md`](docs/COLOSSEUM_SUBMISSION.md) · [`docs/PROTOCOL_BSX.md`](docs/PROTOCOL_BSX.md) · [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · demo live |
| 4. **Market Size** | [`docs/MARKET_OPPORTUNITY.md`](docs/MARKET_OPPORTUNITY.md) — fuentes: Chainalysis, Galaxy, a16z, Pantera, BID |
| 5. **Founder Communication** | [`docs/PITCH.md`](docs/PITCH.md) · [`docs/FAQ_FOR_JUDGES.md`](docs/FAQ_FOR_JUDGES.md) |
| 6. **Viability** | [`docs/BUSINESS_MODEL.md`](docs/BUSINESS_MODEL.md) · [`docs/COMPETITIVE_LANDSCAPE.md`](docs/COMPETITIVE_LANDSCAPE.md) |

### Otros docs operacionales

- [`docs/COLOSSEUM_SUBMISSION.md`](docs/COLOSSEUM_SUBMISSION.md) — narrative completa para jueces
- [`docs/SUBMISSION_CHECKLIST.md`](docs/SUBMISSION_CHECKLIST.md) — checklist operacional pre-submit

---

## Demo rápido (para jueces)

```
Demo live: https://tropico-rho.vercel.app
```

1. Login con email → Privy crea wallet Solana embedded en 15 segundos
2. En `/home` → botón "Modo demo · devnet" → fondear con faucets públicos (SOL + USDC devnet)
3. `/cambiar` tab Bolívares → flujo BsX: depositá USDC, recibís BsX a la tasa del día
4. `/pagar-servicios` → Pago Móvil VE: escaneá QR Suiche7B o ingresá datos manual
5. `/carlos` → preguntá "¿cuánto vale el dólar hoy?" o "cobrale $5 a Juan en BsX"

Detalle completo: [`docs/JUDGE_DEMO_GUIDE.md`](docs/JUDGE_DEMO_GUIDE.md)

---

## Quick start

```bash
# 1. Clonar
git clone https://github.com/[tu-usuario]/Tropico.git tropico
cd tropico

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus keys (ver sección Variables de entorno)

# 4. Levantar dev server
npm run dev
# → http://localhost:3000
```

Sin ninguna key, la app corre en **modo demo** con mocks honestos y banners explícitos. Carlos AI usa smart fallback (sin LLM real). Ningún flow visual queda roto.

### Variables de entorno

```bash
# Privy — wallet MPC embedded
NEXT_PUBLIC_PRIVY_APP_ID=

# Helius — RPC de Solana
NEXT_PUBLIC_HELIUS_RPC=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
HELIUS_API_KEY=

# Carlos AI — LLM (elige uno)
GOOGLE_GENERATIVE_AI_API_KEY=   # Gemini 2.0 Flash
# DEEPSEEK_API_KEY=              # alternativa más barata

# Fee accounts de Tropico
NEXT_PUBLIC_TROPICO_FEE_OWNER=
NEXT_PUBLIC_TROPICO_FEE_ATA_USDC=
NEXT_PUBLIC_TROPICO_FEE_ATA_SOL=
NEXT_PUBLIC_TROPICO_FEE_ATA_USDT=

# Cluster
NEXT_PUBLIC_SOLANA_CLUSTER=mainnet-beta
```

---

## Arquitectura

```
CAPAS DE TROPICO
═══════════════════════════════════════════════════════════════════

CAPA PROTOCOLO (Solana programs / Anchor)
  programs/tropico_bs/          ← BsX: mint/burn/attest/oracle
  programs/tropico_treasury/    ← registro on-chain de fees (audit)

CAPA INTEGRACIÓN (bridges)
  lib/tropico-bs-bridge.ts      ← USDC → Bs → Pago Móvil VE
  lib/suiche7b-parser.ts        ← QR Suiche7B (formato bancario VE)
  lib/jupiter.ts                ← swap Jupiter v6 platformFeeBps=50
  lib/solana-pay.ts             ← Solana Pay + durable nonces offline

CAPA AGENTE (Lumen runtime + Carlos)
  lumen-kit/                    ← KIT + 7 SKILLS declarativas (Lumen)
  lumen-capabilities/           ← scripts Python ejecutables (Lumen)
  lib/carlos-prompt.ts          ← system prompt Carlos AI
  app/api/carlos/               ← proxy LLM (DeepSeek / Gemini / fallback)

CAPA APLICACIÓN
  app/ (Next.js 15 App Router)  ← 9 módulos consumer + merchant
  lib/i18n/                     ← 4 idiomas (es/en/pt/fr)

WALLET / AUTH
  Privy MPC embedded            ← login email, non-custodial real
  Solana Wallet Adapter         ← Phantom / Solflare fallback
```

Ver [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) para diagramas detallados y descripción de cada módulo.

---

## BsX — el protocolo

`programs/tropico_bs/` es el programa Anchor que implementa el bolívar sintético on-chain:

| Instrucción | Qué hace |
|---|---|
| `initialize(peg_rate)` | crea PDAs del protocolo, delega mint authority |
| `update_peg(new_rate)` | oracle_authority actualiza la tasa Bs/USD |
| `mint_bsx(usdc_amount)` | usuario deposita USDC → recibe BsX |
| `burn_bsx(bsx_amount)` | usuario quema BsX → recupera USDC |
| `attest_reserves()` | cualquiera escribe snapshot on-chain (usdc_reserves, bsx_supply) |
| `set_pause(paused)` | admin pausa/reactiva en emergencias |

Matemática: `bsx = usdc * peg_rate / 1_000_000` donde `peg_rate = Bs por 1 USD × 1_000_000`.

Spec completa: [`docs/PROTOCOL_BSX.md`](docs/PROTOCOL_BSX.md)

---

## Los 9 módulos del consumidor

| # | Módulo | URL | Qué hace |
|---|---|---|---|
| 1 | **Wallet / Home** | `/home` | Saldo on-chain real (USDC/SOL/SPL) via Helius + acciones rápidas |
| 2 | **Cambiar** | `/cambiar` | Tab Bolívares: USDC ↔ BsX vía protocolo BsX. Tab Tokens: Jupiter v6 (`platformFeeBps=50`) |
| 3 | **Cobrar** | `/cobrar` | QR Solana Pay client-side, fee 1% hacia arriba, merchant recibe monto exacto |
| 4 | **Enviar** | `/enviar` | P2P directo + claim links compartibles por WhatsApp |
| 5 | **Guardar** | `/guardar` | Yield ~5-7% APY — mSOL (Marinade) o Kamino |
| 6 | **Pago Móvil VE** | `/pagar-servicios` | QR Suiche7B + conversión USDC→Bs + Pago Móvil al banco destino en 2-5s |
| 7 | **Carlos AI** | `/carlos` | Agente venezolano sobre Lumen — 7 capabilities + Modo Agente |
| 8 | **Remesas** | `/remesas` | On-ramp aggregator (MoonPay/Transak/Ramp/Stripe Crypto) |
| 9 | **Mi Tropico** | `/perfil` | Avatar, nombre editable, pubkey, cluster, importar wallet |

### Módulos auxiliares

| Módulo | URL | Qué hace |
|---|---|---|
| **Descubrir** | `/descubrir` | Catálogo educativo de 9 tokens curados |
| **Claim** | `/claim/[id]` | Receptor de claim links de /enviar |
| **Modo Agente** | `/carlos/agente` | 4 acciones autónomas: DCA, auto-yield, cashback, rebalance |
| **Wallet crear/abrir** | `/wallet/crear`, `/wallet/abrir` | Wallet local cifrada AES-GCM 256 + PBKDF2 100k |

---

## Carlos AI y Lumen

**Lumen** (`lumen-kit/`, `lumen-capabilities/`) es el runtime de agentes — framework open-source por @gabogabucho. Define personalidad (YAML), skills (markdown), y ejecuta capabilities (scripts Python).

**Carlos** (`lib/carlos-prompt.ts`, `app/carlos/`) es el agente de producto construido sobre Lumen. Habla venezolano, conoce Solana, y tiene reglas inviolables (cero política, cero garantías de rendimientos).

```
KIT (lumen-kit/kit/)
  personality.yaml  → identidad Carlos: voz VE, reglas, knowledge
        │
        ▼
SKILLS (lumen-kit/skills/)
  tropico-balances  tropico-prices   tropico-swap
  tropico-pay       tropico-yield    tropico-cashback
  tropico-agent-actions
        │
        ▼
CAPABILITIES (lumen-capabilities/)
  precio_bs.py      ← cotización USD/VES real (ve.dolarapi.com)
  precio_usd.py     ← precio token USD (Jupiter Price API v3)
  jupiter_quote.py  ← quote real Jupiter v6 con fee 0.5%
  [+ 5 capabilities pendientes post-hackathon]
```

Doc completa: [`docs/CARLOS_AI.md`](docs/CARLOS_AI.md) — [`docs/LUMEN_INTEGRATION.md`](docs/LUMEN_INTEGRATION.md)

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + Tailwind 3 |
| Wallet | Privy MPC embedded + Solana Wallet Adapter |
| On-chain | SPL Token, Jupiter v6, Marinade, Kamino |
| Programs propios | Anchor 0.30.1 — `tropico_bs` + `tropico_treasury` |
| RPC | Helius |
| AI | DeepSeek-V4 / Gemini 2.0 Flash / smart fallback |
| Datos VE | ve.dolarapi.com (tasa USD/VES) |
| State | TanStack Query 5 |
| i18n | custom (es/en/pt/fr), sin librería externa |

---

## On-chain footprint

### Programs propios

| Program | Address (devnet) | Estado |
|---|---|---|
| `tropico_treasury` | `3a5NkTssAsVaarUPqx4YokNwUcfxHnNebGugrgBBxe8S` | implementado, listo para deploy a devnet |
| `tropico_bs` | `EdWuyZDXao86mTcUSpRVzNXaT9Tb5muU6YGubFhADWdN` | implementado, listo para deploy a devnet |

### Programs públicos usados

| Program | Address | Para qué |
|---|---|---|
| SPL Token | `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` | transfers USDC, ATAs |
| Jupiter v6 | `JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4` | swaps |
| Marinade | `MarBmsSgKXdrN1egZf5sqe1TMThczhMLJhTndPfxN1V` | yield mSOL |
| Kamino | `KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD` | vaults USDC |

### TROPI test token (devnet)

```
Mint:    AbkCW6BA2ZVoTw4Q6M1NvATiZjn2aMS3WvWZQbhRQf6K
Tx mint: 5rnR7yKT7z84awgCfvis4zbv3CDyYkzMUCEiBKJnQnYhNMhxjDbNweDy9kcoqCmBku6JkLcaG1cJxgXMCj7dJB5F
```

---

## Tropico Pay — para merchants e integradores

Cualquier plataforma puede cobrar en USDC sobre Solana con un solo endpoint:

```bash
POST /api/checkout/create
{
  "merchantWallet": "Mer7Ghj...",
  "amount": 12.50,
  "tokenSymbol": "USDC",
  "partnerId": "yummy-rides",
  "orderId": "ORD-9182",
  "webhookUrl": "https://api.tuapp.com/webhook/tropico"
}
```

Devuelve: `sessionId`, `solanaPayUrl`, `hostedCheckoutUrl`, `customerPays`, `merchantReceives`. Webhooks firmados con HMAC-SHA256.

Spec completa: [`docs/INTEGRATION_API.md`](docs/INTEGRATION_API.md)

---

## Modelo de negocio

| Stream | Tasa | Mecánica |
|---|---|---|
| Swap | 0.5% | Jupiter `platformFeeBps=50` al ATA de Tropico |
| Send | 0.3% | spread USDC en envíos P2P |
| Yield | 2% del yield | performance fee sobre mSOL/Kamino |
| Merchant fee | 1% | cada cobro QR (cargo al cliente) |
| Tropico Pay | 0.5% | cada checkout de plataforma externa |

---

## Non-custodial — cómo funciona

Privy MPC divide la clave privada en 3 shares:

```
Login usuario (email/Google)
  ├── share-1 → dispositivo del usuario (encriptado)
  ├── share-2 → infraestructura Privy (encriptado)
  └── share-3 → guardian backup (encriptado)

La llave privada completa NUNCA existe en ningún servidor.
Para firmar una tx, 2 de 3 shares cooperan sin reconstruirla.
```

El usuario puede exportar su seed phrase desde `/perfil` en cualquier momento. Tropico nunca accede a ningún share.

---

## Internacionalización

UI disponible en 4 idiomas. Switcher en el header (icono globo):

| Idioma | Código | Cobertura |
|---|---|---|
| Español venezolano (default) | `es` | 100% |
| English | `en` | 100% |
| Português | `pt` | 100% |
| Français | `fr` | 100% |

Implementado custom en `lib/i18n/dictionary.ts` + `lib/i18n/context.tsx`. Sin librería externa.

---

## Roadmap

| Período | Hitos |
|---|---|
| **Post-Colosseum** | Deploy `tropico_bs` mainnet, oracle v2 con Pyth, multi-sig Squads |
| **Q3 2026** | Lumen server en producción, tool calling real, Tropico Pay GA, on-ramp real |
| **Q4 2026** | Tropico Card (debit USDC + cashback), Tropico Vaults, bug bounty público |
| **Q1 2027** | Expansión LATAM (CO, AR, MX, PE, CL), app React Native, Solana Mobile dApp Store |

---

## Documentación

| Documento | Contenido |
|---|---|
| [`docs/COLOSSEUM_SUBMISSION.md`](docs/COLOSSEUM_SUBMISSION.md) | Submisión completa a Colosseum |
| [`docs/PROTOCOL_BSX.md`](docs/PROTOCOL_BSX.md) | Spec técnica del protocolo BsX |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Arquitectura de componentes |
| [`docs/CARLOS_AI.md`](docs/CARLOS_AI.md) | Carlos AI: arquitectura, capabilities, FAQ |
| [`docs/LUMEN_INTEGRATION.md`](docs/LUMEN_INTEGRATION.md) | Lumen runtime: setup, deployment, replicabilidad |
| [`docs/INTEGRATION_API.md`](docs/INTEGRATION_API.md) | Spec Tropico Pay: endpoints, webhooks HMAC |
| [`docs/ANCHOR_PROGRAM.md`](docs/ANCHOR_PROGRAM.md) | Deploy de los programas Anchor |
| [`docs/BLOCKCHAIN_BACKEND.md`](docs/BLOCKCHAIN_BACKEND.md) | Stack on-chain: flows end-to-end |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Visión detallada Q3 2026 → Q1 2027 |
| [`docs/PITCH_DECK.md`](docs/PITCH_DECK.md) | Pitch deck 6 slides (Marp) |
| [`docs/JUDGE_DEMO_GUIDE.md`](docs/JUDGE_DEMO_GUIDE.md) | Guía de demo para jueces |
| [`docs/SUBMISSION_CHECKLIST.md`](docs/SUBMISSION_CHECKLIST.md) | Checklist pre-submisión |

---

## License

MIT — ver [`LICENSE`](LICENSE).

---

> **Tropico no es una wallet. Es la infraestructura económica que el venezolano necesita — y el bolívar primitivo que Solana no tenía.** 🌴
