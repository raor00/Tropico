# Tropico — Architecture

> Documento orientado a jueces, contribuidores, y auditores. Cubre el estado actual del repositorio y la arquitectura objetivo post-hackathon.

**Última actualización**: 2026-05-11
**Estado del repo**: monolito Next.js + Anchor (single package). La migración a monorepo está documentada abajo como arquitectura objetivo; no está ejecutada todavía.

---

## Estado actual del repositorio

```
Tropico/
├── app/                          # Next.js 15 App Router
├── components/                   # React UI components
├── lib/                          # helpers, integraciones, lógica de negocio
├── lumen-kit/                    # KIT + SKILLS declarativas de Lumen
├── lumen-capabilities/           # scripts Python ejecutables (capabilities)
├── programs/
│   ├── tropico_treasury/         # Anchor: audit trail de fees on-chain
│   └── tropico_bs/               # Anchor: protocolo BsX (mint/burn/attest)
├── docs/                         # documentación técnica
├── scripts/                      # utilidades (screenshots Playwright)
└── tests/                        # tests Anchor (TypeScript/Mocha)
```

---

## Arquitectura objetivo (monorepo target)

La migración está documentada como target post-Colosseum. La estructura objetivo:

```
Tropico/ (monorepo — en migración)
├── apps/
│   ├── web/                      # app Next.js actual (migrada)
│   └── merchant-dashboard/       # futuro dashboard merchant dedicado
├── packages/
│   ├── core/                     # tipos compartidos, constantes, mints
│   ├── sdk/                      # @tropico/sdk — merchant SDK público
│   ├── lumen/                    # Lumen KIT + SKILLS (portado de lumen-kit/)
│   ├── guacama/                   # agente Guacama (portado de lib/guacama-*)
│   ├── payments/                 # Solana Pay, durable nonces, Pago Móvil
│   ├── swap/                     # Jupiter v6 integration
│   ├── wallet/                   # Privy MPC + Wallet Adapter
│   └── ui/                       # design system, componentes React compartidos
└── programs/
    ├── tropico_treasury/         # existente
    └── tropico_bs/               # existente — protocolo BsX
```

> **Honestidad técnica**: el repo de Colosseum es el monolito actual. El monorepo target es la dirección de viaje, no el estado presente.

---

## Diagrama general — flujo de datos

```
┌──────────────────────────────────────────────────────────────────────┐
│                        BROWSER / PWA                                 │
│                                                                       │
│  React 19 + Next.js 15 App Router + Tailwind 3                       │
│  TanStack Query 5 (cache 30s)   │   Privy SDK (auth + MPC)           │
└───────────────────┬──────────────────────────┬───────────────────────┘
                    │ fetch                     │ MPC signing
                    ▼                           ▼
┌───────────────────────────┐   ┌───────────────────────────────────────┐
│  Next.js Edge / Node API  │   │  Solana (devnet / mainnet-beta)       │
│  ─────────────────────    │   │  ──────────────────────────────────   │
│  /api/guacama   → LLM      │   │  programs/tropico_bs (BsX protocol)  │
│  /api/checkout → TropicoPay   │  programs/tropico_treasury (fees)    │
│  /api/precio-bs → dolarapi│   │  SPL Token Program                   │
│                           │   │  Jupiter v6 Aggregator               │
└───────────────────────────┘   │  Marinade / Kamino (yield)           │
                                │  Solana Pay (QR + findReference)     │
                                └───────────────────────────────────────┘
                                              ▲
                                Helius RPC ───┘
```

---

## Módulos — estado actual y responsabilidades

### `app/` — rutas (Next.js App Router)

| Ruta | Estado | Qué hace |
|---|---|---|
| `/` | funcional | landing pública |
| `/home` | funcional | dashboard: saldo on-chain, 9 módulos, balance USDC/SOL/SPL |
| `/cambiar` | funcional | tab Bolívares (BsX) + tab Tokens (Jupiter v6, `platformFeeBps=50`) |
| `/cobrar` | funcional | QR Solana Pay client-side, fee 1% hacia arriba |
| `/enviar` | funcional | P2P directo + claim links compartibles por WhatsApp |
| `/guardar` | funcional | yield mSOL / Kamino (~5-7% APY) |
| `/pagar-servicios` | funcional | Pago Móvil VE — integración Suiche7B + banco destino |
| `/remesas` | funcional | on-ramp aggregator (MoonPay/Transak/Ramp) |
| `/guacama` | funcional | chat Guacama AI con 7 capabilities |
| `/guacama/agente` | funcional | Modo Agente — 4 acciones autónomas (UI + lógica) |
| `/comercios` | funcional | landing merchant, comparativa vs POS |
| `/integraciones` | funcional | Tropico Pay — 3 patrones de integración |
| `/perfil` | funcional | avatar, nombre editable, pubkey, cluster, importar wallet |
| `/wallet/crear` | funcional | wallet local cifrada AES-GCM 256 + PBKDF2 |
| `/descubrir` | funcional | catálogo educativo 9 tokens curados |
| `/api/checkout/create` | funcional | POST endpoint Tropico Pay, devuelve session + Solana Pay URL |
| `/api/guacama` | funcional | proxy LLM (DeepSeek > Gemini > smart fallback) |

