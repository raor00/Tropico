# Trópico × Crixto — Tokenización de Inmuebles en Solana (POC para pitch)

> 📌 **¿Buscás el estado actual / cómo correr el demo?** Ver [`REALESTATE_DEMO_GUIA.md`](./REALESTATE_DEMO_GUIA.md) — direcciones devnet reales, env vars de Vercel y qué falta. Este archivo es el **plan de diseño** original.

> **Estado:** plan aprobado, listo para ejecución.
> **Branch de trabajo:** `claude/tropico-wallet-mvp-roadmap-JEAda`.
> **Última revisión:** 2026-05-20.
> **Entregable:** demo funcional en **devnet** (todo real on-chain, con inmueble/SPV ficticios) para presentar a Crixto y ganar la alianza/inversión.

---

## Resumen ejecutivo (TL;DR)

El founder se reunió con **Crixto** (una de las **dos** plataformas cripto autorizadas por Sunacrip en Venezuela — corre CRIXTOPAY: pagos, remesas, escrow, cripto-fiat) y plantearon **tokenizar inmuebles venezolanos sobre Solana con gobernanza descentralizada**.

Este documento es la guía de ejecución para construir un **demo en devnet** con un click-path de 8 pasos: un usuario navega un inmueble, hace el **tour 3D** (ya desarrollado por el founder, se embebe vía iframe), **compra acciones fraccionadas** con USDC, ve la **transacción on-chain en Solscan**, su **portafolio**, **vota** una propuesta, **reclama renta** y ve los **fees on-chain** — demostrando dónde gana Crixto (win-win).

- **Programa Anchor nuevo:** `tropico_realestate` (clonado estructuralmente de `tropico_bs`).
- **Token por inmueble:** SPL **fungible, 0 decimales** (1 token = 1 acción indivisible).
- **Fees registrados on-chain** vía `tropico_treasury::record_fee` bajo un nuevo `ModuleType::RealEstate`.
- **Esfuerzo Fase 0:** ~2-3 semanas (1 dev Anchor + 1 dev frontend).

### Decisiones del founder (cerradas)

1. **"Reward assets" = concepto general RWA en Solana**, no un producto propietario de Crixto. Modelo estándar: un token fungible por inmueble que representa propiedad fraccionada Y reparte rendimiento (renta) a los holders.
2. **Legal compartido**: Crixto aporta la capa pesada regulada (SPV/título/KYC/custodia fiat), pero **Trópico también construye su propia capa legal** (entidad de la plataforma, T&C, acuerdo de token-holders, postura de cumplimiento). No se terceriza todo.
3. **Primer entregable = Demo POC en devnet** (todo real on-chain, con inmueble/SPV ficticios).
4. **Tour 3D vía iframe** (URL embebible) en la página de detalle.
5. **Fees (cerrado, ver §3):** venta primaria **1,5% sobre el precio** (lo paga el inversor); split **Crixto mayor 60/40** (Crixto 90 bps / Trópico 60 bps).

---

## Cómo funcionan los "reward assets" / RWA en Solana (marco general)

Modelo estándar de la industria (RealT, Zoniqx, etc., adaptado a Solana):

1. Un **SPV** (vehículo de propósito especial) es el **dueño legal del título** del inmueble. Los inversores **no compran el ladrillo**, compran participaciones del SPV.
2. El SPV **emite tokens** que representan esas participaciones fraccionadas. En Solana: **token SPL fungible** (divisible, balances nativos en cualquier wallet).
3. El token otorga derechos exigibles: **gobernanza** (voto), **reparto de renta/rendimiento** (el "reward"), y **redención**.
4. La renta del alquiler se distribuye on-chain en stablecoin (USDC) **pro-rata** según las acciones de cada holder.
5. La capa legal/custodia/KYC es pesada y regulada — por eso un socio licenciado (Crixto) es clave. **Ese es el win-win**: Crixto = legal/compliance, Trópico = rail técnico + UX.

En nuestro diseño, el "reward asset" = `ShareMint` (fungible, 0 decimales) + el par `deposit_yield` / `claim_reward` indexado por `YieldEpoch`.

---

## 1. Arquitectura y reparto de responsabilidades

