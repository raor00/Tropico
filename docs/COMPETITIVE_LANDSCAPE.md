# Tropico — Competitive Landscape

> Análisis competitivo por cuadrante + breakdown por player + por qué Tropico no se copia rápido.

**Última actualización**: 2026-05-11

---

## Cuadrante competitivo

Dos ejes para ubicar a todos los players:

- **Eje X**: Fiat-native ←→ Crypto-native
- **Eje Y**: Genérico LatAm ←→ Venezuela-specific

```
                          Venezuela-specific
                                  ▲
                                  │
                 Reserve App      │      ▶ TROPICO
                 (custodia)       │       (BsX onchain + Pago Móvil
                                  │        + Carlos AI + non-custodial)
                                  │      KumoPay (offline USDC)
   Western Union ──────────────── + ──────────────── Binance P2P VE
   MoneyGram                      │                   USDT/Tron
   Zelle                          │
                                  │      Strike (BTC LN)
                 Bitso (MX/AR)    │      VozPay (AR, USDC+WhatsApp)
                 Lemon (AR)       │      LatamLink (BOL POS)
                 Buenbit (AR)     │
                                  │
                          Genérico LatAm
                                  ▼

   ◄─── Fiat-native        Crypto-native ───►
```

**Tropico está solo en el cuadrante superior-derecho**: Venezuela-specific + Crypto-native + Non-custodial + con primitivo monetario propio (BsX) + rail bancario nativo (Pago Móvil).

---

## Validación cuantitativa contra Colosseum (5.400+ proyectos)

Búsqueda directa en la base oficial de Colosseum Copilot — todos los Renaissance, Radar, Breakout y Cypherpunk hackathons. Los proyectos más cercanos a Tropico, con su score de similaridad:

| # | Proyecto | Hackathon | Similaridad | Gap vs Tropico |
|---|---|---|---|---|
| 1 | **Cachin** | Breakout | 0.056 | LatAm USDC genérico; sin moneda local; sin VE |
| 2 | **LocalPay** | — | 0.055 | QR stablecoin emerging markets; sin VE; sin moneda local |
| 3 | **StickyPay** | — | 0.052 | Consumer payments genérico |
| 4 | **Bando** | — | 0.051 | México fiat-bridge; sin VE; sin moneda local sintética |
| 5 | **Moongate** | — | 0.049 | Apple/Google Pay → memecoins; sin remesas; sin VE |
| 6 | **Rampa** | Cypherpunk + Breakout | 0.048 | Europa→LATAM USDC; sender-side; sin in-country; sin Bs |
| 7 | **Solara** | — | 0.048 | Wallet Solana consumer; sin VE; sin moneda local |
| 8 | **LINK Business** | Breakout | 0.046 | África B2B FX con stablecoins locales — más cercano conceptualmente pero B2B no consumer, África no LatAm |
| 9 | **CryptoMapp** | — | 0.032 | Argentina USDC QR para expats |
| 10 | **Reflection** | Breakout | 0.024 | RWA sintético (equities/bonos); mismo primitivo, distinto activo |

**Conclusión cuantitativa**:
- **0 proyectos** Venezuela-specific en 5.400.
- **0 proyectos** emiten moneda local sintética consumer en LatAm.
- **0 proyectos** integran un rail bancario nacional latinoamericano (Pago Móvil VE, PIX BR, Transferencia 3.0 AR, SPEI MX).
- El proyecto más cercano (Cachin, 0.056) está a ~94% de distancia conceptual.

Los jueces de Colosseum pueden verificar esto: el corpus que usan es el mismo.

---

## Breakdown por competidor

### Fiat tradicional

#### Western Union
- **Qué hacen bien**: red física global, brand reconocida, regulación clara.
- **Qué les falta vs Tropico**: 8–15% de fee, 1–3 días settlement, oficinas físicas requeridas en VE, sujeto a sanciones US.
- **Por qué perdemos contra ellos hoy**: brand y red física. Una abuela en Maracaibo aún confía más en Western Union que en cualquier app.
- **Por qué los superamos en 3 años**: la diáspora joven ya migró a digital, y el fee es 10× nuestro.

