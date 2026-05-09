# Tropico — Guía: deployar TROPI-TEST en Solana devnet

> Cómo crear un SPL token de prueba llamado **TROPI-TEST** en devnet para que cualquier dev pueda probar Cobrar, Enviar, y Tropico Pay sin gastar USDC real.

**Última actualización**: 2026-05-08

---

## Por qué un test token

En devnet no existe USDC real. Puedes usar el mint de USDC de devnet
(`4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`) pero depende de
que el faucet de Circle esté disponible, y muchas veces no lo está.

TROPI-TEST resuelve eso: es un token **propio**, con mint authority en tu keypair de dev,
que podés mintear a voluntad y distribuir a cualquier wallet de prueba con un script.

Casos de uso:
- Probar el módulo **Cobrar** (merchant recibe TROPI-TEST)
- Probar el módulo **Enviar** (claim links con TROPI-TEST)
- Probar **Tropico Pay** (B2B checkout en devnet)
- Demostrar balances reales en UI sin arriesgar plata

---

## Pre-requisitos

### 1. Solana CLI

```bash
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
```

Verificar:

```bash
solana --version
# solana-cli 1.18.x (o superior)
```

### 2. SPL Token CLI

```bash
cargo install spl-token-cli
```

Si no tenés Rust instalado:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
cargo install spl-token-cli
```

Verificar:

```bash
spl-token --version
# spl-token-cli 3.x.x
```

### 3. Keypair de devnet

Crear una keypair dedicada para desarrollo (no usar la de producción nunca):

```bash
solana-keygen new -o ~/.config/solana/devnet-test.json
```

Guardar el seed phrase en un lugar seguro (puede ser `~/.config/solana/devnet-seed.txt` local — nunca en el repo).

### 4. Configurar CLI en devnet

```bash
solana config set \
  --url devnet \
  --keypair ~/.config/solana/devnet-test.json

solana config get
# RPC URL: https://api.devnet.solana.com
# Keypair Path: ~/.config/solana/devnet-test.json
```

### 5. Airdrop SOL en devnet

Necesitás SOL para pagar rent y fees de transacción:

```bash
solana airdrop 2

# Si el airdrop falla (rate limit), intentar con:
solana airdrop 2 --url devnet

# Ver balance:
solana balance
# 2 SOL
```

> El airdrop de devnet tiene rate limit. Si falla, esperá 30 segundos y reintentá. También podés usar https://faucet.solana.com.

---

## Crear el token TROPI-TEST (10 comandos)

### Paso 1 — Crear el mint

```bash
spl-token create-token --decimals 6
```

Output esperado:

```text
Creating token <MINT_ADDRESS> under program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA

Address: <MINT_ADDRESS>
Decimals: 6

Signature: <TX_SIGNATURE>
```

**Guardar el `MINT_ADDRESS`** — lo necesitás en todos los pasos siguientes. Ejemplo:

```bash
export TROPI_MINT="<MINT_ADDRESS>"
```

### Paso 2 — Crear una token account para tu wallet

```bash
spl-token create-account $TROPI_MINT
```

Output:

```text
Creating account <TOKEN_ACCOUNT_ADDRESS>

Signature: <TX_SIGNATURE>
```

### Paso 3 — Mintear 1,000,000 TROPI-TEST

```bash
spl-token mint $TROPI_MINT 1000000
```

Output:

```text
Minting 1000000 tokens
  Token: <MINT_ADDRESS>
  Recipient: <TOKEN_ACCOUNT_ADDRESS>

Signature: <TX_SIGNATURE>
```

### Paso 4 — Verificar el balance

```bash
spl-token balance $TROPI_MINT
# 1000000
```

### Paso 5 — Transferir 100 TROPI-TEST a una wallet de prueba

```bash
spl-token transfer $TROPI_MINT 100 <WALLET_DE_PRUEBA> --fund-recipient
```

`--fund-recipient` crea la token account en la wallet destino y paga el rent. Es el equivalente de "init ATA" si la wallet destino nunca tuvo este token.

### Paso 6 — Ver la supply total

```bash
spl-token supply $TROPI_MINT
# 1000000
```

### Paso 7 — Ver todas tus token accounts

```bash
spl-token accounts
```

### Paso 8 — (Opcional) Agregar metadatos al token

Para que el token aparezca con nombre en Solscan y wallets:

```bash
# Requiere Metaplex CLI o sugar
# npx @metaplex-foundation/mpl-token-metadata create
# Por ahora, el nombre se ve como "Unknown Token" en explorers sin metadatos
```

En Solscan, el token sí aparece por su mint address y decimales. Los metadatos completos (nombre, símbolo, imagen) son opcionales para testing.

### Paso 9 — Exportar mint address a `.env.local`

```bash
# .env.local
NEXT_PUBLIC_TROPI_TEST_MINT=<MINT_ADDRESS>
NEXT_PUBLIC_SOLANA_CLUSTER=devnet
```

### Paso 10 — Verificar en Solscan devnet

```
https://solscan.io/token/<MINT_ADDRESS>?cluster=devnet
```

Ahí vas a ver:
- Supply total (1,000,000)
- Holders
- Transfers (cada `spl-token transfer` que hiciste)

---

## Verificar en el explorador

Solscan devnet: `https://solscan.io/token/<MINT_ADDRESS>?cluster=devnet`