```
┌──────────── CRIXTO (off-chain, regulado) ──────────────┐
│ Formación del SPV + custodia del título (1 SPV/inmueble)│
│ Cumplimiento Sunacrip · KYC/AML                         │
│ Sourcing, avalúo y due diligence del inmueble           │
│ Custodia fiat (Bs/USD) · cobro de renta a inquilinos    │
│ Escrow y disputas (CRIXTOPAY ya lo hace hoy)            │
│ Firma atestaciones: hash legal, renta, valuación        │
└───────────────┬─────────────────────────────────────────┘
                │ firma como oracle/attester (Pubkey on-chain)
                ▼
┌──────────── TRÓPICO (on-chain + wallet UX + legal propia)┐
│ Programa Anchor tropico_realestate                       │
│ UX: explorar / tour 3D / comprar / portafolio / votar    │
│ Mint SPL fraccionado por inmueble (autoridad PDA)        │
│ Liquidación USDC de venta primaria + reparto de renta    │
│ Whitelist PDA que gatea quién puede holdear (KYC Crixto) │
│ Auditoría vía tropico_treasury (módulo RealEstate)       │
│ CAPA LEGAL PROPIA: entidad plataforma, T&C, acuerdo de   │
│   token-holders, política de cumplimiento, disclaimers   │
└──────────────────────────────────────────────────────────┘
```

**Capa legal propia de Trópico (entregable paralelo, no-código):** términos de servicio del marketplace, acuerdo de token-holders (qué derechos da la acción, no es asesoría financiera), política KYC/AML de la plataforma, disclaimers de riesgo, y la estructura de la entidad que opera el programa. Se redacta con counsel; en el demo se representa con páginas `app/legal/*` placeholder + el `legal_doc_hash` on-chain.

---

## 2. Diseño on-chain

### 2.1 Nuevo programa `programs/tropico_realestate/`

Clonado estructuralmente de `programs/tropico_bs/src/lib.rs` (config PDA como mint authority + CPI + `emit!` + `set_pause`). Agregar program id nuevo a `Anchor.toml` en `[programs.devnet]` y `[programs.localnet]`.

**PDAs / cuentas:**

- `RegistryConfig` — singleton, seeds `[b"registry"]`: `admin`, `crixto_authority` (attester/oracle, espeja `oracle_authority` de `tropico_bs`), `usdc_mint`, `paused`, `bump`.
- `PropertyConfig` — seeds `[b"property", property_id]`: `property_id`, `share_mint`, `usdc_vault` (ATA del programa), `total_shares`, `price_per_share` (USDC 6dec), `shares_sold`, `legal_doc_hash:[u8;32]`, `valuation_usdc`, `status{Draft,Active,Paused,Closed}`, `crixto_fee_bps` (default 90), `tropico_fee_bps` (default 60; suman 150 = 1,5% venta primaria, sobre el precio), `bump`. El `share_mint` se crea con `mint::authority = property_config` PDA — patrón exacto de `tropico_bs` líneas 339-347.
- `InvestorPosition` — seeds `[b"position", property, investor]`: `shares_owned`, `reward_debt`, `last_claimed_epoch`.
- `YieldEpoch` — seeds `[b"yield", property, epoch]`: `epoch`, `total_usdc_deposited`, `total_shares_snapshot`, `deposited_at`, `crixto_attestation`.
- `Whitelist` (gate KYC) — seeds `[b"kyc", investor]`: `verified`, `verified_by` (=crixto_authority), `expires_at`.
- Gobernanza: `Proposal` — seeds `[b"proposal", property, proposal_id]`: `creator`, `title_hash`, `uri`, `yes_weight`, `no_weight`, `start_ts`, `end_ts`, `executed`, `snapshot_total_shares`. `VoteReceipt` — seeds `[b"vote", proposal, voter]` (anti-doble-voto).

**Instrucciones** (cada una hace `emit!` de evento de auditoría, estilo `tropico_bs`):