### `lib/` — lógica de negocio

| Archivo | Qué hace |
|---|---|
| `tropico-bs-bridge.ts` | conversión USDC ↔ Bs, integración con Pago Móvil VE |
| `suiche7b-parser.ts` | parseo de QR Suiche7B (formato bancario venezolano) |
| `jupiter.ts` | `buildSwapTransaction()` con `platformFeeBps=50` |
| `solana-pay.ts` | `buildSolanaPayUrl()`, QR, durable nonces para pagos offline |
| `guacama-prompt.ts` | system prompt de Guacama: identidad venezolana, reglas estrictas |
| `agent-actions.ts` | definición de las 4 acciones autónomas del Modo Agente |
| `agent-rules-store.ts` | persistencia de reglas de agente por usuario (localStorage) |
| `balances.ts` | lectura de SPL token accounts vía Helius |
| `checkout.ts` | `createCheckoutSession()` — Tropico Pay |
| `send-tx.ts` | firma y broadcast de transferencias SPL |
| `i18n/` | sistema i18n custom: 4 idiomas (es/en/pt/fr), persiste en localStorage |

### `lumen-kit/` — runtime declarativo de Lumen

Ver sección "Lumen vs Guacama" más abajo.

```
lumen-kit/
├── kit/
│   ├── module.yaml       # metadatos: tropico-wallet-kit v0.1.0
│   └── personality.yaml  # identidad Guacama + tono + reglas + knowledge
└── skills/
    ├── tropico-balances/SKILL.md
    ├── tropico-prices/SKILL.md
    ├── tropico-swap/SKILL.md
    ├── tropico-pay/SKILL.md
    ├── tropico-yield/SKILL.md
    ├── tropico-cashback/SKILL.md
    └── tropico-agent-actions/SKILL.md
```

### `lumen-capabilities/` — scripts Python ejecutables

```
lumen-capabilities/
├── prices/
│   ├── precio_bs.py        # cotización USD/VES — ve.dolarapi.com
│   └── precio_usd.py       # precio token USD — Jupiter Price API v3
├── swap/
│   └── jupiter_quote.py    # quote real Jupiter v6 con platformFeeBps=50
├── balances/               # (pendiente post-hackathon)
├── pay/                    # (pendiente post-hackathon)
├── yield/                  # (pendiente post-hackathon)
├── cashback/               # (pendiente post-hackathon)
└── agent/                  # (pendiente post-hackathon — requiere OpenClaw)
```

3 de 8 scripts están implementados y funcionan con datos reales de mainnet. Los restantes son trabajo del sprint post-Colosseum.

### `programs/tropico_treasury/` — registro on-chain de fees

PDA `["treasury"]` con dos counters: `total_fees_lamports` y `total_tx_count`. Instrucción `record_fee(amount, module, user)` emite evento `FeeRecorded` indexable por Helius webhooks. **NO custodia tokens** — es pura observabilidad on-chain. Program ID configurado: `3a5NkTssAsVaarUPqx4YokNwUcfxHnNebGugrgBBxe8S` (declarado en `declare_id!()` y `Anchor.toml`, listo para deploy a devnet).

### `programs/tropico_bs/` — protocolo BsX (nuevo en Colosseum)

El diferencial técnico principal. Ver spec completa en `docs/PROTOCOL_BSX.md`.

PDAs: `ProtocolConfig` (seeds: `["config"]`) y `ReservesAttestation` (seeds: `["attestation"]`). BsX mint y treasury vault también son PDAs del programa (`["bsx_mint"]` y `["treasury_vault"]`), lo que significa que el programa es la única autoridad sobre el mint y el vault — no hay clave privada externa que controle el supply.

---

## Lumen vs Guacama — subsección crítica

Esta distinción fue borrosa en documentación anterior. La aclaramos aquí de forma definitiva:

### Lumen = runtime / framework de agentes

**Qué es**: framework open-source MIT por @gabogabucho (`github.com/gabogabucho/lumen-agent`). Define una arquitectura de 3 capas (KIT + SKILLS + CAPABILITIES) para construir agentes con personalidad configurable, tool calling hacia scripts externos, y soporte multi-plataforma.

**Dónde vive en este repo**:
- `lumen-kit/` — definición declarativa del agente (YAML + markdown)
- `lumen-capabilities/` — scripts Python que Lumen ejecuta via terminal connector

**Analogía**: Lumen es el motor. No sabe nada de Tropico ni de Venezuela por sí solo.

### Guacama = agente de producto construido sobre Lumen

**Qué es**: el copiloto financiero venezolano de Tropico. Conoce el ecosistema Solana, habla español venezolano, tiene reglas estrictas (cero política, cero garantías de rendimientos), y puede guiar al usuario a cada módulo de la app.

**Dónde vive en este repo**:
- `lib/guacama-prompt.ts` — system prompt: identidad + tono + reglas + knowledge de Solana/VE
- `lib/agent-actions.ts` — definición de las 4 acciones del Modo Agente
- `lib/agent-rules-store.ts` — persistencia de reglas de agente por usuario
- `app/guacama/` — UI del chat
- `app/guacama/agente/` — UI del Modo Agente

