# Tropico Wallet — Colosseum Submission

**Nombre del proyecto**: Tropico Wallet
**Tagline**: "Bolívares Onchain — la primera capa de moneda soberana-estable y transparente para Venezuela, construida en Solana."
**Founder**: Rafael Oviedo (solo founder, venezolano) — [docs/TEAM.md](TEAM.md) · [docs/FOUNDER_NARRATIVE.md](FOUNDER_NARRATIVE.md)
**Demo live**: https://tropico-rho.vercel.app
**Repo**: este mismo

---

## Para jueces de Colosseum — los 6 criterios, mapeados

> Esta sección existe para que cada juez encuentre rápido la evidencia que necesita para puntuar cada criterio oficial. Cada link va al doc dedicado.

| # | Criterio Colosseum | Dónde está la evidencia |
|---|---|---|
| 1 | **Founder + Market Fit** | [`TEAM.md`](TEAM.md) — solo founder, venezolano, 6 años cripto, 3 años software · [`FOUNDER_NARRATIVE.md`](FOUNDER_NARRATIVE.md) — por qué este founder, este problema, este momento |
| 2 | **Insight** | [`INSIGHT.md`](INSIGHT.md) — tesis "el venezolano ya migró", validada contra los 5.400+ proyectos del corpus oficial de Colosseum (similaridad máxima 0.056 = el espacio bolívar-onchain está vacío) |
| 3 | **Product + Execution** | Esta página (sección "La solución" + "Qué es nuevo desde Dev3pack") · [`PROTOCOL_BSX.md`](PROTOCOL_BSX.md) (spec técnica) · [`ARCHITECTURE.md`](ARCHITECTURE.md) · demo live arriba · Dev3pack 2026: **#1 Venezuela / #28 global / #10 LatAm** de 386 proyectos |
| 4 | **Market Size** | [`MARKET_OPPORTUNITY.md`](MARKET_OPPORTUNITY.md) — TAM $415B LatAm crypto, SAM $10-15B GMV VE, SOM $47M GMV año 1, fuentes: Chainalysis, Galaxy Research, a16z, Pantera, BID |
| 5 | **Founder Communication** | [`PITCH.md`](PITCH.md) — narrativa maestra · video pitch (link pendiente) · este README en 30 segundos arriba · capacidad de responder preguntas duras: [`FAQ_FOR_JUDGES.md`](FAQ_FOR_JUDGES.md) |
| 6 | **Viability** | [`BUSINESS_MODEL.md`](BUSINESS_MODEL.md) — 5 streams, unit economics, path a break-even · [`COMPETITIVE_LANDSCAPE.md`](COMPETITIVE_LANDSCAPE.md) — quadrante competitivo + por qué Tropico no se copia rápido |

---

## El problema

Venezuela tiene 30 millones de habitantes y una moneda que pierde entre el 60% y el 80% de su poder de compra cada año. El ciudadano que logró dolarizarse —usando USDT en Tron vía Binance P2P— resuelve la devaluación pero queda atrapado en un ecosistema cerrado, lento y con fees del 2-5% en cada movimiento. La diáspora venezolana envía remesas pagando entre el 8% y el 15% en comisiones; la plata demora días en llegar.

Para el comercio, el panorama es peor. Un POS tradicional cobra el 4.5% más IVA, liquida en 24-72 horas y expone al merchant al riesgo de chargebacks. Pago Móvil es el único rail digital nativo venezolano, pero opera en bolívares —que se devalúan entre la venta y el cierre del día— y ningún protocolo DeFi ni wallet Solana tiene integración real con él. El venezolano que quiere pagar o cobrar en USDC sigue teniendo que convertir a bolívares, vía banco, vía una app custodia de terceros.

El bolívar no vive en ninguna cadena como primitivo de primera clase. No hay un BsX, no hay un activo que represente la moneda venezolana con reservas verificables on-chain, compatible con DeFi y transferible en fracciones de segundo. Eso es el agujero que Tropico viene a cerrar.

---

## La solución

**BsX** es el nuevo primitivo: un token sintético anclado al bolívar, respaldado 1:1 en reservas USDC custodiadas por el programa `tropico_bs` en Solana, con atestación pública de reservas que cualquiera puede invocar. Es el primer bolívar en cadena con transparencia criptográfica verificable.

**Tropico Wallet** es la consumer app construida encima: nueve módulos integrados que cubren el ciclo económico completo del venezolano —swap, QR merchant, yield, envío de remesas, Pago Móvil VE, y Carlos AI como copiloto.

