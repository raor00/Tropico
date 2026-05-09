# Tropico — Blockchain backend (Solana)

> Cómo funciona TODO el lado on-chain de Tropico. Sin programa Anchor custom — todo via programs existentes (SPL Token, Jupiter, Solana Pay spec).

**Última actualización**: 2026-05-08

---

## TL;DR

```
┌──────────────────────────────────────────────────────────────────────┐
│                  TROPICO — STACK ON-CHAIN                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Cliente (Privy MPC wallet)                                           │
│     │                                                                 │
│     │ firma client-side (3-share: device + Privy + recovery)         │
│     ▼                                                                 │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │             PROGRAMS ON-CHAIN (públicos, no nuestros)        │   │
│  │                                                                │   │
│  │  ┌─────────────────┐  ┌──────────────┐  ┌─────────────────┐ │   │
│  │  │ SPL Token Prog  │  │  Jupiter v6  │  │ Marinade/Kamino │ │   │
│  │  │ TokenkegQ...    │  │  JUP6Lkbz... │  │  vaults yield   │ │   │
│  │  │ transfer USDC,  │  │  swap +      │  │  staking        │ │   │
│  │  │ create ATAs,    │  │  platformFee │  │  liquid SOL     │ │   │
│  │  │ mint TropiCoin  │  │  routing     │  │                 │ │   │
│  │  └─────────────────┘  └──────────────┘  └─────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
│     │                                                                 │
│     │ tx confirmada en ~400ms (devnet) / ~1s (mainnet)               │
│     ▼                                                                 │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              ESTADO ON-CHAIN (público, auditable)            │   │
│  │  - Saldos SPL del usuario en su wallet                       │   │
│  │  - Fees acumulados en ATAs del treasury de Tropico           │   │
│  │  - References únicos por sesión Solana Pay                   │   │
│  │  - LP positions en Marinade/Kamino                           │   │
│  └──────────────────────────────────────────────────────────────┘   │
│     │                                                                 │
│     │ findReference + getTokenAccountsByOwner via Helius RPC         │
│     ▼                                                                 │
│  Server Tropico (Next.js Edge)                                        │
│  - Confirma pagos via reference tracking                             │
│  - Emite webhook firmado HMAC-SHA256 a partners                      │
│  - Lee balances/yield para mostrar en UI                             │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 1. Programas on-chain usados (todos públicos, no nuestros)

| Programa | Address | Para qué |
|---|---|---|
| **SPL Token Program** | `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` | Transfer USDC, USDT, BONK, JUP, JTO, etc. Crear ATAs. Mint TropiCoin (Q4). |
| **Associated Token Account Program** | `ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL` | Crear ATA para cada (wallet × token) que recibe SPL tokens. |
| **Jupiter v6 Aggregator** | `JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4` | Swap routing. Cobra `platformFeeBps=50` automático al ATA del treasury. |
| **Marinade Liquid Staking** | `MarBmsSgKXdrN1egZf5sqe1TMThczhMLJhTndPfxN1V` | Staking SOL → mSOL (~7% APY). Usado por módulo Guardar. |
| **Kamino Lending** | `KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD` | Vaults USDC + LP mSOL/USDC. ~5% / ~12% APY. |
| **Memo Program** | `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr` | Mensajes opcionales en tx (recibos legibles para usuario). |

**Cero programa custom de Tropico.** Esto es decisión de producto (principio #2 del brief).

---

## 2. Wallets de Tropico

### 2.1 Treasury wallet

Pubkey almacenada en `NEXT_PUBLIC_TROPICO_TREASURY`. Recibe:
- Fees de swap (vía `platformFeeBps=50` de Jupiter)
- Fees de Cobrar QR (1% que paga el cliente extra)
- Fees de Tropico Pay API (0.5% extra del cliente)

**Generar**:
```bash
solana-keygen new -o ~/.config/solana/tropico-treasury.json
solana-keygen pubkey ~/.config/solana/tropico-treasury.json
```

**Custodia**: la secret key vive en Vault o 1Password — JAMÁS en el repo, JAMÁS en .env. Solo el pubkey va a `NEXT_PUBLIC_TROPICO_TREASURY`.

**Idealmente multi-sig (Squads)** para producción → 2-of-3 con cofounders. Q3.

### 2.2 ATAs del treasury

Una ATA por cada token aceptado como output:

```bash
# USDC
spl-token create-account \
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v \
  --owner <treasury-pubkey>

