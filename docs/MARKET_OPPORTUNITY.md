# Tropico — Market Opportunity

> Cuantificación del mercado al que Tropico apunta. Toda cifra con `[verify: ...]` necesita confirmación de fuente antes de la submission final.

**Última actualización**: 2026-05-11

---

## TL;DR

Tropico opera en la intersección de **tres mercados en crecimiento** que ningún competidor cubre al mismo tiempo:

1. **Remesas a Venezuela** — ~$4.7B/año, +20% YoY desde 2020. [verify: BID + Diálogo Interamericano 2024]
2. **Stablecoins en mercados emergentes** — volumen onchain superó volumen mensual de Visa en 2024–2025. [verify: Visa Onchain Analytics + Artemis]
3. **Pagos domésticos venezolanos** — economía dolarizada de facto, 65–80% de las transacciones cotidianas en USD. [verify: Ecoanalítica 2024]

**Tropico captura GMV en los tres** a través de un único primitivo (BsX) + un único rail (Pago Móvil) + una única UX (wallet en español).

---

## 1. Definición del mercado

Tropico no compite con "wallets cripto". Compite con:

- **Pagos transfronterizos LatAm** (Western Union, MoneyGram, Wise, Remitly).
- **Stablecoins en mercados emergentes** (Bitso, Lemon, Buenbit, Reserve App, Strike).
- **Payments domésticos venezolanos** (Pago Móvil VE, POS bancarios, Zelle gris, USDT/Tron en P2P).

Tres mercados, un solo equipo cubriéndolos con una pieza coherente.

---

## 2. TAM — Total Addressable Market

### 2.1 Capa global

| Componente | Tamaño | Fuente |
|---|---|---|
| Cripto LatAm transactions (2023) | **~$415B** | Chainalysis Geography of Crypto 2024. [verify: cifra exacta y año] |
| Crecimiento YoY LatAm | **+40%** | Chainalysis 2023→2024. [verify] |
| Remesas globales LatAm | **~$160B/año** | Banco Mundial Migration & Development Brief 2024. [verify] |
| Stablecoin onchain volume mensual | **>$1T** | Visa Onchain Analytics + Artemis 2024-2025. [verify: cifra exacta] |

### 2.2 Capa Venezuela-específica

| Componente | Tamaño | Fuente / nota |
|---|---|---|
| Remesas anuales a Venezuela | **~$4.5–5B** | BID + Diálogo Interamericano 2024. [verify: rango exacto — algunos analistas estiman $3.5B (Caracas Chronicles), otros $5.4B] |
| Comercio dolarizado de facto VE | **65–80% del PIB transaccional** | Ecoanalítica 2024. [verify: % exacto] |
| PIB Venezuela (nominal) | **~$95B (2023)** | FMI WEO. [verify: año más reciente] |
| Tamaño aproximado del mercado de pagos digitales VE | **~$10–15B/año** | Estimación derivada (PIB × % dolarizado × velocidad). [verify: estudio formal] |
| % del PIB dependiente de remesas | **~12%** | Ecoanalítica + BID. [verify] |
| Mercado P2P cripto Venezuela | **#6–9 global en adopción** | Chainalysis Global Crypto Adoption Index 2023–2024. [verify: ranking exacto] |

**TAM efectivo Tropico**: **$5–8B/año** considerando remesas + pagos digitales en USD que pueden tokenizarse y/o convertirse a BsX onchain.

---

## 3. SAM — Serviceable Addressable Market

Filtros para llegar al SAM:

- **Smartphone penetration VE**: ~70% (~21M de 30M residentes). [verify: GSMA Venezuela 2024]
- **Smartphone + acceso a apps cripto**: 4–6M residentes con curiosidad o uso (Chainalysis ranks VE top 10).
- **Diáspora venezolana global**: ~7.7M (ACNUR 2024). [verify] La mayoría bancarizada en su país de destino.
- **Diáspora que envía remesas regularmente**: ~3–4M. [verify]
- **Comercios formales/informales en VE**: ~1.5M (Fedecámaras 2023). [verify]

**SAM**:

| Segmento | Endpoints | Volumen anual estimado |
|---|---|---|
| Diáspora enviando remesas | 3–4M | $4–5B |
| Residentes VE con cripto / curiosidad | 4–6M | $2–3B en flujos digitales |
| Comercios afiliables (smartphone + dispuestos) | 200k–500k | $5–10B GMV |
| **SAM total** | **~10M endpoints únicos** | **~$10–15B/año GMV potencial** |

