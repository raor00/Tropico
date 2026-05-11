# Tropico — Business Model

> Cómo Tropico genera revenue desde día uno, qué unit economics nos sostienen, y por qué el modelo es defendible.

**Última actualización**: 2026-05-11

---

## TL;DR

- **5 streams de revenue activos desde día uno**, 8 en horizonte 12 meses.
- **Take rate blended ~0.6–0.9%** sobre GMV procesado.
- **CAC ~$3–5** vía distribución viral (WhatsApp, diáspora, comercios).
- **LTV año 1 ~$40–60** → LTV/CAC 8–12×.
- **Payback period < 60 días**.
- **Break-even operacional a ~50k usuarios activos mensuales** con un equipo de 8–10 personas.

---

## 1. Revenue streams

### Stream 1 · Spread BsX ↔ USDC swap — **0.3 a 0.5%**

Cada vez que un usuario mintea BsX (deposita USDC al vault del programa BsX) o burnea BsX (recibe USDC del vault), Tropico cobra un spread.

| Comparativo | Spread | Velocidad |
|---|---|---|
| Tropico BsX | **0.3–0.5%** | <1 segundo |
| Binance P2P VE | 1–3% spread | 5–30 min |
| Western Union (corredor digital→VE) | 8–15% all-in | 1–3 días |
| Cambio en casa de cambio VE | 3–6% | minutos físicos |

**Mecánica técnica**: el programa Anchor `tropico_bs` aplica el spread en `mint_bsx` y `burn_bsx`. La fee va a un ATA controlado por Tropico, verificable onchain.

**Estimación volumen año 1**: $47M GMV swap → $141k–$235k revenue.

---

### Stream 2 · Merchant fee — **1%**

Cobrado al merchant en cada cobro QR Solana Pay completado.

| Comparativo | Fee al merchant | Settlement | Chargebacks |
|---|---|---|---|
| Tropico | **1%** | <1 segundo | No (onchain final) |
| Visa/Mastercard POS VE | 4–4.5% + IVA | 24–72h | Sí |
| Pago Móvil VE puro | 0.5% pero en Bs (devaluación) | Instantáneo | No |
| Binance P2P | 1–3% + tiempo de matching | 5–30 min | Riesgo P2P |
| Zelle (cuando funciona) | 0% pero ilegal/bloqueable | Variable | No |

**Estimación**: 2,000 comercios año 1 × $10,000 GMV mensual promedio = $240M/año → $2.4M revenue posible. SOM realista año 1: ~10% de esto = $240k.

---

### Stream 3 · Yield share — **20% del yield USDC inactivo (opt-in)**

USDC parqueado en wallets Tropico (con consentimiento del usuario) se rutea a Marinade (mSOL) o Kamino (USDC vault) generando 5–7% APY. Tropico se queda con 20% del rendimiento.

| Caso ejemplo | Usuario gana | Tropico gana |
|---|---|---|
| $1,000 USDC × 6% APY × 1 año | $48 neto al usuario | $12 a Tropico |

**Estimación**: 25k usuarios × $300 USDC promedio en yield × 1.2% net to Tropico = $90k/año.

---

### Stream 4 · Premium Carlos AI — **$4.99/mes**

Tier de pago para acciones autónomas (Modo Agente):
- DCA programado
- Auto-yield al recibir remesa
- Auto-cashback claim
- Rebalance de portafolio

**Estimación adopción**: 5% de usuarios activos → 1,250 suscriptores año 1 × $60/año = $75k.

---

### Stream 5 · SDK enterprise / Tropico Pay — **B2B contract**

`@tropico/sdk` + Tropico Pay API + drop-in JS para integraciones de delivery, e-commerce, ticketing, SaaS. Fee 0.5% sobre GMV procesado o contrato mensual mínimo $500–2,000.

**Estimación**: 10 partners año 1 × $1,000/mes promedio = $120k.

---

### Streams futuros (12–24 meses)

