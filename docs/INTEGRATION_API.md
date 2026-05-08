# Tropico Pay — Integration API

> Layer de integración para que cualquier plataforma (delivery, e-commerce, ticketing, SaaS) cobre en USDC sobre Solana usando Tropico como gateway de pagos.

**Última actualización**: 2026-05-08
**Estado**: MVP demo (endpoint REST funcional, webhook firmado, hosted checkout). Producción Q3 2026.

---

## TL;DR

```
Tu plataforma                Tropico Pay              Solana
─────────────                ───────────              ───────
1. POST /api/checkout/create ──────▶
                                    ┌─ arma URL solana:...
                                    └─ devuelve sessionId + reference
                       ◀────────────
2. Cliente abre solanaPayUrl
   o el hostedCheckoutUrl     ─────────────────────────▶ wallet del cliente
                                                         firma tx con USDC
                                                            │
                                    ┌────────────────────── ▼
                                    │ findReference(reference)
                                    │ confirma on-chain
                                    ▼
3. Tu webhook ◀──── POST con event: payment.confirmed
4. Marcas la orden como pagada en tu DB. Listo.
```

---

## 1. ¿Por qué integrar Tropico Pay?

| Métrica | Visa/Mastercard | Tropico Pay |
|---|---|---|
| Settlement | 1-3 días hábiles | **1 segundo** |
| Fee al merchant | 2.5–5% + flat | **0.5%** |
| Chargebacks | Sí (riesgo del merchant) | **0** (firma irreversible) |
| Moneda | Local (devaluable) | **USDC** (estable, USD digital) |
| Custodia | Banco intermediario | **Non-custodial** |
| Disponibilidad | Banca tradicional VE | **24/7 sin banco** |
| Compatibilidad | Solo Visa/MC | **Cualquier wallet de Solana** |

---

## 2. Patrones de integración

### 2.1 Solana Pay link (universal, sin SDK)

El más simple. Tu plataforma genera un link `solana:...` y se lo pasa al cliente. El cliente lo abre en cualquier wallet de Solana.

**Cuándo usar**: ticketing, links cortos por WhatsApp, QR físico en local, pop-ups, integraciones rápidas sin backend.

```bash
curl -X POST https://tropico.app/api/checkout/create \
  -H "Content-Type: application/json" \
  -d '{
    "merchantWallet": "Mer7GhjMAcEYTmpAcePtAgVgkLogo3ZgKHSPaC9Th",
    "amount": 12.50,
    "tokenSymbol": "USDC",
    "partnerId": "tu-app",
    "orderId": "ORD-001"
  }'
```

Respuesta:

```json
{
  "sessionId": "tps_a1b2c3d4e5f6g7h8",
  "reference": "9KqM3nF...",
  "solanaPayUrl": "solana:Mer7Gh...?amount=12.50&spl-token=...&reference=9KqM3nF...",
  "hostedCheckoutUrl": "https://tropico.app/checkout?session=tps_a1b2c3d4e5f6g7h8&...",
  "expiresAt": "2026-05-08T20:30:00.000Z",
  "feeBps": 50,
  "merchantReceives": 12.4375,
  "partnerId": "tu-app",
  "orderId": "ORD-001"
}
```

### 2.2 REST API + Webhook (server-to-server)

Para apps con backend propio. Creas la sesión server-side, recibes webhook cuando el pago se confirma on-chain, marcas la orden como pagada.

**Cuándo usar**: e-commerce, marketplaces, suscripciones, apps de delivery con backend, ticketing con validación.

Auth: header `Authorization: Bearer <TROPICO_PAY_API_KEY>` (opcional en MVP demo, requerido en producción).

```typescript
// Server-side (Node, Next.js API route, Express, lo que sea)
const session = await fetch("https://tropico.app/api/checkout/create", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.TROPICO_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    merchantWallet: process.env.MERCHANT_WALLET,
    amount: 12.50,
    tokenSymbol: "USDC",
    partnerId: "tu-empresa",
    orderId: "ORD-001",
    channel: "ecommerce",
    redirectUrl: "https://tu-tienda.com/orden/ORD-001/ok",
    webhookUrl: "https://api.tu-empresa.com/webhooks/tropico",
  }),
}).then(r => r.json());

// Guarda session.reference en tu DB asociado al orderId.
// Redirige al cliente a session.hostedCheckoutUrl o muéstrale el QR de session.solanaPayUrl.
```

### 2.3 Drop-in button (una línea de HTML)

Pegas un script en tu checkout y aparece un botón Tropico Pay listo. Maneja el flow completo (QR, deeplink móvil, redirect). Cero estado en tu lado.

