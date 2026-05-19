# Trópico Wallet — Documento Maestro de Contexto

> Documento único de contexto: qué es Trópico, cómo está construido, qué está
> hecho (real vs mock), el roadmap MVP, decisiones de marca y assets de
> marketing. Pensado para onboarding de cualquier dev, diseñador, inversor o
> agente que necesite el panorama completo en una sola lectura.
>
> **Última actualización:** 2026-05-19 · **Branch activa:** `claude/tropico-wallet-mvp-roadmap-JEAda`

---

## 1. Qué es Trópico (en una frase)

**Trópico es la primera wallet non-custodial sobre Solana que cierra el círculo entre cripto y el sistema de pagos venezolano.** El patrimonio del usuario vive en USDC/SOL; cuando necesita pagar a un comercio, Trópico convierte al instante a bolívares vía Pago Móvil VE — sin abrir cuentas en otro país, sin P2P, sin esperar 30 minutos.

- **Lema:** *"No es solo una wallet. Es la infraestructura abierta de pagos que LatAm necesita — empezando por el bolívar."*
- **Reconocimiento:** Dev3pack Global Hackathon 2026 — #1 Venezuela · #28 Global · #10 LatAm (de 386 proyectos).
- **Demo live:** https://tropico-rho.vercel.app
- **Estado actual:** testnet/devnet, buscando orientación de mercado antes de mainnet.

---

## 2. El problema que resuelve

Mover y guardar plata en Venezuela hoy implica:
- Abrir cuentas en Panamá/EEUU para pagar servicios internacionales.
- Hacer P2P de madrugada para enviar remesas a familiares.
- Esperar 30 minutos a que un trader confirme en un exchange.
- Ver el bolívar devaluarse entre el cobro del sueldo y la compra del mercado.

Trópico apunta a que el usuario **mantenga su patrimonio dolarizado (USDC)** y **pague en bolívares solo en el instante exacto del pago**, sin exponerse a la devaluación ni depender de intermediarios.

---

## 3. Arquitectura (capas)

```
CAPA PROTOCOLO (Solana programs / Anchor)
  programs/tropico_bs/          ← BsX: mint/burn/attest/oracle
  programs/tropico_treasury/    ← registro on-chain de fees (audit-only)

CAPA INTEGRACIÓN (bridges)
  lib/tropico-bs-bridge.ts      ← USDC → Bs → Pago Móvil VE
  lib/suiche7b-parser.ts        ← QR Suiche7B (formato bancario VE)
  lib/jupiter.ts                ← swap Jupiter v6 (platformFeeBps=50)
  lib/solana-pay.ts             ← Solana Pay + durable nonces offline

CAPA AGENTE (Lumen runtime + GuacamaAI, ex-Carlos)
  lumen-kit/                    ← KIT + SKILLS declarativas
  lumen-capabilities/           ← scripts Python ejecutables
  lib/carlos-prompt.ts          ← system prompt del agente (pendiente rename)
  app/api/carlos/               ← proxy LLM (DeepSeek / Gemini / fallback)

CAPA APLICACIÓN
  app/ (Next.js 15 App Router)  ← módulos consumer + merchant
  lib/i18n/                     ← 4 idiomas (es/en/pt/fr)

WALLET / AUTH
  Privy MPC embedded            ← login email, non-custodial real
  Solana Wallet Adapter         ← Phantom / Solflare fallback
```

### Stack técnico

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

## 4. BsX — el rail JIT

`programs/tropico_bs/` es el programa Anchor que actúa como **rail just-in-time** entre USDC y el sistema bancario local. **BsX no es un instrumento de hold** — es un token transitorio que existe solo durante la ventana del pago (segundos), para que el patrimonio del usuario nunca se devalúe en bolívares.

| Instrucción | Qué hace |
|---|---|
| `initialize(peg_rate)` | crea PDAs del protocolo, delega mint authority |
| `update_peg(new_rate)` | oracle_authority actualiza la tasa del día |
| `mint_bsx(usdc_amount)` | mint JIT — usuario quema USDC al momento de pagar |
| `burn_bsx(bsx_amount)` | redime BsX no usados → USDC de vuelta |
| `attest_reserves()` | cualquiera escribe snapshot on-chain (reservas/supply) |
| `set_pause(paused)` | admin pausa/reactiva en emergencias |

