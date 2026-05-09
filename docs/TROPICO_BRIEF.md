# TROPICO — Brief completo del proyecto

> **Cómo usar este documento:**
> Este archivo es la fuente de verdad ÚNICA del producto Tropico. Está escrito como brief técnico-producto y como prompt operativo. Contiene todo lo necesario para que un humano o una herramienta IA reconstruyan el producto desde cero, sin información externa adicional. Si modificás el plan, actualizá este archivo.

---

## 0. TL;DR — Resumen ejecutivo (90 segundos)

**Tropico** es **la red económica del venezolano en Solana**. NO es una wallet más. Es una **red privada de pagos paralela al sistema bancario** donde el usuario ahorra en USDC (no se devalúa) generando yield ~5% APY automático, paga directo en comercios afiliados con QR (settlement en 1 segundo, sin Banesco/sin POS), y los comercios pagan 60-75% menos en fees vs Visa/Mastercard. **Es la red económica caribeña en Solana**, nativa de USDC, sin custodios.

**Mecánica circular** (la trifecta económica):
- **Usuario** deposita USDC → genera yield mientras la plata está parada (combate inflación de raíz, porque la plata nunca toca el bs)
- **Comercio** acepta pagos USDC vía QR → settlement instantáneo, sin chargebacks, 1% de fee total (vs 4-5% Visa)
- **Como ambos están en Tropico**, el dinero gira dentro de la red sin pasar por bancos. El comercio puede ofrecer **cashback al usuario** (porque le sobra margen) → fidelización exponencial.

**Tropico tiene dos productos integrados:**

- **Tropico Wallet** (consumidor): saldo USDC con yield default ON, pagos en comercios afiliados, swaps, envíos, Carlos AI.
- **Tropico Comercios** (merchant): QR de cobro, dashboard de ingresos, settlement 1s, logo "Acepta Tropico", reportes para contabilidad.

**5 módulos por lado del consumidor**, 3 por el lado del merchant — todos integrados, todos non-custodial.

**Demo del 48h hackathon (dev3pack, mayo 2026):** usuario logguea con email → ve saldo USDC con yield acumulado → paga $5 a un "comercio Tropico" simulado → swap real SOL → JTO con fee a Tropico (verificable en Solscan) → conversación real con Carlos → tour del lado merchant en `/comercios`.

**Posicionamiento competitivo:**
> Una red de pagos caribeña sobre Solana. Como Visa pero non-custodial y 60% más barato. Como Kontigo pero abriendo el ecosistema completo. Como Reserve pero con red de comercios y yield real.

**Stack:** Next.js 15 + Privy + Jupiter v6 + Gemini 2.0 Flash + Helius RPC. Cero programa Anchor custom. Cero backend persistente.

---

## 1. Identidad del producto

| Campo | Valor |
|---|---|
| Nombre marca paraguas | **Red Tropico** |
| Producto consumidor | **Tropico Wallet** |
| Producto merchant | **Tropico Comercios** |
| Slug | `tropico` |
| Categoría | Red económica privada / payment network non-custodial |
| Tagline corto | "La red económica del venezolano. Ahorra ganando intereses. Paga sin perder valor." |
| Tagline largo | "Tu plata en USDC genera mientras está parada. Pagas directo en comercios sin pasar por el banco. Los comercios pagan 60% menos. Todos ganan." |
| Idioma | Español venezolano (es-VE) |
| Mercado objetivo | Venezuela primero, LATAM después (CO, AR, MX, PE) |
| Tipo de app | Progressive Web App (PWA), mobile-first |
| Custodia | **Non-custodial** estricto (Privy MPC + Wallet Adapter) |
| Modelo | 5 streams de microcomisiones (swap + send + save + pay + carlos como acelerador) |
| Branding | Solana-Maxi: puro Solana, sin guiños a EVM/Tron salvo para contrastar |

---

## 1.5 La Red Tropico — el ecosistema económico circular

Esto es lo que diferencia a Tropico de cualquier wallet o app de pagos existente: **no es una herramienta aislada, es una RED de dos lados que se autoalimenta**.

### Las tres reglas de la red

1. **La plata vive en USDC, no en bs** → no se devalúa. La inflación se neutraliza en origen.
2. **La plata genera mientras está parada** → yield ~5% APY default (mSOL/Kamino bajo el hood). Combate la inflación USD también.
3. **Si pagas dentro de la red, no sales de USDC** → el dinero gira sin tocar bancos, sin Visa, sin POS tradicional, sin spreads ocultos.

### Comparativa de costos al merchant (lo que vendes en el pitch)

| Método | Fee total al merchant | Settlement | Chargebacks | Hardware |
|---|---|---|---|---|
| Visa/Mastercard via POS tradicional | 4.5% + IVA | 24-72h | Sí (riesgoso) | $50-150 |
| POS tradicional terminal | 3.5-4% | 24h | Sí | $50-150 |
| Pago Móvil bs | 0.5% pero cobra en bs (devaluación) | Instantáneo | No | Smartphone |
| Binance P2P | 1-3% por venta + tiempo | 5-30 min | Riesgo P2P | App |
| Zelle | Gratis pero ilegal/bloqueable | Variable | No | Cuenta US |
| **Tropico Comercios** | **1%** | **<1s** | **No (on-chain final)** | **Smartphone** |

**Por cada $1.000 en ventas, un merchant venezolano ahorra ~$35 al mes vs POS tradicional.** Eso es lo que el merchant puede devolver al cliente como cashback (creando lealtad), reinvertir, o quedarse de margen.

### Por qué el usuario gana

| Acción del usuario | Lo que gana |
|---|---|
| Mantiene saldo USDC | ~5% APY automático (yield default ON) |
| Paga en comercio Tropico | Cashback típico 0.5-1% (paga el comercio del fee ahorrado) |
| Recomienda a otro usuario | $5 USDC en su próximo swap (post-MVP) |
| Recomienda a un comercio | 10% del primer mes de fees del comercio (post-MVP) |

### El efecto red

Cada nuevo merchant afiliado aumenta el valor de la wallet del usuario (más lugares donde pagar). Cada nuevo usuario aumenta el valor de Tropico Comercios (más clientes potenciales). Esto es **classic two-sided network effect** — el mismo modelo bilateral que ha probado escalar redes de pagos en LATAM.

### Confianza radical (la base de todo)

Sin confianza, esta red no funciona. Tropico construye confianza con 4 pilares **visibles en la app**:

1. **Auditoría on-chain pública**: link directo en la app al fee account de Tropico en Solscan. *"Este es exactamente cuánto cobramos. Verificalo tú mismo."*
2. **Tropico nunca toca tu plata**: explicación visual en onboarding y banner permanente. La wallet es del usuario. Tropico es UI/UX, no custodia.
3. **Comparativa transparente vs alternativas**: pantalla "Cuánto te ahorrás" con números reales vs Banesco/Binance.
4. **Open source del frontend** (post-MVP): cualquiera puede auditar el código.

---

## 2. Persona objetivo: Carlos (el usuario, no el bot)

**Carlos**, 32 años, vive en Maracaibo. Trabaja como freelancer de diseño gráfico cobrando a clientes en EEUU/Colombia. Sus ingresos llegan a su cuenta de Binance vía P2P en USDT/Tron. Para gastos diarios pasa USDT a bs por Pago Móvil. Tiene Zelle pero le bloquearon la cuenta dos veces este año. Recibe remesas de su mamá desde España.

**Conoce**: Binance P2P, USDT/Tron, Zelle, Reserve.

**No conoce** (y queremos que descubra):
- Que Solana existe y es 1000× más barata que Tron
- Que con USDC en Solana puede recibir las remesas de su mamá en <1s sin Western Union
- Que puede convertir USDC en mSOL y ganar ~7% al año automático
- Que puede cobrarle a sus clientes con un QR sin pasar por Binance P2P
- Que existe Carlos (el bot) que le explica todo en su idioma

**Sus 5 dolores diarios** = los 5 módulos de Tropico Wallet:
1. "Mis ahorros pierden poder con la inflación" → **yield default ON**
2. "Cobrarle a clientes afuera me cuesta 3-7% en P2P" → **Cobrar (auto-merchant)**
3. "Mandarle a mi tía que vive en otra ciudad es lento y caro" → **Enviar**
4. "Estoy atrapado en USDT y no sé qué más existe" → **Cambiar**
5. "No entiendo nada de cripto y nadie me explica" → **Carlos**

