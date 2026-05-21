# Tropico — Competitive Landscape

> Análisis competitivo por **categorías**, no por nombres. Foco en el quadrant vacío que Tropico ocupa.

**Última actualización**: 2026-05-11

---

## Cuadrante competitivo

Dos ejes para ubicar las categorías de players:

- **Eje X**: Fiat-native ←→ Crypto-native
- **Eje Y**: Genérico LatAm ←→ Venezuela-specific

```
                          Venezuela-specific
                                  ▲
                                  │
                 Apps custodiales │      ▶ TROPICO
                 locales VE       │       (BsX rail JIT + Pago Móvil
                                  │        + Guacama AI + non-custodial)
                                  │
   Remesadoras ────────────────── + ──────────────── Exchanges P2P
   tradicionales                  │                   globales
                                  │
                 Exchanges        │      Wallets cripto
                 centralizados    │      generalistas
                 LatAm            │
                                  │
                          Genérico LatAm
                                  ▼

   ◄─── Fiat-native        Crypto-native ───►
```

**Tropico está solo en el cuadrante superior-derecho**: Venezuela-specific + Crypto-native + Non-custodial + con rail JIT abierto a moneda local (BsX) + rail bancario nativo (Pago Móvil).

---

## Validación cuantitativa contra Colosseum (5.400+ proyectos)

Búsqueda directa en la base oficial de Colosseum Copilot — todos los Renaissance, Radar, Breakout y Cypherpunk hackathons. La similaridad máxima entre Tropico y cualquier proyecto previo:

| Query | Mejor similaridad | Gap conceptual |
|---|---|---|
| "Pago Móvil mobile payment local fiat" | **0.056** | El best match es LatAm USDC genérico; sin rail bancario local |
| "Venezuela bolívar stablecoin sintético Solana" | **0.048** | El best match es remesa Europa→LATAM USDC; sender-side; sin moneda local |
| "Venezuela crypto wallet payments" | **0.052** | El best match es pagos consumer genéricos; sin foco país |
| "Synthetic local currency on-chain" | **0.046** | El best match es África B2B; no consumer LatAm |
| "Synthetic fiat RWA Solana" | **0.024** | RWA equities/bonos; no monedas fiat locales |

**Conclusión cuantitativa**:
- **0 proyectos** Venezuela-specific en 5.400.
- **0 proyectos** emiten un rail JIT abierto a moneda local consumer en LatAm.
- **0 proyectos** integran un rail bancario nacional latinoamericano (Pago Móvil VE, PIX BR, Transferencia 3.0 AR, SPEI MX) como rail JIT.
- El mejor match está a ~94% de distancia conceptual.

Los jueces pueden verificar esto: el corpus que usan es el mismo.

---

## Categorías competitivas

### 1. Remesadoras tradicionales

**Qué hacen bien**: red física global, brand reconocida, regulación clara, confianza de generaciones mayores.

**Gap vs Tropico**:
- Fees altos (8–15% en corredores con VE — WB Remittance Prices Worldwide Q4 2024). [verify]
- 1–3 días settlement.
- Oficinas físicas requeridas en VE.
- Algunas opciones sujetas a sanciones US para corredor VE.

**Por qué Tropico no compite hoy en este segmento**: brand y red física. Una abuela en Maracaibo aún confía más en una marca de 100 años.

**Por qué los superamos en 3 años**: la diáspora joven ya migró a digital, y el fee es 10× el nuestro.

---

### 2. Exchanges P2P globales

**Qué hacen bien**: liquidez masiva, fácil entrada vía stablecoins, opciones de pago amplias.

**Gap vs Tropico**:
- Custodial (la wallet es del exchange).
- Spread + tiempo de matching + riesgo de contraparte (scams, holds).
- No es un rail JIT integrado a Pago Móvil VE — el usuario debe coordinar el pago manualmente con su contraparte.
- El usuario termina con moneda local en su banco, pero pasa por intermediación humana en el medio.

**Por qué Tropico no compite hoy**: efecto red. Casi todo venezolano cripto está en uno o más de estos exchanges.

**Por qué los superamos**: UX, velocidad <1s, non-custodial, brand local, rail directo banco-a-banco sin intermediación.

---

### 3. Apps custodiales locales VE

**Qué hacen bien**: brand fuerte en VE, integraciones bancarias profundas, UX adaptada al usuario local, alguna integración con Pago Móvil.

**Gap vs Tropico**:
- Custodial — el operador controla los fondos.
- Cerradas, sin componente onchain auditable.
- No emiten ni operan sobre un protocolo abierto multi-moneda.
- El usuario depende del operador para todo (reservas, peg, settlement).

**Por qué Tropico es diferente**: auto-custodia real (Privy MPC), reservas verificables onchain (`attest_reserves`), rail JIT abierto que escala a otras monedas LatAm. No competimos con su mercado actual; competimos con la categoría completa al ser **infraestructura abierta**.