**Analogía**: Guacama es el conductor. Sabe adónde ir (el contexto de Tropico), usa el motor (Lumen) para moverse.

### En MVP (estado actual)

`app/api/guacama/route.ts` llama directamente al LLM (DeepSeek → Gemini → smart fallback) sin pasar por un servidor Lumen. El Tropico Web3 Kit (`lumen-kit/`) está estructurado y listo; la integración real con `lumen server` ocurre post-Colosseum (ver `docs/LUMEN_INTEGRATION.md`).

---

## Programa BsX — PDAs, instrucciones, flujo de reservas

### PDAs

| Semilla | Tipo de cuenta | Contenido |
|---|---|---|
| `["config"]` | `ProtocolConfig` | admin, usdc_mint, bsx_mint, treasury_vault, oracle_authority, paused, peg_rate |
| `["bsx_mint"]` | `Mint` (SPL) | el mint de BsX; mint authority = config PDA |
| `["treasury_vault"]` | `TokenAccount` (SPL) | USDC reservas; authority = config PDA |
| `["attestation"]` | `ReservesAttestation` | snapshot: usdc_reserves, bsx_supply, timestamp, attester |

### Flujo mint_bsx

```
Usuario deposita N USDC
    │
    ├── CPI: SPL Transfer(user_usdc_ata → treasury_vault, N)
    │
    ├── bsx_to_mint = N * peg_rate / 1_000_000
    │
    └── CPI: SPL MintTo(bsx_mint, user_bsx_ata, bsx_to_mint)
              signed by config PDA
```

### Flujo burn_bsx

```
Usuario quema M BsX
    │
    ├── CPI: SPL Burn(user_bsx_ata, M)
    │
    ├── usdc_to_release = M * 1_000_000 / peg_rate
    │
    └── CPI: SPL Transfer(treasury_vault → user_usdc_ata, usdc_to_release)
              signed by config PDA
```

### Atestación de reservas

`attest_reserves()` puede ser invocada por cualquier cuenta (permissioned solo en costo de gas). Lee `treasury_vault.amount` y `bsx_mint.supply` directamente de los PDAs —sin oracle externo— y los escribe en `ReservesAttestation`. El resultado es un snapshot on-chain verificable en Solscan en cualquier momento.

---

## Pago Móvil VE — integración

Dos archivos forman la integración:

**`lib/suiche7b-parser.ts`**: parsea el formato de QR bancario venezolano Suiche7B. Un comercio en Venezuela muestra su QR de Pago Móvil; el usuario de Tropico lo escanea con la cámara (vía `html5-qrcode`). El parser extrae banco destino, cédula/RIF del receptor, teléfono, y referencia.

**`lib/tropico-bs-bridge.ts`**: convierte el monto en USDC a bolívares a la tasa del día (via `ve.dolarapi.com` — fuente paralelo), ejecuta el Pago Móvil al banco destino venezolano, y devuelve comprobante bancario. Settlement en 2-5 segundos.

Este es el único proyecto del ecosistema Solana con integración nativa de Pago Móvil VE.

---

## Guacama AI — flujo completo (prompt → tx)

```
Usuario: "cobrale 50 USDT a María en BsX"
    │
    ▼
POST /api/guacama  {message, history, currentScreen}
    │
    ▼
app/api/guacama/route.ts
    │  inyecta GUACAMA_SYSTEM_PROMPT (lib/guacama-prompt.ts)
    │  provider: DeepSeek → Gemini → smart fallback
    │
    ▼
LLM parsea intención → identifica skill "tropico-swap" + acción
    │
    ▼ (Q3 2026 — con Lumen server real)
Lumen carga SKILL.md de tropico-swap
    │  ejecuta python3 lumen-capabilities/swap/jupiter_quote.py
    │  → devuelve quote real Jupiter v6
    │
    ▼
Guacama propone tx en lenguaje natural venezolano
    │  "María puede recibir BsX desde USDT. El quote es: X USDT → Y BsX.
    │   ¿Confirmamos?"
    │
    ▼ (usuario confirma)
Frontend firma tx vía Privy MPC
    │
    ▼
Solana — transacción on-chain en < 1 segundo
```

---

## Modelo de seguridad

**Non-custodial estricto**: Tropico nunca accede a llaves privadas de usuarios. Privy MPC divide la clave en 3 shares (dispositivo + Privy infra + recovery); la clave completa nunca se reconstruye en ningún servidor.

**Programas Anchor propios**: `tropico_treasury` no custodia fondos (solo metadata). `tropico_bs` custodia USDC en un vault PDA cuya authority es el propio programa — no hay clave privada externa.

**Estado actual**: devnet. Antes de mainnet se requiere auditoría externa del programa `tropico_bs` y migración del `authority` a multi-sig Squads.

**API keys**: secrets solo en rutas `app/api/*` (server-side). Variables `NEXT_PUBLIC_*` son únicamente pubkeys y RPC URLs sin valor sensible.