**Cuándo usar**: e-commerce con plantillas (Shopify, Tienda Nube, WooCommerce), landings, apps web sin backend.

```html
<!-- En tu página de checkout -->
<script src="https://tropico.app/sdk/tropico-pay.js" defer></script>

<button
  data-tropico-pay
  data-merchant="Mer7Gh..."
  data-amount="12.50"
  data-order="ORD-001"
  data-partner="tu-app"
  data-redirect="https://tu-app.com/orden/ORD-001/ok"
>
  Pagar con Tropico
</button>
```

El SDK detecta el botón al cargar, agrega el handler. Al hacer click abre un modal con QR + deeplink móvil (`solana:...`). Cuando el pago se confirma on-chain, redirige a la `data-redirect` URL con `?session=...&status=success`.

---

## 3. Endpoint REST detallado

### `POST /api/checkout/create`

Crea una sesión de checkout y devuelve URL Solana Pay + reference única.

**Headers**:
- `Content-Type: application/json` (requerido)
- `Authorization: Bearer <api-key>` (opcional MVP, requerido producción)

**Body**:

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `merchantWallet` | string | sí | Pubkey base58 del wallet que recibe los fondos |
| `amount` | number | sí | Monto en token humano (ej. `12.50`) |
| `tokenSymbol` | string | no | Default `USDC`. Otros: `USDT`, `SOL` |
| `partnerId` | string | sí | Slug de la plataforma integradora (ej. `yummy-rides`) |
| `orderId` | string | sí | ID del pedido en tu sistema |
| `channel` | string | no | `delivery`, `ecommerce`, `ticketing`, `saas`, `p2p`, `other` |
| `redirectUrl` | string | no | URL para redirect post-pago (success page) |
| `webhookUrl` | string | no | URL que recibe el webhook on-chain confirm |
| `message` | string | no | Mensaje opcional al cliente (Solana Pay `message`) |

**Response 201**:

```json
{
  "sessionId": "tps_<16char>",
  "reference": "<32char base58>",
  "solanaPayUrl": "solana:<recipient>?amount=...&spl-token=...&reference=...",
  "hostedCheckoutUrl": "https://tropico.app/checkout?session=...",
  "expiresAt": "ISO 8601",
  "feeBps": 50,
  "merchantReceives": 12.4375,
  "partnerId": "tu-app",
  "orderId": "ORD-001"
}
```

**Errores**:

| Status | Body | Cuándo |
|---|---|---|
| 400 | `{ error: "invalid_json" }` | Body no es JSON válido |
| 400 | `{ error: "missing_field", field: "<name>" }` | Falta campo requerido |
| 400 | `{ error: "invalid_amount" }` | `amount` no es número positivo |
| 401 | `{ error: "unauthorized" }` | API key inválida (en producción) |

---

## 4. Webhook on-chain confirm

Cuando el cliente firma la tx en su wallet, Tropico monitorea Solana con la `reference` única de la sesión. Cuando la tx se confirma (~1 segundo), tu `webhookUrl` recibe:

```http
POST https://api.tu-empresa.com/webhooks/tropico
Content-Type: application/json
X-Tropico-Signature: sha256=<hmac>
X-Tropico-Event: payment.confirmed
X-Tropico-Timestamp: 1715200800

{
  "event": "payment.confirmed",
  "sessionId": "tps_a1b2c3d4...",
  "orderId": "ORD-001",
  "partnerId": "tu-app",
  "reference": "9KqM3nF...",
  "amount": 12.50,
  "tokenSymbol": "USDC",
  "merchantReceives": 12.4375,
  "feeBps": 50,
  "txSignature": "5xK...abc",
  "blockTime": 1715200800,
  "explorer": "https://solscan.io/tx/5xK...abc"
}
```

### Eventos posibles

| Event | Cuándo |
|---|---|
| `payment.confirmed` | Tx confirmada on-chain (settlement) |
| `payment.expired` | Sesión expiró sin pago (15 min default) |
| `payment.failed` | Tx falló on-chain (rare) |

### Verificar la firma

El header `X-Tropico-Signature` es HMAC-SHA256 del body con tu `webhookSecret` (te lo damos al onboarding). Verifica antes de procesar:

```typescript
import crypto from "crypto";

function verifyTropicoSignature(rawBody: string, signature: string, secret: string) {
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  // timing-safe comparison
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
```

### Reintentos

Tu endpoint debe responder `200 OK` en menos de 5 segundos. Si falla:
- Reintento inmediato (1 segundo)
- Backoff exponencial: 5s, 30s, 5min, 30min, 2h, 12h, 24h
- Después de 24h se marca como `webhook.dead_letter` y se notifica al equipo de Tropico