# USDT
spl-token create-account \
  Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB \
  --owner <treasury-pubkey>

# wSOL (wrapped SOL)
spl-token create-account \
  So11111111111111111111111111111111111111112 \
  --owner <treasury-pubkey>
```

Pubkeys resultantes → `NEXT_PUBLIC_TROPICO_FEE_ATA_USDC/USDT/SOL`.

### 2.3 User wallets (Privy MPC 3-share)

- **Share 1**: device del usuario (encriptada con biometría)
- **Share 2**: Privy infraestructura (encriptada)
- **Share 3**: Recovery (email magic link de Privy)

Para firmar tx → necesitas 2 de 3 shares. Tropico nunca tiene NINGUNA share. **Non-custodial estricto.**

User puede exportar la wallet a Phantom/Solflare en cualquier momento — la combinación de 2 shares regenera la secret key, exportable como base58 o array.

---

## 3. Flujos de transacción end-to-end

### 3.1 Cobrar (merchant recibe USDC)

```
1. Merchant abre /cobrar → ingresa $5
2. App genera reference (32-char base58) + Solana Pay URL:
   solana:<merchant-pubkey>?amount=5.05&spl-token=<usdc>&reference=<ref>&label=...
   (amount = 5.05 porque fee 1% HACIA ARRIBA)
3. UI muestra QR del URL
4. Cliente escanea con Phantom/Solflare/Tropico → ve "Pagar 5.05 USDC"
5. Cliente confirma → wallet arma tx:
   SPL Token Program::Transfer
     from: cliente-USDC-ATA
     to:   merchant-USDC-ATA
     amount: 5_050_000 (5.05 con 6 decimals)
     [+ TransferInstruction extra al treasury-USDC-ATA con 0.05 USDC = el fee]
6. Cliente firma client-side, broadcast a RPC
7. Tx confirmada en ~1s
8. App escucha con findReference(connection, reference) → detecta tx, marca "pagado"
```

**Nota fee implementation**: en MVP el fee se cobra por transfer separada en la misma tx. En producción se considera Token-2022 `TransferFeeConfig` extension para automatizar.

### 3.2 Cambiar (swap via Jupiter)

```
1. Usuario abre /cambiar → input $10 SOL → output USDC
2. App llama lite-api.jup.ag/swap/v1/quote?inputMint=...&outputMint=...&amount=10000000000&platformFeeBps=50
3. Jupiter devuelve quote: outAmount = ~9.95 USDC (post-fee)
4. App pide swap tx: lite-api.jup.ag/swap/v1/swap con feeAccount=<treasury-USDC-ATA>
5. Jupiter devuelve serialized tx (versioned tx con lookup tables)
6. Privy firma client-side
7. Broadcast + confirm — Jupiter handle todo el routing on-chain
8. Treasury recibe ~0.05 USDC en su ATA
```

### 3.3 Tropico Pay (B2B partner)

```
1. Yummy Rides backend → POST /api/checkout/create
   { merchantWallet, amount: 12.50, partnerId: "yummy", orderId: "ORD-1" }
2. Tropico server arma session:
   reference = generateReference()
   customerPays = 12.50 × 1.005 = 12.5625
   solanaPayUrl = solana:<merchant>?amount=12.5625&spl-token=<usdc>&reference=...
3. Tropico devuelve { sessionId, solanaPayUrl, hostedCheckoutUrl, customerPays, merchantReceives }
4. Yummy Rides muestra QR al cliente (o redirige a /checkout?session=...)
5. Cliente paga vía wallet → tx on-chain
6. Tropico monitor con findReference → detecta confirmación
7. POST a webhookUrl del partner con HMAC-SHA256:
   { event: "payment.confirmed", txSignature, customerPays, merchantReceives, ... }
8. Yummy marca orden como pagada en su DB
```

### 3.4 Enviar (claim links)

```
1. User A genera link → secret base58 32-char
2. App transfiere USDC a un escrow PDA derivado del secret (o a wallet temporal de Privy)
3. App genera URL: tropico.app/claim?secret=...&from=A&amount=5&token=USDC
4. User A comparte link por WhatsApp
5. User B abre link → si tiene wallet, login Privy + reclama
   Si no tiene, Privy crea wallet con su email → reclama
