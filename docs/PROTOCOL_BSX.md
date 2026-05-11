# Protocolo BsX — Especificación

> Rail JIT (just-in-time) abierto entre USDC y el sistema de pagos local: respaldado 1:1 en reservas USDC, con atestación pública verificable en Solana. **BsX no es un instrumento de hold** — es un token transitorio que existe durante la ventana del pago.

**Programa**: `programs/tropico_bs/src/lib.rs`
**Program ID configurado**: `EdWuyZDXao86mTcUSpRVzNXaT9Tb5muU6YGubFhADWdN` (declarado en `declare_id!()` y `Anchor.toml`)
**Estado**: implementado y configurado con keypair real. Pendiente de deploy a devnet (toolchain Anchor 0.30.1 lista) + auditoría externa antes de mainnet
**Keypair**: `target/deploy/tropico_bs-keypair.json` (en repo local, no committeado)

---

## Motivación

El bolívar venezolano está en hiperinflación sostenida (7mo año consecutivo). El usuario que quiere protegerse convierte a USDC — pero entonces queda sin un puente nativo con el sistema de pagos venezolano (Pago Móvil, comercios locales).

**BsX resuelve esto sin obligar al usuario a holdear moneda local.** El patrimonio vive en USDC. Cuando el usuario necesita pagar a un comercio en bolívares, BsX se mintea **en el momento exacto del pago** (just-in-time), se libera vía Pago Móvil VE, y cualquier remanente vuelve a USDC inmediatamente. La ventana en la que el usuario está expuesto al bolívar se mide en segundos, no en días.

El default es la **tasa oficial** (compatible con el marco regulatorio local). El usuario puede activar tasas alternativas como configuración opt-in en su perfil — la decisión es del usuario, no del protocolo, y queda dentro de su esfera privada.

La diferencia con una app custodial: las reservas USDC viven en un vault PDA cuya authority es el propio programa — nadie puede tocarlas sin ejecutar `burn_bsx`. La atestación (`attest_reserves`) es pública, gratuita (solo gas), y escribe un snapshot verificable on-chain. Cualquier usuario, auditor, o herramienta puede confirmar que el collateral existe en cualquier momento.

**El protocolo es multi-moneda**: el mismo primitivo escala a ARS, COP, CUP, PEN. Venezuela es el primer mercado, no el único. BsX es la pieza de infraestructura abierta para conectar USDC con cualquier sistema de pagos local LatAm.

---

## Roles

| Rol | Descripción |
|---|---|
| **admin** | Cuenta que inicializó el protocolo. Puede pausar/reactivar y (por defecto) actualizar el peg. |
| **oracle_authority** | Cuenta autorizada para llamar `update_peg`. Por defecto es el admin; se puede delegar a un oráculo externo o a un programa multi-sig en producción. |
| **user** | Cualquier cuenta que llame `mint_bsx` o `burn_bsx`. No requiere permiso especial. |
| **attester** | Cualquier cuenta que llame `attest_reserves`. Sin restricción — solo paga gas. |

---

## Estado del protocolo — cuentas PDA

### `ProtocolConfig`

**Seeds**: `["config"]`

| Campo | Tipo | Descripción |
|---|---|---|
| `admin` | `Pubkey` | administrador del protocolo |
| `usdc_mint` | `Pubkey` | mint de USDC usada como colateral |
| `bsx_mint` | `Pubkey` | mint de BsX (authority = este PDA) |
| `treasury_vault` | `Pubkey` | ATA del programa que custodia USDC (authority = este PDA) |
| `oracle_authority` | `Pubkey` | única cuenta que puede llamar `update_peg` |
| `paused` | `bool` | si `true`, mint y burn están deshabilitados |
| `peg_rate` | `u64` | Bs por 1 USD, escalado por `1_000_000` |
| `last_peg_update_ts` | `i64` | unix timestamp de la última actualización del peg |
| `bump` | `u8` | bump seed del PDA |

**Nota sobre `peg_rate`**: si 1 USD = 36.50 Bs, entonces `peg_rate = 36_500_000`. El escalado de 6 decimales permite precisión sub-céntimo sin punto flotante.

### `ReservesAttestation`

**Seeds**: `["attestation"]`

| Campo | Tipo | Descripción |
|---|---|---|
| `total_usdc_reserves` | `u64` | balance USDC del `treasury_vault` en el momento de la atestación |
| `total_bsx_supply` | `u64` | supply total de BsX en el momento de la atestación |
| `attested_at` | `i64` | unix timestamp |
| `attester` | `Pubkey` | quien invocó `attest_reserves` |
| `bump` | `u8` | bump seed del PDA |