---

## 2.5 Persona objetivo: María (la merchant)

**María**, 47 años, tiene una **bodega en Catia, Caracas**. Vende panadería, abarrotes, recargas. Atiende 80-150 clientes al día, ticket promedio $3-8 USD.

**Cómo cobra hoy**:
- 60% Pago Móvil bs (depende del banco — a veces se cae, los bs pierden valor entre la venta y el cierre del día)
- 25% efectivo dólares (riesgo robo, billetes falsos, vuelto difícil)
- 10% Zelle (clientes con cuenta US — pero cada vez menos)
- 5% Binance P2P (clientes jóvenes con USDT en Tron)

**Sus 4 dolores diarios** = el lado merchant de Tropico:
1. **"El bolívar se devalúa entre la venta y que llego al banco"** → Tropico Comercios cobra USDC, no bs.
2. **"Si pongo POS tradicional me cobran 4.5% + me piden contrato + tarda 3 días en ver la plata"** → Tropico Comercios fee 1%, settlement 1 segundo, sin contrato.
3. **"No tengo cómo verificar billetes USD falsos"** → Pago digital en USDC: no hay falsificación posible.
4. **"Mis clientes jóvenes ya prefieren cripto y los pierdo"** → Los clientes Tropico son sus clientes.

**Beneficios concretos que vendemos a María**:
- Ahorra ~$35/mes por cada $1.000 en ventas vs POS tradicional
- Settlement instantáneo (no espera 3 días)
- Sin chargebacks (pagos on-chain son finales)
- Sin hardware caro (solo necesita su Android viejo)
- Reportes para SENIAT exportables (CSV)
- Logo "Acepta Tropico" para pegar en su local físico
- Listada en directorio público para que clientes Tropico la encuentren

**Lo que María necesita para confiar**:
- Onboarding sin abogado (5 minutos máx)
- "Mi plata aparece donde yo digo" — Tropico no la guarda
- Soporte en WhatsApp en español
- Otros comercios visibles que ya la usan (testimonios)
- Demo en vivo: ver el dinero llegar en su pantalla en tiempo real

---

## 3. Problema → Solución → Diferenciación

### El problema sistémico

El 95% del volumen cripto venezolano vive en USDT/Tron por Binance P2P. Las apps en español que existen para venezolanos son **monolíticas y custodias**: Reserve solo guarda dólares, Kontigo solo guarda dólares, Zinli solo es Zelle alternativo. Phantom es non-custodial pero asume usuario experto y no ofrece nada más allá de "ser una wallet". El venezolano queda atrapado entre dos mundos: o usa apps custodias en español (limitadas, riesgosas), o usa Phantom + Jupiter por separado en inglés (fragmentado, intimidante).

**No existe una plataforma única, multi-feature, non-custodial, en español venezolano, sobre Solana.**

### La solución: Tropico = OS financiero modular

5 módulos en una sola app, conectados por un copiloto IA común:

```
┌───────────────────────────────────────────────────────────┐
│                      TROPICO HOME                         │
│  Saldo total: $1,247.30  (Bs. 811,408.92)                 │
│                                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │ CAMBIAR  │ │ ENVIAR   │ │ GUARDAR  │                   │
│  │ Jupiter  │ │ Solana   │ │ mSOL +   │                   │
│  │ swap     │ │ Pay URL  │ │ Kamino   │                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
│  ┌──────────┐ ┌──────────┐                                │
│  │ COBRAR   │ │ CARLOS   │                                │
│  │ QR para  │ │ AI       │                                │
│  │ merchants│ │ copilot  │                                │
│  └──────────┘ └──────────┘                                │
└───────────────────────────────────────────────────────────┘
```

### Diferenciación frente a competencia

| Producto | Custodial | Idioma | Multi-feature | AI | Solana | Mobile-first | Non-custodial |
|---|---|---|---|---|---|---|---|
| Binance P2P | ✓ | EN/ES gen | Limitado | ✗ | ✗ | App nativa | ✗ |
| Reserve | ✓ | ES | Solo USD | ✗ | ✗ | App nativa | ✗ |
| Kontigo | ✓ | ES | Solo USD | ✗ | ✗ | App nativa | ✗ |
| Zinli | ✓ | ES | P2P only | ✗ | ✗ | App nativa | ✗ |
| Phantom | ✗ | EN | Solo wallet | ✗ | ✓ | App nativa | ✓ |
| Jupiter mobile | ✗ | EN | Solo swap | ✗ | ✓ | Web | ✓ |
| **TROPICO** | **✗** | **ES-VE** | **5 módulos** | **✓ Carlos** | **✓** | **PWA** | **✓** |

**Tropico es la PRIMERA plataforma multi-feature, non-custodial, en español, sobre Solana, para LATAM.**

---

## 4. Modelo de negocio — 6 streams de revenue (5 directos + 1 acelerador)

### Streams directos al consumidor (Tropico Wallet)

| Stream | Mecánica | Tasa | Implementación técnica |
|---|---|---|---|
| **Cambiar** | Jupiter `platformFeeBps` | 0.5% (50 bps) | Pasamos parámetro al `/v6/swap`, fee aterriza en ATA propio |
| **Enviar** | Spread USDC sobre P2P | 0.3% | Diferencia entre lo enviado y lo recibido |
| **Guardar (yield)** | Performance fee | 2% del yield generado | Si usuario gana 5% APY de mSOL, Tropico se queda 2 puntos del rendimiento; usuario neto recibe ~3% |

### Stream del lado merchant (Tropico Comercios)

| Stream | Mecánica | Tasa | Implementación técnica |
|---|---|---|---|
| **Cobrar (merchant fee)** | Tropico cobra del merchant en cada cobro | 1% del monto cobrado | Solana Pay con `reference` propio; Tropico ejecuta una segunda tx que rutea 1% a su ATA al confirmar el pago, o usa transfer hook (token-2022) post-MVP |

### Streams indirectos / aceleradores

| Stream | Mecánica | Tasa | Cuándo aporta |
|---|---|---|---|
| **Carlos AI** | Acelerador de los 4 anteriores | — | Multiplica conversion + retention 2-3× |
| **Cashback merchant→user** (NO es revenue Tropico, es feature de la red) | Merchant da 0.5-1% al cliente | 0-1% | Crea lealtad de los usuarios a la red |

### La ecuación económica circular completa

```
Comercio cobra $100 vía Tropico
  → recibe $99 en su wallet (1% fee Tropico)
  → opcionalmente envía $0.50 cashback al cliente (0.5% del cobro original)
  → su costo neto: $99.50 (vs Banesco $95.50 — ahorra $4 por cada $100)

Cliente paga $100 al comercio
  → recibe $0.50 cashback inmediato
  → su saldo USDC restante sigue generando ~5% APY
  → costo neto del pago: $99.50 (vs efectivo USD donde no gana yield)

Tropico recibe $1 directo del comercio
  → no toca el wallet del usuario ni del comercio
  → es 100% transparente y verificable on-chain
```

**Ambos lados ganan, Tropico cobra, y el dinero NUNCA toca el bolívar ni el sistema bancario.** Esa es la propuesta de valor.

### Proyección financiera revisada

| Métrica | Mes 1 | Mes 6 | Mes 12 |
|---|---|---|---|
| Usuarios activos | 1,000 | 10,000 | 50,000 |
| Comercios afiliados | 20 | 300 | 2,000 |
| Volumen mensual / usuario (USD) | $200 | $300 | $400 |
| Volumen mensual / comercio (USD) | $5,000 | $8,000 | $12,000 |
| Volumen total mensual | $300k | $5.4M | $44M |
| Revenue mensual estimado | $1.5k | $30k | $250k |

El revenue por comercio supera al revenue por consumidor a partir del mes 6. **El motor de crecimiento real es la afiliación de comercios.**

### Add-ons futuros (roadmap pitch)

- Tropico Card (Q4 2026) — debit USDC con interchange ~1.5%
- Tropico Vaults (Q4 2026) — performance fee 10% sobre estrategias DeFi
- Premium subscription ($5/mes) para advanced features
- Sponsored discoveries (tokens promocionados con disclaimer)
- Programa de afiliación: usuario que afilia merchants se queda con 10% del revenue del merchant en su primer mes

---

