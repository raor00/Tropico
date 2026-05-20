# Tropico Wallet — MVP Roadmap (sin P2P)

> **Estado:** roadmap aprobado, pendiente de ejecución.
> **Horizonte:** 14 semanas, 2 devs (1 full-stack + 1 contratos/backend).
> **Branch de trabajo:** `claude/tropico-wallet-mvp-roadmap-JEAda`.
> **Última revisión:** 2026-05-18.

---

## Resumen ejecutivo (TL;DR)

Tropico llega a mainnet con 50 usuarios canary en 14 semanas mediante un **agregador de rampas licenciadas en Venezuela** (Reserve / El Dorado / Vita Wallet) que aporta el float de bolívares. El usuario nunca interactúa con otro usuario: paga al banco del partner, el partner confirma vía webhook firmado, el backend liquida en Solana a través del programa Anchor `tropico_bs` (mint_bsx → burn_bsx en la misma tx → USDC limpio a la wallet del usuario).

- **4 flujos:** Registro (Privy + Truora KYC) · Compra Bs→USDC (Pago Móvil + partner) · Cambio bidireccional (`/cambiar` USDC↔Bs) · Transferencia (SPL + escrow on-chain `tropico_claim`).
- **4 fases:** Foundations (sem 0-2) · Registro+Compra (3-6) · Cambio bi+Transfer (7-10) · Hardening (11-14).
- **Inversión mínima MVP:** ~$60-80k (buffer USDC $50k + setup KYC/infra $5k + counsel + sandbox sign-on). No incluye salarios.
- **OPEX mensual estimado en producción:** ~$2-3k (Supabase + Sentry + Axiom + Truora pay-per-use + KMS + Chainalysis entry).
- **Pitch al inversor:** *"No usamos P2P. Es routing inter-rail — Debridge entre el banco venezolano y Solana."*

---

## Conversación origen (Twitter, mayo 2026)

> **LEVELoxyz — Incubate Before You Launch** (1h)
> *"Entiendo. Supongo que buscas convertir USDC directamente a BS, pero ¿cómo? Recurrir al P2P suele ser el método más habitual, a menos que configures algún tipo de enrutamiento o utilices Creadores de Mercado Automatizados (AMM). ¿Similar a Debridge? ¿Estás en Testnet?"*
>
> **Tropico Wallet** (1h)
> *"Sip, estamos ahorita en testnet y es donde buscamos orientación para poder tomar la mejor decisión adaptada al mercado."*
>
> **LEVELoxyz** (1h)
> *"Nice, me interesa saber cómo se desarrolla tu proyecto. Siéntete libre de seguirnos, somos una incubadora permissionless. Estamos considerando la idea de abrirnos a proyectos que no planean lanzar un token, pero quieren ser descubiertos. ¿Tienes algún early deploy o demás?"*

Este roadmap es la respuesta operativa a esa conversación: define el "routing inter-rail" que reemplaza al P2P, conserva la opción no-token, y queda listo para mostrar como early-deploy plan a la incubadora.

---

## Contexto

Tropico Wallet es una wallet non-custodial en Solana para Venezuela. Hoy en testnet, buscamos definir cómo el usuario podrá **comprar USDC/SOL con bolívares dentro de la app sin recurrir a un marketplace P2P**.

El repo ya tiene infraestructura sólida — programa Anchor `tropico_bs` con `mint_bsx`/`burn_bsx`, Pago Móvil OUTBOUND vía Suiche7B, Privy MPC, Carlos AI sobre Lumen — pero el on-ramp Bs→USDC es **100% mock** (pool hardcoded en `components/BsSwapForm.tsx`, ningún partner real, sin KYC, sin backend). El módulo `/intercambio-p2p` ya está deprecado/redirigido a `/cambiar`, así que el camino "no-P2P" no requiere desmontar nada, sólo construir el reemplazo correcto.

**Objetivo:** llevar Tropico de "demo de hackathon" a "MVP en mainnet con 50 usuarios canary" en 14 semanas, definiendo las 4 rutas (Registro, Compra, Cambio bidireccional, Transferencia) con cero matching P2P.

### Decisiones aprobadas

1. **Modelo de liquidez:** agregador de partners licenciados (Reserve, El Dorado, Vita Wallet). Tropico es router + UX + capa on-chain; los partners aportan el float de bolívares y manejan SUDEBAN/AML del lado fiat. Se descartó Tropico-direct-treasury por capital + carga regulatoria.
2. **Equipo & horizonte:** 14 semanas, 2 devs (1 full-stack + 1 contratos/backend).
3. **Semántica de BsX:** transitorio. El usuario siempre ve USDC; BsX se mintea y quema dentro de la misma transacción como recibo on-chain auditable. Coherente con README (*"BsX no es un instrumento de hold"*).

---

## Estado actual del codebase (snapshot mayo 2026)

