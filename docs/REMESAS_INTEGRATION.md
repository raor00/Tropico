# Tropico Remesas — Integración con on-ramps internacionales

> Cómo Tropico permite que un familiar en cualquier país mande dinero desde su banco a un wallet venezolano en USDC sobre Solana, en 1 segundo, sin colas ni Western Union.

**Última actualización**: 2026-05-09
**Estado**: investigación + plan de integración. UI funcional MVP, on-ramp real Q3 2026.

---

## TL;DR

Familiar en USA / España / cualquier país abre `/remesas` → elige monto + método de pago → paga con su tarjeta / transferencia bancaria / PayPal / crypto → on-ramp partner convierte fiat a USDC en Solana → llega al wallet del receptor venezolano en ~1 segundo. El receptor decide qué hacer: yield, comercios, swap a Bs, pagar servicios, mandar a otro.

```
Familiar en exterior              On-ramp partner             Tropico Solana
──────────────────                 ──────────────              ──────────────
Banco / Tarjeta / PayPal  ───▶    MoonPay/Transak/      ───▶  USDC en wallet
                                   Ramp/Stripe                  del venezolano
                                                                (1 segundo)
                                   ▲
                                   │ MVP demo: simulado
                                   │ Q3 producción: API real
```

---

## 1. ¿Por qué este módulo es crítico para Venezuela?

**Mercado real**:
- ~7M venezolanos viven fuera del país (CIA Factbook 2024-2026 estimates)
- Remesas a VE: ~$3.5B/año estimado (Caracas Chronicles, 2025)
- 88% recibe entre $50-300/mes
- Métodos actuales:
  - **Western Union / Moneygram**: 6-15% fee, 1-3 días, oficinas físicas en VE
  - **Wire transfer bancario**: $25-50 flat + 3-5% spread, 2-5 días, bloqueos por sanciones
  - **Zelle (USA→bancos VE)**: bloqueado en 2024 por sanciones, no funciona ya
  - **Binance P2P**: 1-3% spread, custodia Binance, fricción de matching
  - **AirTM/Reserve**: 0.5-2%, custodia parcial, fricción onboarding receptor

**Oportunidad Tropico**:
- 1-2% fee total (3-5x más barato que tradicional)
- 1 segundo settlement (3000x más rápido que Western Union)
- Non-custodial (receptor dueño de sus llaves)
- Funciona 24/7 desde cualquier país sin oficinas

---

## 2. Stack técnico — opciones de on-ramp evaluadas

### 2.1 Comparativa de providers

| Provider | Países | Métodos | Soporta USDC Solana | Fee típico | Notas |
|---|---|---|---|---|---|
| **MoonPay** | 160+ | Card, ACH, SEPA, Open Banking | ✅ sí | 3.5-4.5% | Widget + API. Buen UX. KYC obligatorio. |
| **Transak** | 150+ | Card, ACH, SEPA, Pix (BR), UPI (IN) | ✅ sí | 3.5-5% | Widget + API. Bueno para LATAM. |
| **Ramp Network** | 150+ | Card, ACH, SEPA, Open Banking | ✅ sí | 2.5-4% | Más barato en bank transfers. |
| **Coinbase Onramp** | 100+ | Coinbase account, ACH, card | ✅ sí | 1-2.5% | Más barato si el sender ya tiene Coinbase. |
| **Stripe Crypto** | 50+ (US-strong) | Card, Apple Pay, Link | ✅ sí | 1.5-2% | Ideal para senders en USA. |
| **Mercuryo** | 100+ (EU-strong) | Card, SEPA | ✅ sí | 3-4% | Mejor en Europa. |
| **Banxa** | 100+ | Card, bank transfer | ✅ sí | 3-4% | Generalist global. |
| **Sphere Pay** | Limitado | Card, USDC-native | ✅ sí (Solana-native) | 0.5-1.5% | Más nuevo, menor cobertura, ideal cuando aplique. |

### 2.2 Aggregator recomendado: OnRamper