## 5. Stack técnico — Versiones exactas

### `package.json` final

```json
{
  "name": "tropico",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@google/generative-ai": "^0.21.0",
    "@privy-io/react-auth": "^2.0.0",
    "@solana/spl-token": "^0.4.9",
    "@solana/wallet-adapter-base": "^0.9.23",
    "@solana/wallet-adapter-react": "^0.15.35",
    "@solana/wallet-adapter-react-ui": "^0.9.35",
    "@solana/wallet-adapter-wallets": "^0.19.32",
    "@solana/web3.js": "^1.95.4",
    "@tanstack/react-query": "^5.59.0",
    "bs58": "^6.0.0",
    "next": "^15.0.0",
    "qrcode": "^1.5.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/qrcode": "^1.5.5",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.6.0"
  }
}
```

**Nuevas dependencias agregadas para los 5 módulos:**
- `qrcode` — para generar QRs en Cobrar y Enviar
- `@types/qrcode` — tipos

### Stack por capa

| Capa | Tecnología | URL/SDK | Notas |
|---|---|---|---|
| Framework | Next.js 15 (App Router) | nextjs.org | RSC + Server Actions + Edge Runtime |
| UI | React 19 + Tailwind 3 | — | Mobile-first |
| Wallet primario | Privy | `@privy-io/react-auth` | Login email/Google/wallet, MPC embedded |
| Wallet fallback | Solana Wallet Adapter | `@solana/wallet-adapter-react-ui` | Phantom + Solflare |
| Swap aggregator | Jupiter v6 | `https://quote-api.jup.ag/v6/` | REST, sin SDK |
| Pagos / Solana Pay | `@solana/web3.js` + helpers propios | spec: solanapay.com | URLs `solana:` para Enviar y Cobrar |
| QR codes | `qrcode` | npm | Cliente-side, sin servicio externo |
| AI copilot | Google Gemini 2.0 Flash | `@google/generative-ai` | gratis 15 req/min |
| RPC | Helius | `https://mainnet.helius-rpc.com/?api-key=X` | free tier 100k/mes |
| Tasa bs | ve.dolarapi.com | `https://ve.dolarapi.com/v1/dolares` | público, sin key |
| Yield (Guardar) | Marinade + Kamino (vía Jupiter route + signature) | docs.marinade.finance, kamino.finance | mSOL es liquid staking, USDC en Kamino vault |
| State | React Query 5 | `@tanstack/react-query` | cache 30s |
| Tokens | SPL Token | `@solana/spl-token` | leer balances ATAs |
| Hosting | Vercel | vercel.com | free hobby tier |

**Cero backend persistente. Cero base de datos. Cero programa Anchor custom.**

---

## 6. Variables de entorno

Archivo: `.env.local` (NUNCA commitear, está en `.gitignore`).

```bash
# === Privy (embedded wallet) ===
NEXT_PUBLIC_PRIVY_APP_ID=

# === Google Gemini (Carlos AI) ===
GOOGLE_GENERATIVE_AI_API_KEY=

# === Helius RPC ===
NEXT_PUBLIC_HELIUS_RPC=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
HELIUS_API_KEY=

# === Tropico fee accounts (ATAs) ===
NEXT_PUBLIC_TROPICO_FEE_OWNER=
NEXT_PUBLIC_TROPICO_FEE_ATA_USDC=
NEXT_PUBLIC_TROPICO_FEE_ATA_SOL=
NEXT_PUBLIC_TROPICO_FEE_ATA_USDT=

# === Cluster ===
NEXT_PUBLIC_SOLANA_CLUSTER=mainnet-beta
```

---

## 7. Setup pre-código (~30 minutos)

### Paso 1: Wallet de fees

```bash
solana-keygen new --outfile ~/.config/solana/tropico-fees.json
solana-keygen pubkey ~/.config/solana/tropico-fees.json  # → NEXT_PUBLIC_TROPICO_FEE_OWNER
solana config set --keypair ~/.config/solana/tropico-fees.json
solana config set --url mainnet-beta
# Fondear con ~0.05 SOL para crear ATAs
```

### Paso 2: ATAs para mints donde recibirás fees

```bash
spl-token create-account EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v  # USDC
spl-token create-account So11111111111111111111111111111111111111112  # wSOL
spl-token create-account Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB  # USDT
```

### Paso 3: API keys

| Servicio | URL | Acción |
|---|---|---|
| Privy | https://dashboard.privy.io | App ID |
| Gemini | https://aistudio.google.com/apikey | API key |
| Helius | https://dashboard.helius.dev | RPC URL |

### Paso 4: Vercel — pegar todas las env vars en el dashboard.

---

## 8. Arquitectura de carpetas

```
Hackathon/
├── .env.local                            # API keys (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
├── README.md
├── docs/
│   ├── TROPICO_BRIEF.md                  # ESTE archivo (fuente de verdad)
│   ├── ROADMAP.md                        # visión long-term post-MVP
│   ├── architecture.md                   # diagrama y flujo de datos
│   ├── pitch-script.md                   # pitch de 4 min
│   └── demo-checklist.md                 # checklist pre-pitch
├── public/
│   ├── manifest.json                     # PWA manifest
│   └── icons/
│       ├── icon-192.png
│       ├── icon-512.png
│       └── tropico.svg
├── app/
│   ├── layout.tsx                        # fonts + metadata + Providers wrapper
│   ├── globals.css                       # Tailwind + tokens Tropico
│   ├── providers.tsx                     # Privy + WalletAdapter + RQ
│   ├── page.tsx                          # Landing (público)
│   ├── home/page.tsx                     # Dashboard 5 módulos (post-login)
│   ├── descubrir/page.tsx                # Educational: 9 tokens curados
│   ├── cambiar/page.tsx                  # MÓDULO 1: Swap (Jupiter)
│   ├── enviar/page.tsx                   # MÓDULO 2: Send (Solana Pay)
│   ├── guardar/page.tsx                  # MÓDULO 3: Save (yield)
│   ├── cobrar/page.tsx                   # MÓDULO 4: Receive QR
│   ├── carlos/page.tsx                   # MÓDULO 5: AI chat
│   ├── claim/[id]/page.tsx               # Claim link receiver (Enviar)
│   └── api/
│       ├── precio-bs/route.ts            # proxy ve.dolarapi.com
│       └── carlos/route.ts               # proxy Gemini
├── lib/
│   ├── tokens.ts                         # catálogo 9 tokens
│   ├── jupiter.ts                        # quote + buildSwapTransaction
│   ├── solana-pay.ts                     # URL builder + claim links
│   ├── yield.ts                          # mSOL/Kamino integration helpers
│   ├── precio-bs.ts                      # tasa USD/VES
│   ├── balances.ts                       # leer SPL token accounts
│   ├── carlos-prompt.ts                  # system prompt + greetings
│   ├── solana.ts                         # connection + cluster helpers
│   ├── claim-store.ts                    # localStorage para claim links
│   └── formato.ts                        # formatUSD, formatBs, shortAddress
├── components/
│   ├── AuthButton.tsx                    # Privy + fallback adapter
│   ├── DualPrice.tsx                     # USD + bs (firma del producto)
│   ├── ModuleCard.tsx                    # card grande para cada módulo en home
│   ├── TokenCard.tsx                     # card educativa de token
│   ├── BalanceList.tsx                   # tokens del usuario
│   ├── SwapForm.tsx                      # formulario Cambiar
│   ├── SendForm.tsx                      # formulario Enviar
│   ├── SaveDashboard.tsx                 # estado de yield activo
│   ├── ReceiveQR.tsx                     # QR de Cobrar
│   ├── ChatCarlos.tsx                    # UI WhatsApp-style
│   ├── BannerOnRamp.tsx                  # banner waitlist
│   └── ClaimLinkShare.tsx                # WhatsApp share del claim link
└── node_modules/
```

### Diagrama de flujo de datos