| Instrucción | Caller | Efecto |
|---|---|---|
| `initialize_registry(crixto_authority)` | admin | crea `RegistryConfig` |
| `list_property(id, total_shares, price, legal_doc_hash, valuation, fees)` | admin | init `PropertyConfig` + crea `share_mint` (autoridad PDA) + `usdc_vault`; emit `PropertyListed` |
| `set_kyc(investor, verified, expires)` | crixto_authority | upsert `Whitelist` |
| `buy_shares(num_shares)` | investor | requiere KYC; `precio = num_shares×price_per_share`, `fee = precio×150/10_000` (1,5% **sobre el precio**); CPI USDC investor→vault por el **precio** (SPV 100%, como `mint_bsx` L104) + CPI USDC investor→ATA Crixto (90 bps) y →ATA Trópico (60 bps); CPI MintTo de shares con PDA signer (L119-128); upsert position; record_fee(fee total, RealEstate); emit `SharesPurchased` |
| `transfer_shares(amount, to)` | holder | requiere `to` con KYC; CPI transfer; emit `SharesTransferred` (primitiva de mercado secundario) |
| `deposit_yield(epoch, usdc, attestation)` | crixto_authority | transfiere USDC al vault, snapshot total shares, crea `YieldEpoch`; emit `YieldDeposited` |
| `claim_reward(epoch)` | holder | `balance/total_snapshot * epoch_usdc`; transfiere USDC vault→holder (PDA signer, como `burn_bsx` L183-192); emit `RewardClaimed` |
| `create_proposal / vote / execute_proposal` | holders | peso = balance de shares vivo; quorum/mayoría |
| `update_valuation(new, attestation)` | crixto_authority | actualiza valuación; emit `ValuationUpdated` |
| `set_pause(paused)` | admin | espeja `tropico_bs::set_pause` |

### 2.2 Modelo de token — RECOMENDADO: SPL fungible fraccionado (NO NFT)

La propiedad fraccionada desde ~$50-100 necesita unidades divisibles y fungibles. SPL fungible da: matemática pro-rata gratis, balances en la wallet existente (`lib/balances.ts` / `HomeBalances`), transfer vía `send-tx.ts`, y un peso `balance/total_shares` limpio para renta Y gobernanza. NFT-por-acción explota la cantidad de cuentas y rompe la UI de balances. Usar **0 decimales** (1 token = 1 acción indivisible; ej. 1 acción = $50, inmueble = 2.400 acciones = $120k).

### 2.3 Metadata Metaplex

Agregar `@metaplex-foundation/mpl-token-metadata`. Adjuntar Metadata a cada `share_mint`: nombre ("Trópico RE — Residencias Ávila #1"), símbolo ("tAVILA"), `uri` → JSON con imagen, dirección, m², habitaciones, año, **legal_doc_hash**, número de registro del SPV, y **URL del tour 3D**. Fase 0: hostear el JSON estático en `public/properties/<id>.json`. Hace que las acciones se rendericen bien en Solscan/cualquier wallet = óptica fuerte para el pitch.

### 2.4 Dónde vive el reward/renta

`usdc_vault` PDA ATA por inmueble + snapshots `YieldEpoch` + `claim_reward` **pull-based** (el holder reclama). Pull-based evita iterar todos los holders en una tx (límites de cuentas Solana) y demuestra limpio ("tenés $X reclamables"). Crixto deposita renta vía `deposit_yield` con atestación = prueba on-chain de que la renta llegó.

### 2.5 Gobernanza — RECOMENDADO: voting Anchor liviano propio (in-program), NO SPL Governance/Realms

Para un demo que se clickea en minutos y Crixto debe entender al toque, un flujo de 3 instrucciones (`create_proposal`/`vote`/`execute_proposal`) ponderado por balance de shares es mucho más simple de construir, explicar y auditar que levantar Realms + plugins de voter-weight + su propia UI. Reusa el share mint que ya tenemos. En el pitch se dice que Fase 2 puede migrar a **SPL Governance/Realms + multisig Squads** (el repo ya insinúa "Q4 multi-sig via Squads" en `tropico_treasury`).

---

## 3. Modelo de revenue (el win-win de Crixto) — CERRADO

> **Porcentajes cerrados por el founder:**
> - **Fee de venta primaria = 1,5% total**, cobrado **sobre el precio** (lo paga el inversor encima del subtotal; el SPV/vault recibe el 100% del precio).
> - **Split "Crixto mayor" = 60/40** en venta y renta (Crixto carga el costo regulado pesado, toma la porción mayor); secundario 50/50.

Todos los fees se registran on-chain vía `tropico_treasury::record_fee` bajo un NUEVO `ModuleType::RealEstate` (agregar al enum en `programs/tropico_treasury/src/lib.rs`) — transparente, auditable.

