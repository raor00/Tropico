# Tokenización de Inmuebles — Guía del Demo (estado actual)

> **Para qué sirve este documento:** entender y poder explicar, sin leer código, qué se construyó, dónde vive cada cosa, cómo corre, y qué falta. Refleja lo que está **deployado en devnet hoy**.
>
> **Última actualización:** 2026-05-20
> **Red:** Solana **devnet** (todo de prueba, sin fondos reales)
> **Diseño/plan completo:** ver [`REALESTATE_TOKENIZATION.md`](./REALESTATE_TOKENIZATION.md). Este archivo es el "qué quedó funcionando".

---

## 1. Qué es en una frase

Un marketplace donde un usuario venezolano compra **acciones fraccionadas** de un inmueble (desde $2) usando USDC, recibe **tokens** que representan su propiedad, cobra **renta** y **vota** decisiones — todo registrado on-chain en Solana, auditable en Solscan. Trópico pone el rail técnico + UX; Crixto pondría la capa legal/regulada (SPV, KYC, custodia).

---

## 2. Estado actual (qué funciona ya)

| Pieza | Estado |
|---|---|
| Programa Anchor `tropico_realestate` | ✅ deployado en devnet |
| Registry inicializado | ✅ |
| 3 inmuebles listados | ✅ a 5 / 3 / 2 USDC por acción |
| KYC de wallets demo | ✅ seed wallet + wallet de la app (96Bj) |
| Catálogo, detalle, portafolio (web) | ✅ rinden (HTTP 200) |
| Lectura de saldos optimizada | ✅ de 10 llamadas RPC a 2 |
| Compra real on-chain (mintea token) | ✅ firma con Privy/wallet local; antes caía a modo demo |
| Modal de confirmación de compra | ✅ muestra subtotal/fee/total/red + aviso de irreversibilidad |
| Portafolio on-chain (`/mis-inmuebles`) | ✅ lee saldos reales con `fetchShareBalance` (antes era data hardcodeada) |
| Transferencia de acciones (mercado secundario) | ✅ `ShareTransferCard` → `buildTransferShareTx` |
| Reclamar renta / votar | ⏳ falta probar en navegador (requiere firmar con la wallet) |

---

## 3. Direcciones devnet (la "libreta de contactos" del demo)

### Programa y mint
| Qué | Dirección |
|---|---|
| **Program ID** `tropico_realestate` | `3V49YdnmbsHPoguFWhDhyAJhbUASq9s9LAXjxSfBPoWK` |
| **USDC devnet** (mint del registry) | `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU` |

### Wallets
| Rol | Dirección | Notas |
|---|---|---|
| **Admin / Crixto / autoridad de deploy** | `3uFYUqXtjHpQCxpoQxSYuJ1dgtkPDT2uH1wmK87iAgUQ` | archivo: `~/.config/solana/tropico-devnet.json`. Lista inmuebles, firma KYC, deposita renta. |
| **Inversor (wallet de la app)** | `96BjLBarLCAqZMU1FBun6VbtrCUkKoGg2xq5N8xSDY8i` | la que usás con Trópico. KYC ✅. Tiene ~19 USDC. |
| **Fee collector (demo)** | ATA USDC `rzE5XcurQWJGTb63e37dFWqqfhZ6gc82GEk1fFu1k3f` | en demo los fees vuelven a la propia wallet 96Bj. |