Solana Explorer devnet: `https://explorer.solana.com/address/<MINT_ADDRESS>?cluster=devnet`

Ambos muestran el token, la supply, y el historial de transacciones.

---

## Cómo conectar TROPI-TEST a Tropico

Abrí `lib/tokens.ts` y agregá el token. Tenés dos opciones:

### Opción A — Agregarlo al `TOKENS` registry (recomendada para testing extenso)

```typescript
// lib/tokens.ts

export type TokenSymbol =
  | "SOL"
  | "USDC"
  // ... otros tokens
  | "TROPI-TEST"; // Agregar aquí

// En el objeto TOKENS:
"TROPI-TEST": {
  symbol: "TROPI-TEST",
  name: "Tropico Test Token",
  mint: process.env.NEXT_PUBLIC_TROPI_TEST_MINT ?? "REEMPLAZAR_CON_MINT_DEVNET",
  decimals: 6,
  logoURI: "/icons/tropi-test.svg", // o cualquier placeholder
  vibe: "Solo para devs — no tiene valor",
  pitchVE: "Token de prueba para el equipo de desarrollo. No tiene valor real.",
  riesgo: 1 as const,
  brand: "#9945FF",
},
```

### Opción B — Variable de entorno sin tocar tokens.ts (más limpia para demo)

```typescript
// lib/tokens.ts — al final del archivo

/** Solo en devnet — mint del token de prueba para desarrollo */
export const TROPI_TEST_MINT =
  process.env.NEXT_PUBLIC_TROPI_TEST_MINT ??
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"; // fallback: USDC devnet oficial
```

Luego, en cualquier lugar donde hardcodees el mint de USDC para testear:

```typescript
import { TROPI_TEST_MINT } from "@/lib/tokens";

// En lugar de:
const mint = TOKENS.USDC.mint;

// Usás:
const mint =
  process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "devnet"
    ? TROPI_TEST_MINT
    : TOKENS.USDC.mint;
```

---

## Faucet propio

Para que cualquier dev del equipo pueda recibir 100 TROPI-TEST sin
necesitar acceso al keypair del mint authority, existe `scripts/faucet.sh`.

Uso:

```bash
bash scripts/faucet.sh <WALLET_PUBKEY>
```

Ejemplo:

```bash
bash scripts/faucet.sh 7xKXtABCDEF123456789abcdefghijkl
# Enviando 100 TROPI-TEST a 7xKXt...
# Signature: 5abc...
# Done! El dev ya tiene tokens para probar.
```

El script está en `scripts/faucet.sh` y requiere:
- Solana CLI configurado en devnet
- El keypair con mint authority en `~/.config/solana/devnet-test.json`
- La variable de entorno `TROPI_TEST_MINT` o el mint hardcodeado en el script

> El script necesita estar configurado con el mint address real después de correr los pasos de creación del token.

---

## Cleanup — antes de ir a producción

Antes de hacer deploy a mainnet, verificar que no hay referencias al test token:

```bash
# Buscar usos del mint de devnet en el código
grep -r "TROPI_TEST_MINT\|devnet-test\|NEXT_PUBLIC_TROPI" src/ app/ lib/ components/

# Verificar que cluster es mainnet
cat .env.production
# NEXT_PUBLIC_SOLANA_CLUSTER=mainnet-beta

# En lib/tokens.ts — asegurarse que el USDC mint es el de mainnet
# EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v ← correcto mainnet
# 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU ← devnet, NO usar en prod
```

El test token TROPI-TEST **no existe en mainnet** — si alguien accidentalmente intenta usarlo en mainnet, las transacciones fallan porque el mint no existe. No hay riesgo de pérdida de fondos reales por este motivo.

---

## Referencia rápida de comandos

```bash
# Setup inicial
solana config set --url devnet --keypair ~/.config/solana/devnet-test.json
solana airdrop 2

# Crear token
spl-token create-token --decimals 6
spl-token create-account <MINT>
spl-token mint <MINT> 1000000

# Distribuir
spl-token transfer <MINT> 100 <WALLET> --fund-recipient

# Verificar
spl-token balance <MINT>
spl-token supply <MINT>

# Explorer
# https://solscan.io/token/<MINT>?cluster=devnet
```