| Módulo                       | Archivo principal                            | Real / Mock | Observación clave                                                              |
|------------------------------|----------------------------------------------|-------------|--------------------------------------------------------------------------------|
| Auth Privy MPC               | `app/providers.tsx:32-93`                    | REAL        | Solana-only embedded, Ethereum off. Login email/Google funciona.               |
| Wallet local cifrada         | `app/wallet/{crear,abrir}/`                  | REAL        | AES-GCM 256 + PBKDF2 100k en localStorage `tropico:wallet:v1`.                 |
| BsX Anchor program           | `programs/tropico_bs/src/lib.rs`             | REAL devnet | `mint_bsx` + `burn_bsx` + `update_peg` + `attest_reserves` deployados.         |
| Treasury Anchor program      | `programs/tropico_treasury/src/lib.rs`       | REAL devnet | Audit-only fee recorder. NO custodia tokens.                                   |
| Liquidez pool Bs en UI       | `components/BsSwapForm.tsx:59-60`            | **MOCK**    | `POOL_BS_AVAILABLE = 50_000_000` hardcoded. Cero liquidez real.                |
| Pago Móvil OUT               | `lib/tropico-bs-bridge.ts:129-162`           | **MOCK**    | `setTimeout(2500)` simula ejecución bancaria. Parser Suiche7B sí real.         |
| Pago Móvil IN                | —                                            | NO EXISTE   | No hay forma de recibir Bs del banco del usuario. Es lo que este roadmap crea. |
| Transfers SPL P2P            | `app/enviar/SendToAddressPrivy.tsx`          | REAL        | Firma Privy real, SPL Token transfer on-chain.                                 |
| Claim links                  | `app/claim/[id]/ClaimView.tsx:41-56`         | **MOCK**    | Escrow en localStorage. Q3 plan: Anchor program.                               |
| Solana Pay merchant          | `app/cobrar/`, `lib/solana-pay.ts`           | REAL        | `findReference()` listener, fee 1%, settle ~1s.                                |
| Jupiter swaps                | `lib/jupiter.ts`                             | REAL        | v6 con `platformFeeBps=50`.                                                    |
| Profile store                | `lib/profile-store.ts`                       | MINIMAL     | Solo `name` + `pubkey` en localStorage. Sin email/phone/cédula.                |
| KYC / verificación identidad | —                                            | NO EXISTE   | Solo formato de cédula validado en pagos. Cero KYC real.                       |
| AML / límites                | `lib/aml.ts`                                 | **MOCK**    | $5k/tx, $20k/día, $100k/mes en localStorage. Sin ledger server.                |
| On-ramp partners             | `app/remesas/`                               | UI ONLY     | MoonPay/Transak/Ramp/Stripe mencionados, cero código/keys.                     |
| Carlos AI capabilities       | `lumen-capabilities/`                        | 3/8         | Implementadas: `precio_bs`, `precio_usd`, `jupiter_quote`. Faltan 5.           |
| `/intercambio-p2p`           | `app/intercambio-p2p/page.tsx:4-9`           | DEPRECADO   | Redirige a `/cambiar`. No requiere desmontaje.                                 |
| Backend                      | —                                            | NO EXISTE   | Todo client-side u on-chain. Sin Postgres, sin webhooks, sin queue.            |
| i18n                         | `lib/i18n/dictionary.ts`                     | REAL        | 4 idiomas (es/en/pt/fr), 100% cobertura. No tocar en MVP.                      |

**Lectura:** la base on-chain es sólida y reusable. El gap crítico es **todo el plano off-chain**: backend persistente, integración con partners reales de fiat, KYC, AML server-side, y observabilidad.

---

## Arquitectura de los 4 flujos

```
                       ┌──────────────────────────────────────┐
                       │       USUARIO (Privy MPC wallet)     │
                       └───────────┬──────────────────────────┘
                                   │
        ┌──────────────────────────┼────────────────────────────┐
        │                          │                            │
   REGISTRO                  COMPRA / CAMBIO              TRANSFERENCIA
   /onboarding               /comprar  /cambiar           /enviar  /claim
        │                          │                            │
        ▼                          ▼                            ▼
   Truora KYC          ┌──── Router de partners ────┐    Solana SPL +
   tier 0/1/2          │  Reserve  ElDorado  Vita   │    tropico_claim
                       └─────────────┬──────────────┘    (escrow PDA)
                                     │
                       Webhook firmado (HMAC)
                                     │
                       ┌─────────────▼──────────────┐
                       │  Backend (Supabase + API)  │
                       │  ramp_orders, aml_ledger   │
                       └─────────────┬──────────────┘
                                     │
                       Oracle authority firma
                                     │
                       ┌─────────────▼──────────────┐
                       │  tropico_bs (Anchor)       │
                       │  mint_bsx + burn_bsx       │
                       │  release_usdc (nuevo)      │
                       └─────────────────────────────┘
```

**Por qué esto NO es P2P:** el usuario siempre paga al banco del partner (no a otro usuario). El partner reconcilia, el backend confirma vía webhook firmado, el programa on-chain liquida. Tropico es siempre la contraparte visible.