| Stream | Mecánica | Tasa estimada |
|---|---|---|
| Tropico Card (debit USDC + cashback) | Interchange | 1–1.5% |
| Tropico Vaults (estrategias DeFi curadas) | Performance fee | 10% del yield |
| Sponsored token discoveries | CPM/CPC | Negociado |

---

## 2. Resumen revenue año 1 (escenario realista)

| Stream | Revenue año 1 (low) | Revenue año 1 (target) |
|---|---|---|
| Swap spread | $80k | $235k |
| Merchant fee | $120k | $240k |
| Yield share | $40k | $90k |
| Premium Carlos AI | $35k | $75k |
| SDK enterprise | $50k | $120k |
| **Total** | **~$325k** | **~$760k** |

Con 25k usuarios activos y 1,000 comercios. Razonable comparado con Buenbit año 1 / Lemon año 1.

---

## 3. Unit economics

### CAC — Customer Acquisition Cost

| Canal | CAC estimado | Mecánica |
|---|---|---|
| Referral usuario | **$2–4** | Bonus $5 USDC al referrer cuando el referido hace 1er swap |
| WhatsApp / Telegram diáspora | **$3–5** | Contenido orgánico + grupos diáspora |
| Comercios → usuarios | **$1–2** | Cada comercio Tropico distribuye QR a sus clientes |
| Paid ads (Meta + Twitter LatAm) | **$8–15** | Para escala post-PMF |
| **Blended año 1** | **~$3–5** | Mix orgánico + referrals |

### LTV — Lifetime Value

Asumiendo:
- GMV medio mensual por usuario activo: $250 (entre remesas + pagos domésticos)
- Take rate blended: ~0.7%
- Revenue por usuario por mes: ~$1.75
- Churn año 1: ~30% (alto en mercados emergentes, pero compensado por viralidad)
- Vida media: ~24 meses

**LTV año 1**: ~$40
**LTV target año 2 (con Card + Vaults)**: ~$80–120

### LTV / CAC

| Año | CAC | LTV | Ratio |
|---|---|---|---|
| 1 | $4 | $40 | **10×** |
| 2 | $6 | $80 | **13×** |
| 3 | $8 | $120 | **15×** |

**Payback period**: <60 días en el escenario blended.

---

## 4. Cost structure

### Costos variables (escalan por usuario)

| Item | Costo / usuario activo / mes |
|---|---|
| Privy MPC | ~$0.005 |
| Helius RPC | ~$0.01 |
| OpenAI / Gemini / DeepSeek (Carlos) | ~$0.01–0.05 (cap a $0.10 con rate limiting) |
| Vercel + Cloudflare | ~$0.001 |
| **Total infra / usuario / mes** | **~$0.02–0.06** |

### Costos fijos (no escalan linealmente)

| Item | Año 1 estimado |
|---|---|
| Equipo core (3–5 personas remoto) | $150–250k |
| Audit BsX program (Ottersec / Halborn / Neodyme) | $30–80k |
| Compliance legal LatAm (consultor regulatorio) | $20–40k |
| GTM (ambassadors VE, partnerships comercios) | $30–60k |
| Marketing / contenido | $20–40k |
| **Total OpEx año 1** | **$250–470k** |

### Break-even

- 50,000 usuarios activos mensuales × LTV $50 anualizado = ~$2.5M ARR.
- OpEx escalado a esa carga: ~$1.5–2M/año.
- **Break-even operacional a 50k MAU**, alcanzable mes 15–18 con ejecución correcta.

---

## 5. Path to profitability

| Hito | Mes | Usuarios | ARR | Status |
|---|---|---|---|---|
| Pre-revenue | 0–3 | <1k | <$10k | Bootstrapped + Colosseum funds |
| First revenue stream live | 3–6 | 1k–5k | $30–100k | Mosly swap fee + early merchants |
| All 5 streams active | 6–12 | 5k–25k | $300–800k | SDK partners online |
| Break-even on operating | 15–18 | 50k+ | $2.5M+ | Profitable run-rate |
| Series A readiness | 18–24 | 100k+ | $5M+ | Card live, multi-país |