Matemática: `bsx = usdc * peg_rate / 1_000_000`. El mismo protocolo escala a ARS, COP, CUP, PEN — Venezuela es el primer mercado, no el único.

---

## 5. Módulos y rutas

### Principales

| # | Módulo | URL | Qué hace |
|---|---|---|---|
| 1 | Wallet / Home | `/home` | Saldo on-chain real (USDC/SOL/SPL) via Helius + acciones rápidas |
| 2 | Cambiar | `/cambiar` | Tab Bolívares (USDC↔BsX JIT) + Tab Tokens (Jupiter v6) |
| 3 | Cobrar | `/cobrar` | QR Solana Pay client-side, fee 1%, merchant recibe monto exacto |
| 4 | Enviar | `/enviar` | P2P directo + claim links + pago a comercio con QR Suiche7B |
| 5 | Guardar | `/guardar` | Yield ~5-7% APY — mSOL (Marinade) o Kamino |
| 6 | Pago Móvil VE | `/pagar-servicios` | QR Suiche7B + conversión USDC→Bs + Pago Móvil en 2-5s |
| 7 | GuacamaAI (ex-Carlos) | `/carlos` | Agente venezolano sobre Lumen |
| 8 | Remesas | `/remesas` | On-ramp aggregator (UI; MoonPay/Transak/Ramp/Stripe) |
| 9 | Mi Trópico | `/perfil` | Avatar, nombre, pubkey, cluster, importar wallet |
| 10 | Offline | `/offline` | Firma txs sin conexión con durable nonces |
| 11 | WhatsApp Bot | `/carlos/whatsapp` | Demo del agente via WhatsApp Cloud API |

### Auxiliares

| Módulo | URL | Qué hace |
|---|---|---|
| Descubrir | `/descubrir` | Catálogo educativo de 9 tokens curados |
| Claim | `/claim/[id]` | Receptor de claim links de `/enviar` |
| Modo Agente | `/carlos/agente` | DCA, auto-yield, cashback, rebalance |
| Integraciones | `/integraciones` | Demo Trópico Pay para merchants |
| Intercambio P2P | `/intercambio-p2p` | **DEPRECADO** — redirige a `/cambiar` |
| Comercios | `/comercios` | Directorio de comercios afiliados con cashback |
| Wallet crear/abrir | `/wallet/crear`, `/wallet/abrir` | Wallet local AES-GCM 256 + PBKDF2 100k |

---

## 6. Estado actual del código (REAL vs MOCK)

| Módulo | Archivo principal | Estado | Observación clave |
|---|---|---|---|
| Auth Privy MPC | `app/providers.tsx:32-93` | REAL | Solana-only embedded, login email/Google funciona |
| Wallet local cifrada | `app/wallet/{crear,abrir}/` | REAL | AES-GCM 256 + PBKDF2 100k en localStorage |
| BsX Anchor program | `programs/tropico_bs/src/lib.rs` | REAL devnet | mint/burn/update_peg/attest deployados |
| Treasury program | `programs/tropico_treasury/src/lib.rs` | REAL devnet | Audit-only fee recorder, NO custodia tokens |
| Liquidez pool Bs en UI | `components/BsSwapForm.tsx:59-60` | **MOCK** | `POOL_BS_AVAILABLE = 50_000_000` hardcoded |
| Pago Móvil OUT | `lib/tropico-bs-bridge.ts:129-162` | **MOCK** | `setTimeout(2500)` simula banco; parser Suiche7B sí real |
| Pago Móvil IN | — | NO EXISTE | No hay forma de recibir Bs del banco del usuario |
| Transfers SPL P2P | `app/enviar/SendToAddressPrivy.tsx` | REAL | Firma Privy real, SPL Token on-chain |
| Claim links | `app/claim/[id]/ClaimView.tsx:41-56` | **MOCK** | Escrow en localStorage; falta programa on-chain |
| Solana Pay merchant | `app/cobrar/`, `lib/solana-pay.ts` | REAL | findReference listener, fee 1%, settle ~1s |
| Jupiter swaps | `lib/jupiter.ts` | REAL | v6 con platformFeeBps=50 |
| Profile store | `lib/profile-store.ts` | MINIMAL | Solo name + pubkey en localStorage |
| KYC / identidad | — | NO EXISTE | Solo formato de cédula en pagos, cero KYC |
| AML / límites | `lib/aml.ts` | **MOCK** | $5k/tx, $20k/día, $100k/mes en localStorage |
| On-ramp partners | `app/remesas/` | UI ONLY | MoonPay/Transak/Ramp/Stripe sin código ni keys |
| GuacamaAI capabilities | `lumen-capabilities/` | 3/8 | `precio_bs`, `precio_usd`, `jupiter_quote` listas |
| Backend | — | NO EXISTE | Todo client-side u on-chain; sin Postgres/webhooks |
| i18n | `lib/i18n/dictionary.ts` | REAL | 4 idiomas, 100% cobertura |