```
┌──────────────┐   ┌────────────────────────────────────────┐
│   Browser    │   │              Tropico (Vercel)          │
│              │   │                                        │
│  ┌────────┐  │   │  ┌──────────┐    ┌──────────────────┐  │
│  │ React  │──┼───┼─▶│ App      │    │ /api/precio-bs   │──┼──▶ ve.dolarapi.com
│  │ + RQ   │  │   │  │ Router   │    │  (Edge runtime)  │  │
│  └────────┘  │   │  └──────────┘    └──────────────────┘  │
│      │       │   │                  ┌──────────────────┐  │
│      │       │   │                  │ /api/carlos      │──┼──▶ Gemini 2.0 Flash
│      │       │   │                  │  (Node runtime)  │  │
│      │       │   │                  └──────────────────┘  │
│  ┌────────┐  │   └────────────────────────────────────────┘
│  │ Privy  │──┼──▶ Privy infra (auth + MPC)
│  └────────┘  │
│      │       │           ┌─────────────────┐
│  ┌────────┐  │           │ Jupiter v6 API  │ ← módulo Cambiar
│  │ wallet │──┼──────────▶├─────────────────┤
│  │        │  │           │ Solana RPC      │ ← módulos Enviar/Cobrar/Guardar (firma directa)
│  │        │──┼──────────▶│ (Helius)        │   ← lectura de balances
│  └────────┘  │           └─────────────────┘
└──────────────┘
```

**Reglas de boundary (críticas):**
- API keys SECRETAS → solo en `app/api/*` (servidor)
- API keys PÚBLICAS (`NEXT_PUBLIC_*`) → ok en client
- Firmas de transacciones → SIEMPRE en cliente, con la wallet del usuario
- Tropico NUNCA toca llaves privadas del usuario
- Claim links → almacenados en localStorage del remitente (no en backend) — el destinatario reclama vía URL pública con secret

---

## 9. Los 5 módulos — UX/UI completo

### 9.0 Landing pública (`/`)

**Para visitantes no logueados.**

- Hero: "El sistema financiero del venezolano, en Solana."
- Subtitle: "Ahorra, gasta, recibe, manda y crecé. Todo en una sola app, sin custodios."
- 5 cards (uno por módulo) con badge + descripción
- CTAs: "Empezar con email" (Privy) | "Ya tengo Phantom"

### 9.1 Home (`/home`)

**Dashboard post-login. El centro de comando.**

- Header con saldo total: `DualPrice size="xl"` ($1,247.30 / Bs. 811,408.92)
- Sub-header: número de tokens + dirección abreviada del wallet
- Grid 2x3 de **ModuleCards**:
  1. Cambiar (purple→green) — "Intercambia entre tokens al mejor precio"
  2. Enviar (sun→coral) — "Manda USDC a quien quieras, instantáneo"
  3. Guardar (sea→green) — "Tu plata generando ~7% al año"
  4. Cobrar (coral→sun) — "QR para recibir cobros en USDC"
  5. Carlos (purple→sea) — "Pregúntale al copiloto"
  6. Descubrir (border) — "Explorá el ecosistema"
- Lista de balances activos (BalanceList)
- Banner inferior: "🟡 Pronto: deposita bs desde tu banco"

### 9.2 Cambiar (`/cambiar`) — MÓDULO 1: Swap

**Estado MVP: 100% funcional.**

- Header con back
- Bloque "From":
  - Selector de token (de los del usuario)
  - Input numérico grande
  - "Saldo: X.XX SYMBOL" + "Max"
  - DualPrice del monto
- Botón flip
- Bloque "To":
  - Selector del catálogo
  - Output esperado (Jupiter quote)
  - DualPrice
- Detalles colapsables:
  - Tasa
  - Slippage 0.5%
  - Price impact
  - **Comisión Tropico: 0.5% (~$X)** [destacado]
  - Ruta vía Jupiter
- Botón "Confirmar cambio"
- Post-success: confeti + signature + "Ganaste exposición a JTO 🌴"

### 9.3 Enviar (`/enviar`) — MÓDULO 2: Send

**Estado MVP: UI completa + happy path Solana Pay URL.**

Subflujos:
- **A) Enviar a wallet conocida:** input de pubkey → monto → confirmar → tx directa
- **B) Enviar con claim link** (cuando el destinatario no tiene wallet):
  - Input "¿A quién?" (nombre + foto opcional)
  - Monto USDC
  - "Crear link de cobro"
  - Genera URL `https://tropico.app/claim/{id}?secret={s}` (id+secret guardados en localStorage del remitente, fondos en escrow temporal de su propio wallet hasta claim)
  - Botón "Compartir por WhatsApp" → abre `wa.me/?text=...`
  - Estado del link (pendiente / reclamado) en histórico
  - **Página `/claim/[id]`**: receptor abre, hace login con email (Privy crea wallet si no tiene), el remitente firma la transferencia al wallet recién creado del receptor

**Para el demo MVP (UI-only, simulado):**
- Form completo
- Botón "Crear link" genera URL real con QR
- WhatsApp share funciona
- Página /claim renderiza pero el "claim" simula un paso de wallet creation + balance fake (no transfer real)
- El pitch explica: "En producción, el remitente firma el transfer cuando el receptor reclama"

### 9.4 Guardar (`/guardar`) — MÓDULO 3: Save

**Estado MVP: UI completa + simulación de yield.**

- Header: "Tu plata trabajando"
- Card con saldo actual en USDC (el "ahorro disponible")
- Toggle grande: **"Activar yield automático"**
  - OFF: "Tu USDC está parado. Actívalo para que gane ~7% al año."
  - ON: muestra simulación: "Estás ganando ~$X/mes (~Bs. Y/mes)"
- Estrategias disponibles (cards):
  - **mSOL Liquid Staking** — APY ~7%, riesgo bajo, lock 0 días
  - **Kamino USDC Vault** — APY ~5%, riesgo bajo, lock 0 días
  - **Kamino mSOL/USDC LP** — APY ~12%, riesgo medio, lock 0 días
- Cada card: descripción, APY, riesgo, gráfico mini, botón "Activar"
- Sección "Historial de yield" (vacía si no hay)

**Para el demo MVP (UI-only, simulado):**
- Toggle funciona pero no ejecuta swap real a mSOL
- "Activar" en una estrategia muestra modal: "✨ Funcionalidad completa en próximo sprint"
- En el pitch: "El backend técnico ya está listo (mSOL es Jupiter route normal); falta la UX de confirmación"

### 9.5 Cobrar (`/cobrar`) — MÓDULO 4: Receive

**Estado MVP: UI completa + QR generation real.**

- Header: "Cobrar"
- Input grande: "¿Cuánto cobras?" (USD)
- DualPrice del monto en bs
- "Generar QR" → fullscreen con QR de Solana Pay URL
- Debajo del QR: "Comparte por WhatsApp" + signature listener
- Cuando llega un pago (en mainnet): animación de check + sonido + "¡$X recibidos!"
- Botón "Compartir recibo por WhatsApp"
- Histórico de cobros del día con totales en USD/bs

**Para el demo MVP (UI-only, simulado):**
- QR se genera real (URL Solana Pay válida)
- "Listening for payment" muestra spinner durante 3s
- Botón "Simular pago recibido" para demo en vivo
- En el pitch: "En producción, el listener escucha el RPC con `findReference` del Solana Pay SDK"

### 9.6 Carlos (`/carlos`) — MÓDULO 5: AI Copilot

**Estado MVP: 100% funcional.**

- Layout estilo WhatsApp (fullscreen mobile)
- Avatar Carlos + "En línea"
- Greeting: "¡Epa, panita! Soy Carlos, tu copiloto en Solana..."
- Quick prompts: "¿Qué es JTO?" | "¿Cuál token me conviene?" | "¿Por qué Solana?" | "Diferencia USDC/USDT"
- Lista de mensajes con burbujas
- Input fijo abajo + botón send
- Carlos puede sugerir un módulo: "Si quieres ahorrar, ve a /guardar y activa mSOL"

**Backend:** `POST /api/carlos` con `{ message, history, currentScreen }` → Gemini 2.0 Flash con system prompt + history + contexto de pantalla → respuesta + sugerencia opcional de CTA a otro módulo.

### 9.7 Descubrir (`/descubrir`) — Apoyo educativo

**Carrusel/grid de los 9 tokens curados con copy venezolano. Detalle en sección 11.**

---

## 10. Branding y diseño

### Paleta (Tailwind tokens)

```ts
colors: {
  tropico: {
    ink: "#0a0a14",       // background
    panel: "#13131f",     // card surfaces
    border: "#1f1f30",
    mute: "#5a5a6e",
    text: "#e9e9f1",
    purple: "#9945FF",    // Solana brand
    green: "#14F195",     // Solana brand
    sun: "#FFD166",       // Caribeño warm yellow
    coral: "#EF476F",     // Caribeño hot coral
    sea: "#06D6A0",       // Caribeño sea green
  }
}
```