---

## 6. Defensibilidad — por qué este modelo no se copia rápido

### 6.1 Network effects bilaterales

Two-sided marketplace clásico:
- Más comercios → más utilidad para usuarios (más donde gastar BsX/USDC).
- Más usuarios → más demanda para que comercios se afilien.
- El primer player en alcanzar masa crítica en VE captura el mercado.

### 6.2 Switching cost real

- Libreta de contactos privada por wallet (P2P + claim links históricos).
- Histórico de pagos a comercios (loyalty acumulada).
- Carlos AI con memoria personalizada (preferencias, presupuestos, frecuencia).
- BsX balance + reserva atestada — el usuario confía en este vault, no en el de otro.

### 6.3 Brand local

- "Tropico" = identidad caribeña venezolana. Carlos AI habla con voseo natural.
- Marca pega antes que cualquier app gringa en español machine-translated.
- Diáspora venezolana en Madrid, Buenos Aires, Miami reconoce y comparte.

### 6.4 Technical moat — BsX program

El protocolo BsX está en `programs/tropico_bs/`. Cualquier copia necesita:
- 1:1 USDC reserva en vault PDA-owned.
- Oracle reputado para peg rate.
- `attest_reserves` callable por anyone para transparencia.
- Integración Pago Móvil VE (rail + relaciones bancarias + entender 20+ bancos).

Eso son 6–9 meses para un equipo sin ventaja local. Para entonces Tropico tiene mainnet + audit + 10k+ usuarios + brand.

### 6.5 Pago Móvil VE

Rail nativo del 90% de la economía cotidiana venezolana. Un equipo extranjero tarda meses solo en entender los flows. Nosotros los usamos a diario.

---

## 7. Sensibilidad — qué pasa si...

| Escenario | Impacto en revenue año 1 |
|---|---|
| Solo 0.3% de remesas capturadas (vs 1% target) | Revenue cae a ~$100k. Aún sostenible con seed. |
| Audit BsX se retrasa 6 meses | Mainnet Q4 en lugar de Q3. Revenue año 1 cae 30–40%. |
| Pago Móvil VE bloquea acceso | Cae stream merchant pero crecen swap + remesas. Revenue -20%. |
| USDC depeg | Pausa temporal de BsX mint/burn, BsX se queda con backing parcial. Mitigación: diversificar a USDT/EURC. |
| Competidor con BsX onchain serio aparece | Diferencial baja a brand + Pago Móvil. Aún defendible. |

---

## 8. Capital — qué pedimos y para qué

**Seed target**: $500k – $1M

| Uso | % | Cubre |
|---|---|---|
| Equipo | 40% | 3 hires (ingeniero, GTM lead VE, partnerships LatAm) |
| Audit + compliance | 20% | Audit BsX program + abogado regulatorio VE/Colombia |
| GTM | 25% | Ambassadors VE, partnerships comercios, eventos diáspora |
| Infraestructura + buffer | 15% | RPC, MPC, LLM, contingencias |

**Runway**: 12–18 meses hasta Series A con ARR $1.5M+.

---

## 9. Comparables de exit (escenarios largo plazo)

| Empresa | Mercado | Exit / Valuation | Comentario |
|---|---|---|---|
| Bitso | Mexico crypto | $2.2B Series C 2021 [verify] | Mismo mercado vertical, escala probada |
| Strike | LatAm payments | Public sources $200–500M valuation [verify] | Lightning fue rail; nosotros Solana |
| Reserve | LatAm stablecoin | $30M raised [verify] | Validó VE wallet pero custodial |
| Mountain Protocol | Regulated yield USD | Recent raise [verify] | Precedente para BsX como producto financiero |

**Path realista**: Series A a 18–24 meses, Series B con 200k+ MAU, expansión LatAm completa, opciones de exit o IPO 5–7 años.
