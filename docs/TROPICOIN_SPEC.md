# TropiCoin ($TROP) — Spec del token de Tropico

> Token SPL nativo de Tropico que se "alimenta" del uso de la plataforma. Loyalty + governance + flywheel económico.

**Última actualización**: 2026-05-08
**Estado**: Spec — listo para mintear cuando se decida launch

---

## 0. TL;DR

**TropiCoin ($TROP)** es un **SPL Token estándar** (NO requiere programa Anchor custom) que se distribuye a usuarios por usar Tropico. Cada swap, cada cobro, cada referido genera puntos $TROP. El token se mintea con CLI estándar de Solana en 5 minutos. Tokenomics simples: **supply fijo + emisión decreciente + utilidad real (descuentos en fees, governance Q4)**.

---

## 1. ¿Por qué TropiCoin?

### Razón 1: Flywheel económico

El usuario que usa más Tropico → gana más $TROP → puede usar $TROP para descuentos en fees → tiene más razón para volver. Loop positivo.

### Razón 2: Diferenciación competitiva

Ningún wallet/payment app en LATAM tiene token nativo. Es un **moat de marca**. Cuando un usuario tiene 500 $TROP acumulados, "pertenece" a Tropico psicológicamente — no se va a Phantom solo por capricho.

### Razón 3: Captura de valor para el equipo

20% del supply queda al equipo (vested 4 años). Si Tropico crece, $TROP crece, el equipo se beneficia sin tener que monetizar agresivamente.

### Razón 4: Compatibilidad con DeFi

Una vez listed en Jupiter, $TROP es **swappable** desde día 1. Liquidez en Raydium = posibilidad de pools, yields en Kamino, etc. El token mismo se vuelve activo financiero.

---

## 2. Tokenomics

### Supply

- **Total supply fijo**: 1,000,000,000 (1 billón) TROP
- **Decimales**: 6 (igual que USDC para coherencia)
- **Mint authority**: revocada después del launch (supply no puede crecer)
- **Freeze authority**: revocada (Tropico no puede congelar wallets)

### Distribución

| Bucket | % | Cantidad | Vesting | Uso |
|---|---|---|---|---|
| **Comunidad / rewards** | 40% | 400M | Liberación gradual via uso | Reward usuarios + comercios |
| **Equipo** | 20% | 200M | Vested 4 años con cliff 1 año | Compensación equipo |
| **Liquidez** | 15% | 150M | Inmediato | Pools Raydium / Jupiter LP |
| **Marketing / partnerships** | 10% | 100M | Discrecional | Influencers, comercios estratégicos |
| **Tesorería DAO** | 10% | 100M | Lock-up 2 años | Inversión, runway |
| **Airdrop temprano** | 5% | 50M | Snapshot pre-launch | Usuarios beta |

### Mecánica de distribución a usuarios

| Acción | Reward TROP |
|---|---|
| Crear cuenta + wallet | 100 TROP (one-time, primer airdrop) |
| Por cada swap | 1% del valor en TROP equivalente |
| Por cada cobro recibido (merchant) | 2% del valor en TROP |
| Por cada cliente afiliado (merchant) | 50 TROP |
| Por cada usuario referido | 25 TROP |
| Por activar Modo Agente | 200 TROP (one-time) |
| Por cada DCA ejecutado | 5 TROP |

**Cap mensual por usuario**: 10,000 TROP (anti-farming).

### Utilidad ($TROP holders pueden)

1. **Descuento de fees**: 50 TROP staked → -10% fees en swap, -10% fee merchant
2. **Yield boost**: 1000 TROP staked → +0.5% APY adicional en Save
3. **Acceso prioritario a features beta**: 500 TROP → tester program
4. **Governance Q4 2026**: 1 TROP = 1 voto en propuestas (modelo DAO)
5. **Cashback merchant boost**: comercios con 5000 TROP → cashback 0.5% extra a sus clientes

---

## 3. Implementación técnica — ¿necesita programa Anchor?

**Respuesta corta**: NO para v1.

### Token v1 (launch hackathon o post-MVP) — solo SPL Token estándar

✅ Lo que se puede hacer SIN programa Anchor:
- Mintear $TROP con `spl-token create-token` + `spl-token mint`
- Distribuir manualmente o vía batch transfers
- Habilitar swap en Jupiter (cualquier token SPL es automáticamente swappable cuando hay liquidez)
- Mostrar balance $TROP en /home (lectura SPL token account estándar)
- Distribuir rewards via Vercel Cron + script Node que firma con wallet de tesorería

⚠️ Lo que SÍ requeriría Anchor (post-MVP, Q4 2026):
- Staking de $TROP con boost automático on-chain
- Governance voting on-chain (DAO)
- Vesting transparente para el equipo (alternativa: Streamflow protocol que ya existe)
- Burn por uso (deflación) — alternativa: Token-2022 transfer fee extension

### Lanzamiento sin programa custom (lo que vamos a hacer)

