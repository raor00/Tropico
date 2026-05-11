# Tropico — Pitch maestro Colosseum

> Fuente única de narrativa para deck, video y form de submission.
> Cualquier slide o copy del pitch sale de este documento.

**Última actualización**: 2026-05-11

---

## One-liner

**Bolívares Onchain en Solana: el primer dólar digital nacional para los 30 millones de venezolanos.**

(15 palabras. Es la frase de apertura. Memorizarla.)

Variante para audiencia anglo:
> *"Bolívares Onchain (BsX): the first sovereign-stable, transparent currency primitive built for 30 million Venezuelans on Solana."*

---

## El problema — visceral, con números

Venezuela es la economía más distorsionada del hemisferio:

- **Bolívar pierde 60–80% de poder adquisitivo cada año** (FMI 2024, BCV) — el 7mo año consecutivo de hiperinflación. [verify: cifra exacta IMF WEO 2024-2025]
- **~$4.7B/año en remesas** llegan a Venezuela (BID + Diálogo Interamericano, 2024). [verify: fuente exacta — algunos estiman $3.5B, otros $5.4B]
- **8–15% de fee promedio** en Western Union/MoneyGram para corredores con VE. [verify: WB Remittance Prices Worldwide Q4 2024]
- **4.5% fee + 24–72h de settlement** en POS bancario venezolano (Banesco, Mercantil, Provincial).
- **30M+ venezolanos en VE, 7M+ en diáspora** (ACNUR 2024 ≈ 7.7M migrantes/refugiados venezolanos). [verify: ACNUR/IOM 2024]
- **~12% del PIB venezolano depende de remesas** según Ecoanalítica. [verify: Ecoanalítica 2024 report]
- **USDT/USDC ya adoptados por necesidad** — Chainalysis Global Crypto Adoption Index ubica a Venezuela en top 10 mundial. [verify: Chainalysis 2024 ranking exacto, lo han tenido entre #6 y #13]

El venezolano ya migró a cripto. **Lo que no tiene es un dólar digital nacional con onramp/offramp local digno**, ni precios en su moneda mental (Bs), ni acceso al rail bancario nativo (Pago Móvil VE).

---

## Por qué ahora — el "why now"

Cinco ventanas se abrieron en los últimos 12 meses:

1. **El volumen de stablecoins onchain superó al volumen mensual de Visa** durante 2024–2025 (Visa Onchain Analytics, Artemis). [verify: comparación exacta]
2. **Solana Pay maduró** — adopción merchant, Mobile Wallet Adapter, Privy MPC, Jupiter v6 con `platformFeeBps`. El stack para construir un wallet venezolano serio existe HOY.
3. **Pago Móvil VE alcanzó 100% de adopción bancaria** — el rail nativo del 90% de las transacciones cotidianas. Nadie en Solana lo ha tocado.
4. **La diáspora venezolana se duplicó desde 2018** (1.5M → 7.7M). [verify: ACNUR] Mercado de remesas en expansión, no contracción.
5. **La hiperinflación cumple 7 años**. El "demand floor" para stablecoins en VE no se va a contraer — es estructural.

**Tropico es la plataforma correcta, en la geografía correcta, en el momento correcto.**

---

## El insight (lo que solo nosotros vemos)

> **El venezolano YA migró a USDT/USDC por necesidad. El problema no es convencerlo de usar cripto — es darle un bolívar digital con peg transparente, respaldo verificable, y que se integre al rail nativo (Pago Móvil). Las wallets cripto actuales tratan al venezolano como early-adopter cuando ya es usuario forzado.**

Esto cambia todo:

- No competimos con Phantom — competimos con Western Union y con la informalidad del P2P.
- No tenemos que explicar "qué es Solana" — tenemos que esconderla detrás de una UX en Bs.
- No necesitamos onboarding "cripto" — necesitamos onboarding "Pago Móvil con USDC adentro".

**Tres equipos no ven esto:**
- Equipos extranjeros: ven Venezuela como "país pobre con cripto", no como economía dolarizada con fricción de last-mile.
- Equipos venezolanos cripto: vienen de DeFi puro (AMMs, lending) y no construyen primitivos monetarios.
- Reguladores/bancos: no van a soltar Pago Móvil, pero tampoco pueden cerrar la API porque es un rail público.

Detalle completo en [`INSIGHT.md`](INSIGHT.md).

---

## Producto — qué construimos

**Tropico Wallet** es la superficie consumidor. **Bolívares Onchain (BsX)** es el moat.

### Lo que está vivo hoy en `tropico-rho.vercel.app`

9 módulos funcionando:

| # | Módulo | Estado |
|---|---|---|
| 1 | Wallet/Home con saldo onchain | Live |
| 2 | Cambiar (Jupiter v6, fee 0.5%) | Live |
| 3 | Cobrar (QR Solana Pay client-side) | Live |
| 4 | Enviar (P2P + claim links WhatsApp) | Live |
| 5 | Guardar (yield mSOL/Kamino, UI) | Live, ejecución Q3 |
| 6 | Pago Móvil VE (scan Suiche7B + ejecución bancaria) | Live (UI completa, rail Q3) |
| 7 | Carlos AI by Lumen | Live |
| 8 | Remesas (on-ramp internacional) | Live (UI), partners Q3 |
| 9 | Perfil + i18n 4 idiomas | Live |

### El moat — BsX program (NUEVO en Colosseum)

`programs/tropico_bs/` — programa Anchor con:

- **Mint/burn 1:1 USDC↔BsX** vía PDA-controlled vault. Cero custodia humana.
- **Oracle peg** actualizable por authority dedicada (separada del admin).
- **`attest_reserves`** llamable por cualquiera — snapshot onchain de `treasury_vault.amount` y `bsx_mint.supply` con timestamp. **Transparencia radical, no auditoría privada.**
- Pause switch para mitigación de incidentes.

**Por qué importa**: nadie en el top 30 de hackathons Solana 2024–2025 ha construido un primitivo monetario nacional con reservas verificables onchain. KumoPay hace USDC offline, no Bs onchain. LatamLink hace POS LatAm, sin moneda local. Reserve App no toca cadena.

### La capa agéntica — Carlos sobre Lumen

Carlos AI corre sobre [Lumen](https://github.com/gabogabucho/lumen-agent) — framework open-source MIT en español. 7 skills tipadas (precios, balances, swap, pay, yield, cashback, agent-actions). LLM agnóstico (DeepSeek default, fallback Gemini/Claude). **Modo Agente** con 4 acciones autónomas con policy engine: DCA, auto-yield, auto-cashback, rebalance.

Carlos no es un wrapper de LLM — es un agente con capabilities tipadas y políticas user-defined.

### La capa SDK — Tropico Pay

REST + webhook + drop-in JS + hosted checkout. Cualquier comercio integra USDC sobre Solana en minutos. Fee modelo "hacia arriba": el merchant recibe su precio exacto, el cliente absorbe el spread. Spec en [`docs/INTEGRATION_API.md`](INTEGRATION_API.md).

### Offline-first (roadmap Q3)

Inspirado por KumoPay (#32 dev3pack 2026, offline USDC), Tropico Bs Bridge usará durable nonces + Pago Móvil cache para que un comerciante en zona con conectividad intermitente pueda seguir cobrando.

---

## Tracción — proof points

- **Demo público live**: [tropico-rho.vercel.app](https://tropico-rho.vercel.app) — 9 módulos navegables, modo demo devnet con faucets públicos.
- **Submission previa dev3pack 2026: #28 global · #1 Venezuela · #10 LatAm** (de 386 proyectos). Validación de jueces internacionales.
- **Token TROPI deployado en devnet** (`AbkCW6BA2ZVoTw4Q6M1NvATiZjn2aMS3WvWZQbhRQf6K`), mint tx verificable en Solscan.
- **BsX program scaffolded en este sprint** para Colosseum — primer protocolo de bolívar onchain con reservas atestables.
- **Comercios piloto** [TODO: agregar N comercios en cola — usuario completa]
- **Comunidad/waitlist** [TODO: usuario completa]

---

## Mercado — TAM / SAM / SOM

| Capa | Tamaño | Cómo se construye |
|---|---|---|
| **TAM** | ~$415B/año | Cripto LatAm transactions 2023 (Chainalysis Geography of Crypto 2024). [verify] |
| **TAM ajustado VE** | ~$5–8B/año | Remesas a VE (~$4.7B) + comercio dolarizado de facto VE [verify Ecoanalítica] |
| **SAM** | ~$2–3B/año | 7M diáspora + 30M residentes con smartphone (~70% penetración) × ticket promedio remesa $50–300/mes |
| **SOM 12 meses** | ~$47M GMV | Capturar 1% de remesas digitales en año 1 |
| **SOM 36 meses** | ~$235M GMV | 5% de remesas + onchain payments domésticos |

Detalle completo y fuentes en [`MARKET_OPPORTUNITY.md`](MARKET_OPPORTUNITY.md).

---

## Competencia

| Player | Crypto rail | Pago Móvil VE | Bs onchain | Voice / AI agent | Offline | Venezuelan team |
|---|---|---|---|---|---|---|
| Western Union | No | No | No | No | No | No |
| MoneyGram | No | No | No | No | No | No |
| Zelle | No | No | No | No | No | No |
| Binance P2P VE | Sí | Manual (P2P) | No | No | No | No |
| Reserve App | Sí (custodia) | No | No | No | No | No |
| AirTM | Parcial | No | No | No | No | No |
| Strike (BTC LN) | Sí | No | No | No | No | No |
| KumoPay (#32 dev3pack) | Sí | No | No | No | **Sí** | Sí |
| LatamLink (#36 dev3pack) | Sí | No | No | No | No | No (BOL) |
| VozPay (#35 dev3pack) | Sí (USDC) | No | No | Voz WhatsApp | No | No (AR) |
| **Tropico** | **Sí** | **Sí (rail nativo)** | **Sí (BsX)** | **Carlos AI + 4 acciones autónomas** | **Roadmap Q3** | **Sí** |

Detalle por competidor en [`COMPETITIVE_LANDSCAPE.md`](COMPETITIVE_LANDSCAPE.md).

---

## Modelo de negocio — cómo capturamos valor

5 streams desde día uno, 8 en horizonte 12 meses:

| Stream | Tasa | Mecánica |
|---|---|---|
| Spread BsX ↔ USDC swap | 0.3–0.5% | vs 3–5% en P2P informal |
| Merchant fee | 1% | vs 4.5% POS bancario VE |
| Yield share | 20% del yield USDC | 5–7% APY → 1–1.4% para Tropico |
| Premium Carlos AI | $4.99/mes | DCA + auto-yield + acciones autónomas |
| SDK enterprise | B2B contract | Comercios grandes y plataformas |

**Unit economics objetivo**:
- CAC: $3–5 (WhatsApp + referrals — distribución viral en VE/diáspora)
- LTV año 1: $40–60
- LTV/CAC: 8–12×
- Payback: <60 días

Detalle completo en [`BUSINESS_MODEL.md`](BUSINESS_MODEL.md).

---

## Defensibilidad — por qué no nos copian rápido

1. **Network effects bilaterales**: más comercios → más usuarios → más comercios. Clásico two-sided marketplace.
2. **Brand local**: Tropico = identidad caribeña venezolana. "Carlos" como nombre cercano. Voseo venezolano (no extraño). Diáspora reconoce.
3. **Switching cost**: historial de pagos en Pago Móvil + contactos + Carlos AI con memoria personal.
4. **Technical moat BsX**: el primero con reservas onchain atestables. Una copia necesita 1:1 USDC en vault + oracle reputado + integración Pago Móvil. Eso son 6–9 meses para alguien sin ventaja local.
5. **Pago Móvil VE**: el rail no se compra. Se conoce. Equipo extranjero tarda meses solo en entender los 20+ bancos.

---

## Equipo

[Plantilla completa en [`FOUNDER_NARRATIVE.md`](FOUNDER_NARRATIVE.md) y [`TEAM.md`](TEAM.md)]

Headline: **Equipo venezolano. Vivimos la inflación. Conocemos a la María que pierde $4 por cada $100 vendido en POS. Conocemos al Carlos freelancer que pierde $7 por cada $100 cobrado en Binance P2P.** Eso no se Googlea.

---

## Roadmap — 30 / 60 / 90 / 180 días

| Hito | T+30 | T+60 | T+90 | T+180 |
|---|---|---|---|---|
| BsX program en mainnet | ✅ deploy + audit kickoff | audit cerrado | — | — |
| Comercios piloto Caracas | 50 | 200 | 500 | 2,000 |
| Carlos AI v1 prod | — | ✅ live | acciones autónomas | memoria persistente |
| `@tropico/sdk` npm | — | ✅ publish v1 | docs site | partners B2B firmados |
| Usuarios activos | 1k | 2k | 5k | 25k |
| Mobile app (Expo RN) | — | — | beta | live + Solana Mobile dApp Store |
| Expansión LatAm | — | — | — | Colombia + Argentina (stables locales) |
| Series seed | preparación | conversaciones | term sheet | cerrado |

---

## El "ask" en Colosseum

Tropico no pide código — pide adopción y capital para escalar.

- **Validación de jueces** que ya entienden mercados emergentes.
- **Conexión con LPs** (Multicoin, Solana Ventures, Anagram, Slow) que invierten en infraestructura LatAm.
- **Mentores con experiencia en stablecoins** (Circle, Tether, Mountain Protocol).
- **Capital seed**: target $500k–$1M para cubrir 12 meses (audit BsX, equipo +3, GTM Caracas/Bogotá, partners bancarios).

---

## Pull-quotes para deck / video

1. *"El venezolano YA migró a USDT/USDC por necesidad. Tropico le da el primer bolívar digital con respaldo verificable onchain."*
2. *"No competimos con Phantom — competimos con Western Union, MoneyGram y el 8–15% de fee que se llevan."*
3. *"Bolívares Onchain (BsX) es el primer primitivo monetario nacional con `attest_reserves` llamable por cualquiera. Transparencia radical, no auditoría privada."*

---

## La frase que cierra

> **Tropico no es una wallet. Es la infraestructura económica que el venezolano necesita — y que nadie le está construyendo. Hasta ahora.**

---

## Apéndice — orden recomendado de slides (10 slides, 4–5 min)

1. **One-liner** (15 segundos) — el bolívar digital de 30M de venezolanos.
2. **Problema** (45s) — Bolívar -80%/año, $4.7B remesas, 8–15% fee WU, 4.5% POS.
3. **Insight** (30s) — el venezolano ya migró. Necesita Bs digital, no más USDC.
4. **Producto** (60s) — 9 módulos live + demo en vivo BsX mint/burn.
5. **Por qué nosotros** (30s) — venezolanos, top 1 dev3pack, BsX onchain.
6. **Mercado** (30s) — TAM $5–8B VE, SOM $47M año 1.
7. **Competencia** (30s) — tabla.
8. **Modelo** (30s) — 5 streams, LTV/CAC 8–12×.
9. **Roadmap + ask** (30s) — 30/60/90/180.
10. **Cierre** (15s) — la frase final.
