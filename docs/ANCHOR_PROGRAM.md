# Tropico Treasury — Anchor Program Custom

> Programa Anchor minimalista que registra cada fee de Tropico on-chain con
> auditabilidad total. **Diferencial técnico** del proyecto: transparencia radical
> verificable on-chain en lugar de "trust me bro" off-chain.

---

## ¿Qué hace este program?

Un solo PDA global `["treasury"]` mantiene un counter de:
- `total_fees_lamports` — cuánto ha cobrado Tropico en total
- `total_tx_count` — cuántas tx registradas

Cada vez que Tropico cobra un fee (swap 0.5%, pay 1%, yield perf 2%, etc.), llama
`record_fee(amount, module, user)` y emit un event:

```rust
emit!(FeeRecorded {
    user, module, amount_lamports, new_total, tx_count, timestamp
});
```

El dashboard `/transparency` (Q3 2026) lee este state vía `getAccountInfo` + indexea
los events vía Helius webhook. Resultado: cualquiera ve LIVE cuánto ha cobrado
Tropico, en qué módulo, de qué wallet — todo verificable en Solscan.

---

## Por qué este diseño (no más complejo)

Tropico es **non-custodial estricto** — el program **NO custodia tokens** del usuario.
Solo registra metadata pública. Las llaves del usuario nunca tocan este program.
Las txs reales (transfer USDC) las firma directamente el wallet del usuario contra
el SPL Token Program estándar.

Este program existe SOLO para transparencia radical — diferencial vs custodios
que no muestran ingresos reales.

**~150 LOC Rust. Auditable en 1 hora. Cero superficie de ataque (no maneja fondos).**

---

## Estructura

```
programs/
└── tropico_treasury/
    ├── Cargo.toml         # anchor-lang 0.30.1
    └── src/
        └── lib.rs         # Programa entero (~150 LOC)

Anchor.toml                # config Anchor (cluster devnet/mainnet)
```

### State

```rust
#[account]
pub struct TreasuryState {
    pub authority: Pubkey,         // cofounder (Q4 multi-sig Squads)
    pub total_fees_lamports: u64,  // counter total
    pub total_tx_count: u64,       // # tx registradas
    pub bump: u8,
}
```

### Instrucciones

| Instruction | Quién llama | Qué hace |
|---|---|---|
| `initialize()` | Authority (1 vez) | Crea PDA `["treasury"]` |
| `record_fee(amount, module, user)` | Tropico server (post-tx confirm) | Incrementa counters + emit event |
| `read_stats()` | Cualquiera (read) | Devuelve snapshot del state |

### Module enum (8 variantes)

```
Swap · Pay · Yield · Cashback · Remesas · Servicios · P2pBs · TropicoPay
```

Cada módulo del producto Tropico tiene su tag, indexable después.

---

## Deploy paso a paso

### Pre-requisitos (~30 min primer setup)

```bash
# 1. Instalar Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 2. Instalar Solana CLI
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# 3. Instalar Anchor (toma ~10 min compilando)
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --tag v0.30.1

# 4. Configurar Solana CLI a devnet
solana config set --url devnet
solana-keygen new -o ~/.config/solana/tropico-deployer.json
solana config set --keypair ~/.config/solana/tropico-deployer.json

# 5. Pedir SOL devnet (necesitas ~5 SOL para deploy)
solana airdrop 2  # repite hasta tener 5 SOL
# o https://faucet.solana.com (1 SOL por request)
```

### Deploy

```bash
cd ~/Documents/GitHub/Hackathon

# 1. Generar keypair del program
solana-keygen new -o target/deploy/tropico_treasury-keypair.json --no-bip39-passphrase
# Anota el program ID que sale (ej: 7xK...abc)

# 2. Update lib.rs línea 14 con el nuevo program ID
# declare_id!("EL_NUEVO_PROGRAM_ID");

# 3. Update Anchor.toml [programs.devnet] con el mismo
# tropico_treasury = "EL_NUEVO_PROGRAM_ID"

# 4. Build
anchor build

# 5. Deploy a devnet
anchor deploy --provider.cluster devnet
# → "Deploy success. Program Id: 7xK..."

# 6. Inicializar el state global (1 sola vez)
# Crear test simple en tests/initialize.ts o usar anchor cli interactive

# 7. Verificar en Solscan
# https://solscan.io/account/<PROGRAM_ID>?cluster=devnet
```

### Después del deploy

Pega el Program ID en:
1. Form del hackathon (Smart Contract / Program Address)
2. README.md sección "On-chain footprint"
3. `app/api/treasury/route.ts` (Q3 — endpoint que llama record_fee post-tx)

---

## Migration path: opción A → opción C

```
HOY    → Opción A: TROPI test mint via web tool (5 min, address verificable)
Q3     → Deploy tropico_treasury a devnet (este program), wire post-tx hooks
Q3     → /transparency dashboard lee state + events
Q4     → Migrar a multi-sig Squads (authority = Squads PDA)
Q4     → Deploy a mainnet con audit
```

---

## Por qué este program NO compromete el principio "no Anchor custom"

Re-leer `docs/BLOCKCHAIN_BACKEND.md` — el principio dice "no Anchor para
**custodia o lógica de fondos del usuario**". Este program:

- ❌ NO custodia tokens del usuario
- ❌ NO firma tx en su nombre
- ❌ NO mueve fondos
- ✅ SÍ registra metadata pública post-hoc
- ✅ SÍ provee transparencia radical verificable

Es una capa de **observabilidad on-chain**, no de custodia. El principio se mantiene.

---

## Alternativas evaluadas (descartadas)

| Diseño | Pro | Con | Veredicto |
|---|---|---|---|
| **Treasury vault con escrow** | Custodia fees on-chain | Complejidad audit | ❌ rompe "non-custodial" |
| **AMM custom para Bs↔USDC** | Sexy, ROI alto | Audit > $50k, riesgo | ❌ usar pool off-chain MVP, mainnet Q4 |
| **TropiCoin Token-2022 con transfer hooks** | Loyalty token enforced | Token-2022 menos compatible | ⏸ Q4 con design sólido |
| **Cashback distributor con merkle proofs** | Eficiente para grandes pools | Overkill para MVP | ⏸ Q3 cuando volumen lo justifique |
| **Tropico Treasury (este)** | Simple, útil, auditable | Solo metadata | ✅ Ship now |

---

## Referencias

- Anchor docs: https://www.anchor-lang.com
- Solana program model: https://solana.com/docs/programs
- Squads (multi-sig): https://squads.so
- Próximo program (Q3): treasury splitter on-chain con merkle distribution