| Fee | Tasa total | Sobre | Split (Crixto / Trópico) | bps Crixto / Trópico |
|---|---|---|---|---|
| Listing | ~$250–500 flat | `list_property` | Trópico (cubre mint/metadata) | — / flat |
| **Venta primaria** | **150 bps (1,5%)** | cada `buy_shares`, **sobre el precio** | **60 / 40** | **90 / 60 bps** |
| Transfer secundario | 100 bps (1,0%) | cada `transfer_shares` | 50 / 50 | 50 / 50 bps |
| Gestión de renta | 1000 bps (10% de la renta) | cada `deposit_yield` | 60 / 40 | 600 / 400 bps |

**Lógica del split:** Crixto carga el costo regulado pesado (SPV/KYC/custodia/escrow/cobro de renta), así que toma el 60%; Trópico monetiza el rail técnico + UX con el 40%. Ambos ganan en el evento de capital (venta) Y en el recurrente (renta). El 1,5% es deliberadamente competitivo (por debajo del 2% estándar RWA) para bajar la fricción de entrada del inversor y maximizar volumen de suscripción.

**Mecánica "sobre el precio":** en `buy_shares(num_shares)`, `precio = num_shares × price_per_share`; `fee = precio × 150 / 10_000`; el inversor transfiere `precio + fee` en USDC; el `precio` va al `usdc_vault` (SPV recibe 100%), el `fee` se reparte 90/60 bps a las ATAs USDC de Crixto y Trópico, y se registra vía `record_fee`.

**Ejemplo trabajado (slide del pitch):** apartamento en Caracas de $120.000 = 2.400 acciones @ $50.

- Venta primaria suscrita completa: $120.000 × 1,5% = **$1.800** → Crixto $1.080 / Trópico $720. (El inversor agregado paga $121.800; el SPV recibe $120.000 limpios.)
- Renta anual ~8% bruto = $9.600; fee de renta 10% = **$960/año** → Crixto $576 / Trópico $384 (recurrente).
- Rotación secundaria ~30%/año = $36.000 × 1,0% = **$360/año** → 50/50 (Crixto $180 / Trópico $180).
- Año 1 por inmueble ≈ **$3.120** (Crixto ~$1.836 / Trópico ~$1.284). A 50 inmuebles ≈ **$156k/año** en fees, con la parte recurrente (renta) componiéndose año tras año. El mensaje: *"cada inmueble tokenizado es una anualidad para los dos"*.

---

## 4. Flujos de app y archivos

### CREAR — frontend

- `lib/properties.ts` — `PropertyInfo` + `PROPERTIES` + `PROPERTY_LIST` + `getPropertyById()` (espeja `lib/tokens.ts`). Campos: id, shareMint, name, city, address, images[], **tourUrl**, pricePerShare, totalShares, sharesSold, valuationUsdc, apyEstimate, legalDocHash, bedrooms, m2, vibe, pitchVE.
- `lib/realestate-program.ts` — cliente Anchor/web3: `buildBuySharesTx`, `buildClaimRewardTx`, `buildVoteTx`, `buildTransferSharesTx`, `fetchPropertyConfig`, `fetchInvestorPosition`, `fetchProposals`. Reusa `lib/cluster.ts`, el `Signer` + `signAndBroadcast` de `send-tx.ts`, y helpers ATA SPL.
- `lib/realestate-yield.ts` — matemática de reclamable por epoch + depósito de renta simulado para Fase 0 (estilo `lib/tropico-bs-bridge.ts`).
- `lib/treasury-client.ts` — PRIMER cliente TS de `tropico_treasury`: `buildRecordFeeTx(amount, ModuleType.RealEstate, user)`. Reusable por otros módulos.
- `components/PropertyCard.tsx` — clon de `components/TokenCard.tsx` (imagen, ciudad, $/acción, barra de progreso de shares vendidas, APY est.).
- `components/PropertyBuyForm.tsx` — clon de `components/BsSwapForm.tsx`: input de acciones → panel de quote (subtotal del precio + fee 1,5% **sobre el precio** desglosado Crixto 90 bps / Trópico 60 bps + **total a pagar** = subtotal+fee) → gate KYC/whitelist (reusa bloque de alerta AML) → badge on-chain-vs-demo → modal password → panel de éxito con tx sig + link Solscan.
- `components/TourEmbed.tsx` — wrapper del tour 3D externo. `<iframe src={tourUrl}>` responsivo (formato confirmado por el founder). Punto único de integración = campo `tourUrl`.
- `components/ProposalCard.tsx` + `components/VotePanel.tsx`, `components/RewardClaimCard.tsx`.
- `app/inmuebles/page.tsx` — grid de catálogo (clon de `app/descubrir/page.tsx`, mapea `PROPERTY_LIST` → `PropertyCard`).
- `app/inmuebles/[id]/page.tsx` — `Suspense` + `params: Promise<{id}>` (clon de `app/claim/[id]/page.tsx`).
- `app/inmuebles/[id]/PropertyView.tsx` — detalle client: `TourEmbed` + características + `PropertyBuyForm` + panel "Ruta on-chain" (program id, share mint, vault, última tx — la narrativa "blindado en Trópico").
- `app/inmuebles/[id]/gobernanza/page.tsx` — propuestas + `VotePanel` (o tab dentro de `PropertyView`).
- `app/mis-inmuebles/page.tsx` — portafolio: acciones por inmueble (lee ATAs del investor estilo `lib/balances.ts`), rewards reclamables, valor a valuación actual.