**Lectura:** la base on-chain es sólida y reusable. El gap crítico está en todo el plano off-chain (backend, partners fiat, KYC, AML server-side, observabilidad).

### On-chain footprint

| Program | Address (devnet) | Estado |
|---|---|---|
| `tropico_treasury` | `3a5NkTssAsVaarUPqx4YokNwUcfxHnNebGugrgBBxe8S` | implementado, listo para deploy |
| `tropico_bs` | `EdWuyZDXao86mTcUSpRVzNXaT9Tb5muU6YGubFhADWdN` | implementado, listo para deploy |

| Program público | Address | Para qué |
|---|---|---|
| SPL Token | `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` | transfers USDC, ATAs |
| Jupiter v6 | `JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4` | swaps |
| Marinade | `MarBmsSgKXdrN1egZf5sqe1TMThczhMLJhTndPfxN1V` | yield mSOL |
| Kamino | `KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD` | vaults USDC |

---

## 7. Modelo de negocio

| Stream | Tasa | Mecánica |
|---|---|---|
| Swap | 0.5% | Jupiter platformFeeBps=50 al ATA de Trópico |
| Send | 0.3% | spread USDC en envíos P2P |
| Yield | 2% del yield | performance fee sobre mSOL/Kamino |
| Merchant fee | 1% | cada cobro QR (cargo al cliente) |
| Trópico Pay | 0.5% | cada checkout de plataforma externa |

---

## 8. Non-custodial — cómo funciona

Privy MPC divide la clave privada en 3 shares:
- share-1 → dispositivo del usuario (encriptado)
- share-2 → infraestructura Privy (encriptado)
- share-3 → guardian backup (encriptado)

La llave privada completa **nunca existe** en ningún servidor. Para firmar una tx, 2 de 3 shares cooperan sin reconstruirla. El usuario puede exportar su seed phrase desde `/perfil` en cualquier momento.

---

## 9. Roadmap MVP sin P2P (resumen)

> Documento completo: [`docs/MVP_ROADMAP_NO_P2P.md`](MVP_ROADMAP_NO_P2P.md)

**Objetivo:** de demo de hackathon a mainnet con 50 usuarios canary en 14 semanas, definiendo 4 flujos (Registro, Compra, Cambio bidireccional, Transferencia) con cero matching P2P.

**Decisiones aprobadas:**
1. **Liquidez:** agregador de partners licenciados (Reserve, El Dorado, Vita Wallet). Trópico es router + UX + capa on-chain; los partners aportan el float de bolívares.
2. **Equipo:** 14 semanas, 2 devs.
3. **BsX transitorio:** el usuario siempre ve USDC; BsX se mintea+quema en la misma tx como recibo on-chain.

**Por qué NO es P2P:** el usuario siempre paga al banco del partner (no a otro usuario). El partner reconcilia, el backend confirma vía webhook firmado, el programa on-chain liquida. Trópico es siempre la contraparte visible. Es "routing inter-rail" — la idea de Debridge aplicada entre el banco venezolano y Solana.

**Fases:**
- **Fase 0 (sem 0-2) — Foundations:** backend Supabase, matar mock `POOL_BS_AVAILABLE`, sunset `/intercambio-p2p`, extender profile/AML, peg-oracle bot, observabilidad.
- **Fase 1 (sem 3-6) — Registro + Compra:** onboarding + Truora KYC tiers, `/comprar` Bs→USDC vía Pago Móvil + webhook partner, `release_usdc` en `tropico_bs`.
- **Fase 2 (sem 7-10) — Cambio bi + Transferencia:** USDC→Bs off-ramp, escrow on-chain `tropico_claim`, transfers tier-aware.
- **Fase 3 (sem 11-14) — Hardening:** AML real (Chainalysis/TRM), observabilidad v2, tercer partner, pen test.