```bash
# 1. Crear el mint
solana-keygen new -o tropicoin-mint.json
MINT=$(solana-keygen pubkey tropicoin-mint.json)
spl-token create-token --decimals 6 tropicoin-mint.json
# → output: $TROP mint address

# 2. Crear ATA de tesorería
spl-token create-account $MINT
# → output: ATA donde van a ir los 1B tokens

# 3. Mintear el supply total
spl-token mint $MINT 1000000000  # 1 billón con 6 decimals

# 4. Revocar mint authority (supply ya no puede crecer)
spl-token authorize $MINT mint --disable

# 5. Revocar freeze authority (no puedes congelar wallets de usuarios)
spl-token authorize $MINT freeze --disable

# 6. Setupear metadata Metaplex (nombre, símbolo, logo, description)
# Opción A: Metaplex Sugar CLI
sugar mint --account $MINT \
  --name "TropiCoin" \
  --symbol "TROP" \
  --uri "https://tropico.app/metadata/trop.json" \
  --seller-fee-basis-points 0

# Opción B: Token Metadata via Solana CLI
# (más manual, ver docs Metaplex)

# 7. Crear pool inicial en Raydium (opcional)
# Aporta 50M TROP + valor equivalente en USDC al pool
# Esto da liquidez para que cualquiera pueda comprar/vender $TROP
```

### Distribución programada (rewards a usuarios)

Vercel Cron + Node script que:
1. Lee de DB las acciones del usuario en la última semana (swap, cobro, referido)
2. Calcula reward en TROP según tabla
3. Firma batch transfer desde wallet tesorería
4. Persiste en DB el snapshot

```ts
// scripts/distribute-rewards.ts
import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, Transaction } from "@solana/web3.js";
import { createTransferCheckedInstruction, getAssociatedTokenAddress } from "@solana/spl-token";

const TROP_MINT = new PublicKey("AQUI_VA_EL_MINT_ADDRESS");
const TREASURY_KEYPAIR = Keypair.fromSecretKey(/* ... */);

async function distributeRewards(usersWithRewards: Array<{ wallet: string; amountTrop: number }>) {
  const connection = new Connection(process.env.HELIUS_RPC!);
  const treasuryATA = await getAssociatedTokenAddress(TROP_MINT, TREASURY_KEYPAIR.publicKey);

  for (const { wallet, amountTrop } of usersWithRewards) {
    const userPubkey = new PublicKey(wallet);
    const userATA = await getAssociatedTokenAddress(TROP_MINT, userPubkey);
    const tx = new Transaction().add(
      createTransferCheckedInstruction(
        treasuryATA,
        TROP_MINT,
        userATA,
        TREASURY_KEYPAIR.publicKey,
        BigInt(amountTrop * 10 ** 6),  // 6 decimals
        6
      )
    );
    await sendAndConfirmTransaction(connection, tx, [TREASURY_KEYPAIR]);
  }
}
```

---

## 4. Roadmap de lanzamiento

### Fase 0 — Spec (HOY)
- ✅ Doc spec finalizada (este archivo)
- ✅ Mockups de $TROP en UI futura

### Fase 1 — Devnet launch (semana 1 post-hackathon)
- Mint en devnet
- Test de distribución, claims, swap via Jupiter
- Audit interno del flow

### Fase 2 — Mainnet launch (mes 2)
- Mint mainnet con supply final
- Pool inicial en Raydium con $25k de liquidez (USDC)
- Listing en Jupiter (automático cuando hay liquidez)
- Anuncio en Twitter/Telegram + airdrop a beta users
- Comunicación: "Si usaste Tropico antes del [fecha], reclama tu TROP"

### Fase 3 — Utility activation (mes 3)
- UI de stake en `/guardar` para boost de yield
- UI de fee discount en `/cambiar` con badge "TROP holder"
- Dashboard de TROP earnings en `/home`

### Fase 4 — Governance DAO (Q4 2026)
- Snapshot space inicial (off-chain voting)
- Propuestas: nuevos comercios destacados, ajustes de fee, distribución de tesorería
- Q1 2027: migración a on-chain governance (programa Anchor + Realms)

---

## 5. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Token cae de precio post-launch | Pool inicial pequeño + distribución gradual + utility real (fee discount) crea presión de demanda |
| Sybil attack — usuarios crean miles de wallets para farmear airdrops | Cap mensual + KYC ligero para claims >$100 TROP equivalente |
| Bots dumpean en el listing | Vesting + lockup en distribución temprana |
| Regulación VE prohíbe tokens cripto | Token vive en Solana mainnet — fuera de jurisdicción VE. El usuario VE puede mantenerlo en su wallet sin tocar bolívares. |
| Equipo se va con el 20% | Vesting 4 años con cliff 1 año + multisig en wallet de equipo |
| El concepto "memecoin tropicoin" canibaliza percepción seria del producto | Marketing: TROP es **utility token**, no memecoin. Tagline: "Tu lealtad, recompensada." Diferenciado de BONK/WIF. |

---

## 6. Comparativa con tokens similares