---

## Fase 0 — Foundations (semanas 0–2)

**Meta:** matar mocks que contradicen el storytelling "Tropico es la contraparte", levantar backend mínimo, cerrar P2P deprecado.

**Entregables:**
- Backend Supabase (Postgres + RLS) con esquema inicial: `users`, `kyc_records`, `ramp_orders`, `aml_ledger`, `partner_webhooks`, `peg_rates`. Migración en `supabase/migrations/0001_init.sql`.
- Eliminar `POOL_BS_AVAILABLE` de `components/BsSwapForm.tsx` y `lib/p2p-swap.ts`. Reemplazar por llamada server a `/api/liquidity/quote` que devuelve 503 "sin liquidez" hasta Fase 1 (no mentir más en UI).
- Sunset completo de `/intercambio-p2p`: quitar de nav, sitemap, README, `lib/carlos-prompt.ts`. Guardia CI en `scripts/smoke-tests.mjs` con grep para evitar reintroducción.
- `lib/profile-store.ts` extendido: campos `email`, `phone_e164`, `cedula`, `jurisdiction`, `kyc_tier`, `kyc_status`. Source of truth en Postgres, localStorage es cache.
- `lib/aml.ts` reescrito: misma API, backed por `/api/aml/ledger`. localStorage = cache optimista.
- `scripts/peg-oracle.mjs`: worker que lee `ve.dolarapi.com` cada 60s y llama `tropico_bs.update_peg` en devnet. Hosted en Railway (~$5/mes).
- Observabilidad baseline: Sentry (front+API), Axiom logs, `/api/health` endpoint exponiendo `{ db, peg_age_s, partners }`.

**Reuso:** `programs/tropico_bs/src/lib.rs` tal cual, `lib/precio-bs.ts`, `lib/tropico-bs-bridge.ts` (matemática de quote), Privy provider en `app/providers.tsx`.

**Dependencias externas:** Supabase free tier, Sentry, Axiom, Railway ($5/mes).

**Riesgos:**
- Reg: pasar a guardar PII en server convierte a Tropico en data controller. Mitigación: `app/legal/privacidad/page.tsx` antes de cerrar Fase 0.
- Tech: oracle es single point of failure. Mitigación: multi-source (dolarapi + monitordolarvenezuela + override admin).

**Done criteria:**
- Grep CI verde: ninguna mención de `POOL_BS_AVAILABLE`.
- `/api/health` 200 con `peg_age_s < 120`.
- Devnet: `tropico_bs.attest_reserves` muestra peg actualizándose cada minuto.

---

## Fase 1 — Registro + Compra Bs→USDC (semanas 3–6)

**Meta:** un venezolano se registra, hace KYC Tier-1, deposita bolívares vía Pago Móvil, y recibe USDC en su wallet non-custodial — sin cruzarse con otro usuario.

### Flujo 1 — Registro (`/onboarding`, ≤90s para Tier-0)

1. `/onboarding` — confirmación de idioma (es-VE default), país (VE preset).
2. `/onboarding/auth` — Privy login (email u OTP teléfono). Privy crea la wallet MPC.
3. `/onboarding/perfil` — nombre, alias, email backup opcional.
4. `/onboarding/kyc` — **Tier-1**: cédula (V/E + 7-8 dígitos), match de nombre, selfie + foto de cédula. **Vendor: Truora** (soporta cédula VE vía SAIME). Fallback: Sumsub.
5. Landing en `/home` con banner "Verifica para depositar más de $200" si Tier-1 incompleto.

**Modelo de tiers (sustituye el `AML_LIMITS` hardcoded actual):**

| Tier | Caps                       | Requerido            |
|------|----------------------------|----------------------|
| 0    | $200/día, $500/mes         | Email/teléfono       |
| 1    | $2 000/día, $20 000/mes    | Cédula + selfie      |
| 2    | $10 000/día, $100 000/mes  | + domicilio + SoF    |

### Flujo 2 — Compra Bs→USDC (`/comprar`)

1. Usuario indica monto en Bs o USDC objetivo. UI muestra quote agregado (mejor de los partners registrados), spread Tropico explícito (BCV+1.5%), timer de expiración 60s.
2. Al aceptar, backend crea `ramp_orders` row con `status: AWAITING_DEPOSIT`, selecciona el partner más barato, genera instrucciones específicas de Pago Móvil (cédula/banco/teléfono del colector del partner + código de referencia único).
3. UI muestra: *"Envía exactamente X,XX Bs por Pago Móvil al **0414-XXXXXXX, Banesco, V-XXXXXXX**, concepto **TR-AB12CD**"*. Botones de copia grandes. Carlos flotante con "¿necesitás ayuda?".
4. Usuario hace Pago Móvil desde su app bancaria VE (out-of-band).
5. **Partner webhook → `/api/ramp/webhook/[partner]`** confirma depósito (matched por código de referencia).
6. Backend dispara settlement: oracle service llama `tropico_bs.mint_bsx` con el equivalente en USDC (USDC viene del **buffer de liquidez Tropico**, pre-fondeado ~$50k para MVP), inmediatamente llama `burn_bsx` para liberar USDC limpio a la **ATA del usuario**. Net: BsX vive segundos en tx history (transparencia on-chain), wallet del usuario termina con USDC.
7. Usuario recibe push/email "Recibiste $XX,XX USDC". Order flips a `SETTLED`.