---

## 4. SOM — Serviceable Obtainable Market

Realismo: capturamos un % del SAM en 12–36 meses.

| Horizonte | % de remesas | % de pagos domésticos | GMV objetivo | Take rate Tropico | Revenue |
|---|---|---|---|---|---|
| **12 meses** | 1% | <0.1% | $47M | ~0.6% blended | $282k |
| **24 meses** | 3% | 0.3% | $180M | ~0.8% | $1.4M |
| **36 meses** | 5% | 1% | $400M+ | ~0.9% | $3.6M |

Estas cifras asumen ejecución en VE + 1 país adyacente (Colombia o Argentina) para año 2.

---

## 5. Drivers de crecimiento (por qué el mercado crece, no se contrae)

1. **Hiperinflación venezolana persistente** (7mo año consecutivo). Demand floor estructural para stablecoins. No hay escenario "se arregla y la gente vuelve al Bs banking".
2. **Generación Z venezolana es cripto-nativa**. Telegram, Binance, USDT son tan comunes como WhatsApp.
3. **Diáspora bancarizada con apetito por reducir fees**. Un venezolano en Madrid que paga 8% a Western Union acepta cambiar en 30 segundos si la UX es buena.
4. **Pago Móvil VE ya está pre-instalado mentalmente**. El 90% de los bancos venezolanos lo ofrecen. Tropico no necesita educar — solo conectar.
5. **Solana Mobile Seeker en preventa** → distribución hardware nativo para wallets.
6. **Regulación venezolana ambigua pero no prohibitiva** para cripto (a diferencia de China). Sudeban y SUNACRIP han variado pero no han cerrado el rail.
7. **Stablecoin onchain volume creciendo +200% YoY** (Artemis 2024). El rail técnico ya escaló.

---

## 6. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Sudeban/SUNACRIP prohíben Tropico explícitamente | Alto | Non-custodial: el protocolo BsX es código público en Solana. No se puede "cerrar". Tropico es UI. |
| Pago Móvil VE cierra acceso programático | Medio | El rail es público; usamos los mismos endpoints que apps móviles oficiales. Fallback: settlement P2P entre usuarios Tropico. |
| Binance/CEX dominan el mercado de remesas | Medio | UX y velocidad: Tropico es <1s vs 5–30min en Binance P2P. No competimos en spread, competimos en fricción. |
| USDC depeg / regulación stablecoins US | Bajo–medio | Diversificar a USDT, EURC, y stablecoins LatAm cuando salgan. |
| EE.UU. sanciona Tropico por ser servicio de transferencia | Medio | No operamos fiat en US. Onramp via partners regulados (MoonPay, Stripe Crypto). |
| Otro equipo con BsX onchain | Bajo | Ventaja: BsX live + reserves attestation + brand. Audit + mainnet rápido cierra ventana. |

---

## 7. Comparables exitosos (precedentes de inversión)

Equipos que tomaron mercados similares y escalaron:

| Empresa | País | Modelo | Funding / Valuation | Lección para Tropico |
|---|---|---|---|---|
| **Bitso** | México / Argentina | Exchange + remesas | $250M Series C, $2.2B valuation (2021). [verify] | Mercados emergentes LATAM escalan con stablecoins + UX local |
| **Buenbit** | Argentina | Stablecoin wallet | Serie A. [verify monto] | DAI/USDC fueron the killer feature ante peso devaluado |
| **Lemon** | Argentina | Crypto wallet + card | $44M Series A 2022. [verify] | Mobile-first + tarjeta debit + branding local funcionan |
| **Strike** | El Salvador / Argentina | Bitcoin Lightning remesas | $80M Series B. [verify] | Lightning como rail funcionó cuando el costo cayó. Solana Pay es análogo. |
| **Reserve App** | Venezuela / LatAm | Stablecoin wallet | $5M+ raised. [verify] | Validó que el venezolano paga por stablecoins, pero no es non-custodial ni multi-feature |
| **Bitnovo** | España / LatAm | Vouchers + on-ramp | ~$10M. [verify] | Validó el corredor España → LatAm |

**Tropico tiene el founder-market fit de Buenbit, el rail técnico de Strike, y el moat de Bitso (Pago Móvil = nuestro SPEI).**