---

## 5. Casos de uso por vertical

### 5.1 Delivery (Yummy Rides, apps de comida, mensajería)

**Flujo**: el cliente termina su orden en la app del partner → la app crea sesión Tropico vía REST → muestra QR (o deeplink en móvil) → cliente paga desde su wallet → webhook confirma → la orden pasa a "pagada", el rider sale.

**Por qué encaja**: settlement en 1 segundo es ideal cuando el rider está esperando confirmación en la cocina. Sin chargebacks fraudulentos típicos de delivery.

### 5.2 E-commerce (PedidosYa, tiendas online, marketplaces)

**Flujo**: checkout web → REST API + webhook → el merchant ve la orden pagada en su panel.

**Por qué encaja**: USDC es estable, el merchant no pierde valor con devaluación. 0.5% vs 4-6% de procesadores tradicionales. Sin retención de fondos.

### 5.3 Ticketing y eventos (conciertos, boletería, bares)

**Flujo**: link Solana Pay corto → cliente paga → recibe ticket único asociado a su `reference` → en la puerta se valida el `reference` on-chain.

**Por qué encaja**: imposible duplicar un ticket — la `reference` es única y on-chain. Cero chargebacks post-evento.

### 5.4 SaaS y suscripciones (streaming, software, coworking)

**Flujo**: el usuario activa Modo Agente en Tropico → autoriza una `DCA semanal` que paga al partner cada mes con su `merchantWallet` → Carlos firma la renovación con session key delegada vía OpenClaw + Privy.

**Por qué encaja**: cobros recurrentes sin tarjeta que vence. El usuario controla policy (max amount, frequency).

---

## 6. Sandbox y testing

En MVP demo el endpoint funciona contra mainnet (default) o devnet (con `?network=devnet` en el body):

```bash
# Sandbox devnet
curl -X POST https://tropico.app/api/checkout/create \
  -H "Content-Type: application/json" \
  -d '{
    "merchantWallet": "<tu-wallet-devnet>",
    "amount": 1.00,
    "partnerId": "test-integration",
    "orderId": "TEST-001",
    "network": "devnet"
  }'
```

Para airdrop USDC devnet: `https://faucet.circle.com/`

---

## 7. Pricing

| Stream | Tropico cobra | Tu plataforma cobra (sugerido) |
|---|---|---|
| Fee transaccional | 0.5% del amount | A discreción del merchant (0–2% típico) |
| Setup partner | $0 | — |
| API calls | Gratis hasta 10k/mes | Gratis hasta volumen |
| Volumen >$100k/mes | 0.4% | Negociable directo con Tropico |

---

## 8. SLA

- **Uptime**: 99.9% (mismo SLA que Helius RPC)
- **Latencia**: <500ms p95 para `POST /api/checkout/create`
- **Webhook delivery**: 99.5% en menos de 10s tras `payment.confirmed`
- **Soporte partners**: 24h primera respuesta, dedicado por Slack post-onboarding

---

## 9. Seguridad

- **Nunca** envíes secretos en el body. Usa Bearer auth.
- **Verifica** la firma del webhook antes de procesar.
- **Idempotencia**: el webhook puede llegar más de una vez. Usa `txSignature` como key.
- **Rate limit**: 100 req/min por API key. Excedido → `429 Too Many Requests`.

---

## 10. Onboarding como partner

1. Llena el form en https://tropico.app/integraciones (CTA "Hablar con el equipo")
2. Llamada técnica de 30 min con el equipo
3. Te damos: API key sandbox, webhook secret, slot en el directorio de partners
4. Pruebas en devnet hasta validar
5. Cambias a mainnet, listo

Contacto directo: `partners@tropico.app`

---

## 11. Roadmap del API

| Fecha | Feature |
|---|---|
| Q2 2026 (MVP) | REST endpoint, hosted checkout, Solana Pay link |
| Q3 2026 | Drop-in JS SDK (`tropico-pay.js`), webhook firmado, sandbox devnet público |
| Q3 2026 | Modo Agente recurring (DCA) para SaaS |
| Q4 2026 | Multi-token (BONK, JUP, custom SPL) |
| Q4 2026 | Dispute resolution layer (opt-in) |
| Q1 2027 | Multi-chain bridge stub (Ethereum→Solana auto-swap) |

---

## 12. Referencias

- Spec Solana Pay: https://docs.solanapay.com
- SDK Solana web3.js: https://solana-labs.github.io/solana-web3.js
- Tropico repo: https://github.com/raor00/Tropico
- Brief Tropico: `docs/TROPICO_BRIEF.md`