#### MoneyGram
- Igual a Western Union pero con menor footprint en VE.
- **Diferencial vs Tropico**: ninguno relevante. Mismo tier.

#### Zelle (USA → VE informal)
- **Cuando funciona**: instantáneo, gratis.
- **El problema**: muchas cuentas bancarias VE-affiliated quedaron bloqueadas en 2023–2024 por sanciones US. No es una opción confiable.
- **Tropico**: non-custodial, no sujeto a sanciones tipo Zelle.

---

### Crypto-native genérico LatAm

#### Binance P2P VE
- **Qué hacen bien**: liquidez masiva, fácil entrada via USDT/Tron, opciones de pago amplias.
- **Qué les falta vs Tropico**: custodial (Binance es la wallet), 1–3% spread + tiempo de matching, riesgo P2P (scams, hold), no es Bs digital sino USDT.
- **Por qué perdemos contra ellos hoy**: efecto red. Casi todo venezolano cripto está en Binance.
- **Por qué los superamos**: UX, velocidad, non-custodial, brand local.

#### Reserve App
- **Qué hacen bien**: brand fuerte en LatAm, custodia regulada, dólares digitales.
- **Qué les falta vs Tropico**: custodial (no non-custodial), no Bs onchain, no Pago Móvil real, no AI agent, no Solana (corren en su propio rail), no programmable.
- **Por qué pierden contra Tropico**: cuando un usuario quiere control real de sus fondos y velocidad <1s, Reserve no compite.

#### Bitso (México / Argentina)
- **Qué hacen bien**: exchange grande, integración SPEI (rail mexicano), remesas US→MX competitivas.
- **Qué les falta vs Tropico**: no operan VE (es nuestro mercado, no el suyo), custodial, no tienen primitivo monetario nacional propio.
- **Relación**: comparables, no competidores directos. Validan el modelo "exchange con remesa + stablecoin local" funciona en LatAm.

#### Lemon (Argentina)
- **Qué hacen bien**: mobile-first, debit card, brand cripto-LatAm.
- **Qué les falta vs Tropico**: foco AR, no VE, custodial, no Bs onchain.

#### Buenbit (Argentina)
- **Qué hacen bien**: stablecoin wallet con DAI/USDC, brand AR.
- **Qué les falta vs Tropico**: custodial, no Bs onchain, no VE-specific.

---

### Crypto-native otras geos

#### Strike (Bitcoin Lightning, El Salvador y Argentina)
- **Qué hacen bien**: rail Lightning para remesas Bitcoin, partner con bancos locales, regulación El Salvador.
- **Qué les falta vs Tropico**: BTC volatilidad (incluso con instant convert a USD interno), no programmable smart contracts, no VE.
- **Lección que tomamos**: Lightning probó que un rail cripto puede mover remesas a escala. Solana Pay es el análogo más maduro y rápido.

---

### Dev3pack 2026 — los otros venezolanos / LatAm que el jurado conoce

#### KumoPay (#32 dev3pack 2026)
- **Qué hacen bien**: USDC offline payments via durable nonces — innovación técnica real. Equipo venezolano.
- **Qué les falta vs Tropico**:
  - No Bs onchain (solo USDC offline).
  - No Pago Móvil VE.
  - No AI agent.
  - No SDK para merchants externos.
- **Cómo nos diferenciamos**: Tropico cubre más del ciclo (remesas + comercio + AI + Bs digital). KumoPay es un primitivo técnico interesante pero acotado.
- **Relación posible**: integrar durable nonces como capa offline de Tropico Bs Bridge en Q3.

#### LatamLink (#36 dev3pack 2026, Bolivia)
- **Qué hacen bien**: POS LatAm en stablecoins.
- **Qué les falta vs Tropico**: no moneda local digital, no Pago Móvil, no AI, no Venezuela.
- **Diferencial Tropico**: Bs onchain + brand venezolana + Carlos AI + rail Pago Móvil.