**Costos:** ~$70-85k CAPEX (buffer USDC $50k incluido) + ~$2-3k/mes OPEX.

---

## 10. Marca y assets de marketing (sesión mayo 2026)

### 10.1 Rebrand: Carlos AI → GuacamaAI

El agente de IA pasa de **"Carlos AI"** a **"GuacamaAI"** (juego de palabras: guacamaya + AI).

- **Estética:** guacamaya 3D estilo Pixar (cabeza roja, hombros amarillos, alas azules, parche facial blanco, ojos negros amables, pico curvo corto). Señal de "AI" sutil: chispas/sparkles, headset minimalista o anillo holográfico — evitar circuitos/pantallas.
- **Diferenciación:** el loro grande en la escena de la isla es la "mascota ambiente" (full body); GuacamaAI es un personaje chibi/cabezón estilo emoji 3D, misma paleta pero proporciones más cute.
- **Aplica en:** card de feature inferior, tab bar del teléfono (`GUACAMAAI` reemplaza `CARLOS`), copy de marketing.
- **Pendiente en código (NO ejecutado aún):** renombrar `lib/carlos-prompt.ts` → `lib/guacama-prompt.ts`, rutas `/carlos` → `/guacama`, `app/api/carlos/` → `app/api/guacama/`, entradas de i18n. Requiere refactor explícito.

### 10.2 Post de Instagram — diseño

Formato 1080×1350 (4:5). Estilo 3D claymation/Pixar, paleta pastel caribeña.

**Estructura del diseño:**
- Tercio superior: isla tropical (palmera + guacamaya + montañas pixel-art + sol), wordmark "Trópico" en gradiente arcoíris, tagline "Tu wallet tropical", pill "Pagos simples con sabor Caribe".
- Fila de badges informativas: "Non-custodial · Privy MPC", "Pago Móvil VE en 2-5s", "Solana · Fee <$0.001", "Disponible en 4 idiomas".
- Tercio medio: mockup de teléfono con la home (saldo $0.00 USDC, modo demo devnet, botones Depositar/Reclamar faucet, tab bar INICIO/CAMBIAR/COBRAR/GUACAMAAI/COMERCIOS, card de cashback).
- Floating info cards alrededor del teléfono: "🏆 Dev3pack 2026 #1 Venezuela", "🇻🇪 Hecho en Venezuela", "⚡ +25 comercios afiliados", "🔒 Tu llave, tu plata".
- Tercio inferior: 4 feature cards — Paga y cobra (wallet), Comercios (storefront), Multi-chain (monedas + logo Solana), GuacamaAI (guacamaya chibi).
- Margen derecho: 4 stickers 3D (isla, guacamaya, coco dormido con zzz, coco transmitiendo con ondas).

**Paleta hex de marca:**
- Fondos: lavanda `#E8DCFF`, menta `#DFF7E8`
- Acentos: coral `#FF6B9D`, naranja `#FF9A56`, dorado `#FFD23F`, verde tropical `#4ED4A6`, azul cielo `#5DC5E8`, púrpura `#6B3FA0`
- Tipografía: rounded geometric sans-serif (Nunito / Poppins ExtraBold), wordmark en gradiente arcoíris.

**Nota de producción:** Midjourney suele romper strings largas de texto. Recomendado: generar la base visual con IA y componer badges + UI del teléfono en Figma/Canva sobre el render para acabado profesional.

### 10.3 Bio de Instagram (opción elegida — editable)

```
🌴 Wallet non-custodial sobre Solana, hecha para Venezuela 🇻🇪
USDC → Bs en segundos · Remesas · Yield · GuacamaAI 🦜
👇 Probá el demo
```

- Categoría sugerida: "Servicios financieros" o "App".
- Nombre de cuenta (indexable): `Trópico · Wallet 🇻🇪`.
- Link en bio: `tropico-rho.vercel.app` (migrar a Linktree cuando haya más destinos).
- Highlights sugeridos: Demo · GuacamaAI · Cómo funciona · Equipo · Prensa.

### 10.4 Primer post de Instagram (copy informativo)