**Trampa de cents-fingerprint:** monto exigido incluye céntimos que codifican el order id mod 100 (ej. 102,47 Bs). Si el usuario manda mal, script auto-refund T+30min ejecutado por el partner.

**Entregables:**
- `app/onboarding/` (nuevo): 4 rutas, reusa patrones de `components/SplashScreen.tsx`.
- `app/comprar/` (nuevo): page + `BuyForm.tsx` reusando lógica de quote de `components/BsSwapFormPrivy.tsx`.
- `lib/kyc/index.ts` + `lib/kyc/truora.ts` (nuevos): vendor-agnostic API.
- `lib/ramp-partners/types.ts` (nuevo): interfaz `RampPartner` con `quoteBuy`, `createDepositOrder`, `confirmDeposit`, `cancelOrder`, `healthCheck`.
- `lib/ramp-partners/{reserve,eldorado,vita}.ts` (nuevos): ship con los 2 que firmen primero, mock del tercero detrás de feature flag.
- `lib/ramp-partners/router.ts` (nuevo): selección por (precio, latencia p95, error rate, liquidez disponible).
- `app/api/ramp/{quote,order,settle,webhook/[partner]}/route.ts` (nuevos). Webhook con HMAC + idempotencia por `reference`.
- `programs/tropico_bs/src/lib.rs` (extender): añadir `release_usdc(amount, recipient)` gated por `oracle_authority`, para evitar el round-trip mint+burn cuando ya está neto.
- `app/legal/{privacidad,terminos}/page.tsx` (nuevos).

**Reuso:** `lib/tropico-bs-bridge.ts` (matemática spread), `lib/precio-bs.ts` (BCV ref), `programs/tropico_bs` (leg on-chain), `lib/auth-context.tsx` + Privy, `components/RailStatusBanner.tsx` (status partner en `/comprar`).

**Dependencias externas:**
- Contratos firmados con ≥2 de: Reserve, El Dorado, Vita Wallet. Definen liability por AML/SAR del lado bolívar (debe ser el partner licenciado).
- Truora ($0.50-$1.50/verificación, presupuesto $500 para Fase 1).
- Buffer USDC Tropico ~$50k en mainnet (devnet usa faucet).
- KMS para signer backend (AWS KMS o Turnkey policy-bound key).

**Riesgos:**
- Concentración de partner: si Reserve corta API, desaparece la mitad. Mitigación: nunca live con <2 partners activos; status en UI.
- SUDEBAN podría declarar la agregación misma como servicio de pago regulado. Mitigación: contratos definen a Tropico como "vendor tecnológico" y partner como "merchant of record" del leg Bs. Counsel VE (~$3k retainer).
- Webhook spoofing. Mitigación: HMAC + IP allowlist + idempotencia por `reference`.
- Liquidez: buffer USDC se drena si partner tarda en reponer. Mitigación: SLA T+1 contractual; auto-pausa `/comprar` si buffer <20% volumen diario promedio.

**Done criteria:**
- E2E devnet: signup → KYC sandbox aprobado → Pago Móvil simulado vía sandbox webhook → USDC visible en wallet, todo <5min.
- `/comprar` muestra quote agregado vivo de ≥2 sandboxes reales.
- Ningún code path en `/comprar` menciona "P2P", "trader", "match", "contraparte (usuario)".

---

## Fase 2 — Cambio bidireccional + Transferencia robusta (semanas 7–10)

**Meta:** agregar el leg USDC→Bs (off-ramp al banco propio del usuario), pasar transferencias de "funciona" a "confiable", hacer claim links reales on-chain.

### Flujo 3 — Cambio (`/cambiar`, bidireccional)

`/cambiar` ya tiene tab Jupiter (SOL/USDC/USDT/JTO/JUP) y tab Bs. Re-cableado:

- **Tab Bs-comprar** → redirect a `/comprar` (Fase 1).
- **Tab Bs-vender** (NUEVO): USDC → Bs al banco VE propio del usuario.

**User journey vender:**
1. `/cambiar` → tab Bs → "Vender USDC".
2. Selecciona destino: contacto Pago Móvil pre-guardado (cédula+banco+teléfono propios) desde `lib/contacts.ts`, o entra uno nuevo.
3. Monto + quote (Tropico sell rate = BCV − 1.0% spread + 0.5% fee). Lock 60s.
4. Confirma → wallet firma `tropico_bs.mint_bsx` (USDC al vault BsX), inmediatamente `burn_bsx` con `recipient = partner_collector_pubkey` usando `release_usdc` (añadido en Fase 1). USDC llega al wallet del partner.
5. Backend `/api/ramp/payout` instruye al partner ejecutar Pago Móvil de su banco VE al beneficiario del usuario. Partner confirma vía webhook ~30s-5min.
6. UI muestra progreso: firmado ✓ → partner recibió USDC ✓ → Pago Móvil ejecutado ✓ → referencia bancaria. Reuso de `lib/tropico-bs-bridge.ts:buildReceiptText`.