---

## Instrucciones

### `initialize(peg_rate: u64)`

**Signers**: `admin`
**Accounts**: `admin`, `usdc_mint`, `bsx_mint` (init PDA), `treasury_vault` (init PDA), `config` (init PDA), `token_program`, `system_program`, `rent`

**Qué hace**:
1. Inicializa el PDA `ProtocolConfig` con los valores provistos.
2. Crea el mint BsX como PDA del programa (`seeds: ["bsx_mint"]`), con `mint_authority = config PDA`.
3. Crea el vault USDC como PDA del programa (`seeds: ["treasury_vault"]`), con `authority = config PDA`.
4. Emite `ProtocolInitialized { admin, bsx_mint, peg_rate }`.

**Restricciones**: `peg_rate > 0`.

---

### `update_peg(new_rate: u64)`

**Signers**: `oracle` (debe coincidir con `config.oracle_authority`)
**Accounts**: `oracle`, `config`

**Qué hace**:
1. Verifica que `oracle.key() == config.oracle_authority`.
2. Actualiza `config.peg_rate = new_rate` y `config.last_peg_update_ts = now`.
3. Emite `PegUpdated { old_rate, new_rate, updated_at }`.

**Restricciones**: `new_rate > 0`.

**Seguridad**: la tasa debe actualizarse con frecuencia o el protocolo queda expuesto a arbitraje. En v1, el oracle es una cuenta controlada por el equipo Tropico que llama `update_peg` cuando la tasa real cambia más de un umbral. En v2, se integra Pyth Network como fuente de datos.

---

### `mint_bsx(usdc_amount: u64)`

**Signers**: `user`
**Accounts**: `user`, `config`, `bsx_mint`, `treasury_vault`, `user_usdc_ata`, `user_bsx_ata`, `token_program`

**Qué hace**:
1. Verifica `!config.paused`.
2. Calcula `bsx_amount = (usdc_amount as u128 * peg_rate as u128 / PEG_SCALE) as u64`.
3. CPI: `SPL Token Transfer(from: user_usdc_ata, to: treasury_vault, amount: usdc_amount)` — firmada por `user`.
4. CPI: `SPL MintTo(mint: bsx_mint, to: user_bsx_ata, amount: bsx_amount)` — firmada por `config PDA`.
5. Emite `BsxMinted { user, usdc_deposited, bsx_minted, peg_rate }`.

**Restricciones**: `!paused`, `usdc_amount > 0`, `bsx_amount > 0`.

---

### `burn_bsx(bsx_amount: u64)`

**Signers**: `user`
**Accounts**: `user`, `config`, `bsx_mint`, `treasury_vault`, `user_bsx_ata`, `user_usdc_ata`, `token_program`

**Qué hace**:
1. Verifica `!config.paused`.
2. Calcula `usdc_amount = (bsx_amount as u128 * PEG_SCALE as u128 / peg_rate as u128) as u64`.
3. Verifica que `treasury_vault.amount >= usdc_amount`.
4. CPI: `SPL Burn(mint: bsx_mint, from: user_bsx_ata, amount: bsx_amount)` — firmada por `user`.
5. CPI: `SPL Transfer(from: treasury_vault, to: user_usdc_ata, amount: usdc_amount)` — firmada por `config PDA`.
6. Emite `BsxBurned { user, bsx_burned, usdc_redeemed, peg_rate }`.

**Restricciones**: `!paused`, `bsx_amount > 0`, reservas suficientes.

---

### `attest_reserves()`

**Signers**: `attester` (cualquiera)
**Accounts**: `attester`, `config`, `bsx_mint`, `treasury_vault`, `attestation` (init_if_needed), `system_program`

**Qué hace**:
1. Lee `treasury_vault.amount` y `bsx_mint.supply` directamente de los PDAs (sin oracle).
2. Escribe en `attestation`: `total_usdc_reserves`, `total_bsx_supply`, `attested_at`, `attester`.
3. Emite `ReservesAttested { total_usdc_reserves, total_bsx_supply, attested_at, attester }`.

**Diseño**: `init_if_needed` permite que la primera atestación cree el PDA. Las siguientes lo sobreescriben. El historial completo vive en los logs de eventos indexados por Helius. La cuenta `attestation` es el snapshot más reciente.

---

### `set_pause(paused: bool)`

**Signers**: `admin` (debe coincidir con `config.admin`)
**Accounts**: `admin`, `config`

