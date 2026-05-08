# Tropico Constitution

> Constitución del proyecto Tropico — la red económica del venezolano en Solana.
> Estos principios son **non-negotiable** y rigen todas las decisiones técnicas y de producto.

## Core Principles

### I. Non-Custodial Estricto (NON-NEGOTIABLE)

Tropico **NUNCA** accede, custodia, ni puede mover llaves privadas de los usuarios. Toda firma de transacción se ejecuta cliente-side via Privy MPC (Multi-Party Computation) o Wallet Adapter. Cuando hay autonomía agéntica (Modo Agente), las llaves están en infraestructura Privy con session keys delegadas y policy engine — **jamás** en prompts ni memoria de Carlos AI.

**Implicaciones**:
- Cero servicios custodiales tipo Binance/Reserve.
- Si Tropico cierra mañana, los usuarios mantienen acceso a sus fondos vía export de seed phrase Privy.
- Todo fee on-chain (Jupiter `platformFeeBps`, merchant 1%) es verificable públicamente en Solscan.

### II. Cero Programa Anchor Custom (NON-NEGOTIABLE para MVP)

Tropico se construye exclusivamente sobre **protocolos abiertos de Solana**: SPL Token Program, Jupiter v6, Solana Pay spec, Marinade (mSOL), Kamino. **No se escriben programas custom en Rust/Anchor** salvo decisiones explícitas post-MVP (ej. escrow para claim links Q3 2026, governance DAO Q4 2026).

**Por qué**: Reinventar protocolos abiertos es orgullo de junior; usarlos es ingeniería madura. Reduce superficie de auditoría, acelera time-to-market, y mantiene compatibilidad infinita con el ecosistema.

### III. Mobile-First PWA Venezuela-Friendly

Todo se diseña primero para Android viejo (360px ancho, conexión 3G, RAM limitada). Cero app nativa hasta Q1 2027. Cero Play Store/App Store dependence — distribución vía URL pública + "Add to Home Screen" PWA.

**Implicaciones**:
- Bundle JS bajo 200KB en first load.
- Imagenes optimizadas (Next/Image + WebP).
- Touch targets ≥ 44px.
- Funciona offline-tolerant donde sea posible (cache de precios, manifest PWA).

### IV. Solana-Maxi Branding sin Disculpas

Cero menciones positivas a Ethereum, Tron, o Bitcoin en copy de producto. Estas se mencionan **únicamente para contrastar** (ej. "Solana es 1000× más barato que Tron"). Toda integración técnica vive en Solana mainnet.

**No se acepta**: bridges multi-chain (Wormhole), wrapped assets de otras chains, soporte a EVM.

**Sí se acepta**: comparativas educativas en Carlos AI cuando el usuario pregunta.

### V. Identidad Venezolana Auténtica (Caribeño + Carlos)