**El `setTimeout(2500)` mock de `lib/tropico-bs-bridge.ts:executeBsBridge` se reemplaza por la llamada real al partner.** Firma estable: `components/PagarComercioBs.tsx` y `/pagar-servicios` siguen funcionando — mismo motor, distinto rail (pago a comercio vs. pago a sí mismo).

### Flujo 4 — Transferencia (`/enviar`, `/claim`)

`/enviar` ya hace transfers SPL reales vía Privy. Las brechas son off-chain UX.

**Upgrades Fase 2:**
- **Escrow on-chain para claim links** (reemplaza simulación localStorage de `app/claim/[id]/`):
  - Programa Anchor nuevo `programs/tropico_claim/`: PDA seeded por `[b"claim", sender, nonce]`, holds tokens hasta `claim_by_recipient(secret_hash)` o `cancel_by_sender(after_expiry)`.
  - Token-2022 transfer-hook fue evaluado y descartado: agrega riesgo de compatibilidad con USDC clásico. Stick con SPL + escrow PDA.
  - Backend `app/api/claim/[id]/route.ts` (nuevo) guarda sólo metadata (hint del destinatario, expiry, sender pubkey). El secreto vive en el fragment de la URL, nunca toca server.
- **Trust signals en address book**: `lib/contacts.ts` extiende con flag "verified Tropico user" (lookup server por pubkey), warning UI primer envío a address nuevo.
- **Memo + receipt**: cada transfer adjunta memo Solana `tropico:tx:v1:{purpose,note}`; `/enviar` muestra página de receipt compartible.
- **Limits respetan tier**: `/enviar` lee `getKycTier()`; Tier-0 cap $200/tx con upsell a KYC.

**Entregables:**
- `programs/tropico_claim/` (nuevo): `create_claim`, `redeem_claim`, `cancel_claim`.
- `app/api/claim/[id]/route.ts` (nuevo): sólo metadata.
- `app/claim/[id]/ClaimView.tsx` (reescribir): llama programa nuevo.
- `app/cambiar/CambiarTabs.tsx` (editar): wire Bs-vender a flujo nuevo.
- `components/SellUsdcForm.tsx` (nuevo): destino + quote + confirm.
- `lib/tropico-bs-bridge.ts` (reescribir `executeBsBridge`): llama `lib/ramp-partners/router.ts:requestPayout`.
- `lib/ramp-partners/*.ts` (extender cada adapter con `quotePayout`, `createPayoutOrder`).
- `app/api/ramp/payout/route.ts` (nuevo).
- `app/enviar/EnviarTabs.tsx` (editar): tier-aware caps, contact verification badge.
- `lib/contacts.ts` (extender): verified flag, server sync.

**Reuso:** `programs/tropico_bs` (mint/burn + `release_usdc`), adapters Fase 1 + endpoints payout, `lib/suiche7b-parser.ts`, `buildReceiptText`, `components/SendForm.tsx`, `components/SendToAddressPrivy.tsx`.

**Dependencias externas:**
- APIs de payout de partners (mismo contrato Fase 1, verificar antes de comprometer fechas).
- Slot de auditoría para `tropico_claim` (OtterSec/Sec3, $5-10k) antes de mainnet.

**Riesgos:**
- Asimetría de liquidez: usuarios pueden querer vender más Bs-side del que partners absorben. Mitigación: caps por partner como techo vivo en UI; queue + ETA al superarlo.
- Desync peg: lag BCV oracle vs. quote real del partner. Mitigación: mostrar quote del partner, no derivado de BCV.
- Bug en programa escrow: fondos bloqueados. Mitigación: `cancel_by_sender` con expiry 7 días; auditar antes de mainnet.

**Done criteria:**
- Devnet E2E: usuario con $100 USDC vende $50 → Bs llega a partner sandbox → receipt muestra referencia bancaria real.
- Claim link creado en devnet, claimed desde segundo dispositivo, fondos mueven on-chain (verificable Solscan).
- `/cambiar` USDC→Bs latencia p95 <60s end-to-end (partner sandbox).

---

## Fase 3 — Hardening & growth (semanas 11–14)

**Meta:** AML production-ready, observabilidad, primer de segunda jurisdicción, tercer partner live.