### EXTENDER

- `lib/i18n/dictionary.ts` — agregar keys `inmuebles.*`, `governance.*`, `reward.*`, `kyc.*` (es/en/pt/fr).
- `components/BottomNav.tsx` y/o el grid de `ModuleCard` del home — agregar "Inmuebles" → `/inmuebles`.
- `.env.example` — `NEXT_PUBLIC_REALESTATE_PROGRAM_ID`, `NEXT_PUBLIC_TREASURY_PROGRAM_ID`, `NEXT_PUBLIC_CRIXTO_FEE_ATA_USDC`, `NEXT_PUBLIC_TROPICO_FEE_ATA_USDC`.
- `Anchor.toml` — agregar id `tropico_realestate` en `[programs.devnet]` y `[programs.localnet]`.
- `package.json` — `@metaplex-foundation/mpl-token-metadata` (+ umi) y `@coral-xyz/anchor`.
- `programs/tropico_treasury/src/lib.rs` — agregar `RealEstate` (opc. `RealEstateYield`, `RealEstateSecondary`) al `ModuleType`.
- `app/legal/*` — páginas placeholder de T&C / acuerdo token-holders / política KYC (capa legal propia de Trópico).

### CREAR — programas/tests

- `programs/tropico_realestate/src/lib.rs` (+ `Cargo.toml`).
- `tests/tropico_realestate.ts` (clon de `tests/tropico_bs.ts`).
- `scripts/seed-properties.mjs` — setup devnet: crear share mints, listar 2-3 inmuebles, mintear USDC demo, KYC de la wallet demo (clon de `scripts/create-tropi-token.mjs`).

---

## 5. Demo script para el pitch a Crixto (devnet) — el "money shot"

Pre-seed off-camera: deploy de `tropico_realestate` a devnet, correr `scripts/seed-properties.mjs` (listar "Residencias Ávila" 2.400 acciones @ $50, KYC wallet demo, fondear USDC + SOL devnet).

1. `/inmuebles` → grid de inmuebles venezolanos (cards con barras de progreso). *"Explorá como Airbnb, comprá como acciones."*
2. Tap inmueble → `/inmuebles/[id]` → carga el **tour 3D** en `TourEmbed`; mostrar m², dirección, ~8% APY, y el panel "Ruta on-chain" (program id + share mint en Solscan).
3. `PropertyBuyForm`: comprar **4 acciones = $200**. El quote muestra subtotal $200 + fee 1,5% = **$3,00** desglosado visible Crixto $1,80 (90 bps) / Trópico $1,20 (60 bps); **total a pagar $203,00**. El SPV recibe los $200 limpios. Confirmar → la wallet firma.
4. Éxito → tap a la tx sig → **Solscan (devnet)** muestra transfer USDC→vault, MintTo de shares a tu ATA, y el evento `record_fee`. *"Todo auditable, blindado."*
5. `/mis-inmuebles` → tus 4 acciones, valor trackeado, % de propiedad.
6. Admin (Crixto) corre `deposit_yield` (o botón de renta simulada) → `RewardClaimCard` muestra USDC reclamable → **Reclamar** → USDC llega → prueba en Solscan.
7. `/inmuebles/[id]/gobernanza` → propuesta abierta ("¿Aprobar reparación de techo $5k?") → **Votar SÍ**; peso = balance de shares; tally en vivo; resultado de `execute_proposal`.
8. Cerrar en los datos de `tropico_treasury`: total de fees RealEstate on-chain → *"este número es revenue compartido, y es público."*