#### VozPay (#35 dev3pack 2026, Argentina)
- **Qué hacen bien**: WhatsApp + USDC + voz. UX simple.
- **Qué les falta vs Tropico**: no peso digital onchain (solo USDC), no integraciones bancarias locales argentinas, no merchant SDK.
- **Diferencial Tropico**: BsX como primitivo + Pago Móvil + 9 módulos + agente con 4 acciones autónomas.

#### VOCA (#34 dev3pack 2026)
- **Qué hacen bien**: voice agent genérico cripto.
- **Qué les falta vs Tropico**: agente sin geografía ni rail ni primitivo monetario. Carlos AI está embebido en una red económica real.

---

### Tabla comparativa final

| Player | Crypto rail | Pago Móvil VE | Bs onchain | AI agent | Offline | Venezuelan team | Non-custodial |
|---|---|---|---|---|---|---|---|
| Western Union | No | No | No | No | No | No | N/A |
| MoneyGram | No | No | No | No | No | No | N/A |
| Zelle | No | No | No | No | No | No | N/A |
| Binance P2P | Sí | Manual | No | No | No | No | No |
| Reserve | Sí | No | No | No | No | No | No |
| Bitso | Sí | No (SPEI MX) | No | No | No | No | No |
| Lemon | Sí | No | No | No | No | No | No |
| Buenbit | Sí | No | No | No | No | No | No |
| Strike | Sí (BTC LN) | No | No | No | No | No | Parcial |
| KumoPay | Sí | No | No | No | **Sí** | Sí | Sí |
| LatamLink | Sí | No | No | No | No | No (BOL) | Sí |
| VozPay | Sí | No | No | Voz | No | No (AR) | Sí |
| **Tropico** | **Sí** | **Sí (nativo)** | **Sí (BsX)** | **Carlos + 4 acciones autónomas** | **Roadmap Q3** | **Sí** | **Sí (Privy MPC)** |

---

## Por qué nadie nos copia rápido

Cuatro moats apilados:

### 1. BsX program (technical moat)

`programs/tropico_bs/` es el primer programa Anchor de bolívar onchain con:
- 1:1 USDC backing en vault PDA-owned.
- Oracle peg con authority separada.
- `attest_reserves` callable por anyone — transparencia verificable.
- Pause switch para mitigación.

Una copia necesita: 6–9 meses, un equipo Solana competente, un oracle reputado, y capital para mint inicial. Mientras tanto Tropico ya tiene mainnet + audit + 10k usuarios.

### 2. Pago Móvil VE (rail moat)

90% de la economía cotidiana venezolana corre por Pago Móvil. Conocemos los 20+ bancos, los flows, los edge cases (cuando se cae Banesco, cuando Provincial tiene horario reducido). Un equipo extranjero tarda meses solo en mapear esto.

### 3. Carlos AI sobre Lumen (capability moat)

Carlos no es un wrapper de LLM:
- Personalidad YAML con voseo venezolano nativo.
- 7 skills tipadas con capabilities ejecutables (Python scripts que consultan Solana real-time).
- Modo Agente con 4 acciones autónomas + policy engine.
- LLM-agnostic (DeepSeek default, Gemini fallback).
- Memoria persistente (Q3).

Copiar esto requiere conocer Lumen framework + tener identidad venezolana + scripts capability + integración Solana. No es "le metí ChatGPT a una wallet".

### 4. Brand venezolana (network moat)

- "Tropico" + paleta caribeña + Honk wordmark + Bricolage Grotesque = identidad reconocible.
- Voseo natural en copy y Carlos.
- Diáspora distribuye orgánicamente.
- Comercios físicos con sticker "Acepta Tropico".

Una app gringa machine-translated al español NO puede competir con esto.

---

## La frase para deck

> *"Hay equipos resolviendo partes del problema. KumoPay hace USDC offline, LatamLink hace POS LatAm, VozPay hace WhatsApp+USDC. Pero ninguno construyó el primitivo monetario nacional venezolano con rail bancario integrado, AI agent en voseo, y SDK merchant — todo en una pieza coherente. Esa pieza es Tropico."*