**Entregables:**
- **AML real**: integrar **Chainalysis KYT** o **TRM Labs** screening en cada inbound (origen del wallet) y outbound (USDC ATA destino). `lib/aml/screening.ts` (nuevo), llamado desde `/api/ramp/order` y `/enviar` confirm.
- **Velocity rules**: motor de reglas server-side (`lib/aml/rules.ts`): flag (no bloquear) >3 depósitos/día desde mismo pubkey externo, montos repetidos justo bajo threshold. Flags → manual review queue en `app/admin/aml/`.
- **Audit trail SAR-ready**: cada order/settlement/screening append-only en Postgres con hash chain; tool de export para compliance de partners.
- **Observabilidad v2**: Grafana dashboard (peg deviation, partner uptime, settlement latency p50/p95/p99, AML hit rate). PagerDuty para partner-down y peg-stale.
- **Tercer partner live**: traer el tercer LLP de sandbox a producción — el router necesita failover real (un demo con sólo 2 no es honesto).
- **Carlos aware**: extender `lib/carlos-prompt.ts` para que pueda responder "¿por qué mi compra está pendiente?" leyendo `ramp_orders` (tool read-only en `lumen-capabilities/`).
- **Tropico Card primer**: NO construir la card aún, pero: campo `card_eligible` en `users`, funnel `app/onboarding/kyc-tier-2/`, conversación Reap/Rain iniciada.
- **Primer 2da jurisdicción**: campo `jurisdiction` ya abstraído; adapter `lib/ramp-partners/colombia/{bitso,littio}.ts` detrás de feature flag.

**Reuso:** todo de Fases 0-2. Esta fase no agrega user-facing flows nuevos, hace los existentes bank-grade.

**Dependencias externas:**
- Contrato Chainalysis/TRM (~$1-2k/mes entry).
- PagerDuty + Grafana Cloud.
- Tercer LLP firmado.

**Riesgos:**
- AML hit en usuario real obliga a freeze, pero Tropico es non-custodial — no puede congelar. Política: flag → suspender uso del rail Tropico → usuario sigue self-custodiando sus fondos. Documentar en T&Cs.

**Done criteria:**
- 3 partners live, router probado en failover (drill planificado).
- Pen test (Halborn / OtterSec) limpio para critical/high.
- Load test 24h: 100 buys + 100 sells concurrentes, p95 settlement <120s, cero stuck.

---

## Inventario de archivos críticos

**Nuevos (high-impact):**
- `app/onboarding/{page,auth,perfil,kyc}/page.tsx`
- `app/comprar/{page,BuyForm}.tsx`
- `app/api/ramp/{quote,order,settle,payout}/route.ts`, `app/api/ramp/webhook/[partner]/route.ts`
- `app/api/{aml/ledger,health,claim/[id]}/route.ts`
- `lib/ramp-partners/{types,router,reserve,eldorado,vita}.ts`
- `lib/kyc/{index,truora}.ts`
- `lib/aml/{screening,rules}.ts`
- `programs/tropico_claim/src/lib.rs`
- `supabase/migrations/0001_init.sql`
- `scripts/peg-oracle.mjs`

**Extender (load-bearing):**
- `lib/profile-store.ts` — KYC tier + email/phone/cédula/jurisdiction, server-backed.
- `lib/aml.ts` — tier-aware caps, ledger server.
- `lib/tropico-bs-bridge.ts` — reemplazar `setTimeout` por payout real; API estable.
- `programs/tropico_bs/src/lib.rs` — agregar `release_usdc(amount, recipient)` gated por `oracle_authority`.
- `components/BsSwapForm.tsx` — borrar `POOL_BS_AVAILABLE`, renderizar quote desde `/api/ramp/quote`.
- `lib/p2p-swap.ts` — renombrar a `lib/bs-quote.ts`, reducir a helpers de pricing (el nombre engaña).
- `app/cambiar/CambiarTabs.tsx` — Bs-comprar redirect a `/comprar`; Bs-vender → `SellUsdcForm`.
- `app/claim/[id]/ClaimView.tsx` — llamar escrow on-chain.
- `lib/carlos-prompt.ts` — borrar lenguaje P2P-marketplace; enseñar buy/sell/claim flows y partner status.

---

## Verificación (aplicada por fase, antes de merge a `main`)

1. **Unit + property tests** en `tests/` para `lib/ramp-partners/router.ts` (quote selection, failover), `lib/aml/` (tier caps, ledger), programas Anchor (`anchor test`).
2. **Devnet E2E**: extender `scripts/smoke-tests.mjs` con flujo scriptado: register → KYC sandbox approve → comprar 100 Bs → balance check → vender 1 USDC → balance check → enviar a segunda wallet → claim desde tercer dispositivo.
3. **Partner sandbox E2E**: cada sandbox webhook + payout ejecutado en job nocturno; falla pages on-call.
4. **Walkthrough regulatorio**: counsel VE revisa cada string UI en `/comprar`, `/cambiar`, `/legal/*` antes de cada ship.
5. **Mainnet canary**: post-devnet sign-off, ship a mainnet con caps $500 y allowlist 50 usuarios x 5 días antes de abrir.

---

## Pitch al inversor (para responder a LEVELoxyz)