```
┌────────────────────────────────────────────────────────────────┐
│                        TROPICO ECOSYSTEM                        │
├─────────────────────────────────┬──────────────────────────────┤
│     PROTOCOLO                   │     WALLET / APP              │
│                                 │                               │
│  ┌──────────────────────────┐   │  ┌────────────────────────┐  │
│  │  programs/tropico_bs     │   │  │  9 módulos consumer     │  │
│  │  ─────────────────────   │   │  │  /cambiar  /cobrar      │  │
│  │  mint_bsx(usdc_amount)   │   │  │  /enviar   /guardar     │  │
│  │  burn_bsx(bsx_amount)    │   │  │  /pagar-servicios       │  │
│  │  attest_reserves()       │   │  │  /remesas  /carlos      │  │
│  │  update_peg(oracle)      │   │  │  /perfil   /descubrir   │  │
│  └──────────────────────────┘   │  └────────────────────────┘  │
│                                 │                               │
│  ┌──────────────────────────┐   │  ┌────────────────────────┐  │
│  │  programs/tropico_treasury│  │  │  Carlos AI / Lumen      │  │
│  │  record_fee (audit trail) │  │  │  7 capabilities Python  │  │
│  └──────────────────────────┘   │  └────────────────────────┘  │
│                                 │                               │
│  Pago Móvil VE rail             │  @tropico/sdk (merchants)     │
│  lib/tropico-bs-bridge.ts       │  Offline: durable nonces      │
│  lib/suiche7b-parser.ts         │  Privy MPC (non-custodial)    │
└─────────────────────────────────┴──────────────────────────────┘
```

---

## Qué es nuevo desde Dev3pack

Tropico participó anteriormente en Dev3pack. Esta es la lista de artefactos nuevos o sustancialmente evolucionados para Colosseum:

### Nuevo: `programs/tropico_bs/` — programa BsX

El diferencial principal de esta submisión. Programa Anchor que implementa el protocolo BsX completo:

- `initialize` — crea el PDA `ProtocolConfig`, delega mint authority al PDA, fija peg rate inicial
- `update_peg` — el `oracle_authority` actualiza la tasa Bs/USD (escala `1_000_000`)
- `mint_bsx` — usuario deposita USDC → programa transfiere a `treasury_vault` → mint BsX al usuario
- `burn_bsx` — usuario quema BsX → programa libera USDC del vault → usuario recupera USDC
- `attest_reserves` — cualquiera invoca, escribe snapshot `(usdc_reserves, bsx_supply, timestamp, attester)` en PDA `ReservesAttestation`
- `set_pause` — admin puede pausar/reactivar mint y burn en emergencias

Matemática: `bsx = usdc * peg_rate / 1_000_000` con peg_rate = Bs por 1 USD escalado. Ver `docs/PROTOCOL_BSX.md` para spec completa.

### Nuevo: Pago Móvil VE (`/pagar-servicios`)

Integración real del rail de pagos más usado en Venezuela. `lib/tropico-bs-bridge.ts` convierte USDC → Bs, `lib/suiche7b-parser.ts` parsea QR Suiche7B de comercios venezolanos. Primer y único proyecto del ecosistema Solana con esta integración.

### Nuevo: Carlos AI sobre Lumen

**Lumen** (`lumen-kit/`, `lumen-capabilities/`) es el runtime/framework de agentes. **Carlos** (`lib/carlos-prompt.ts`, `app/carlos/`) es el agente de producto construido encima. La distinción es importante y estaba borrosa en la submisión anterior: Lumen es la infraestructura; Carlos es el producto. 7 capabilities Python ejecutables (balances, precios, swap, QR, yield, cashback, Modo Agente).

### Nuevo: CI, husky, biome, `.env.example`

Infraestructura de calidad de código: linting, format checks, git hooks, y archivo de ejemplo de variables de entorno documentado para que cualquier judge pueda levantar el repo en minutos.

### En progreso: monorepo target

La arquitectura objetivo está documentada en `docs/ARCHITECTURE.md`. El repositorio actual es Next.js + Anchor en estructura única; la migración a `apps/` + `packages/` está en curso. El código del hackathon es funcional y desplegado; el refactor de estructura ocurre post-submisión.

### Nuevo: `docs/ARCHITECTURE.md`, `docs/PROTOCOL_BSX.md`

Documentación técnica orientada a jueces y auditores, con diagramas ASCII, spec completa del programa BsX, y separación clara de responsabilidades entre módulos.

---

## Diagrama de arquitectura