[OnRamper](https://onramper.com) es un aggregator que combina los providers anteriores y rutea cada transacción al **provider más barato disponible** según el país + método del sender. Single integration, elige automático.

- Widget embed o API
- 8% revenue share con MoonPay/Transak/Ramp como partners
- KYC handled by underlying provider
- Single SDK, multi-provider routing

**Decisión**: OnRamper aggregator como integración principal. Stripe Crypto como complemento para US (mejor fee).

### 2.3 Métodos no-fiat (opcional, mismos rieles)

- **Crypto-to-crypto directo** (sender ya tiene USDC en Phantom/Coinbase Wallet) → fee 0%, sólo gas Solana ~$0.001
- **PayPal PYUSD** → swap a USDC vía Jupiter → 0.5% total
- **Cash App Bitcoin** → swap a USDC → 1-2% total

---

## 3. Arquitectura — flow técnico end-to-end

```
┌────────────────────────────────────────────────────────────────────┐
│  Familiar en exterior abre /remesas                                │
└────────────────────────────────────────────────────────────────────┘
                       │
                       │ ingresa monto + país + método
                       ▼
┌────────────────────────────────────────────────────────────────────┐
│  POST /api/remesa/quote                                            │
│  { senderCountry, fiatAmount, fiatCurrency, method,                │
│    receiverWallet, channel: "remesa" }                             │
└────────────────────────────────────────────────────────────────────┘
                       │
                       │ arma quote vía OnRamper API o estima MVP
                       ▼
┌────────────────────────────────────────────────────────────────────┐
│  Response:                                                          │
│  { onRampProvider: "moonpay" | "transak" | "ramp" | "stripe" |     │
│    "coinbase",                                                      │
│    fiatAmount: 100, fiatCurrency: "USD",                           │
│    onRampFeeBps: 350,                                              │
│    tropicoFeeBps: 50,                                              │
│    usdcAmount: 95.95,                                              │
│    estimatedSettlement: "5 min" | "1 sec" | "5-10 min ACH",        │
│    sessionUrl: "https://buy.moonpay.com/?...",                     │
│    reference: "rms_<32char>" }                                     │
└────────────────────────────────────────────────────────────────────┘
                       │
                       │ familiar redirige a sessionUrl
                       ▼
┌────────────────────────────────────────────────────────────────────┐
│  On-ramp partner widget                                            │
│  - KYC (si no lo hizo antes)                                       │
│  - Captura método de pago (card / ACH / SEPA)                      │
│  - Cobra fiat                                                       │
│  - Compra USDC y manda a receiverWallet en Solana                  │
└────────────────────────────────────────────────────────────────────┘
                       │
                       │ webhook on-chain confirm + reference
                       ▼
┌────────────────────────────────────────────────────────────────────┐
│  Tropico monitorea wallet del receptor con findReference           │
│  - Detecta tx confirmada                                            │
│  - Notifica al receptor (push / WhatsApp / in-app)                 │
│  - Cobra Tropico fee 0.5% del USDC recibido (transfer al treasury) │
└────────────────────────────────────────────────────────────────────┘
                       │
                       ▼
              Receptor venezolano ve su saldo +$95.45 USDC
              Decide: yield, pagar comercios, swap a Bs,
              pagar servicios, mandar a otro pana
```

---

## 4. Implementación por fases

### Fase 1 — MVP hackathon (HOY)

✅ `/remesas` page — UI completa con:
- Comparativa vs Western Union / Moneygram / Wire
- 3 caminos (tarjeta / PayPal / crypto-to-crypto)
- Quote calculator (cliente, mock cálculo)
- Sección "qué hace el receptor" con los 5 caminos
- Diagrama end-to-end ASCII
- Banner explícito "Demo · integraciones reales Q3"

✅ Crypto-to-crypto FUNCIONA HOY — cualquiera con USDC en cualquier wallet de Solana puede mandar a un wallet de Tropico (es la misma red SPL Token Program). Sin integración adicional necesaria.

### Fase 2 — Pilot Q3 2026 (~4 semanas dev)

- Integración con **OnRamper** API (single SDK, multi-provider routing)
- Endpoint `POST /api/remesa/quote` real (en lugar de mock)
- Widget embed de OnRamper en `/remesas` con redirect a checkout
- Webhook listener para detectar deposits en wallets de receptores
- Notification system (push notifications + WhatsApp via Twilio si configurado)
- KYC handled by underlying provider — Tropico no toca PII del sender

Costo estimado dev: ~80 horas. Compliance review: $5-10k.

### Fase 3 — Stripe Crypto direct (Q3-Q4)

- Para senders en USA: integración directa con Stripe Crypto en lugar de aggregator
- Fee 1.5-2% (vs 3.5% via MoonPay aggregator)
- Apple Pay + Link soporte
- Probable ~30% de volumen total VE remesas viene de USA → vale la pena directo

### Fase 4 — PayPal PYUSD swap (Q4)

- Sender paga con PayPal en PYUSD
- Tropico convierte PYUSD → USDC vía Jupiter (0.5% fee Jupiter)
- Costo total ~1.5% — competitivo con métodos US

### Fase 5 — Locale-specific rails (2027)

- **Brasil → Pix** (Transak ya lo soporta) — fee 1-2%
- **Argentina → CBU/Mercado Pago** (vía Lemon o Bitwage)
- **México → SPEI** (Bitso o Banxa)
- **Colombia → PSE** (Buenbit o Banxa)

Cada rail añadido sube 50-300% el volumen del país respectivo.

---

## 5. Compliance considerations

### 5.1 KYC

Tropico **NO hace KYC** del sender. El on-ramp partner (MoonPay/Transak/etc.) es el responsable regulatorio. Esto es:
- Más rápido para Tropico (no licencia MSB / FinCEN registration)
- Más caro para el sender (paga el fee del partner que ya hizo KYC)

Trade-off correcto para hackathon + early stage. Q4+ se puede internalizar KYC con partner como Sumsub/Persona si volumen lo justifica.

### 5.2 Sanctions screening

USDC en Solana es público. **Tropico no puede bloquear** transacciones a wallets sancionadas (no tenemos custody). El compliance de OFAC vive en el on-ramp partner, no en Tropico.

Esto es feature, no bug — es lo que hace Tropico **non-custodial real** vs custodios que pueden y deben bloquear (y a veces bloquean por error a venezolanos legítimos).

### 5.3 Receptor en Venezuela

Recibir USDC en wallet propio NO es operación regulada en VE actualmente. La Sudeban/SUNACRIP regula intercambio fiat↔crypto, no holding de crypto. Conversión USDC→Bs vía `/depositar` ya tiene complianza vía red de agentes P2P licenciados (Q3).

---

## 6. Modelo de revenue

| Stream | Fee | Volumen estimado mes 12 |
|---|---|---|
| Tropico fee on-ramp | 0.5% del USDC depositado | $200k MRR si capturamos 0.5% del mercado VE remittance ($3.5B/año) |
| Spread USDC↔Bs (en /depositar) | 1-2% | Adicional según churn USDC→Bs |
| Yield del USDC parqueado en Save | 2% del yield generado | Marginal pero recurring |

**Single biggest revenue stream proyectado para 2027** si capturamos 1-2% del mercado VE remittance.

---

## 7. Por qué sender elegiría Tropico vs Western Union

| Factor | Western Union | Tropico Remesas |
|---|---|---|
| **Tiempo** | 1-3 días hábiles | 1 segundo on-chain |
| **Fee total** | 6-15% (incluye tasa cambio mala) | 1-2% (fee on-ramp + Tropico) |
| **Disponibilidad** | Solo en horario de oficina física | 24/7 desde cualquier país |
| **Receptor sin colas** | Tiene que ir a oficina, hacer cola, pasar foto | Recibe en su teléfono al instante |
| **Lo que recibe** | Bolívares devaluables al cambio oficial malo | USDC estable, decide cuándo y cómo cambiar |
| **Custodia** | Western Union custodia hasta el retiro | Receptor dueño de sus llaves desde el segundo 1 |
| **Trazabilidad** | Resguardo en papel, propenso a perderse | Tx on-chain pública, auditable en Solscan |
| **Bloqueos por sanciones** | Frecuentes y arbitrarios | Imposibles (red blockchain pública) |
| **Yield mientras esperas** | 0% (la plata está parada en WU) | El receptor activa Save y gana 5% APY default |

---

## 8. Endpoint REST `/api/remesa/quote` (Q3)

```http
POST /api/remesa/quote
Content-Type: application/json

{
  "senderCountry": "US",
  "fiatAmount": 100,
  "fiatCurrency": "USD",
  "method": "card" | "bank_ach" | "bank_sepa" | "paypal" | "crypto",
  "receiverWallet": "<pubkey-receiver>",
  "channel": "remesa"
}
```

Response 201:

```json
{
  "quoteId": "rms_q_<32char>",
  "reference": "<32char base58>",
  "onRampProvider": "moonpay",
  "fiatAmount": 100,
  "fiatCurrency": "USD",
  "onRampFeeBps": 350,
  "tropicoFeeBps": 50,
  "usdcAmount": 95.95,
  "estimatedSettlement": "5-10 min",
  "sessionUrl": "https://buy.moonpay.com/?currencyCode=usdc_sol&...",
  "expiresAt": "2026-05-09T18:30:00Z"
}
```

El sender abre `sessionUrl` en una nueva pestaña → completa el pago en el widget del partner → al confirmar on-chain, Tropico detecta vía webhook + notifica al receptor.

---

## 9. Próximos pasos

1. **Esta semana (hackathon)**: `/remesas` page UI completa con flow simulado (✅ done)
2. **Q3 sprint 1**: integración OnRamper API + `/api/remesa/quote` real
3. **Q3 sprint 2**: webhook listener + notification system
4. **Q3 sprint 3**: Stripe Crypto integration directa para US
5. **Q4**: PayPal PYUSD + locale-specific rails (Pix, CBU, SPEI, PSE)

---

## 10. Referencias

- OnRamper docs: https://docs.onramper.com
- MoonPay docs: https://www.moonpay.com/business/onramp
- Transak docs: https://docs.transak.com
- Ramp Network docs: https://docs.ramp.network
- Stripe Crypto onramp: https://docs.stripe.com/crypto/onramp
- Coinbase Onramp: https://docs.cdp.coinbase.com/onramp/docs/welcome
- VE remittances market data: Caracas Chronicles 2025, Banco Central de Venezuela estimates