---

### 4. Wallets cripto generalistas

**Qué hacen bien**: gran adopción global, ecosistema amplio, integraciones DeFi profundas.

**Gap vs Tropico**:
- En inglés o español neutro (no voseo, no jerga venezolana).
- Sin Pago Móvil VE.
- Sin rail JIT a moneda local LatAm.
- Sin AI agent con conocimiento de la realidad económica local.
- Tratan al usuario como early-adopter cripto, no como dolarizado-de-facto que necesita pagar en bolívares.

**Por qué Tropico es diferente**: Tropico no es una wallet — es una infraestructura de pagos con wallet incluida. La diferencia está en el rail JIT, no en la UI.

---

### 5. Exchanges centralizados LatAm

**Qué hacen bien**: integraciones con rails nacionales (SPEI en MX, Transferencia 3.0 en AR), remesas digitales competitivas.

**Gap vs Tropico**:
- No operan VE como foco principal.
- Custodial.
- No emiten un primitivo monetario propio ni operan como protocolo abierto.

**Relación**: comparables, no competidores directos. **Validan que el modelo "rail cripto + integración bancaria local" funciona** en LatAm — Tropico construye la versión onchain, abierta, y replicable a múltiples monedas.

---

## Tabla comparativa por categoría

| Categoría | Crypto rail | Pago Móvil VE | Rail JIT moneda local | AI agent local | Open / auditable | VE team | Non-custodial |
|---|---|---|---|---|---|---|---|
| Remesadoras tradicionales | No | No | No | No | No | No | N/A |
| Exchanges P2P globales | Sí | Manual | No | No | Parcial | No | No |
| Apps custodiales VE | Limitado | Sí | No (custodia) | No | No (cerrado) | Mix | No |
| Wallets cripto generalistas | Sí | No | No | No | Variable | No | Sí |
| Exchanges centralizados LatAm | Sí | No (otros rails) | No | No | No | No | No |
| **Tropico** | **Sí** | **Sí (nativo)** | **Sí (BsX JIT)** | **Guacama + 4 acciones autónomas** | **Sí (onchain attest)** | **Sí** | **Sí (Privy MPC)** |

---

## Por qué nadie nos copia rápido

Cuatro moats apilados:

### 1. BsX program (technical moat)

`programs/tropico_bs/` es el primer rail JIT abierto USDC↔moneda local con:
- Mint/burn JIT — BsX existe solo durante la ventana del pago (segundos).
- 1:1 USDC backing en vault PDA-owned.
- Oracle peg con authority separada; tasa default oficial, opt-in para alternativas.
- `attest_reserves` callable por cualquiera — transparencia verificable.
- Pause switch.
- **Multi-moneda**: el mismo primitivo escala a ARS, COP, CUP, PEN.

Una copia necesita: 6–9 meses, un equipo Solana competente, un oracle reputado, capital de seed, y comprensión profunda del marco regulatorio local. Mientras tanto Tropico ya tiene mainnet + audit + base de usuarios.

### 2. Pago Móvil VE (rail moat)

~90% de la economía cotidiana venezolana corre por Pago Móvil. Conocemos los 20+ bancos, los flows, los edge cases (cuándo se cae Banesco, cuándo Provincial tiene horario reducido, cómo funciona el formato QR de Suiche7B). Un equipo extranjero tarda meses solo en mapear esto.

### 3. Guacama AI sobre Lumen (capability moat)

Guacama no es un wrapper de LLM:
- Personalidad YAML con voseo venezolano nativo.
- 7 skills tipadas con capabilities ejecutables (Python scripts que consultan Solana real-time).
- Modo Agente con 4 acciones autónomas + policy engine.
- LLM-agnostic (DeepSeek default, Gemini fallback).
- Memoria persistente (Q3).

Copiar esto requiere conocer Lumen framework + tener identidad local nativa + scripts capability + integración Solana. No es "le metí un LLM a una wallet".

### 4. Brand venezolana (network moat)

- "Tropico" + paleta caribeña + Honk wordmark + Bricolage Grotesque = identidad reconocible.
- Voseo natural en copy y Guacama.
- Diáspora distribuye orgánicamente.
- Comercios físicos con sticker "Acepta Tropico".

Una app extranjera traducida al español neutro no compite con esto.

---

## La frase para deck

> *"Hay categorías resolviendo partes del problema — remesadoras, exchanges P2P, apps custodiales, wallets generalistas. Pero ninguna construyó un rail JIT abierto entre USDC y moneda local LatAm, con `attest_reserves` onchain, integración bancaria nativa, AI agent en voseo, y SDK merchant — todo en una pieza coherente. Esa pieza es Tropico."*