El producto **vive y respira venezolano**. No "español neutro", no rioplatense, no anglicismos sin traducir. Carlos AI usa muletillas locales (mi pana, vale, panita) con moderación. La paleta visual prioriza colores caribeños cálidos (sun #FFD166, coral #EF476F, sea green #06D6A0) sobre la paleta tech fría.

**Prohibido**: opinión política, garantías de rendimiento, jerga cripto sin explicación, comparaciones con bancos específicos por nombre (genérico: "POS tradicional").

### VI. Cero Backend Persistente en MVP

Toda la app corre client-side + Edge API routes (Next.js). Estado en localStorage o sessionStorage. Sin Postgres, sin Redis, sin Auth0 — usamos Privy para auth, Solana RPC para state on-chain, ve.dolarapi.com para tasa bs.

**Justificación**: Reduce complejidad operacional, costos de infra, y superficie de seguridad. Backend persistente solo cuando se justifique (Q3+: comercios afiliados, claim links históricos, agentic cron jobs).

### VII. Honestidad Demo (Mocks Visibles)

Cuando un flow no está completo en producción real, se admite explícitamente con banner visual ("Demo del hackathon"), tooltip, o copy honesto en la pantalla. **No se simulan transacciones reales engañando al usuario**. Si Privy no está configurado, el botón dice "DEMO" y navega a /home con mocks; no firma nada falso.

## Technology Stack (NON-NEGOTIABLE)

- **Framework**: Next.js 15 App Router + React 19 + Tailwind 3
- **Wallet primario**: Privy embedded MPC (`@privy-io/react-auth`)
- **Wallet fallback**: Solana Wallet Adapter (Phantom + Solflare)
- **Swap**: Jupiter v6 vía REST (lite-api.jup.ag) con `platformFeeBps=50`
- **Pay**: Solana Pay spec con QR client-side via `qrcode` lib
- **AI agente**: **Lumen** (motor) + **OpenClaw** (firma autónoma) + **Hermes** (memoria — opcional)
- **LLM**: DeepSeek-V4-flash via LiteLLM, fallback Gemini 2.0 Flash
- **RPC**: Helius (free tier 100K req/mes)
- **Tasa USD/VES**: ve.dolarapi.com (paralelo, no oficial)
- **Hosting**: Vercel
- **Tipografía**: Honk (wordmark) + Bricolage Grotesque (display) + Manrope (body)
- **Iconos**: Lucide React + emoji culturales (🌴, 🇻🇪) preservados

## Revenue Model — 5 streams desde día 1

| Stream | Tasa | Mecánica |
|---|---|---|
| Swap (Cambiar) | 0.5% | Jupiter `platformFeeBps=50` → ATA propio |
| Send (Enviar) | 0.3% | Spread USDC peer-to-peer |
| Save (Guardar) | 2% del yield | Performance fee sobre mSOL/Kamino |
| Pay merchant (Cobrar) | 1% | Al merchant por cada cobro |
| Carlos AI | acelerador | Multiplica retention 2-3× |

**Cero subscription en MVP.** Cero ads. Cero data selling. Solo microcomisiones transparentes.

## Development Workflow

### Spec-Driven Development (SDD)

Tropico adopta **GitHub Spec Kit** (`.specify/`) para features substanciales:
1. **Constitution** — este archivo (principios)
2. **Specify** — `.specify/specs/<feature>/spec.md` (requirements)
3. **Plan** — `.specify/specs/<feature>/plan.md` (estrategia técnica)
4. **Tasks** — `.specify/specs/<feature>/tasks.md` (breakdown ejecutable)
5. **Implement** — código
6. **Verify** — checklist + analyze

Para features pequeños (<100 LOC) se puede skippear Specify y arrancar directo con código + commit conventional.

### Cualquier cambio que toque

- **Llaves privadas** → bloqueado por principio I
- **Anchor program nuevo** → requiere RFC + aprobación explícita (principio II)
- **Backend persistente** → requiere justificación de costo/beneficio (principio VI)
- **Bancos por nombre** → bloqueado, usar términos genéricos (principio V)
- **Custodial wallet** → bloqueado por principio I

## Governance

Esta constitución supersede toda otra práctica. Cualquier desviación requiere:
1. RFC en `docs/RFCs/<numero>-<nombre>.md`
2. Justificación documentada
3. Plan de migración si rompe contrato existente

**Violaciones automáticas** (refactor inmediato sin RFC):
- Hardcodear nombres de bancos
- Tocar llaves privadas en client/server
- Crear backend sin justificación
- Copy en inglés (excepto nombres tokens/términos cripto estándar)
- Promesas de rendimientos garantizados en Carlos AI

## Referencias

- Brief master: `docs/TROPICO_BRIEF.md`
- Roadmap: `docs/ROADMAP.md`
- Wallet model: `docs/WALLET_GUIDE.md`
- TropiCoin spec: `docs/TROPICOIN_SPEC.md`
- Lumen integration: `docs/LUMEN_INTEGRATION.md`

---

**Version**: 1.0.0 | **Ratified**: 2026-05-08 | **Last Amended**: 2026-05-08