> *"No usamos P2P. La pata Bs↔USDC la liquidamos como contraparte vía un agregador de rampas licenciadas en Venezuela (Reserve, El Dorado, Vita Wallet), con el peg on-chain visible en nuestro programa Anchor `tropico_bs`. El usuario siempre paga al banco del partner, nunca a otro usuario; nosotros somos el router que escoge el mejor precio/latencia y liquidamos transparentemente en Solana. Es la misma idea de routing que Debridge aplica entre chains, aplicada entre el banco venezolano y Solana."*

---

## Costos estimados (CAPEX + 12 meses OPEX)

| Concepto                                  | Costo único       | OPEX mensual  | Cuándo se necesita |
|-------------------------------------------|-------------------|---------------|--------------------|
| Buffer USDC mainnet (capital de trabajo)  | ~$50 000          | —             | Fase 1             |
| Counsel VE (retainer + revisión legal)    | ~$3 000           | $500          | Fase 0             |
| Truora KYC (pay-per-verification)         | —                 | $200-500      | Fase 1             |
| Supabase Pro                              | —                 | $25           | Fase 0             |
| Railway / oracle hosting                  | —                 | $5            | Fase 0             |
| Sentry team                               | —                 | $26           | Fase 0             |
| Axiom logs                                | —                 | $25           | Fase 0             |
| AWS KMS / Turnkey                         | —                 | $50-100       | Fase 1             |
| Auditoría `tropico_claim` (Anchor)        | $5 000-10 000     | —             | Fase 2             |
| Chainalysis KYT (entry tier)              | $2 000 setup      | $1 000-2 000  | Fase 3             |
| PagerDuty + Grafana Cloud                 | —                 | $50           | Fase 3             |
| Pen test (Halborn/OtterSec)               | $10 000-20 000    | —             | Fase 3             |
| **Total CAPEX (sin salarios)**            | **~$70-85k**      |               |                    |
| **OPEX mensual estimado en producción**   |                   | **$2-3k/mes** |                    |

No incluye: salarios devs (asumimos founder + 1 senior, presupuesto aparte), marketing, BD de partners, costos de adquisición de usuario.

---

## KPIs por fase (criterios de éxito mensurables)

**Fase 0 (semanas 0-2):**
- CI grep limpio (`POOL_BS_AVAILABLE` count = 0, `/intercambio-p2p` count = 0).
- `/api/health` p99 latency <200ms con `peg_age_s < 120` durante 7 días corridos.
- Cobertura tests: `lib/aml.ts` ≥80% líneas, `lib/profile-store.ts` ≥70%.

**Fase 1 (semanas 3-6):**
- ≥2 partners en sandbox con webhook validado (HMAC verde).
- 10 testers internos completan onboarding+compra <5min p50.
- Conversion rate signup→first-buy ≥40% en testers (smoke test).
- 0 órdenes "stuck" (>30min sin settle) en 100 órdenes sandbox.

**Fase 2 (semanas 7-10):**
- Latencia p95 USDC→Bs end-to-end <60s (sandbox), <120s (mainnet canary).
- Claim links: ≥95% redimidos en <24h o cancelados correctamente al expiry.
- Auditoría `tropico_claim`: 0 critical, 0 high.

**Fase 3 (semanas 11-14):**
- 3 partners live, drill de failover <30s recovery time.
- 50 usuarios canary completan ≥1 compra y ≥1 venta cada uno sin escalación a soporte.
- AML hit rate <2% (proxy de fricción honesta), false-positive rate <50% en flags.
- Pen test limpio critical/high.

---

## Alternativas descartadas (registro para auditoría de decisión)

| Alternativa                                        | Por qué se descartó                                                                                                              |
|----------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| **Tropico Treasury directo** (cuentas propias en Banesco/Mercantil) | Requiere registro SUDEBAN, capital float grande exposición a devaluación BCV, ~6 meses extra a mainnet. MVP-killer.   |
| **AMM on-chain puro con BsX persistente**          | Usuario expuesto a devaluación BCV en saldo BsX. UX hostil, contradice posición README ("no es instrumento de hold").            |
| **P2P matching con escrow**                        | El brief del founder lo prohíbe explícitamente. Modelo Binance/LocalBitcoins agrega riesgo de fraude usuario-a-usuario y soporte. |
| **Token-2022 transfer-hook para claim links**      | USDC clásico no es Token-2022; compatibilidad rota. Stick con SPL + escrow PDA en `tropico_claim`.                              |
| **Cloudflare Worker + KV vs Supabase**             | Necesitamos JOIN entre `users`/`ramp_orders`/`aml_ledger`. KV no escala para queries relacionales; Supabase es más barato + RLS. |
| **Sumsub como KYC primary**                        | Truora tiene mejor cobertura SAIME (cédula VE) out-of-the-box. Sumsub queda como fallback.                                       |
| **MoonPay/Transak para Bs**                        | No soportan VES como fiat de entrada. Sirven para diáspora (USD→USDC), no para el caso de uso doméstico VE.                      |

---