### Tipografía

- Display: **Bricolage Grotesque** (Google Fonts)
- UI/Body: **Inter**
- Numerales: tabular-nums

### Voz del producto

- Tuteamos al usuario (no voseo — eso es Argentina)
- "Panita", "mi pana", "vale", "chamo", "epa" en moderación
- Cero anglicismos sin traducir ("swap" se queda, "yield" se traduce)
- Cero promesas de rendimientos
- Cero política
- Tono: cercano, paisano, no condescendiente

### Gradientes por módulo (para ModuleCards)

| Módulo | Gradiente from | Gradiente to |
|---|---|---|
| Cambiar | purple | green |
| Enviar | sun | coral |
| Guardar | sea | green |
| Cobrar | coral | sun |
| Carlos | purple | sea |
| Descubrir | border (neutro) | mute |

---

## 11. Catálogo de tokens (9 curados)

Archivo: `lib/tokens.ts` — fuente de verdad. Ya creado.

| Symbol | Mint (mainnet) | Decimals | Riesgo | Vibe |
|---|---|---|---|---|
| SOL | So11...112 | 9 | 3 | El motor del ecosistema |
| USDC | EPjFWdd5...t1v | 6 | 1 | El dólar digital más confiable |
| USDT | Es9vMFrz...wNYB | 6 | 2 | El que ya conocés, ahora en Solana |
| JUP | JUPyiwrYJ...vCN | 6 | 3 | El Booking de los swaps |
| JTO | jtojtomep...mCL | 9 | 3 | Tu SOL trabajando en background |
| mSOL | mSoLzYCx...m7So | 9 | 2 | SOL con yield automático |
| KMNO | KMNo3nJsBX...9sS | 6 | 4 | Banco descentralizado de Solana |
| RAY | 4k3Dyjzv...kX6R | 6 | 4 | Una de las primeras DEX |
| BONK | DezXAZ8z...B263 | 5 | 5 | La memecoin oficial de Solana |

Pitches completos en `lib/tokens.ts`.

---

## 12. Carlos AI — System prompt

Archivo: `lib/carlos-prompt.ts`. Ya creado, sin cambios mayores. Punto adicional para v2:

**Carlos contextualiza por pantalla.** Cuando el usuario abre el chat desde `/cambiar`, Carlos sabe que está en Cambiar y puede sugerir tokens. Cuando lo abre desde `/guardar`, recomienda estrategias. El frontend pasa `currentScreen` en el request.

```ts
// app/api/carlos/route.ts
const result = await chat.sendMessage(
  `[contexto: usuario está en pantalla ${currentScreen}]\n\n${userMessage}`
);
```

---

## 13. Endpoints externos — referencia técnica

### Jupiter v6 (módulo Cambiar)

```http
GET https://quote-api.jup.ag/v6/quote
  ?inputMint=<MINT>
  &outputMint=<MINT>
  &amount=<RAW>
  &slippageBps=50
  &platformFeeBps=50
  &swapMode=ExactIn
```

```http
POST https://quote-api.jup.ag/v6/swap
{
  "quoteResponse": <quote>,
  "userPublicKey": "<usuario>",
  "feeAccount": "<ATA Tropico para outputMint>",
  "wrapAndUnwrapSol": true,
  "dynamicComputeUnitLimit": true,
  "prioritizationFeeLamports": "auto"
}
```

### Solana Pay URL (módulos Enviar y Cobrar)

```ts
// Generar URL de cobro
const url = new URL("solana:");
url.searchParams.set("recipient", recipientPubkey);
url.searchParams.set("amount", amountInToken);
url.searchParams.set("spl-token", USDC_MINT);
url.searchParams.set("reference", referencePubkey); // para tracking
url.searchParams.set("label", "Tropico");
url.searchParams.set("message", "Cobro de USDC vía Tropico");
// → solana:RECIPIENT?amount=10&spl-token=...&reference=...
```

Para escuchar el pago:
```ts
import { findReference } from "@solana/pay";
const sig = await findReference(connection, referencePubkey, { finality: "confirmed" });
```

### Yield (módulo Guardar)

Para mSOL: usar Jupiter route con inputMint=USDC, outputMint=mSOL_MINT. La conversión automática.

Para Kamino vault: el SDK oficial es `@kamino-finance/klend-sdk`. Para MVP usamos un **stub UI**: muestra "Activar mSOL" → simula activación → muestra "Tu USDC está generando 7%". Sin transacción real.

### ve.dolarapi.com

```http
GET https://ve.dolarapi.com/v1/dolares
```

Devuelve array con `{fuente: "paralelo", promedio: 650.51}` y `{fuente: "oficial", promedio: 499.86}`. Tropico usa paralelo.

### Gemini 2.0 Flash (Carlos)

```ts
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: CARLOS_SYSTEM_PROMPT,
});
const chat = model.startChat({ history });
const result = await chat.sendMessage(`[pantalla: ${currentScreen}] ${userMessage}`);
```

### Privy config

```ts
<PrivyProvider
  appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
  config={{
    appearance: { theme: "dark", accentColor: "#9945FF", logo: "/icons/tropico.svg" },
    loginMethods: ["email", "google", "wallet"],
    embeddedWallets: { createOnLogin: "users-without-wallets", requireUserPasswordOnCreate: false },
    solanaClusters: [{ name: "mainnet-beta", rpcUrl: process.env.NEXT_PUBLIC_HELIUS_RPC! }],
  }}
>
```

---

## 14. Timeline de 48 horas (revisado v3 — Cobrar elevado a crítico)

| Bloque | Hrs | Tarea | Estado |
|---|---|---|---|
| 1 | 0–4 | Foundation: Next.js + deps + providers + Tailwind | ✅ Hecho |
| 2 | 4–7 | Privy + WalletButton + onboarding 3-step | Pendiente |
| 3 | 7–10 | Home con saldo + yield default ON + 5 ModuleCards + BalanceList | Pendiente |
| 4 | 10–18 | **Cambiar full**: Jupiter Quote + Swap real + fee account | Pendiente (CRÍTICO 1) |
| 5 | 18–24 | **Cobrar full**: QR Solana Pay real + listener + 1% fee al merchant | Pendiente (CRÍTICO 2) |
| 6 | 24–28 | **Carlos full**: chat UI + Gemini API + system prompt + context de pantalla | Pendiente (CRÍTICO 3) |
| 7 | 28–32 | Landing `/comercios` (merchant onboarding) + comparativa fees + form afiliación | Pendiente |
| 8 | 32–35 | **Enviar UI** + Solana Pay URL + claim link via WhatsApp | Pendiente |
| 9 | 35–38 | **Guardar UI** + dashboard de yield acumulado + estrategias visibles | Pendiente |
| 10 | 38–42 | Polish: animaciones, copy venezolano, banners de confianza, link Solscan público | Pendiente |
| 11 | 42–46 | Deploy a Vercel + grabar demo (5 min mostrando red económica) | Pendiente |
| 12 | 46–48 | Pitch deck + README + buffer | Pendiente |

**Reglas de hierro (no negociables):**
- Si en hora 36 algo está roto, se corta.
- Demo grabado a hora 44 mínimo.
- Si Privy falla, fallback a solo Phantom.
- **Los 3 críticos (Cambiar / Cobrar / Carlos) son innegociables.** Si alguno no está al 100% en hora 28, dedicar todo el tiempo restante a ese antes de tocar Enviar/Guardar.
- Nunca empezar features nuevas después de hora 30.

**Plan de fallback graduado v3:**
- Si vamos atrasados a hora 28: corta `/comercios` landing (lo metés en pitch deck como "next sprint").
- Si vamos atrasados a hora 32: corta Enviar.
- Si vamos atrasados a hora 35: corta Guardar (queda yield default ON visible en home pero sin pantalla dedicada).
- En el peor caso queda: Foundation + Auth + Home + Cambiar + Cobrar + Carlos. **Tropico Lite — la red económica mínima viable.** Es suficiente para demo.

**Por qué Cobrar es ahora crítico:**
Sin Cobrar funcional, no hay red económica — solo otra wallet. El demo debe mostrar el flujo completo de la red: usuario logueado paga a "comercio" simulado via QR, settlement <1s, fee 1% verificable on-chain, balance del comercio cargado en su wallet de demo. Eso es la magia que no vende ninguna otra app.

