# Tropico Solana Monitoring — Cómo Guacama vigila la blockchain

> Pregunta del usuario: "¿Integraste el Solana program para monitorear todo lo que se haga del lado de Solana?"

**Respuesta corta**: NO custom program. SÍ monitoring completo via RPC + webhooks + capability Python `wallet_balances.py`.

---

## Por qué NO un Solana program propio para monitoring

Solana programs (Anchor) sirven para **escribir/modificar estado on-chain**. Para **leer/monitorear** estado on-chain no necesitas programa propio — ya está todo público y consultable via:

1. **RPC nodes** (Helius, Triton, Solana Foundation) — todas las queries disponibles
2. **WebSocket subscriptions** — push notifications de cualquier cambio
3. **Helius enhanced webhooks** — eventos parseados (NFT mint, swap, transfer, etc.)
4. **getProgramAccounts** — lectura de cualquier account de cualquier program
5. **getSignaturesForAddress** — historial de tx de un wallet
6. **logsSubscribe / accountSubscribe** — push real-time

**Conclusión**: el monitoring de Tropico es 100% lectura. Cero programa custom necesario.

---

## Qué monitorea Guacama AI by Lumen

### 1. Wallets de usuarios

Capability: `lumen-capabilities/balances/wallet_balances.py`

```python
# Lee SOL nativo + todos los SPL tokens del wallet
# RPC: getBalance + getTokenAccountsByOwner
# Devuelve: { sol, usdc, usdt, jup, jto, msol, kmno, ray, bonk, ... }
```

Guacama invoca esto cuando el usuario pregunta "¿cuánto tengo?" o cuando necesita validar saldo antes de un swap/send.

### 2. Tropico Treasury (recibo de fees)

Wallet de Tropico tiene 3 ATAs públicas (USDC/USDT/wSOL). Guacama puede consultar en cualquier momento cuánto fee se ha acumulado:

```bash
spl-token balance <USDC_ATA> --owner <TROPICO_TREASURY>
```

O via Helius RPC. Esto es **transparencia radical** — cualquier usuario puede verificar los ingresos de Tropico en tiempo real. Q3 expondremos un dashboard `/transparency` que lee esto live.

### 3. Solana Pay references (confirmación de cobros)

Cada sesión de cobro o Tropico Pay tiene un `reference` (pubkey base58 32 chars). Guacama usa `findReference` del SDK `@solana/pay`:

```typescript
import { findReference } from "@solana/pay";
const sig = await findReference(connection, new PublicKey(reference), {
  finality: "confirmed",
});
// sig.signature → la tx que pagó este cobro
```

Esto permite confirmar pagos en ~1 segundo sin polling.

### 4. P2P swap epochs (NUEVO — `/intercambio-p2p`)

Guacama monitorea cada 250ms el orderbook P2P. Cuando un epoch cierra (cada 10s):
- Detecta intents nuevos
- Valida balances de cada participante (lectura on-chain)
- Ejecuta el matching aleatorio
- Audita post-tx que ambos lados recibieron lo prometido
- Reporta al usuario por chat o push

### 5. Webhooks Helius (push, no polling)

Q3 setup en Helius dashboard:
- Webhook 1: cualquier transfer USDC al wallet del usuario → trigger `auto-yield` agent action
- Webhook 2: cualquier transfer al treasury de Tropico → trigger transparency dashboard refresh
- Webhook 3: cualquier intent al pool P2P → trigger Guacama epoch validator

Helius parsea las txs y devuelve JSON estructurado. Más eficiente que parsear logs raw.

---

## Arquitectura completa de monitoring

```
┌─────────────────────────────────────────────────────────────────────┐
│  Solana mainnet (estado público)                                    │
│  - Wallets de usuarios (SPL accounts)                               │
│  - Tropico treasury + 3 ATAs                                        │
│  - References de Solana Pay                                         │
│  - Pool de liquidez Bs↔USDC (Q3 PDA)                                │
└─────────────────────────────────────────────────────────────────────┘
              │                          │
              │ RPC reads                │ Webhooks push
              │ (Helius)                 │ (Helius enhanced)
              ▼                          ▼
┌────────────────────────────┐  ┌──────────────────────────────────┐
│  Capabilities Python       │  │  Webhook listeners (Q3)          │
│  lumen-capabilities/*.py   │  │  app/api/webhooks/helius/*       │
│  - wallet_balances.py      │  │  - on-deposit → auto-yield       │
│  - cashback_summary.py     │  │  - on-treasury → transparency    │
│  - solana_pay_url.py       │  │  - on-p2p-intent → Guacama epoch  │
└────────────────────────────┘  └──────────────────────────────────┘
              │                          │
              └──────────┬───────────────┘
                         ▼
              ┌──────────────────────┐
              │  Guacama AI by Lumen  │
              │  /api/guacama/route   │
              │  - Decide cuándo actuar
              │  - Valida pre/post tx
              │  - Reporta al usuario
              └──────────────────────┘
                         │
                         ▼
                 Usuario en /home
```

---

## Por qué ESTA es mejor arquitectura que un program custom

| Approach | Tiempo dev | Costo | Auditoría | Mantenimiento |
|---|---|---|---|---|
| **Tropico (RPC + webhooks)** | Días | Free tier Helius | Cero (es todo lectura) | Cero |
| Custom Anchor monitoring program | Semanas | Deploy + audit $20-100k | Sí, cada deploy | Cada upgrade |
| Indexer propio (subgraph-like) | Semanas | Servidor + DB | No (off-chain) | Constante |

**Para hackathon + early stage**: la respuesta correcta es siempre "compón lo que ya existe" en Solana. La composability es el feature, úsala.

---

## Cuándo SÍ necesitaríamos program propio

Casos futuros (Q4+) donde un Anchor program ~150 LOC empieza a tener sentido:

1. **P2P swap orderbook on-chain** — para que el matching sea verificable on-chain en lugar de cliente. Hoy MVP es client-side, Q3 server-side, Q4 program propio.
2. **Treasury splitter** — distribución automática de fees a cofounders + cashback pool sin intervención manual.
3. **TropiCoin Token-2022 transfer hooks** — enforce reglas de holding o decay de cashback no-reclamado.
4. **DAO voting** — si TropiCoin tiene governance, el setting del feeBps se decide on-chain.

Ninguno bloquea el MVP. Decisión Q4 cuando haya tracción + audit budget.

---

## Cómo verificar TÚ MISMO el monitoring

Sin escribir código:

```bash
# 1. Ver balance de cualquier wallet
solana balance <pubkey> --url mainnet-beta

# 2. Ver SPL tokens de un wallet
spl-token accounts --owner <pubkey> --url mainnet-beta

# 3. Ver historial de tx de un wallet
solana transaction-history <pubkey> --url mainnet-beta --limit 10

# 4. Ver una tx específica decoded
solana confirm -v <signature> --url mainnet-beta

# 5. WebSocket subscribe (real-time push)
# Via wscat:
wscat -c wss://mainnet.helius-rpc.com/?api-key=YOUR_KEY
> {"jsonrpc":"2.0","id":1,"method":"accountSubscribe","params":[<pubkey>]}
```

Todo lo que Guacama ve, vos podés ver. **Transparencia radical** = principio #5 de Tropico.

---

## Referencias

- Helius docs: https://docs.helius.dev
- Solana RPC API: https://solana.com/docs/rpc
- @solana/pay: https://docs.solanapay.com
- @solana/web3.js subscriptions: https://solana.com/docs/clients/javascript-reference#websockets