### Inmuebles listados (ids `-v2`, precios bajos para probar)
| Inmueble | id | $/acción | Acciones | Property PDA | Share Mint | USDC Vault |
|---|---|---|---|---|---|---|
| Residencias Ávila #1 | `residencias-avila-v2` | 5 | 2400 | `H36d56hp2LZ3NazM2CVBkbdAUP3WshD2QRGHHa1Hqrs8` | `9xtEkqZ4Pzp6LyHzUP3caK1frqUxFg62XqiGSwJ3DQdq` | `55naeWAomEota85xT1i3kscT5LNvHMmHGTWzPmPbkhRi` |
| La Candelaria #2 | `la-candelaria-v2` | 3 | 1500 | `DRDRmJCSRLWAjnbvzU5cVSnvQYEBx57xz9P3SDZoXKpd` | `GUU9fbx5aBCFFKKQGQLzmYjR3FVTGh6MhY6WMeEeaZ6J` | `Df6roXcZTikY3Z12VGWqwm9eqpk63JY41xTbrcsUq8G4` |
| Lago Towers Maracaibo #3 | `maracaibo-lago-v2` | 2 | 3200 | `HTrdxqRCejY5XBxQC1o4QVWmKuccWLHiGGeU1pBPqZHY` | `Hny8VvAiWv9j1tzpFuKtTJWjLzVuPa7xbuYye3Y7UFvU` | `FG2ZwqCXqdJPKTFYnAQvRZokt6yLvT17yyiu2teWB8Wn` |

> Ver cualquiera en Solscan: `https://solscan.io/account/<DIRECCIÓN>?cluster=devnet`

---

## 4. Mapa de archivos (qué hace cada uno)

### On-chain (el contrato)
- **`programs/tropico_realestate/src/lib.rs`** — el programa. Define las cuentas (PDAs) y las instrucciones. Es la fuente de verdad: las reglas (precio, fees, KYC, votos) viven acá.
- **`Anchor.toml`** — registra el program ID por red.

### Cliente (puente app ↔ contrato)
- **`lib/realestate-program.ts`** — arma las transacciones que el navegador firma (`buildBuySharesTx`, `buildTransferShareTx`, etc.), lee saldos (`fetchShareBalance`) y deriva las direcciones PDA. Lee el program ID de la env `NEXT_PUBLIC_REALESTATE_PROGRAM_ID`.
- **`lib/properties.ts`** — catálogo estático de los inmuebles (nombre, fotos, precio mostrado, ids). Lo que se ve en las cards.
- **`lib/balances.ts`** — lee saldos on-chain (SOL + tokens). Optimizado a 2 llamadas RPC.
- **`lib/cluster.ts`** — qué red/RPC usar (devnet + Helius).

### UI (lo que ve el usuario)
- **`app/inmuebles/page.tsx`** — catálogo (grid de inmuebles).
- **`app/inmuebles/[id]/PropertyView.tsx`** — detalle: tour 3D (`model-viewer` con `.glb`, no iframe) + características + formulario de compra.
- **`components/PropertyBuyFormPrivy.tsx`** — wrapper: si Privy está activo inyecta el signer real (`walletClientType === "privy"`); si no, renderiza el form pelado. **Sin esto la compra caía a modo demo** (firma falsa, no minteaba token).
- **`components/PropertyBuyForm.tsx`** — formulario de compra: calcula precio + fee, abre el modal de confirmación (`requestBuy`) y al confirmar arma y firma la tx (`execute`).
- **`components/ShareTransferCard.tsx`** — transferir acciones a otra wallet con KYC. Resuelve el signer (Privy o wallet local con password), arma la tx con `buildTransferShareTx`, firma y envía. Incluye modal de confirmación + link a Solscan.
- **`app/inmuebles/[id]/gobernanza/`** — propuestas y votación.
- **`app/mis-inmuebles/page.tsx`** — shell server; delega en `MisInmueblesEntry`.
- **`components/MisInmueblesPrivy.tsx`** / **`components/MisInmueblesView.tsx`** — portafolio del inversor leído **on-chain**: recorre `PROPERTY_LIST`, llama `fetchShareBalance(id, investor)` y muestra solo las posiciones con saldo > 0.
- **`components/BottomNav.tsx`** — pestaña "Inmuebles".

### Setup / scripts
- **`scripts/seed-properties.mjs`** — prepara el demo en devnet: inicializa el registry, lista los 3 inmuebles y hace KYC de las wallets. Se corre una vez tras deployar.

---

## 5. Instrucciones del programa (qué puede hacer)