---

## 15. Pitch script — 4 minutos para los jueces

| Tiempo | Sección | Contenido |
|---|---|---|
| 0:00–0:30 | Problema sistémico | "El venezolano paga 4.5% en POS tradicional, sus ahorros pierden 3% al año contra la inflación USD, y el bolívar se devalúa entre la venta y el cierre del día. Las apps en español son custodias y solo guardan dólares. Nadie le devuelve el control sobre su economía." |
| 0:30–1:00 | La visión: Red Tropico | "Tropico no es una wallet más. Es **la red económica del venezolano**. Dos productos integrados: Tropico Wallet (consumidor) y Tropico Comercios (merchant). Cuando ambos están dentro, el dinero gira en USDC sin tocar el bolívar ni el banco. Yield default. Settlement <1s. 60% más barato que Visa." |
| 1:00–1:30 | Demo lado consumidor | Login con Google → Privy crea wallet en 15s → home: "Saldo $50 USDC · Yield acumulado $0.21 esta semana · 5.2% APY". Sin botones de "activar" — el yield está ON por default. |
| 1:30–2:00 | Demo Cambiar (revenue 1) | SOL → JTO $10 → Jupiter quote → "Comisión Tropico 0.5%" → confirmo → split screen: Solscan muestra fee aterrizando en mi wallet. **Revenue real desde el primer swap.** |
| 2:00–2:45 | Demo Cobrar — el momento red económica | Abro otra ventana como **comercio "Panadería La Esquina"** → escaneo el QR como cliente → confirmo $5 USDC → split screen: cliente ve "-$5 + $0.05 cashback", comercio ve "+$4.95" en <1s, Tropico ve "+$0.05" en su fee account. **Esto es lo que ningún POS hace en 1 segundo.** |
| 2:45–3:10 | Demo Carlos | "Carlos, ¿por qué tengo yield si no activé nada?" → respuesta en español venezolano explicando que el yield es default, en <2s. |
| 3:10–3:30 | Demo `/comercios` | Pestaña merchant: comparativa visual "Banesco te cobra 4.5%, Tropico 1%. Por cada $1.000 vendidos, te ahorrás $35/mes". Form de afiliación. Logo "Acepta Tropico" descargable. |
| 3:30–4:00 | Modelo + visión | "5 streams: 0.5% swap + 0.3% send + 2% del yield + 1% merchant + Card 1.5% Q4. Mes 1: 1k usuarios + 20 comercios = $1.5k MRR. Mes 12: 50k + 2k = $250k MRR. Volumen $44M/mes. Q3: on-ramp real. Q4: Tropico Card. Q1 2027: LATAM. Pregunta a la jury." |

---

## 16. Verification — checklist pre-submit

### Funcional crítico (DEBE funcionar)

- [ ] `npm run dev` y `npm run build` sin errores
- [ ] Login con Privy (email + Google) crea wallet
- [ ] Login con Phantom (fallback) funciona
- [ ] /home muestra balances reales
- [ ] /cambiar genera quote en <2s y ejecuta swap real en mainnet
- [ ] **Verificar en Solscan que la fee de 0.5% llegó al feeAccount de Tropico** ⭐
- [ ] /carlos responde en español venezolano en <3s con contexto de pantalla
- [ ] /api/precio-bs devuelve tasa real

### Funcional UI-only (UI completa, simulación honesta)

- [ ] /enviar genera URL Solana Pay válida y QR
- [ ] /enviar comparte por WhatsApp deep link
- [ ] /claim/[id] renderiza la pantalla de receptor (mock)
- [ ] /guardar muestra 3 estrategias con APYs
- [ ] /guardar toggle "Activar" muestra modal "Próximo sprint"
- [ ] /cobrar genera QR Solana Pay con monto correcto
- [ ] /cobrar muestra estado "esperando pago" + botón "Simular pago" para demo

### UX/UI

- [ ] DualPrice (USD + bs) en todas las pantallas con valores
- [ ] Cero copy en inglés (excepto nombres tokens y "swap")
- [ ] Animaciones fade-up en mounts
- [ ] Loading states en swap, send, carlos
- [ ] Error states claros
- [ ] Mobile-first: todo funciona en 360px ancho
- [ ] PWA instalable en Android

### Seguridad

- [ ] `.env.local` en `.gitignore`
- [ ] API keys secretas SOLO en `app/api/*`
- [ ] Privy maneja firma, no Tropico
- [ ] Tropico NUNCA accede a llaves privadas

### Submit

- [ ] Demo grabado (5 min) en YouTube unlisted
- [ ] README.md completo
- [ ] Pitch deck (5 slides) en Google Slides público
- [ ] Repo público en GitHub con licencia MIT
- [ ] Deploy live en Vercel
- [ ] Wallet de fees con al menos 1 swap demo recibido (Solscan link)
- [ ] Form del hackathon completado

---

## 17. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Privy se complica | Media | Alto | Fallback total a wallet adapter (Phantom) |
| Jupiter rechaza fee account | Baja | Medio | Pre-crear ATAs para múltiples mints |
| Helius rate-limit | Baja | Medio | Free tier 100k/mes; fallback `api.mainnet-beta.solana.com` |
| Carlos opina de política | Baja | Alto | System prompt con regla 4 explícita; pruebas pre-pitch |
| Gemini API down | Baja | Medio | Demo grabado de respaldo |
| ve.dolarapi.com cae | Baja | Bajo | Cache 60s + fallback localStorage |
| API key se filtra | Media | Crítico | Solo `.env.local` server-only |
| Wallet de fees compromete | Baja | Crítico | Wallet DEDICADA, backup seed offline |
| WiFi inestable en pitch | Media | Alto | Demo grabado obligatorio + 4G tethering |
| **Scope creep con 5 módulos** | **Alta** | **Alto** | **Plan de fallback graduado (sección 14)** |
| Solana Pay URL no funciona en wallet del cliente | Media | Medio | Probar con Phantom + Solflare antes; tener backup `solanapay.com` parser |
| Claim link sin wallet del receptor | Alta | Medio | UI honesta: "demo del flujo, en producción incluye claim signing" |

---

## 18. Out of scope (NO hacer en 48h)

- Programa Anchor custom
- Backend persistente / DB / autenticación social custom
- KYC / verificación de identidad
- On-ramp real con dinero (solo stub en /depositar y banner en /home)
- Off-ramp (sacar a bs) — solo se simula
- Mobile app nativa (PWA suficiente)
- Carlos como agente autónomo (Q4 roadmap)
- i18n — solo es-VE
- Pruebas automáticas
- Multi-wallet por usuario
- Yield real con tx en cadena (solo simulación en /guardar)
- Listener real de pagos en /cobrar (solo simulación)
- Claim signing real con escrow (solo simulación en /enviar)

Si te sobra tiempo en hora 42+: agregar tokens, mejorar animación de swap success, voz a Carlos. **Nunca empezar features nuevas después de hora 30.**

---

## 19. Comandos referencia rápida

```bash
# Dev
npm run dev                                      # localhost:3000
npm run build && npm start                       # prod

# Solana CLI
solana-keygen new -o ~/.config/solana/tropico-fees.json
solana config set --keypair ~/.config/solana/tropico-fees.json
solana config set --url mainnet-beta
spl-token create-account <MINT>
spl-token accounts                               # listar ATAs

# Devnet (testing)
solana config set --url devnet
solana airdrop 5

# Vercel
npx vercel                                       # preview
npx vercel --prod                                # prod

# rtk
rtk init -g                                      # global

# Verificar fees
solana balance <FEE_OWNER>
spl-token balance --address <FEE_ATA_USDC>
```

---

## 20. Cómo usar este brief con una herramienta IA

### Prompt de arranque sugerido

