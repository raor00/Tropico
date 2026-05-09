# Tropico — Demo Runbook (Vercel Deploy + Grabación)

> Guía paso a paso para deployar, validar, y grabar el demo de Tropico ante el jurado.
> Tiempo estimado: **15 minutos** de principio a URL live.

---

## Pre-requisitos

- Cuenta en [vercel.com](https://vercel.com) (gratis, signup con GitHub)
- Repo pusheado en GitHub — `https://github.com/raor00/Tropico`
- Node.js 20+ instalado localmente (`node -v` debe decir `v20.x`)
- Vercel CLI instalado:

```bash
npm install -g vercel@latest
vercel --version   # debe imprimir 39.x o superior
```

- (Opcional) Las API keys de la sección Step 2

---

## Step 1: Conectar repo a Vercel (dashboard, ~5 min)

**Opción A — Dashboard visual (recomendada para primer deploy):**

1. Ve a https://vercel.com/new
2. Click **"Import Git Repository"** → conectá con GitHub si te lo pide
3. Seleccioná el repo `raor00/Tropico`
4. Vercel detecta Next.js automáticamente:
   - **Framework Preset**: Next.js ✓ (no cambia nada)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. **NO hagas Deploy todavía** — primero configurá las env vars (Step 2)

**Opción B — CLI:**

```bash
cd /Users/Jefemac/Documents/GitHub/Hackathon
vercel login         # abre el browser, autenticá con GitHub
vercel               # sigue los prompts con los defaults
```

Cuando pregunte `Link to existing project? [y/N]` → `n` (primera vez)
Cuando pregunte el nombre → `tropico`

---

## Step 2: Configurar variables de entorno

> La app funciona SIN estas keys (cae a fallback inteligente), pero con ellas la experiencia es completa.

### Variables — dónde conseguirlas

| Variable | Dónde conseguirla | Urgencia para demo |
|---|---|---|
| `NEXT_PUBLIC_PRIVY_APP_ID` | [dashboard.privy.io](https://dashboard.privy.io) → New App → "App ID" en Settings | ALTA — sin esto la wallet conecta en modo mock |
| `NEXT_PUBLIC_HELIUS_RPC` | [helius.dev](https://www.helius.dev) → Free tier → copia la URL con `?api-key=...` | ALTA — fallback usa RPC público lento |
| `DEEPSEEK_API_KEY` | [platform.deepseek.com](https://platform.deepseek.com) → API keys | MEDIA — sin esto Carlos usa fallback con respuestas pre-armadas |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) → "Get API key" | BAJA — segundo fallback si DeepSeek no disponible |
| `NEXT_PUBLIC_TROPICO_TREASURY` | Wallet pubkey para fees — `solana-keygen pubkey ~/.config/solana/tropico.json` | BAJA — Jupiter corre sin fees si no está |

### Agregar variables en dashboard Vercel

1. Tu proyecto → tab **Settings** → **Environment Variables**
2. Agregar cada una marcando los tres environments (Production, Preview, Development)
3. Mínimo viable para demo:

```
NEXT_PUBLIC_SOLANA_CLUSTER=mainnet-beta
NEXT_PUBLIC_HELIUS_RPC=https://mainnet.helius-rpc.com/?api-key=TU_KEY
NEXT_PUBLIC_BASE_URL=https://tropico-tu-usuario.vercel.app
NEXT_PUBLIC_PRIVY_APP_ID=TU_PRIVY_APP_ID
```

### Agregar variables via CLI

```bash
vercel env add NEXT_PUBLIC_PRIVY_APP_ID production
# pega el valor cuando te lo pide — no se ve en pantalla (seguro)

vercel env add NEXT_PUBLIC_HELIUS_RPC production
# repite para cada var
```

> Despues de agregar variables siempre hace falta un nuevo deploy para que tengan efecto.

---

## Step 3: Deploy

**Desde CLI:**

```bash
# Preview (URL temporal, buena para testear antes)
vercel

# Produccion (URL estable, esta es la que compartis con el jurado)
vercel --prod
```

El output debe terminar en algo como:

```
✅  Production: https://tropico-tu-usuario.vercel.app [3s]
```

**Desde dashboard:** despues de agregar las env vars → tu proyecto → click **Redeploy**

> Build time esperado: ~2-3 min. El bundle de Tropico compila en ~36 segundos localmente.

---

## Step 4: Smoke test de rutas criticas (5 min)

Copia esta URL base y ejecutá el test:

```bash
BASE=https://tropico-tu-usuario.vercel.app

for r in / /home /cambiar /cobrar /enviar /guardar /depositar \
          /comercios /carlos /carlos/agente /descubrir \
          /pagar-servicios /remesas /intercambio-p2p \
          /integraciones /wallet/crear /wallet/abrir; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$BASE$r")
  echo "$code  $r"
done

# API routes
curl -s "$BASE/api/carlos" | python3 -m json.tool | head -10
curl -s -X POST "$BASE/api/checkout/create" \
  -H "Content-Type: application/json" \
  -d '{"amount":5,"currency":"USDC","reference":"test-123","label":"Test Merchant"}' \
  | python3 -m json.tool | head -10
```

Resultado esperado: 17x `200` para rutas + JSON válido para APIs.

### Checklist visual post-deploy

- [ ] `/home` — DualPrice muestra USD + Bs (valores reales o mock si sin Helius)
- [ ] `/cambiar` — quote de Jupiter carga en <3 segundos
- [ ] `/cobrar` — QR se genera correctamente
- [ ] `/carlos` — chat responde (fallback o LLM real)
- [ ] `/carlos/agente` — toggles de Modo Agente visibles
- [ ] `/comercios` — landing de merchants carga
- [ ] PWA installable en mobile: abrí la URL en Chrome Android → "Instalar Tropico"
- [ ] 0 errores en DevTools Console

---

## Step 5: Custom domain (opcional, ~10 min)

Si tenes un dominio propio (ej. `tropico.app`):

1. En Vercel dashboard → tu proyecto → **Settings** → **Domains** → "Add"
2. Escribí tu dominio → Vercel te muestra los DNS records
3. En tu registrar (Namecheap / Cloudflare / etc), configurá:
   - `A` record: `76.76.21.21`
   - `CNAME www`: `cname.vercel-dns.com`
4. Esperá propagación (5 min si es Cloudflare, hasta 24h en otros)
5. Vercel emite SSL automático — no hace falta configurar nada más

Dominios baratos en pesos VE: Namecheap tiene `.app` desde $14/año.

---

## Step 6: Setup wallet demo para grabar

**Opcion A — Phantom en devnet (gratis, recomendada para hackathon):**

```bash
# Airdrops de SOL devnet para tener gas:
solana airdrop 2 TU_WALLET_PUBKEY --url devnet

# Obtener USDC devnet via faucet:
# https://faucet.circle.com — seleccioná Solana Devnet
# Pone tu address Phantom devnet → te manda 10 USDC de prueba

# En Vercel, cambiar cluster a devnet antes de grabar:
NEXT_PUBLIC_SOLANA_CLUSTER=devnet
NEXT_PUBLIC_HELIUS_RPC=https://devnet.helius-rpc.com/?api-key=TU_KEY
```

**Opcion B — Mainnet con saldo real (mas impresionante para el jurado):**

1. Phantom wallet → Network: Mainnet Beta
2. Comprar $5 USDC via MoonPay o Coinbase → enviar a tu address Phantom
3. Tener ~0.01 SOL para gas (llega con $0.10)

> Para el demo, devnet es suficiente. Muestra las mismas UI flows sin riesgo de perder plata real.

---

## Step 7: Setup browser para grabar

**Configuracion de Chrome:**

```bash
# Abrir Chrome en modo incognito (perfil limpio, sin extensiones que distraigan)
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --incognito \
  --window-size=1440,900 \
  --disable-extensions \
  "https://tropico-tu-usuario.vercel.app"
```

**5 tabs a tener abiertas en orden de demo:**

| # | URL | Qué muestra |
|---|---|---|
| 1 | `/home` | Dashboard con balances y DualPrice USD/Bs |
| 2 | `/cambiar` | Jupiter swap con cotizacion en vivo |
| 3 | `/cobrar` | QR generator + Solana Pay |
| 4 | `/carlos/agente` | Modo Agente con los 4 toggles |
| 5 | `/comercios` | Landing de merchants |

**Viewport recomendado para pitch:** 1440x900 (desktop, el jurado verá bien sin scroll lateral)

**Para mostrar mobile experience:**

- DevTools → Toggle device toolbar → iPhone 14 Pro o Pixel 7
- O abrí en un telefono Android real con el URL live

**Devtools preparados:**

- F12 abierto en Console — demostrar 0 errores durante el demo
- Network tab filtrado por "XHR" — para mostrar que `/api/carlos` responde

---

## Step 8: Grabar con OBS

**Settings recomendados:**

- Video: 1920x1080 @ 60fps
- Encoder: x264, CRF 18 (calidad alta)
- Audio: Desktop audio 100% (captura el browser)
- Bitrate: 8000 kbps para local, 4500 kbps para stream

**Scene setup en OBS:**

```
Scene: Tropico Demo
  - Display Capture (o Window Capture → Google Chrome)
  - Audio Input Capture (micrófono) — niveles al 70%
  - Overlay: no usar, el UI de Tropico ya es suficientemente visual
```

**Duración target del video:** 4-5 minutos

**Script de flujo (en orden):**

1. **0:00-0:30** — Abrir `/home`, explicar DualPrice USD/Bs y el concepto
2. **0:30-1:30** — `/cambiar` — hacer un quote de swap SOL→USDC, explicar Jupiter + fee de Tropico
3. **1:30-2:15** — `/cobrar` — generar QR con monto, escanear con el celular
4. **2:15-3:00** — `/carlos` — hacer 2-3 preguntas a Carlos/Lumen (yield, swap, precio del dólar)
5. **3:00-3:45** — `/carlos/agente` — mostrar los 4 toggles de Modo Agente
6. **3:45-4:30** — `/comercios` — propuesta de valor para merchants

**Subir el video:**

```bash
# YouTube unlisted (recomendado — no requiere aprobacion)
# youtu.be/TU-ID
# Agregar al README: "## Demo\n[Video demo](https://youtu.be/TU-ID)"
```

---

## Plan B — Si Vercel falla

### Opcion 1: Netlify

```bash
npm install -g netlify-cli
netlify login
netlify init   # detecta Next.js automaticamente
netlify deploy --prod
```

Limitacion: SSR con Netlify requiere el plugin `@netlify/plugin-nextjs` — ya esta en el package.json.

### Opcion 2: Cloudflare Pages

1. https://pages.cloudflare.com → New project → Connect GitHub
2. Framework preset: Next.js
3. Build command: `npm run build`
4. Limitacion: no soporta Node.js runtime completo — las API routes de Carlos y checkout pueden fallar

### Opcion 3: ngrok (para demo en vivo sin deploy)

```bash
# Corre dev server local
npm run dev

# En otra terminal, expone el puerto
npx ngrok http 3000

# Te da una URL publica tipo:
# https://abc123.ngrok-free.app
```

El jurado puede acceder desde cualquier lugar mientras vos tengas el server corriendo. No usar para el submit, solo para el pitch en vivo.

### Opcion 4: Video pre-grabado

Si el deploy falla el dia del pitch:

1. Tenés el video de OBS grabado localmente
2. Subilo a YouTube unlisted o Google Drive
3. Presentá el video + "la URL live la compartimos post-evento"
4. Tenes el codigo en GitHub como prueba del trabajo

---

## Troubleshooting

### Build falla con TypeScript error

El error conocido es en `app/remesas/page.tsx:323` — `ScrollReveal` no acepta prop `id`. Fix rapido:

```tsx
// ANTES (linea 323):
<ScrollReveal direction="up" as="section" className="flex flex-col gap-6" id="flow">

// DESPUES — wrappear en section con el id:
<section id="flow">
  <ScrollReveal direction="up" as="section" className="flex flex-col gap-6">
```

Despues del fix: `git add app/remesas/page.tsx && git commit -m "fix: remove invalid id prop from ScrollReveal" && git push`

### "Module not found: pino-pretty"

Ya esta fixeado en `next.config.mjs` con webpack externals. Si re-aparece en Vercel, verificá que la version del config se pusheó.

### Hydration error en browser

Busca en Console "Hydration failed". Generalmente pasa si un componente usa `Math.random()` o `Date.now()` en render. Abrí el componente indicado y mové el valor a un `useEffect`.

### `/api/carlos` devuelve 500

Verificá en Vercel → tu deploy → Functions → `/api/carlos` → los logs. El error mas comun es `DEEPSEEK_API_KEY` mal copiada. La ruta tiene fallback — deberia devolver 200 incluso sin keys.

### QR en `/cobrar` no se genera

```bash
npm install qrcode @types/qrcode
git add package.json package-lock.json
git commit -m "fix: ensure qrcode types present"
git push
```

### Jupiter quote no carga en `/cambiar`

El endpoint es `lite-api.jup.ag/swap/v1/quote` (Lite API, no el deprecated `quote-api.jup.ag`). Si Jupiter esta down ese dia, el componente muestra "Cotizaciones no disponibles" y es esperable — no es un bug del proyecto.

### Variables de entorno no toman efecto

Despues de agregar/modificar env vars en Vercel siempre hace falta **redeploy manual**:

```bash
vercel --prod
```

O desde el dashboard → Deployments → tres puntitos → Redeploy.

---

## Links utiles

- Dashboard Vercel: https://vercel.com/dashboard
- Privy: https://dashboard.privy.io
- Helius: https://www.helius.dev
- USDC Devnet faucet: https://faucet.circle.com
- DeepSeek API: https://platform.deepseek.com
- Gemini API: https://aistudio.google.com
- Repo: https://github.com/raor00/Tropico

---

*Tu siguiente comando es: `vercel --prod`*