| Instrucción | Quién la llama | Qué hace |
|---|---|---|
| `initialize_registry` | admin | crea la config global (admin, autoridad Crixto, mint USDC) |
| `list_property` | admin | publica un inmueble: crea su token (share mint) + bóveda USDC |
| `set_kyc` | Crixto | habilita a una wallet a comprar (lista blanca) |
| `buy_shares` | inversor | paga USDC → recibe tokens de acciones; reparte fees |
| `transfer_shares` | holder | transfiere acciones a otra wallet con KYC (mercado secundario básico) |
| `deposit_yield` | Crixto | deposita la renta del periodo en la bóveda |
| `claim_reward` | holder | reclama su parte de renta (pro-rata a sus acciones) |
| `create_proposal` / `vote` / `execute_proposal` | holders | gobernanza ponderada por acciones |
| `update_valuation` | Crixto | actualiza la valuación del inmueble |
| `set_pause` | admin | pausa de emergencia |

**Fees venta primaria:** 1,5% sobre el precio (90 bps Crixto / 60 bps Trópico). El inversor paga `precio + fee`; la bóveda (SPV) recibe el 100% del precio.

---

## 6. Flujo end-to-end (la ruta completa)

```
Navegador  /inmuebles
   └─ lib/properties.ts        catálogo (nombre, fotos, ids)
   └─ lib/realestate-program.ts deriva PDAs con el program ID
   └─ Helius RPC               lee estado on-chain (precio, acciones vendidas)

Click inmueble → /inmuebles/[id]
   └─ Login con Privy (email/OTP) → wallet 96Bj

Comprar (PropertyBuyForm)
   └─ buildBuySharesTx(id, inversor, nº acciones, feeATAs)
   └─ Privy firma la tx
   └─ RPC envía → el programa 3V49Ydnm valida:
        registry no pausado · KYC ok · inmueble activo · hay acciones
   └─ mueve USDC: precio→bóveda, 90 bps→Crixto, 60 bps→Trópico
   └─ mintea tokens de acciones al inversor

Portafolio  /mis-inmuebles   lee los tokens del inversor vía RPC
Renta       /claim/[id]      claim_reward tras deposit_yield del admin
Gobernanza  /inmuebles/[id]/gobernanza   create_proposal / vote / execute
```

---

## 7. Cómo correr en local

```bash
npm install
# .env.local debe tener las vars de la sección 8
npm run dev          # arranca en http://localhost:3000 (o 3001 si está ocupado)
# abrir /inmuebles
```

Re-seed (solo si redeployás el programa o querés resetear inmuebles):
```bash
NEXT_PUBLIC_REALESTATE_PROGRAM_ID=3V49YdnmbsHPoguFWhDhyAJhbUASq9s9LAXjxSfBPoWK \
  node scripts/seed-properties.mjs
```

---

## 8. Cómo desplegar en Vercel

No hay `vercel.json` — Next.js se detecta solo. Toda la config son **Environment Variables** (Project → Settings → Environment Variables, en Production y Preview). Tras agregarlas: **redeploy** (Vercel no toma envs nuevas sin redeploy).

### Críticas (sin esto no arranca)
| Var | Valor |
|---|---|
| `NEXT_PUBLIC_SOLANA_CLUSTER` | `devnet` |
| `NEXT_PUBLIC_HELIUS_RPC` | tu RPC Helius devnet |
| `NEXT_PUBLIC_PRIVY_APP_ID` | tu Privy app id |
| `NEXT_PUBLIC_BASE_URL` | tu URL de Vercel |

### Real estate
| Var | Valor |
|---|---|
| `NEXT_PUBLIC_REALESTATE_PROGRAM_ID` | `3V49YdnmbsHPoguFWhDhyAJhbUASq9s9LAXjxSfBPoWK` |
| `NEXT_PUBLIC_CRIXTO_FEE_ATA_USDC` | `rzE5XcurQWJGTb63e37dFWqqfhZ6gc82GEk1fFu1k3f` |
| `NEXT_PUBLIC_TROPICO_FEE_ATA_USDC` | `rzE5XcurQWJGTb63e37dFWqqfhZ6gc82GEk1fFu1k3f` |