**Qué hace**:
1. Verifica `admin.key() == config.admin`.
2. Asigna `config.paused = paused`.
3. Emite `ProtocolPauseToggled { paused, by }`.

---

## Matemática — manejo de decimales

USDC tiene 6 decimales. BsX también tiene 6 decimales (decisión: coherencia con USDC y consistencia en el frontend).

```
CONSTANTE: PEG_SCALE = 1_000_000

Ejemplo: peg_rate = 36_500_000  (36.5 Bs por 1 USD)

Mint:
  usdc_amount = 1_000_000   (1.0 USDC)
  bsx_amount  = 1_000_000 * 36_500_000 / 1_000_000
              = 36_500_000  (36.5 BsX)

Burn:
  bsx_amount  = 36_500_000  (36.5 BsX)
  usdc_amount = 36_500_000 * 1_000_000 / 36_500_000
              = 1_000_000   (1.0 USDC)
```

El cálculo usa `u128` para el producto intermedio, evitando overflow. El casteo final a `u64` es seguro dado que USDC total supply cabe en `u64` con 6 decimales.

**Truncamiento**: la división entera trunca hacia abajo. El usuario siempre recibe `floor(bsx)` en mint y `floor(usdc)` en burn. La diferencia de céntimos queda en el vault como buffer de reservas, lo que mejora el ratio de cobertura.

---

## Diseño del oráculo

### v1 — Oracle authority simple (estado actual)

`oracle_authority` es el admin (equipo Tropico). Llama `update_peg` cuando la tasa real cambia más de un umbral configurable (ej. 0.5%). La frecuencia mínima recomendada: cada hora durante el horario bancario venezolano (8am-5pm VE); pausar el protocolo si no se puede garantizar actualización.

**Riesgo v1**: si `oracle_authority` es comprometida o inactiva, la tasa queda desactualizada. Usuarios que mintean con tasa stale quedan expuestos a arbitraje.

**Mitigación v1**: campo `last_peg_update_ts`. El frontend puede advertir al usuario si la última actualización supera X horas.

### v2 — Pyth Network + multi-source (roadmap Q3)

En v2, `oracle_authority` apuntará a un programa proxy que:
1. Lee el precio USD/VES de Pyth Network (feed `Crypto.BsX/USD` o equivalente).
2. Opcionalmente agrega con otras fuentes (ve.dolarapi.com vía relayer).
3. Solo acepta actualizaciones si la nueva tasa difiere de la actual en más de un umbral (evita spam).

---

## Supuestos de confianza y cómo se reducen con el tiempo

| Supuesto | Hoy (v1) | Después (v2+) |
|---|---|---|
| El peg refleja la tasa real | Oracle manualcontrolado por el equipo | Pyth Network + multi-source descentralizado |
| Las reservas son 1:1 | Matemáticamente garantizado on-chain | Igual — es invariante del programa |
| Nadie puede mint sin USDC | Garantizado: CPI transfiere USDC antes de mint | Igual |
| El admin no pausa maliciosamente | Confianza en el equipo | Multi-sig Squads (2/3) como `admin` |
| El programa no tiene bugs | Revisión interna del equipo | Auditoría externa antes de mainnet |

---

## Scope de auditoría y modelo de amenazas

### Funciones de alto riesgo

- `mint_bsx`: custodia USDC real. Vector: ¿puede el usuario obtener BsX sin depositar USDC? Mitigación: el CPI de Transfer es antes del MintTo; si falla el transfer, falla toda la instrucción (atomicidad Solana).
- `burn_bsx`: libera USDC del vault. Vector: ¿puede un usuario quemar BsX que no posee? Mitigación: SPL Burn verifica ownership; si el ATA no tiene suficiente balance, falla.
- `update_peg`: si el oracle es comprometido, puede manipular la tasa. Mitigación: multi-sig para oracle authority en producción.

### Funciones de bajo riesgo

- `attest_reserves`: solo lectura + escritura en PDA propio. Sin transferencias.
- `set_pause`: solo cambia un bool. Sin transferencias.
- `initialize`: se llama una vez por deploy.

### Invariantes a verificar en auditoría

1. `treasury_vault.amount >= ceil(bsx_mint.supply * PEG_SCALE / peg_rate)` — las reservas siempre cubren al menos el 100% del supply circulante al peg actual.
2. La mint authority de `bsx_mint` es exclusivamente el PDA `config`. Ninguna clave privada externa puede mintear BsX.
3. La authority del `treasury_vault` es exclusivamente el PDA `config`. Solo `burn_bsx` puede transferir USDC fuera del vault.