## Fuera de alcance del MVP (NO se construye en estas 14 semanas)

Estos puntos son válidos pero **explícitamente diferidos** para post-MVP, para mantener el foco:

- **Tropico Card** (debit USDC + cashback): primer scaffolding en Fase 3, construcción real Q1 2027 con Reap/Rain.
- **Compras de SOL nativo desde Bs**: el MVP cubre Bs→USDC; SOL se obtiene swap-eando USDC→SOL en el tab Jupiter ya existente. Compra directa Bs→SOL queda post-MVP.
- **WhatsApp Bot productivo**: la demo en `/carlos/whatsapp` queda como demo. Producción Q3 2026 según ROADMAP.md original.
- **Lumen server completo**: Carlos AI sigue con direct LLM calls (DeepSeek → Gemini fallback). Lumen runtime real es post-MVP.
- **Yield real (Marinade/Kamino)**: `/guardar` queda con UI actual (mock). Activación real post-MVP.
- **DCA, limit orders, swap history en USD/Bs**: roadmap Q3 original, no en MVP.
- **Tropico Pay GA con SDK**: el endpoint `/api/checkout/create` queda como está; partner enrollment formal es post-MVP.
- **Expansión LATAM (CO/AR/MX/PE/CL)**: campo `jurisdiction` queda abstraído en Fase 3, adapters detrás de feature flag pero sin partners reales.
- **Mobile nativa (React Native / Solana Mobile)**: PWA actual sirve. Native app es Q1 2027.
- **Tropico Earn / loyalty / cashback layer**: post-MVP.
- **Multi-sig Squads para treasury**: post-MVP. KMS single-signer es suficiente para Fase 1.

---

## Glosario

- **BsX**: token SPL transitorio del programa `tropico_bs`. Representa bolívares en on-chain por segundos (mint+burn en misma tx).
- **BCV**: Banco Central de Venezuela. Publica tasa oficial USD/VES.
- **Cents-fingerprint**: técnica de reconciliación donde el monto exigido incluye céntimos que codifican el `order_id mod 100`. Evita misattribution.
- **Cédula**: documento de identidad venezolano. Formato `[VEvj]\d{7,10}`.
- **JIT** (Just-In-Time): el rail BsX existe solo durante la ventana de pago, no como saldo persistente.
- **KMS**: Key Management Service (AWS) — guarda la clave privada del backend signer fuera del código.
- **LLP**: Licensed Liquidity Partner — rampas fiat venezolanas licenciadas (Reserve, El Dorado, Vita Wallet).
- **MPC**: Multi-Party Computation. Privy divide la clave privada en 3 shares; ninguno ve la llave completa.
- **Pago Móvil VE**: rail de pagos interbancarios de Venezuela. Funciona con cédula + banco + teléfono.
- **Privy**: proveedor de wallet embebida non-custodial con MPC.
- **SAIME**: Servicio Administrativo de Identificación venezolano. Source-of-truth de cédulas.
- **SUDEBAN**: regulador bancario venezolano (Superintendencia de Bancos).
- **SUNACRIP**: regulador crypto venezolano, **desaparecido** en 2023. No hay sucesor activo.
- **Suiche7B**: estándar de QR para Pago Móvil en Venezuela.
- **Tier 0/1/2**: niveles de KYC con caps de volumen progresivos.

---

## Próximos pasos inmediatos (semana 0)

Cuando este roadmap esté aprobado para ejecutar:

1. **Founder:** firmar carta de intención con ≥1 partner (Reserve preferido por mayor liquidez), crear cuenta Supabase, abrir línea con counsel VE para revisión preliminar de modelo agregador.
2. **Founder + dev 1 (full-stack):** kick-off semana 0: setup Supabase + Sentry + Axiom + Railway, scaffolding `supabase/migrations/0001_init.sql`, borrar `POOL_BS_AVAILABLE`.
3. **Dev 2 (contratos/backend):** kick-off semana 0: armar `scripts/peg-oracle.mjs`, deployar a Railway, validar contra `tropico_bs` devnet con `attest_reserves`.
4. **Founder:** abrir conversación con Truora para sandbox API key + presupuesto inicial $500.
5. **Founder:** responder a LEVELoxyz citando este doc — *"este es nuestro early deploy plan, sin token, ruteado vs P2P"*.

---

## Referencias internas

- README principal: `README.md`
- Roadmap original Q3 2026 → Q1 2027: `docs/ROADMAP.md`
- Spec BsX: `docs/PROTOCOL_BSX.md`
- Arquitectura general: `docs/ARCHITECTURE.md`
- Backend on-chain: `docs/BLOCKCHAIN_BACKEND.md`
- Spec Tropico Pay: `docs/INTEGRATION_API.md`
- Sistema de claim links: `docs/CLAIM_SYSTEM.md`
- Carlos AI: `docs/CARLOS_AI.md` y `docs/LUMEN_INTEGRATION.md`
- Guía de demo para jueces: `docs/JUDGE_DEMO_GUIDE.md`