> Las dos fee ATAs son **obligatorias** para que la compra funcione (ver §9, gotcha #4).

---

## 9. Decisiones y trampas (gotchas) — para no tropezar de nuevo

1. **Bug arreglado — `Box` en el registry.** En `list_property`, la cuenta `registry` no estaba en heap (`Box`), lo que corrompía la lectura de `registry.admin` y tiraba `Unauthorized` falso. Fix: `registry: Box<Account<RegistryConfig>>`. Sin esto, listar inmuebles falla.
2. **Cerrar un programa retira su ID para siempre.** `solana program close` recupera el SOL del rent pero **inhabilita ese program ID** (no se puede redeployar ahí). Por eso el ID cambió a `3V49Ydnm…`. Si lo cerrás de nuevo, hay que generar otro ID y actualizar `declare_id!`, `Anchor.toml`, el seed y la env de Vercel.
3. **Faucet devnet limitado.** `solana airdrop` por CLI suele estar rate-limited. Para USDC devnet: `faucet.circle.com` (red Solana Devnet).
4. **La compra exige fee ATAs reales.** El programa valida que `crixto_fee_ata`/`tropico_fee_ata` sean cuentas USDC (mismo mint del registry). Si las envs faltan, el front manda la wallet del inversor (que NO es una cuenta de token) → la tx falla. Por eso ambas envs apuntan a una ATA USDC existente.
5. **Precios bajos = ids nuevos.** Los inmuebles on-chain son inmutables en precio (no hay instrucción de "cambiar precio"). Para bajar a 5/3/2 USDC se listaron **ids nuevos** (`-v2`); los viejos quedaron huérfanos en devnet (inofensivo).
6. **Performance saldos.** `lib/balances.ts` ahora hace 1 sola query `getTokenAccountsByOwner` por programId (antes una por token) → de ~10 llamadas RPC a 2.
7. **Bug arreglado — la compra no minteaba token.** `PropertyView` renderizaba `PropertyBuyForm` sin signer → `canDoRealTx = false` → modo demo (firma `DEMO_xxx` falsa, nada on-chain). Fix: `PropertyBuyFormPrivy` inyecta el signer real de Privy. Mismo patrón para `MisInmuebles` y `ShareTransferCard`.
8. **El portafolio era data hardcodeada.** `/mis-inmuebles` mostraba `DEMO_POSITIONS` con id `residencias-avila-001` que no matcheaba el id real `-v2` → siempre vacío. Ahora lee on-chain con `fetchShareBalance`.
9. **CarlosAI → GuacamaAI (rename total).** El agente IA se renombró (referencia: la guacamaya). Rutas `app/carlos/*` → `app/guacama/*`, API `app/api/carlos` → `app/api/guacama`, `lib/carlos-prompt.ts` → `lib/guacama-prompt.ts`. Los enlaces viejos siguen vivos vía `redirects()` en `next.config.mjs` (`/carlos` → `/guacama`, 308 permanente). No había env vars `CARLOS_*` reales — eran constantes/refs de docs.

---

## 10. Qué falta (para cerrar el demo)

- [x] **Comprar** acciones firmando con Privy → mintea token real on-chain (con modal de confirmación).
- [x] **Portafolio** `/mis-inmuebles` lee saldos reales on-chain.
- [x] **Transferir** acciones a otra wallet con KYC.
- [ ] Probar el flujo completo end-to-end en navegador con la wallet 96Bj (tiene 19 USDC).
- [ ] **Reclamar renta**: requiere que el admin corra `deposit_yield` primero (poner USDC en la bóveda).
- [ ] **Votar** en `/inmuebles/[id]/gobernanza`.
- [ ] Setear las envs en Vercel y redeploy para que ande desde la web.
- [ ] (Cosmético) `legalDocHash` de Candelaria tiene 62 hex en vez de 64 — se rellena solo, sin impacto.