> "Estás construyendo Tropico — el sistema operativo financiero del venezolano en Solana. Una webapp PWA con 5 módulos integrados (Cambiar, Enviar, Guardar, Cobrar, Carlos) y 5 streams de revenue. Tu trabajo es seguir el brief adjunto al pie de la letra: stack exacto, branding, copy en español venezolano, arquitectura de carpetas, modelo de negocio multi-stream, y decisiones técnicas (cero programa Anchor custom).
>
> Tienes 48 horas, eres junior con primera vez en Solana, trabajas solo. Priorizá demo funcional sobre completitud técnica. Construí en este orden: 1) foundation y landing, 2) Privy login, 3) home con 5 módulos visibles, 4) **Cambiar funcional** (módulo crítico), 5) **Carlos funcional** (módulo crítico), 6) Enviar UI-only, 7) Guardar UI-only, 8) Cobrar UI-only, 9) polish, 10) deploy + demo, 11) pitch deck.
>
> Reglas no negociables:
> - Cero código Rust/Anchor
> - Mobile-first; mostrar bs equivalentes en cada precio
> - Carlos jamás opina de política, jamás promete rendimientos
> - Comisión 0.5% transparente al usuario via Jupiter `platformFeeBps=50`
> - Non-custodial estricto
> - Solana Maxi branding
> - **Cambiar y Carlos son 100% funcionales; Enviar/Guardar/Cobrar son UI-completa con simulación honesta** (admitir en UI que es demo)
> - Plan de fallback graduado: si vamos atrasados, cortar módulos UI-only ANTES que romper Cambiar o Carlos
>
> Si algo del brief contradice una decisión, alertame antes de proceder. No inventes deps ni endpoints — usa exactamente los listados."

### Archivos a adjuntar a la herramienta IA

1. Este archivo: `docs/TROPICO_BRIEF.md`
2. `docs/ROADMAP.md` (visión long-term)
3. `lib/tokens.ts` (catálogo)
4. `lib/carlos-prompt.ts` (voz)
5. `package.json` (deps exactas)

---

## 21. Estado actual de archivos

### ✅ Hechos
- Configs: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `.gitignore`
- App base: `app/layout.tsx`, `app/globals.css`, `app/providers.tsx`, `app/page.tsx`, `app/descubrir/page.tsx`
- API: `app/api/precio-bs/route.ts`
- Lib: `lib/tokens.ts`, `lib/formato.ts`, `lib/precio-bs.ts`, `lib/jupiter.ts`, `lib/carlos-prompt.ts`
- Components: `components/DualPrice.tsx`, `components/TokenCard.tsx`
- Public: `public/manifest.json`
- Docs: `docs/TROPICO_BRIEF.md` (este archivo), `docs/ROADMAP.md`

### 🟡 Pendientes (a crear durante el sprint)

**Lib:**
- `lib/balances.ts` — leer SPL token accounts del usuario
- `lib/solana.ts` — connection helper
- `lib/solana-pay.ts` — URL builder + claim helpers
- `lib/yield.ts` — strategies stub
- `lib/claim-store.ts` — localStorage de claim links

**Pages (módulos):**
- `app/home/page.tsx` — dashboard 5 módulos
- `app/cambiar/page.tsx` — swap completo
- `app/enviar/page.tsx` — send con claim link
- `app/guardar/page.tsx` — yield UI
- `app/cobrar/page.tsx` — QR receive
- `app/carlos/page.tsx` — chat
- `app/claim/[id]/page.tsx` — claim receiver
- `app/depositar/page.tsx` — onramp stub

**API routes:**
- `app/api/carlos/route.ts` — Gemini proxy

**Components:**
- `components/AuthButton.tsx`
- `components/ModuleCard.tsx`
- `components/BalanceList.tsx`
- `components/SwapForm.tsx`
- `components/SendForm.tsx`
- `components/SaveDashboard.tsx`
- `components/ReceiveQR.tsx`
- `components/ChatCarlos.tsx`
- `components/ClaimLinkShare.tsx`
- `components/BannerOnRamp.tsx`

**Public:**
- `public/icons/icon-192.png`, `icon-512.png`, `tropico.svg`

**Docs adicionales:**
- `docs/architecture.md`
- `docs/pitch-script.md`
- `docs/demo-checklist.md`
- `README.md` (raíz)

---

---

## 23. Capa agéntica — Lumen (motor) + OpenClaw (firma autónoma)

Tropico extiende a Carlos AI con un **Modo Agente** que permite al usuario delegar acciones autónomas con permisos limitados, **sin violar el principio non-custodial**. Arquitectura final: **Lumen como motor agéntico principal** + **OpenClaw + Privy** como capa de firma autónoma.

### Por qué Lumen (sobre Hermes / Gemini directo)

Lumen es un framework open-source (MIT, Python, repo `gabogabucho/lumen-agent`) que organiza al agente en 3 capas:
- **Personality** (`personality.yaml`) — quién es Carlos, cómo habla, qué reglas sigue
- **Skills** (markdown) — qué puede hacer, qué scripts usar
- **Capabilities** (Python scripts) — la ejecución concreta

| Criterio | Gemini directo | Hermes (Nous) | **Lumen** |
|---|---|---|---|
| Personality YAML editable | ❌ Hardcoded | ✅ | ✅ |
| Skills/capabilities pattern | ❌ | ✅ | ✅ |
| Memoria persistente | ❌ Stateless | ✅ | ✅ SQLite + FTS5 |
| Multi-platform (WhatsApp/TG) | ❌ | ⚠️ Limitado | ✅ Built-in |
| Solana wallet ops | ❌ | ❌ Solo lectura | ✅ Vía custom scripts |
| Cambiar de LLM | Reescribir | Reescribir | Cambiar 1 línea YAML |
| Hot reload sin restart | ❌ | ❌ | ✅ POST `/api/reload` |
| Encaje con principio open-source de Tropico | ⚠️ Closed | ✅ | ✅ |

**Decisión: Lumen es el motor agéntico principal.** OpenClaw queda como capa de FIRMA AUTÓNOMA cuando Lumen decide ejecutar una tx en Modo Agente.

### Arquitectura Carlos AI con Lumen

```
┌────────────────────────── CARLOS AI ──────────────────────────────┐
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Lumen Server (Python, port 3099)                            │ │
│  │  ┌─────────────────┐  ┌────────────────────────────────────┐ │ │
│  │  │ personality.yaml│  │ 7 Skills Tropico                   │ │ │
│  │  │ Carlos venezolano│  │ - prices, balances, swap, pay    │ │ │
│  │  │ + reglas + know.│  │ - yield, cashback, agent-actions │ │ │
│  │  └─────────────────┘  └────────────────────────────────────┘ │ │
│  │           │                       │                          │ │
│  │           └────────► LLM (LiteLLM: DeepSeek-V4 default) ◄────┘ │
│  │                                   │                          │ │
│  │                                   ▼                          │ │
│  │  ┌────────────────────────────────────────────────────────┐  │ │
│  │  │ Capabilities (Python scripts, terminal connector)      │  │ │
│  │  │ ./lumen-capabilities/{prices,swap,balances,...}        │  │ │
│  │  │ → Solana RPC, Jupiter v6, ve.dolarapi.com, Solana Pay │  │ │
│  │  └────────────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                   │                               │
│                                   ▼ (solo para Modo Agente)       │
│             ┌─────────────────────────────────┐                   │
│             │  OpenClaw skill (ClawHub)       │                   │
│             │  policy engine + delegated key  │                   │
│             └─────────────────────────────────┘                   │
│                                   │                               │
│                                   ▼                               │
│                  ┌─────────────────────────────┐                  │
│                  │  Privy MPC delegated keys   │                  │
│                  │  (server-side, expira 1h)   │                  │
│                  └─────────────────────────────┘                  │
└───────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                       ┌────────────────────────┐
                       │  Solana mainnet (USDC) │
                       └────────────────────────┘
```

### Roles de cada componente

**Lumen** = el motor agéntico completo:
- Personality (`personality.yaml`) — Carlos venezolano, no-política, no-garantías
- 7 Skills documentadas (`SKILL.md`) — qué puede hacer
- Capabilities (Python scripts) — ejecución de queries reales (precios, balances, quotes)
- LLM agnóstico vía LiteLLM (DeepSeek default, fallback Gemini/Claude)
- Memoria persistente SQLite + FTS5
- Multi-platform: web, Telegram, WhatsApp, Discord (Q4)
- Hot reload sin restart

**OpenClaw + Privy** = la capa de firma autónoma (solo Modo Agente):
- Session keys delegadas (1h default, max 24h)
- Policy engine pre-tx (max amount, frequency, time window)
- Ejecución de tx on-chain
- Llaves NUNCA en prompts ni memoria