**Simplificaciones de Fase 0 a declarar explícitamente:** KYC = toggle admin (`set_kyc`); renta = call admin atestado manual; metadata URI = JSON estático; tour 3D = URL embebible del founder.

---

## 6. "¿Qué más entra en la tokenización?" — más allá de lo básico

**En el demo (Fase 0):** hash de doc legal on-chain (`legal_doc_hash`); gate KYC/whitelist (`Whitelist` PDA, toggle admin); contabilidad de renta/dividendo (`YieldEpoch` + `claim_reward` pull); gobernanza ponderada por shares; transparencia de fees vía treasury.

**Fase 1 (piloto):** KYC real firmado por Crixto vía `set_kyc`; opcional migrar el gate de transferencia a **Token-2022 transfer hooks** (flag: costo de compatibilidad wallet/ATA); oracle/atestación de renta (Crixto como signing oracle, espeja `oracle_authority`/`update_peg` de `tropico_bs`); `update_valuation` para mark-to-market; rol delegado de property manager; escrow/disputa cableado a CRIXTOPAY.

**Fase 2 (producción):** mercado secundario/liquidez (orderbook o AMM — hoy `transfer_shares` es solo P2P); redención/recompra (el patrón de redención de `burn_bsx` es el template); atestación de seguro; reporte fiscal compatible Sunacrip; caps de holders/flags de acreditado; gobernanza Realms + Squads.

---

## 7. Fases y esfuerzo aproximado

- **Fase 0 — POC del pitch (devnet):** programa con `list_property` + `buy_shares` + `deposit_yield` + `claim_reward` + voting propio; fee `RealEstate` en treasury; `/inmuebles` catálogo, detalle+embed 3D, buy form, portafolio, tab gobernanza; seed script; 2-3 inmuebles demo; páginas legales placeholder. **~2-3 semanas** (1 Anchor + 1 frontend). Mínimo para convencer.
- **Fase 1 — piloto (1 inmueble real + SPV Crixto + capa legal real):** KYC real firmado, oracle de renta atestado, valuación, metadata Metaplex en Arweave, revisión legal (Crixto + counsel propio de Trópico), deploy del programa a mainnet, escrow CRIXTOPAY. **~4-6 semanas** + dependencia legal/Crixto.
- **Fase 2 — multi-inmueble + secundario + gobernanza producción:** AMM/orderbook, redención/recompra, Realms+Squads, Token-2022 hooks, fiscal/compliance, auditorías. **~2-3 meses.**

---

## 8. Preguntas abiertas para validar con Crixto

1. **¿Quién forma/posee el SPV** y el `share_mint` queda legalmente atado al equity del SPV? (Asumido Crixto.)
2. **¿Quién hace KYC y cómo firma on-chain?** (Pubkey de Crixto como authority, asumido.)
3. **¿Cómo entra físicamente la renta** — Crixto cobra fiat y deposita USDC vía `deposit_yield`? Cadencia/FX.
4. ~~**Incidencia del fee**~~ **RESUELTO por el founder:** fee de venta = **1,5% sobre el precio, lo paga el inversor encima del subtotal**; el SPV recibe el 100% del precio. Split **60/40 (Crixto 90 bps / Trópico 60 bps)**. Solo queda confirmar con Crixto que aceptan el split 60/40 a su favor.
5. **¿Fungible vs NFT** es aceptable para el regulador/Crixto como representación de propiedad fraccionada?
6. **Decimales / cantidad de acciones / ticket mínimo** — confirmar 0 decimales, mínimo ~$50-100.
7. **Cómo se reparte la responsabilidad legal concreta** entre la entidad de Crixto y la capa legal propia de Trópico (T&C, acuerdo token-holders).
8. **Timing mainnet & USDC** para compras de producción (devnet solo para el pitch).

---

## 9. Verificación (devnet end-to-end)