Tono educativo/fundacional (presenta el proyecto desde cero, plantea el problema antes de la solución, honesto sobre estar en testnet, invita a seguir el journey). Copy completo guardado en el historial de la sesión; estructura:
1. "Hola Venezuela 🇻🇪 — somos Trópico."
2. El problema (P2P de madrugada, cuentas en Panamá, devaluación).
3. La solución (USDC, Pago Móvil instantáneo, remesas, yield, GuacamaAI).
4. Explicación de "non-custodial" en lenguaje plano.
5. Estado honesto: "estamos en testnet, construyendo en abierto".
6. CTA: seguir + demo en `tropico-rho.vercel.app`.

### 10.5 Post original en X (referencia de mensajería)

> *"Tropico Wallet es una super-app financiera para venezolanos, construida sobre @solana 🇻🇪 USDC → Bs en segundos · Remesas sin bancos, Yield nativo, Carlos AI [→ GuacamaAI], tu copiloto financiera. No es solo una wallet. Es la alternativa financiera que Venezuela necesita."*

### 10.6 Conversación con LEVELoxyz (incubadora) — origen del roadmap no-P2P

LEVELoxyz ("Incubate Before You Launch", incubadora permissionless) preguntó cómo Trópico planea convertir USDC↔Bs **sin P2P**, mencionando routing o AMMs "similar a Debridge", y si estaban en testnet. Esto gatilló el roadmap MVP no-P2P. Se interesaron en proyectos sin token que quieren ser descubiertos, y pidieron ver un early-deploy. El roadmap `docs/MVP_ROADMAP_NO_P2P.md` es la respuesta operativa.

---

## 11. Internacionalización

UI en 4 idiomas (switcher en header):

| Idioma | Código | Cobertura |
|---|---|---|
| Español venezolano (default) | `es` | 100% |
| English | `en` | 100% |
| Português | `pt` | 100% |
| Français | `fr` | 100% |

Implementado custom en `lib/i18n/dictionary.ts` + `lib/i18n/context.tsx`, sin librería externa.

---

## 12. Documentación del repo

| Documento | Contenido |
|---|---|
| `README.md` | Overview principal |
| `docs/MVP_ROADMAP_NO_P2P.md` | **Roadmap MVP sin P2P (14 semanas)** |
| `docs/ROADMAP.md` | Roadmap original Q3 2026 → Q1 2027 |
| `docs/PROTOCOL_BSX.md` | Spec técnica del protocolo BsX |
| `docs/ARCHITECTURE.md` | Arquitectura de componentes |
| `docs/CARLOS_AI.md` | Agente AI (pendiente rename a GuacamaAI) |
| `docs/LUMEN_INTEGRATION.md` | Lumen runtime |
| `docs/INTEGRATION_API.md` | Spec Trópico Pay (endpoints, webhooks HMAC) |
| `docs/ANCHOR_PROGRAM.md` | Deploy de programas Anchor |
| `docs/BLOCKCHAIN_BACKEND.md` | Stack on-chain, flows end-to-end |
| `docs/CLAIM_SYSTEM.md` | Sistema de claim links |
| `docs/JUDGE_DEMO_GUIDE.md` | Guía de demo para jueces |

---

## 13. Tareas pendientes destacadas (backlog vivo)

- [ ] Refactor de código Carlos → GuacamaAI (`lib/carlos-prompt.ts`, rutas `/carlos`, `app/api/carlos/`, i18n, `docs/CARLOS_AI.md`).
- [ ] Ejecutar Fase 0 del roadmap MVP (matar mocks, backend Supabase, peg-oracle).
- [ ] Firmar ≥1 partner de liquidez licenciado (Reserve preferido).
- [ ] Diseñar el ícono final de GuacamaAI (guacamaya chibi 3D) y reemplazar el robot en assets + tab bar.
- [ ] Generar el post de Instagram final (base IA + composición Figma/Canva).
- [ ] Configurar perfil de Instagram (bio, categoría, nombre indexable, highlights).
- [ ] Counsel VE para validar modelo agregador antes de mainnet.

> **Nota:** este backlog refleja decisiones de la sesión de planificación de mayo 2026. Ningún ítem de código ha sido ejecutado aún — el trabajo realizado hasta ahora es de definición/roadmap/marketing, no de implementación.