6. Reclamar = tx que transfiere del escrow al wallet de B
```

### 3.5 Guardar (yield via Marinade/Kamino)

```
1. User abre /guardar → elige estrategia (mSOL 7% APY)
2. App pide tx a Marinade SDK:
   - Transfer SOL del usuario al programa Marinade
   - Marinade deposita en validators de su pool, devuelve mSOL al usuario
3. Privy firma → broadcast → confirm
4. mSOL en wallet del usuario empieza a apreciar vs SOL (~7% al año)
5. Para retirar: tx inverso — burn mSOL → recibe SOL + ganancias
```

---

## 4. RPC strategy

| Caso | RPC |
|---|---|
| **Quote/swap Jupiter** | `lite-api.jup.ag/swap/v1/*` (gratis, pública) |
| **Read balances usuario** | `NEXT_PUBLIC_HELIUS_RPC` (Helius free tier — más estable que `api.mainnet-beta.solana.com`) |
| **findReference (pago confirm)** | Helius RPC con `commitment: "confirmed"` |
| **Webhooks on-chain** | Helius webhooks (Q3) — para auto-yield trigger al recibir USDC |
| **Devnet sandbox** | `https://api.devnet.solana.com` + faucet de Circle para USDC test |

**Fallback**: si Helius cae, RPC público de Solana Foundation. Latencia ~3x peor pero funcional.

---

## 5. Auditabilidad

Todo es público y verificable en Solscan:

- **Treasury wallet** → solscan.io/account/`<treasury-pubkey>` muestra TODO el ingreso de fees
- **ATAs treasury** → solscan.io/account/`<usdc-ata>` muestra cada fee individual
- **Tx de un pago** → solscan.io/tx/`<signature>` muestra el flow completo
- **Reference de una sesión Tropico Pay** → buscable on-chain con findReference

Para hacer el ingreso de Tropico transparente al público: dashboard `/transparency` en Q3 que lee live el ATA del treasury y muestra fees acumulados, distribuciones a stakeholders, etc.

---

## 6. Q3+ (cuando un programa Anchor SÍ haría sentido)

Casos donde justificaría escribir programa custom:

1. **Treasury splitter on-chain** — distribución automática de fees a cofounders/cashback pool/community treasury sin intervención manual. ~150 LOC Anchor.
2. **TropiCoin Token-2022 con transfer hooks** — para enforcear reglas de holding o decay de cashback no-reclamado. Token-2022 ya existe; el hook program es nuestro.
3. **Cashback claim escrow** — pool on-chain donde merchants depositan cashback, usuarios reclaman con proof of purchase (Solana Pay reference signed).
4. **DAO voting de fees** — si TropiCoin tiene governance, el setting del feeBps se decide on-chain.

**Ninguno bloquea el MVP.** Decisión Q4 cuando haya tracción real + audit budget.

---

## 7. Seguridad — checklist on-chain

- [ ] Treasury wallet en multi-sig (Squads) — Q3
- [ ] Webhook secrets rotados cada 90 días por partner
- [ ] Rate limit por API key partner (100 req/min default)
- [ ] Bug bounty público después de mainnet GA
- [ ] Auditoría externa de contracts custom — solo si se escriben (Q4)
- [ ] Monitoring: alerta si treasury wallet recibe < 0 (drain detection)
- [ ] Backup recovery shares de Privy en geographically distributed locations

---

## 8. Comparativa: por qué cero Anchor custom es la decisión correcta para hackathon

| Approach | Tiempo dev | Surface ataque | Audit needed | Mantenimiento |
|---|---|---|---|---|
| **Tropico (sin Anchor)** | Días | Cero código nuestro on-chain | No | Cero |
| Con Anchor custom | Semanas | Cada línea es bug potencial | $20-100k | Constante |
| Con Solana program suite (Token-2022 + Squads + Streamflow) | Días | Mismo cero — todos auditados | No | Cero |

**Conclusión**: para MVP fintech sobre Solana, la respuesta correcta casi siempre es "compón lo que ya existe" en vez de "escribe tu programa". Solana tiene composability fuerte — úsala.
