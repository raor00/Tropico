# Guía de Demo para Jueces — Tropico Wallet

> Esta guía explica cómo cualquier juez del hackathon puede probar Tropico end-to-end en menos de 2 minutos sin instalar nada, sin SOL real, sin compras.

---

## TL;DR — 3 pasos

1. Andá al deploy live: `https://<vercel-url>.vercel.app`
2. **Login con tu email** (Privy abre modal con email/Google/wallet)
3. En `/home` click el botón **"Modo demo · devnet"** (bajo "Saldo disponible") → en ~10 segundos vas a tener:
   - Wallet Solana embedded creada por Privy (devnet)
   - **100 TROPI** test tokens minteados a tu wallet
   - **0.05 SOL devnet** para gas
   - El cluster ya cambia automáticamente a devnet

Listo. Ya podés probar todos los flows: enviar, recibir QR, swap, Pago Móvil VE, etc.

---

## Cómo funciona el "Modo demo · devnet"

### Frontend
Componente `components/DevnetFaucetButton.tsx`:
1. Toggle `cluster` a `devnet` en `lib/cluster.ts` (persiste en localStorage).
2. POST a `/api/devnet-faucet` con tu pubkey.
3. Refresca balances + dispara evento `tropico:cluster-changed` para re-render.

### Backend (`app/api/devnet-faucet/route.ts`)
1. Carga el deployer keypair desde env `DEPLOYER_SECRET_KEY_JSON` (server-only, nunca expuesto al browser).
2. **Rate limit**: 1 request cada 5 minutos por pubkey (memoria del proceso).
3. Verifica saldo de SOL del usuario:
   - Si tiene <0.01 SOL devnet → manda 0.05 SOL del deployer (gas + rent ATA).
4. Crea ATA del usuario para `TROPI` mint si no existe (`getOrCreateAssociatedTokenAccount`).
5. Mintea 100 TROPI usando el deployer (mint authority).
6. Devuelve signatures + Solscan links.

### Seguridad

- ✅ El deployer keypair NUNCA llega al browser (env var server-only `DEPLOYER_SECRET_KEY_JSON`)
- ✅ Rate limit por pubkey evita drenar la tesorería del deployer
- ✅ El deployer es un wallet de devnet sin valor mainnet
- ✅ No hay endpoints que cobren del usuario sin firma del usuario
- ✅ El usuario sigue siendo dueño 100% de su wallet (Privy embedded MPC, sin custodia Tropico)

---

## Setup del faucet (para deployers Tropico)

### 1. Generar deployer keypair (si no existe)

```bash
solana-keygen new --no-bip39-passphrase -o ~/.config/solana/tropico-devnet.json
solana airdrop 5 --keypair ~/.config/solana/tropico-devnet.json --url devnet
```

### 2. Crear el TROPI mint (1 vez)

```bash
node scripts/create-tropi-token.mjs
```
Output:
- Mint: `AbkCW6BA2ZVoTw4Q6M1NvATiZjn2aMS3WvWZQbhRQf6K`
- Deployer: `EUSqhaDBVLtzjgqwxeTurcksyPqkW37nyyTBWEhKVXDd`

### 3. Configurar env var en Vercel

```bash
# Leé el secret key array como JSON
cat ~/.config/solana/tropico-devnet.json
# Copiá el array completo, ej: [12,34,56,...]

# En Vercel → Settings → Environment Variables → Add
DEPLOYER_SECRET_KEY_JSON = [12,34,56,...]
```

⚠️ **NUNCA** commitees el archivo `.json` al repo ni lo pongas en `.env.local` rastreado por git. Está en `.gitignore`.

### 4. Mantener el deployer fondeado

El deployer necesita SOL devnet para:
- Crear ATAs nuevas para usuarios (~0.002 SOL por ATA)
- Pagar gas de mints (~0.000005 SOL)
- Mandar 0.05 SOL gas a cada usuario nuevo

Si el deployer baja de 1 SOL devnet, repetir:
```bash
solana airdrop 2 --keypair ~/.config/solana/tropico-devnet.json --url devnet
```

O usar https://faucet.solana.com pegando el pubkey deployer.

---

## Qué probar después del Modo Demo

| Flow | URL | Qué se demuestra |
|---|---|---|
| **Saldo on-chain** | `/home` | Balance real via Helius RPC, refresca cada 30s |
| **Enviar** | `/enviar` → tab "A wallet" | Firma SPL Token con Privy embedded → broadcast Solana devnet |
| **Cobrar (QR)** | `/cobrar` | Genera QR Solana Pay con `reference` único |
| **Swap** | `/cambiar` → tab "Tokens" | Quote real Jupiter v6 con `platformFeeBps=50` |
| **Bs ↔ USDC** | `/cambiar` → tab "Bolívares" | Pool propio Tropico, settlement <1s |
| **Pago Móvil VE** | `/pagar-servicios` | Scan QR Suiche7B (cámara) o entrada manual → pool Bs Tropico paga al banco destino |
| **Carlos AI** | `/carlos` | Chat + 4 acciones agentic (DCA, auto-yield, cashback, rebalance) |
| **Perfil** | `/perfil` | Editar nombre, ver email Privy, eliminar wallet |
| **Idiomas** | Header → globo | ES / EN / PT / FR |

---

## Troubleshooting

| Problema | Solución |
|---|---|
| "Faucet no configurado" | Falta env `DEPLOYER_SECRET_KEY_JSON` en Vercel |
| "Probá de nuevo en Xs" | Rate limit por pubkey (5 min). Esperá. |
| "found no record of a prior credit" | Deployer sin SOL devnet. Pedí airdrop. |
| QR no detecta cámara | Permitir cámara en browser. O usar "Colocar datos manualmente" |
| Privy login no abre | Verificar `NEXT_PUBLIC_PRIVY_APP_ID` + dominios autorizados en Privy dashboard |

---

## Direcciones útiles on-chain

| Recurso | Cluster | Address |
|---|---|---|
| TROPI mint | devnet | `AbkCW6BA2ZVoTw4Q6M1NvATiZjn2aMS3WvWZQbhRQf6K` |
| Deployer/Faucet | devnet | `EUSqhaDBVLtzjgqwxeTurcksyPqkW37nyyTBWEhKVXDd` |
| USDC mint | devnet | `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU` |
| USDC mint | mainnet | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| SPL Token Program | both | `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` |
| Jupiter v6 | mainnet | `JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4` |

Solscan TROPI: https://solscan.io/token/AbkCW6BA2ZVoTw4Q6M1NvATiZjn2aMS3WvWZQbhRQf6K?cluster=devnet