```
CAPAS DE TROPICO
═══════════════════════════════════════════════════════════════════

CAPA PROTOCOLO (Solana programs)
  programs/tropico_bs/          ← BsX: mint/burn/attest/oracle
  programs/tropico_treasury/    ← registro on-chain de fees (audit)

CAPA INTEGRACIÓN (bridges off-chain)
  lib/tropico-bs-bridge.ts      ← USDC → Bs → Pago Móvil
  lib/suiche7b-parser.ts        ← QR Suiche7B de bancos VE
  lib/jupiter.ts                ← swap Jupiter v6 platformFeeBps=50
  lib/solana-pay.ts             ← Solana Pay spec + durable nonces

CAPA AGENTE
  lumen-kit/                    ← Lumen: KIT + 7 SKILLS declarativas
  lumen-capabilities/           ← scripts Python ejecutables
  lib/carlos-prompt.ts          ← Carlos: identidad + reglas
  app/api/carlos/               ← proxy LLM (DeepSeek / Gemini / fallback)

CAPA APLICACIÓN
  app/ (Next.js 15 App Router)  ← 9 módulos consumer + merchant
  components/                   ← React UI components
  lib/i18n/                     ← 4 idiomas (es/en/pt/fr)

CAPA WALLET / AUTH
  Privy MPC embedded            ← login email, non-custodial real
  Solana Wallet Adapter         ← Phantom / Solflare fallback

DATOS EXTERNOS
  Jupiter v6                    ← swap routing
  Helius RPC                    ← Solana mainnet/devnet
  ve.dolarapi.com               ← tasa USD/VES (BCV + paralelo)
  DeepSeek / Gemini             ← LLM para Carlos
```

---

## Demo flow para jueces

URL: `https://tropico-rho.vercel.app`

**Paso 1 — Login**: Abre la app. Click en "Entrar". Privy abre modal → login con email o Google. Se crea una wallet Solana embedded via MPC en 15 segundos. La llave privada NUNCA sale del dispositivo.

**Paso 2 — Fondear en devnet**: En `/home`, click en el botón morado "Modo demo · devnet". Se abre modal con tu pubkey + links a dos faucets públicos: `faucet.solana.com` (1 SOL) y `faucet.circle.com` (10 USDC devnet). En ~30 segundos tenés tu wallet lista.

**Paso 3 — BsX / Cambiar**: En `/cambiar`, tab "Bolívares". Depositá USDC → recibís BsX a la tasa del día (vía `tropico-bs-bridge.ts` + oracle). O usá el tab "Tokens" para swaps vía Jupiter v6.

**Paso 4 — Pago Móvil VE**: En `/pagar-servicios`, escaneá un QR Suiche7B o ingresá datos manualmente. Tropico convierte USDC → Bs y ejecuta el Pago Móvil al banco destino venezolano.

**Paso 5 — Carlos AI**: En `/carlos`, preguntá "¿cuánto vale el dólar hoy?" o "cobrale 50 USDT a María en BsX". Carlos responde en español venezolano natural, consulta capabilities reales vía Lumen, y puede guiar al módulo correcto.

---

## Tracks targeted

| Track | Justificación |
|---|---|
| **Stablecoins** | BsX es el primer bolívar sintético on-chain con reservas verificables en Solana |
| **Consumer Apps** | Wallet con 9 módulos, 4 idiomas, modo demo para jueces, desplegado en producción |
| **DePIN / RWA-adjacent** | BsX representa un activo del mundo real (bolívar) con atestación on-chain de reservas |
| **Mobile / Offline-first** | Pagos offline via Solana durable nonces; PWA instalable en Android; Pago Móvil VE |
| **AI Agents** | Carlos AI sobre Lumen runtime: 7 capabilities, Modo Agente con 4 acciones autónomas |

---

## Equipo

> **[ El equipo debe completar esta sección antes de submittir ]**

| Nombre | Rol | Twitter / GitHub |
|---|---|---|
| — | — | — |
| — | — | — |

**Ubicación**: Venezuela / Caribe  
**Contacto**: —

---

## Links

| Recurso | URL |
|---|---|
| Demo live | `https://tropico-rho.vercel.app` |
| Repositorio | *(rellenar con URL del repo público)* |
| Video demo | *(rellenar con URL YouTube unlisted)* |
| Pitch deck | [`docs/PITCH_DECK.md`](./PITCH_DECK.md) |
| Programa BsX | [`docs/PROTOCOL_BSX.md`](./PROTOCOL_BSX.md) |
| Arquitectura | [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) |

---

## Qué sigue — roadmap 3-6 meses

**Mainnet BsX**: despliegue del programa `tropico_bs` a mainnet con multi-sig Squads como authority. Oracle v2 con Pyth Network como fuente de datos del peg.

**Más programas on-chain**: `tropico_treasury` wired a post-tx hooks → dashboard `/transparency` live. Programa de cashback con merkle distribution cuando el volumen lo justifique.

**App móvil React Native**: primer wallet Solana con Pago Móvil VE nativo en iOS y Android. Target: Solana Mobile dApp Store.

**Merchant dashboard**: interfaz dedicada para comercios con POS, historial de cobros, reportes CSV para SENIAT, y verificación de QR Suiche7B.

**LATAM expansion**: replicar el modelo BsX para otras monedas volátiles de la región (COP, ARS). La arquitectura del programa soporta múltiples instancias.

**@tropico/sdk**: SDK de merchant para integrar Pago Móvil + Solana Pay en cualquier plataforma en menos de una hora.