**Cero programa Anchor custom. Todo open-source.**

### Estado MVP (sprint actual)

✅ **Listos**:
- `lumen-kit/kit/` con `module.yaml` + `personality.yaml`
- `lumen-kit/skills/` con 7 skills documentadas (prices, balances, swap, pay, yield, cashback, agent-actions)
- `lumen-capabilities/` con 3 scripts Python ejecutables y verificados con datos reales:
  - `precio_bs.py` → Bs. paralelo + oficial vía ve.dolarapi.com
  - `precio_usd.py` → USD price vía Jupiter Price API v3
  - `jupiter_quote.py` → quote real con `platformFeeBps=50` confirmado on-chain
- `docs/LUMEN_INTEGRATION.md` con setup completo, deployment guide, FAQ

⏳ **Pendiente post-MVP** (~10-12h de scripts + 8-12h de OpenClaw integration):
- 16 scripts capabilities adicionales (balances, pay, yield, cashback, agent-actions)
- Setup Lumen server en VPS
- Reemplazar `app/api/carlos/route.ts` (actualmente Gemini directo) por proxy a Lumen
- ClawHub registration + Privy policy engine
- Auditoría externa antes de mainnet

### Pitch frase

> "Carlos corre sobre **Lumen** — un framework agéntico open-source. Lumen tiene personality YAML editable, skills curadas, y ejecuta scripts Python que consultan Solana real-time. Para firmas autónomas en Modo Agente, **OpenClaw + Privy delegated keys** validan policy y firman. Tres tecnologías open-source non-custodiales, trabajando juntas: el motor, la firma, y el chain."

### Las 4 acciones agentic

Cada acción tiene: descripción al usuario, configuración, policy en producción, trigger, simulación demo MVP.

#### 1. DCA semanal
- **Usuario**: "Compra $50 de SOL cada lunes 10:00."
- **Policy**: max $200/semana, max $50 por ejecución
- **Trigger producción**: cron semanal
- **Demo MVP**: card en home con "Próximo DCA: lunes 10:00 — $50 USDC → SOL", botón "Ejecutar ahora" abre `/cambiar` con parámetros pre-llenados (ejecuta tx real)

#### 2. Auto-yield al recibir remesa
- **Usuario**: "Cuando reciba más de $50, mové el 70% a Save."
- **Policy**: max 1× por día, solo si saldo USDC > umbral
- **Trigger producción**: webhook on-chain del wallet
- **Demo MVP**: simular transfer entrante → push "Recibiste $200, Carlos sugiere mover $150 a Save" → confirmación

#### 3. Auto-cashback claim
- **Usuario**: "Reclama automático mi cashback acumulado cada semana."
- **Policy**: max $50 por claim, cooldown 24h
- **Trigger producción**: cron semanal
- **Demo MVP**: card "Tienes $3.20 acumulado en 4 comercios. [Reclamar ahora]" con animación de éxito

#### 4. Re-balance de portafolio
- **Usuario**: "Si JTO sube >20% en 7 días, vende 10% a USDC."
- **Policy**: max 50% del holding, max 1 rebalance/token/semana
- **Trigger producción**: poll de precios cada 15min
- **Demo MVP**: card "JTO subió 22% en 7 días. Carlos sugiere vender 10% (~$8) a USDC. [Confirmar]" → ejecuta swap real vía Cambiar

### Arquitectura técnica

```
┌─────────────┐   ┌──────────────────┐   ┌─────────────────┐
│  Browser    │   │  Tropico server  │   │  OpenClaw +     │
│  (Carlos    │──▶│  /api/agent/*    │──▶│  Privy skill    │
│   Modo      │   │  (Next.js)       │   │  (ClawHub)      │
│   Agente UI)│   └──────────────────┘   └─────────────────┘
│             │                                  │
└─────────────┘                                  ▼
                                          ┌─────────────────┐
                                          │  Privy MPC +    │
                                          │  Policy Engine  │
                                          │  (server-side)  │
                                          └─────────────────┘
                                                  │
                                                  ▼
                                          ┌─────────────────┐
                                          │  Solana mainnet │
                                          └─────────────────┘
```

**Reglas de seguridad (no negociables)**:
- Las llaves del usuario NUNCA en prompts, NUNCA en memoria de Carlos
- Toda tx pasa por policy engine ANTES de ejecutarse
- Sesiones de agente expiran en 1h por defecto, 24h máximo
- Usuario puede revocar cualquier sesión en tiempo real
- Cada acción ejecutada queda en histórico auditable

### Estado MVP vs producción

**MVP (48h hackathon)**:
- UI completa de `/carlos/agente` con toggle, 4 cards, configuración, histórico
- Ejecución **simulada** (un click manual desde UI dispara la "ejecución")
- Pitch lo vende como "showcase del flow final, integración real Q3"

**Producción (Q3 2026)**:
- Server-side `/api/agent/*` routes
- OpenClaw skill API real (registro en ClawHub)
- Privy delegated session keys con policy engine
- Cron jobs en Vercel Cron / Cloudflare Workers
- Webhook listener Helius para deposit detection
- Auditoría externa antes de mainnet
- Bug bounty público

### Frase clave en pitch

> "El Modo Agente está conectado a OpenClaw + Privy en producción Q3. Hoy ves la UX final ejecutada manualmente por demo."

---

## 24. Tropico Claude Code Skills

Skills especializadas de Claude Code creadas en `.claude/skills/tropico-*` que aceleran el desarrollo del proyecto y sirven de capa de conocimiento curada para futuros devs (humanos o agentes).

### Las 6 skills

| Skill | Cuándo se invoca | Qué cubre |
|---|---|---|
| `tropico-architecture` | Cualquier archivo Tropico, mención de "Red Tropico" o los 5 módulos | Visión general, principios non-custodial, los 4 pilares de confianza, estructura de carpetas, stack |
| `tropico-jupiter-fees` | Edits a `lib/jupiter.ts`, `app/cambiar/`, swaps, slippage | platformFeeBps=50, fee account ATAs, request/response Jupiter v6, errores comunes, verificación on-chain |
| `tropico-solana-pay` | Edits a `app/cobrar/`, `app/enviar/`, `app/claim/`, QR codes | URL spec Solana Pay, reference tracking, findReference listener, claim links, WhatsApp deep links |
| `tropico-carlos-prompts` | Edits a `lib/carlos-prompt.ts`, `app/carlos/`, prompt engineering | Reglas de voz venezolana, prohibidos, 4 acciones agentic, context injection por pantalla |
| `tropico-design-system` | Cualquier componente UI, edits a `components/`, `app/`, `tailwind.config.ts` | Paleta Tropico, tipografía, gradientes por módulo, animations, voice/copy, mobile-first |
| `tropico-merchant-onboarding` | Edits a `app/comercios/`, dashboards merchant, copy para María | Persona María, comparativa vs POS tradicional, form de afiliación, dashboard, branding "Acepta Tropico" |

### Cómo funcionan

Cada skill es una carpeta en `.claude/skills/tropico-*/` con un archivo `SKILL.md` que tiene frontmatter YAML (name + description). Claude Code las invoca automáticamente cuando detecta el contexto relevante (path de archivos, palabras clave, intención del usuario).

### Beneficios

1. **Aceleran dev**: Claude tiene contexto preciso sin necesidad de releer el brief entero cada vez
2. **Onboarding de devs nuevos**: cualquier dev (humano o agente) que toque el repo recibe el contexto curado al instante
3. **Single source of truth**: cuando algo cambia (ej. la fee de Jupiter), se actualiza en UN solo lugar
4. **Pitcheable**: "Tropico tiene su propia capa de skills para devs — incluso el código está optimizado para colaborar con agentes IA"

### Mantenimiento

- Cada vez que cambien las reglas de un módulo, actualizar la skill correspondiente
- Antes de cada release, revisar que las descripciones siguen siendo trigger-rich
- Si se crea un módulo nuevo, crear una skill nueva (`tropico-<modulo>`)

---

## FIN DEL BRIEF

**Esta es la fuente de verdad de Tropico.** Si algo no está aquí, no existe en el alcance del MVP. Cualquier modificación al alcance se actualiza primero acá, después en código.

**Última actualización**: 2026-05-08 (v5 — sección 23 reescrita: Lumen es el motor agéntico principal, OpenClaw queda como capa de firma autónoma para Modo Agente).
