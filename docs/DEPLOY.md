# Tropico — Deploy a Vercel

> Guía paso a paso para deployar Tropico a Vercel y obtener una URL live como `tropico.vercel.app` o tu dominio custom.

**Última actualización**: 2026-05-08

---

## 🎯 Resultado esperado

Al final tendrás:

1. ✅ Una URL pública tipo `https://tropico-tu-usuario.vercel.app`
2. ✅ Auto-deploy en cada push a `main`
3. ✅ HTTPS automático
4. ✅ Edge runtime (las API routes corren en CDN global)
5. ✅ Free tier — $0 costo hasta que pases 100GB bandwidth/mes

---

## 📋 Pre-requisitos

- Cuenta en [github.com](https://github.com) (free)
- Cuenta en [vercel.com](https://vercel.com) (free, signup con GitHub)
- Node.js 20+ instalado localmente
- El repo de Tropico funcionando local en `localhost:3000`

---

## 🚀 Camino 1 — Deploy via CLI (más rápido, ~5min)

### Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Paso 2: Login

```bash
vercel login
```

Te abre el browser. Autenticá con GitHub. Cierra el browser cuando diga "Success".

### Paso 3: Deploy preview (no producción todavía)

Desde el directorio del proyecto:

```bash
cd /Users/Jefemac/Documents/GitHub/Hackathon
vercel
```

Te va a preguntar:

```
? Set up and deploy "~/Documents/GitHub/Hackathon"? [Y/n] y
? Which scope do you want to deploy to? [tu-username]
? Link to existing project? [y/N] n
? What's your project's name? tropico
? In which directory is your code located? ./
? Want to modify these settings? [y/N] n
```

Espera ~2 minutos. Te imprime una URL tipo:

```
✅  Production: https://tropico-abc123.vercel.app
```

**Esa es tu preview URL.** Abrila, navega las 11 rutas, verifica que todo carga.

### Paso 4: Deploy a producción

```bash
vercel --prod
```

Esto deploya a la URL "production" — más estable, no caduca, ideal para el demo de la jury.

```
✅  Production: https://tropico-tu-usuario.vercel.app
```

**LISTO — esta es la URL que vas a usar para todo (pitch, README, demo video, form del hackathon).**

---

## 🌐 Camino 2 — Deploy via dashboard Vercel (visual, ~10min)

### Paso 1: Subir el código a GitHub

```bash
cd /Users/Jefemac/Documents/GitHub/Hackathon

# Si no es repo git todavía
git init
git add .
git commit -m "Initial commit: Tropico MVP"

# Crear repo en GitHub y conectar
gh repo create tropico --public --source=. --remote=origin --push
# (O crear desde la web de github.com y usar git remote add origin ...)
```

### Paso 2: Importar en Vercel

1. Ve a https://vercel.com/new
2. Click "Import Git Repository"
3. Selecciona tu repo `tropico`
4. Vercel detecta Next.js automáticamente
5. Framework Preset: **Next.js** (ya seleccionado)
6. Root Directory: `./`
7. Build Command: `npm run build` (default)
8. Output Directory: `.next` (default)
9. Click **Deploy**

Espera ~3 minutos. Te muestra "Congratulations" + URL live.

### Paso 3: Auto-deploy configurado

Cada vez que hagas `git push` a la branch `main`, Vercel re-deploya automáticamente. Cero esfuerzo.

---

## 🔑 Configurar variables de entorno (cuando tengas API keys)

### Opción A: Desde dashboard (visual)

1. Ve a tu proyecto en https://vercel.com/dashboard
2. Click en tu proyecto `tropico` → tab **Settings** → **Environment Variables**
3. Agregar una por una (todas las del `.env.local`):

| Key | Value | Environments |
|---|---|---|
| `NEXT_PUBLIC_PRIVY_APP_ID` | `tu-privy-app-id` | Production, Preview, Development |
| `GOOGLE_GENERATIVE_AI_API_KEY` | `tu-key-gemini` | Production, Preview |
| `NEXT_PUBLIC_HELIUS_RPC` | `https://mainnet.helius-rpc.com/?api-key=xxx` | Production |
| `HELIUS_API_KEY` | `tu-key-helius` | Production |
| `NEXT_PUBLIC_TROPICO_FEE_OWNER` | `pubkey-tu-wallet-fees` | Production |
| `NEXT_PUBLIC_TROPICO_FEE_ATA_USDC` | `ata-usdc-de-fees` | Production |
| `NEXT_PUBLIC_TROPICO_FEE_ATA_SOL` | `ata-wsol-de-fees` | Production |
| `NEXT_PUBLIC_TROPICO_FEE_ATA_USDT` | `ata-usdt-de-fees` | Production |
| `NEXT_PUBLIC_SOLANA_CLUSTER` | `mainnet-beta` | Production |

⚠️ **CRÍTICO**: las `NEXT_PUBLIC_*` se exponen al browser. Las que NO tienen prefijo (`HELIUS_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`) son secretas server-side.

### Opción B: Desde CLI

```bash
vercel env add NEXT_PUBLIC_PRIVY_APP_ID production
# pega el valor cuando te lo pida
# repetir por cada env var
```

Después de agregar variables, **re-deployá**:

```bash
vercel --prod
```

(Las env vars NO se aplican retroactivamente — necesita un nuevo deploy.)

---

## 🌍 Dominio custom (opcional, $10-15/año)

Si quieres `tropico.app` o `tropico.com.ve` en lugar de `tropico-xxx.vercel.app`:

1. Compra el dominio en Namecheap, GoDaddy, o Cloudflare Registrar
2. En Vercel dashboard → tu proyecto → Settings → Domains
3. Agregar tu dominio
4. Vercel te muestra los DNS records que tienes que configurar
5. En el panel del dominio, agregar:
   - `A` record: `76.76.21.21`
   - `CNAME www`: `cname.vercel-dns.com`
6. Esperar propagación DNS (5min - 24h)
7. Vercel emite SSL automático

---

## 🚨 Troubleshooting

### "Build failed: out of memory"

Vercel tiene 8GB de memoria por build en free tier. El build de Tropico usa ~600MB — debería estar bien. Si pasa:

```bash
# En Vercel dashboard → Settings → General → Build & Development Settings
# Cambiar Node.js Version a 20.x
```

### "WalletConnect dependencies error"

Si ves errores de `utf-8-validate` o `bufferutil` en el build, ya está fixeado en `next.config.mjs` con `webpack.externals`. Si re-aparece:

```js
// next.config.mjs
webpack: (config) => {
  config.externals.push("pino-pretty", "lokijs", "encoding", "utf-8-validate", "bufferutil");
  return config;
}
```

### "Edge Runtime: cannot use fetch with timeout"

`/api/precio-bs` usa `AbortSignal.timeout()` que requiere Node.js 18+. Vercel Edge runtime lo soporta. Si falla:

```ts
// app/api/precio-bs/route.ts
export const runtime = "edge";  // ya está configurado
```

### El demo en /cobrar no genera el QR

El componente `<ReceiveQR />` usa la lib `qrcode` client-side. Si falla:

```bash
npm install qrcode @types/qrcode
git commit -am "fix: re-add qrcode types"
git push  # Vercel re-deploya
```

### "/cambiar muestra 'Cotizaciones no disponibles'"

El frontend llama a `https://lite-api.jup.ag/swap/v1/quote`. Si Jupiter está caído ese día (raro pero pasa), no hay nada que hacer. Muestra el demo de `/cobrar` mientras tanto.

---

## ✅ Post-deploy checklist

Antes de submit del hackathon:

- [ ] URL live funciona en celular Android (Chrome) — testeá las 11 rutas
- [ ] PWA installable: abrir en Chrome → menú → "Instalar Tropico"
- [ ] DualPrice (USD + Bs) muestra valores reales en `/home`
- [ ] `/cambiar` devuelve cotización Jupiter en <3 segundos
- [ ] `/cobrar` genera QR escaneable
- [ ] `/api/precio-bs` devuelve JSON con tasa real (verificar con curl)
- [ ] Todas las imágenes de tokens cargan (logos en `/descubrir`)
- [ ] Cero errores en la consola del browser
- [ ] Lighthouse score >85 (Performance, Accessibility, Best Practices)

```bash
# Test rápido de las 11 rutas
for r in / /home /cambiar /cobrar /enviar /guardar /depositar /comercios /carlos /carlos/agente /descubrir; do
  echo -n "$r: "
  curl -s -o /dev/null -w "%{http_code}\n" https://tu-url.vercel.app$r
done
```

Esperás 11× `200`.

---

## 📊 Monitoring post-launch

Vercel da gratis:

- **Analytics**: tráfico, top pages, devices (Vercel dashboard → Analytics)
- **Web Vitals**: Core Web Vitals automáticos (Vercel dashboard → Speed Insights)
- **Logs**: logs de cada request (Vercel dashboard → Logs)

Para producción real (post-hackathon):

- **Plausible/Umami**: analytics privacy-first
- **Sentry**: error tracking client + server
- **PostHog**: product analytics + feature flags

---

## 🎯 Después del deploy

1. **Actualizar `README.md`** con la URL live real:
   ```bash
   sed -i '' 's|https://tropico.vercel.app|TU-URL-REAL|g' README.md
   git add README.md && git commit -m "docs: update demo URL" && git push
   ```

2. **Actualizar `docs/PITCH_DECK.md`** con la URL en slide 4 y 7

3. **Actualizar `docs/REGISTRO_PROYECTO.md`** con la URL en la sección de Links

4. **Grabar el demo de 4-5 min** ahora que tienes URL live para mostrar (mira script en `docs/DEMO_READINESS.md`)

5. **Subir el video a YouTube unlisted** y agregar el link al README + pitch

6. **Llenar el form del hackathon** usando los valores de `docs/REGISTRO_PROYECTO.md`

7. ✅ **Submit** 🚀

---

## 🔗 Recursos

- Vercel docs: https://vercel.com/docs
- Next.js deployment: https://nextjs.org/docs/deployment
- Pricing Vercel: https://vercel.com/pricing (Hobby = free, suficiente para hackathon y producción inicial)

---

**Tu próximo comando es:** `vercel --prod` ✨