| Token | Modelo | Lección para TROP |
|---|---|---|
| **JUP** (Jupiter) | Aggregator → token gobierno + fee discount | Mismo patrón que aplicaremos en Q4 |
| **MNDE** (Marinade) | Liquid staking → token gobierno | Modelo DAO probado |
| **JTO** (Jito) | MEV captura → distribución a stakers | TropiCoin no captura MEV pero sí value de fees |
| **PYTH** (Pyth) | Oracle → token gobierno | Modelo similar de utility |
| **BONK** | Memecoin pure-play | NO ser BONK — TROP es utility, no meme |

---

## 7. Métricas de éxito

| Mes | Objetivo |
|---|---|
| Mes 1 (post-launch) | 1,000 holders de TROP, $50k market cap |
| Mes 6 | 10,000 holders, $500k market cap, listed en CoinGecko |
| Mes 12 | 50,000 holders, $5M market cap, integración con 5+ DeFi protocols |

---

## 8. Q&A interno

### ¿Por qué no hacer un programa Anchor desde el principio?

Porque el 95% de la utility de TROP (loyalty + descuentos + governance off-chain) NO requiere Anchor. Hacer Anchor v1 sería sobre-ingeniería, alargaría el launch 3+ meses, y sumaría riesgo de auditoría. Anchor llega cuando la masa crítica justifique features avanzadas (staking real, voting on-chain, vesting custom).

### ¿Qué pasa si alguien copia el token?

Es código abierto SPL — cualquiera puede lanzar un token llamado "TropiCoin" con otro mint. Por eso:
1. **Reservamos el handle @TropiCoin** en Twitter, Telegram, Discord
2. **Verificación en CoinGecko + Jupiter Token List**: solo el mint oficial se verifica
3. **Branding sólido**: el logo Tropico es la identidad — no solo el ticker
4. **Comunicación**: el mint oficial se publica en el sitio + GitHub + redes desde día 1

### ¿Qué problema resuelve TropiCoin que NO resolvía Tropico antes?

- Antes: usuario hace swap → pierde 0.5% sin "compensación"
- Después: usuario hace swap → paga 0.5% + recibe $TROP equivalente al 1% del valor → siente que "gana algo"

Es **psicología de fidelización**. Mismo modelo que Starbucks Stars, Rappi Cash, y programas de fidelización tradicionales.

### ¿Qué hace si un usuario quiere vender todos sus $TROP?

Libre. Va a Jupiter, vende, recibe USDC. Tropico no controla.

Pero el usuario que vende todo $TROP **no obtiene los descuentos de fees** ni el yield boost. Hay incentivo natural a mantener al menos un balance mínimo.

---

## 9. Cuándo ejecutar el launch

**Mi recomendación**: NO durante el hackathon. Hazlo Q3 post-launch cuando tengas:
- Vercel deploy funcionando con tracción inicial
- Al menos 100 usuarios beta para airdrop
- Wallet de tesorería multisig setupeado
- Audit del distribution script
- Compliance básica revisada por abogado

**Lanzar TROP el día 1 sin tracción = token sin volumen = morirse en pump-and-dump**.

**Lanzar TROP en mes 2 con 1000 usuarios reales = airdrop genuino + comunidad + listing valid en Jupiter**.

---

## 10. Script de mint (para cuando llegue el momento)

Ver `scripts/launch-tropicoin.sh` (a crear cuando aplique).

Pseudo-código:
```bash
#!/bin/bash
# launch-tropicoin.sh
# Requisitos: solana CLI, spl-token CLI, wallet de tesorería con SOL para fees

set -e

NETWORK="${NETWORK:-mainnet-beta}"
TREASURY_KEYPAIR="${TREASURY_KEYPAIR:-~/.config/solana/tropico-treasury.json}"

echo "🌴 Lanzando TropiCoin en $NETWORK"

# 1. Setup
solana config set --url $NETWORK
solana config set --keypair $TREASURY_KEYPAIR

# 2. Crear mint
solana-keygen new -o tropicoin-mint.json --no-bip39-passphrase
MINT=$(solana-keygen pubkey tropicoin-mint.json)
echo "Mint address: $MINT"

# 3. Crear el token
spl-token create-token --decimals 6 tropicoin-mint.json

# 4. ATA de tesorería
TREASURY_ATA=$(spl-token create-account $MINT | grep "Creating account" | awk '{print $3}')
echo "Treasury ATA: $TREASURY_ATA"

# 5. Mintear 1B
spl-token mint $MINT 1000000000

# 6. Revocar authorities
spl-token authorize $MINT mint --disable
spl-token authorize $MINT freeze --disable

# 7. Output final
echo ""
echo "✅ TropiCoin minteado!"
echo "   Mint: $MINT"
echo "   Supply: 1,000,000,000 TROP"
echo "   Treasury ATA: $TREASURY_ATA"
echo ""
echo "Próximos pasos:"
echo "   1. Subir metadata a Metaplex (nombre + logo + descripción)"
echo "   2. Crear pool en Raydium con 25k USDC + 50M TROP"
echo "   3. Aplicar a Jupiter Token List (verificación)"
echo "   4. Anunciar"
```

---

**Estado**: Spec lista. Cuando decidas launch, este doc + el script bash + 1h de trabajo CLI = TropiCoin live en mainnet.