---

## 8. Ventanas que se abren ahora (timing)

| Driver | Estado |
|---|---|
| Solana stablecoin volume > Visa monthly | **Cumplido 2024–2025** [verify] |
| Solana Pay merchant adoption en LatAm | **Cumpliéndose (Mercado Pago / Argentina pilots)** [verify] |
| Privy MPC mainstream | **Cumplido 2024** |
| Jupiter v6 con `platformFeeBps` | **Cumplido 2024** |
| Solana Mobile Seeker preventa | **En curso 2025–2026** |
| Diáspora venezolana 2× desde 2018 | **Cumplido (1.5M → 7.7M)** [verify] |
| Mountain Protocol / Ondo USDM expansión | **2024–2025** (precedente regulatorio para stablecoins regionales) |

Ninguna ventana cerrada. Todas alineadas con un solo equipo: el nuestro.

---

## 9. Por qué este TAM/SAM/SOM es defendible ante un VC

- **No inflamos el TAM** a "$10T global payments". Acotamos a remesas + payments digitales VE/LatAm con números rastreables.
- **El SOM 12 meses (1% remesas) es ejecutable**: ~3,900 usuarios activos enviando $200/mes promedio = ~$9M/año GMV, escalable a $47M con segmentación correcta.
- **El bridge VE → LatAm está modelado**: Colombia/Argentina son países 2 y 3 con stablecoin demand probada.
- **No dependemos de un solo cliente** (B2C masivo + B2B SDK + diáspora).

---

## Apéndice — fuentes primarias citables

### Research institucional sobre la tesis (validado vía Colosseum Copilot archive corpus)

Estas fuentes ya están en el corpus que los jueces de Colosseum tienen acceso. Todas respaldan partes específicas de la tesis de Tropico:

| Fuente | Año | Soporta |
|---|---|---|
| **Chainalysis** — *Latin America: Venezuela and Argentina Stand Out as Examples of Crypto's Unique Utility* | 2023 | Adopción cripto VE como utilidad (no especulación), Top-10 global en P2P |
| **Chainalysis** — *Hyperinflation and Sanctions Evasion: What On-Chain Data Tells Us About Venezuelans' Trust in Cryptocurrency* | 2020 | Causa raíz: hiperinflación → desconfianza en bolívar → adopción cripto |
| **Chainalysis** — *Latin America's Key Crypto Adoption Drivers: Storing Value, Sending Remittances, and Seeking Alpha* | 2022 | Los 3 use cases que Tropico cubre directamente |
| **Galaxy Research** — *Stablecoins, DeFi, and Credit Creation* | 2025 | Stablecoins como savings instrument en EM con currency weakness |
| **Galaxy Research** — *Backing Rail to Create the New Global Payments System* | 2025 | Stablecoins reemplazando rieles bancarios tradicionales |
| **Pantera Capital** — *Escape Velocity* | 2024 | Stablecoins ofrecen 10x value prop vs rieles tradicionales en B2C remittances |
| **a16z** — *Stablecoins: A 1+ billion-user onboarding opportunity* | 2025 | Tamaño del onboarding global a stablecoins |
| **a16z** — *State of Crypto 2025: The year crypto went mainstream* | 2025 | Stablecoin volume superando Visa monthly |
| **Galaxy Research** — *The Future of Payments* | 2025 | Stablecoins como nuevo payment rail global |

### Cifras Venezuela-específicas que requieren confirmación adicional

Las siguientes cifras están aproximadas con `[verify: ...]` — requieren cross-check con fuente primaria antes del submission final, pero las consultas a Copilot confirmaron que los rangos son consistentes con el research institucional citado arriba:

- Remesas VE 2024: rango $3.5–5.4B (BID + Diálogo Interamericano, Caracas Chronicles)
- % PIB dolarizado VE: 65–80% (Ecoanalítica)
- Ranking Chainalysis P2P: Top 6–9 global (Chainalysis Global Crypto Adoption Index 2023–2024)
- Diáspora VE: ~7.7M (ACNUR/IOM 2024)
- PIB nominal VE: ~$95B (FMI WEO)
- Smartphone penetration VE: ~70% (GSMA 2024)
- Comercios formales/informales: ~1.5M (Fedecámaras)
- Funding rounds: Bitso $250M Series C, Lemon $44M Series A, Strike $80M Series B (Crunchbase)