- **`anchor test` `tests/tropico_realestate.ts`:** initialize_registry; list_property (assert autoridad del share-mint = PDA); set_kyc; buy_shares (USDC al vault, shares minteados, evento de fee); deposit_yield + claim_reward (assert matemática pro-rata USDC); create_proposal/vote/execute (peso = balance, doble-voto rechazado vía `VoteReceipt`); pause bloquea compras. Clonar el harness de `tests/tropico_bs.ts`.
- **Treasury:** assert `record_fee` emite `FeeRecorded` con `ModuleType::RealEstate` y el total incrementa.
- **Click-path:** correr `scripts/seed-properties.mjs` en devnet, ejecutar §5 con `NEXT_PUBLIC_SOLANA_CLUSTER=devnet`.
- **Solscan (devnet)** por tx en `solscan.io/tx/<sig>?cluster=devnet`: transfer USDC, MintTo de shares, record de fee; confirmar que el share mint muestra metadata Metaplex; el vault sube en compra + depósito de renta, baja en claim.
- **UI de balances:** verificar que `/mis-inmuebles` lee el ATA de shares del investor (reusa `lib/balances.ts`) y que el reclamable coincide con la matemática del programa.

---

## 10. Checklist de ejecución (para correr en otra máquina)

> Prerrequisitos: Rust + `anchor 0.30.1` (ver `Anchor.toml [toolchain]`), Solana CLI configurado a devnet, Node + Yarn, una wallet devnet con SOL (`solana airdrop`).

**On-chain**
- [ ] `programs/tropico_realestate/Cargo.toml` + `src/lib.rs` (clonar estructura de `tropico_bs`).
- [ ] Extender `ModuleType` en `programs/tropico_treasury/src/lib.rs` con `RealEstate`.
- [ ] Agregar program id de `tropico_realestate` en `Anchor.toml` (`[programs.devnet]` y `[programs.localnet]`).
- [ ] `anchor build` → copiar el program id generado a `declare_id!` y `Anchor.toml`.
- [ ] `tests/tropico_realestate.ts` (clon de `tests/tropico_bs.ts`) → `anchor test`.
- [ ] `anchor deploy --provider.cluster devnet`.

**Frontend**
- [ ] `package.json`: agregar `@metaplex-foundation/mpl-token-metadata` (+ umi) y `@coral-xyz/anchor`; `yarn install`.
- [ ] `lib/properties.ts`, `lib/realestate-program.ts`, `lib/realestate-yield.ts`, `lib/treasury-client.ts`.
- [ ] Componentes: `PropertyCard`, `PropertyBuyForm`, `TourEmbed`, `ProposalCard`, `VotePanel`, `RewardClaimCard`.
- [ ] Rutas: `app/inmuebles/`, `app/inmuebles/[id]/`, `app/inmuebles/[id]/gobernanza/`, `app/mis-inmuebles/`, `app/legal/*`.
- [ ] Extender `lib/i18n/dictionary.ts`, `components/BottomNav.tsx` / home grid, `.env.example`.
- [ ] `public/properties/<id>.json` (metadata estática) + imágenes en `public/`.

**Seed + demo**
- [ ] `scripts/seed-properties.mjs` → correr contra devnet (listar 2-3 inmuebles, KYC wallet demo, fondear USDC/SOL).
- [ ] Setear envs en `.env.local` (`NEXT_PUBLIC_SOLANA_CLUSTER=devnet`, program ids, fee ATAs).
- [ ] `yarn dev` → ejecutar el click-path de §5 de punta a punta.

---

## Archivos críticos (templates a reusar)

- `programs/tropico_bs/src/lib.rs` — template: autoridad mint PDA, CPI mint/transfer, eventos, pause.
- `programs/tropico_treasury/src/lib.rs` — extender `ModuleType` con `RealEstate`; ledger de auditoría de fees.
- `lib/send-tx.ts` — plumbing SPL/ATA + abstracción `Signer` a reusar para buy/transfer.
- `components/BsSwapForm.tsx` — UX canónica de compra/confirmación a clonar para `PropertyBuyForm`.
- `lib/tokens.ts` + `app/claim/[id]/page.tsx` — templates de catálogo y ruta-detalle dinámica.
- `lib/balances.ts` / `components/HomeBalances.tsx` — lectura de ATAs para el portafolio.
- `tests/tropico_bs.ts` — harness de tests a clonar.
- `scripts/create-tropi-token.mjs` — template del seed script.
