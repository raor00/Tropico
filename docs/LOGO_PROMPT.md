# Logo de Tropico — Prompt para generación pixel art

> **Estilo objetivo**: pixel art 16-bit retro JRPG, esencia caribeña venezolana con paleta Solana. Palmera de coco costera (estilo Tucacas/Morrocoy), guacamaya bandera, atardecer cálido caribeño.

---

## 🌴 Prompt PRINCIPAL — logo app icon

### Versión recomendada (Midjourney v6+ / Flux 1.1 Pro / Recraft V3)

```
Pixel art logo, 128x128 app icon, 16-bit retro JRPG aesthetic, crisp pixel grid with no anti-aliasing. A single tall slender Venezuelan Caribbean coconut palm tree (the kind that line the coastal road to Tucacas in Falcón state) with a graceful curve leaning slightly right from sea breeze, detailed pixelated coconut cluster at the crown, long fronds swaying. A vibrant scarlet macaw (guacamaya bandera) perched on the lower trunk of the palm, wings folded showing iconic red-yellow-blue plumage, profile view. Golden Caribbean afternoon sun behind the palm crown casting warm rays. Subtle Cerro El Ávila or coastal mountain silhouette in distant background. Color palette: Solana purple #9945FF and Solana electric green #14F195 dominate the sky as a smooth pixel gradient (purple top, green bottom horizon), warm Caribbean yellow #FFD166 for the sun, hot coral pink #EF476F for the macaw body, sea green #06D6A0 for the mountain silhouette and palm fronds shadow. Sand beige #d4b896 ground line. Background base #0a0a14 deep ink. Sticker-style with crisp 1-pixel dark outline. No text, no letters, no watermark. Centered composition. Must be readable at 32x32. Premium fintech meets nostalgic Caribbean tropical, warm and inviting. --ar 1:1 --style raw --stylize 150
```

### Versión simplificada (DALL-E 3 / ChatGPT)

```
Pixel art app icon, 128x128, 16-bit retro style, crisp pixels no smoothing. A tall slender Caribbean coconut palm tree (Venezuelan coast Tucacas style, slightly curved from sea breeze) with a scarlet macaw parrot (guacamaya) perched on its lower trunk showing red-yellow-blue feathers. Golden afternoon sun behind palm crown. Subtle mountain silhouette in distance. Color palette: Solana purple #9945FF and green #14F195 sky gradient, yellow #FFD166 sun, coral #EF476F macaw, sea green #06D6A0 mountain, sand beige ground. Deep ink #0a0a14 background. Sticker style with dark outline. NO TEXT. Centered, premium fintech + Caribbean warmth.
```

### Versión expandida (más símbolos venezolanos)

Si quieres meterle más identidad (orquídea nacional + bandera tricolor sutil):

```
Pixel art logo 128x128, 16-bit retro game aesthetic. Venezuelan tropical icon: central coconut palm tree (Tucacas/Morrocoy coastal style, slender and slightly wind-curved), vibrant scarlet macaw (guacamaya bandera) perched mid-trunk with spread wings showing red-yellow-blue feathers, small white orchid (Cattleya mossiae, flor nacional) blooming at the base of the palm, golden sun behind palm crown radiating subtle yellow-blue-red gradient (Venezuelan flag colors hidden in the rays), Cerro El Ávila silhouette in background. Color palette dominated by: Solana purple #9945FF and Solana green #14F195 as the sky/atmosphere gradient, Caribbean yellow #FFD166 sun, coral pink #EF476F macaw body, sea green #06D6A0 mountain. Background: deep ink #0a0a14. Crisp pixel boundaries, no anti-aliasing, isometric 3/4 perspective, sticker-style with 1-pixel dark outline. No text, no letters. App icon ready, centered, must be readable at 32x32. Premium crypto-fintech meets nostalgic 1990s JRPG vibe.
```

---

## 🎯 Por qué este prompt funciona

1. **Palmera Tucacas-style explícita** — los modelos buenos captan la curva costera específica de Falcón vs una palmera genérica de Hawai/Miami.
2. **Guacamaya bandera** — los colores rojo-amarillo-azul son básicamente la bandera venezolana. Identidad oculta sin ser bandera literal.
3. **Cielo gradient Solana** — purple top → green bottom mete los colores Solana de forma natural (no parchados encima).
4. **Sol amarillo cálido (#FFD166)** — rompe el "frío cripto" típico. Esencia VE preservada.
5. **Atardecer no mediodía** — la luz cálida de la "Caribbean afternoon" es el momento más venezolano (las 5pm en la playa).

---

## 📝 Tips de generación por modelo

| Modelo | Recomendación |
|---|---|
| **Midjourney v6+** | Versión principal + flags `--ar 1:1 --style raw --stylize 150` |
| **DALL-E 3 / ChatGPT** | Versión simplificada (DALL-E mete texto random si el prompt es muy denso) |
| **Flux 1.1 Pro** | Versión principal + agregar `, sharp pixel grid, no smoothing` al final |
| **Ideogram 2.0** | Versión simplificada + activar "Style: 3D" o "Style: Anime" |
| **Recraft V3** | Versión principal, seleccionar "Vector → Pixel Art" como estilo |
| **Leonardo.ai** | Modelo "Leonardo Diffusion XL" + style "Pixel Art" |

### Negative prompt (para modelos que lo soportan)

```
text, letters, words, signature, watermark, blurry, anti-aliased, smooth gradients, 3D render, photo-realistic, dark muddy colors, cluttered composition, modern flat design, generic crypto logos, sharp tech corporate, Hawaii vibe, sunset cliché, dark muddy colors, generic palm
```

---

## 💡 Variaciones para iterar

Genera 4-6 variantes con el mismo prompt y elige. Si quieres iterar, puedes cambiar:

1. **Composición**:
   - "palm centered" vs "palm leaning right" vs "palm leaning left"
   - "macaw front-facing" vs "macaw side-profile" vs "macaw mid-flight"

2. **Fondo**:
   - "deep ink night sky with stars"
   - "sunset gradient (purple → coral → yellow)"
   - "transparent background"

3. **Detalle**:
   - "ultra-detailed 64-color palette"
   - "minimalist 8-color limited palette" (a veces queda más profesional para fintech)

4. **Vibe**:
   - "playful and warm" (más caribeño)
   - "premium and minimal" (más fintech)

---

## 🎨 Paleta oficial Tropico (matchear con Tailwind)

Asegurate de que el logo use SOLO estos colores:

| Color | Hex | Uso en logo |
|---|---|---|
| Ink (background base) | `#0a0a14` | fondo deep |
| Solana Purple | `#9945FF` | cielo top + acentos |
| Solana Green | `#14F195` | cielo bottom + horizonte |
| Caribbean Sun | `#FFD166` | sol cálido |
| Coral Pink | `#EF476F` | cuerpo de la guacamaya |
| Sea Green | `#06D6A0` | montaña + sombras |
| Sand beige | `#d4b896` | línea de suelo |
| Text (white) | `#e9e9f1` | si llegara a haber detalles claros |

---

## 🚀 Plan post-generación

Una vez que tengas el logo elegido:

### 1. Exportar en 3 tamaños

| Tamaño | Uso | Archivo |
|---|---|---|
| 512×512 PNG | Social, presentaciones, demo | `public/icons/tropico-512.png` |
| 192×192 PNG | PWA icon principal | `public/icons/icon-192.png` |
| 32×32 PNG / ICO | Favicon | `public/favicon.ico` |
| SVG vectorial (opcional) | Header de la app | `public/icons/tropico.svg` |

### 2. Subirlos a `/public/icons/`

Reemplazar el placeholder gradient actual del header (`app/page.tsx` línea ~40):

```tsx
{/* ANTES (placeholder) */}
<div className="size-8 rounded-lg bg-gradient-to-br from-tropico-purple to-tropico-green" />

{/* DESPUÉS (con logo real) */}
<Image src="/icons/tropico-512.png" alt="Tropico" width={32} height={32} />
```

### 3. Actualizar `manifest.json`

Verificar que `public/manifest.json` apunta a las rutas correctas (ya lo hace por defecto, pero confirmar después de subir los PNG reales).

### 4. Crear componente `<Logo />`

```tsx
// components/Logo.tsx
import Image from "next/image";

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/icons/tropico-512.png"
      alt="Tropico"
      width={size}
      height={size}
      className="rounded-lg"
      priority
    />
  );
}
```

Reemplazar el placeholder en TODAS las pantallas:
- `app/page.tsx` (landing)
- `app/home/page.tsx` (cuando se cree)
- `app/comercios/page.tsx` (cuando se cree)
- Header de Carlos chat
- Manifest PWA

### 5. Verificar instalación PWA

En Chrome desktop: `localhost:3000` → menú "Instalar Tropico" → debe mostrar el logo correcto.

En Android Chrome: abrir → "Add to Home Screen" → verificar que el icono aparece bien.

---

## 🌴 Justificación de los símbolos elegidos

| Símbolo | Por qué es venezolano | Por qué encaja con Tropico |
|---|---|---|
| **Palmera de coco Tucacas** | Costa Falcón, Caribe venezolano. Reconocible para cualquier VE que haya ido a la playa. | Calor, libertad, casa. Lo opuesto a "frío banco gringo". |
| **Guacamaya bandera** | Ave nacional, colores rojo-amarillo-azul (= bandera) | Vibrante, único, tropical. Imposible de confundir con otra fintech. |
| **Cerro El Ávila silhouette** | Para los caraqueños es el horizonte de toda la vida | Suma identidad sin saturar. Sutil. |
| **Atardecer caribeño 5pm** | El "happy hour" venezolano | Calidez emotiva. Cripto-fintech con alma. |
| **Colores Solana** | (no es venezolano per se) | Conexión directa al ecosistema cripto. |
| **Sand beige ground** | Playa caribeña, no concreto urbano | Refuerza que es una app del PUEBLO, no corporativa. |

La combinación palmera + guacamaya + Solana colors es **única en el ecosistema Solana** — ninguna otra wallet/dapp tiene este branding tropical-LATAM. Es un moat de marca.

---

## 🎁 Variantes adicionales (post-MVP)

Cuando tengas tiempo después del hackathon, considera generar:

1. **Logo Tropico Comercios** (variante para merchants — más profesional, menos juguetón, palmera + guacamaya pero con tonos más sobrios)
2. **Logo "Acepta Tropico"** sticker para que los merchants peguen en sus locales físicos (formato circular o pentagonal con borde colorido)
3. **Favicon minimalista** (solo silueta de palmera + guacamaya en 16×16, sin fondo)
4. **Logo animado** (GIF/Lottie con palmera meciéndose por la brisa, guacamaya parpadeando) para splash screen
5. **Iconos por módulo** (5 mini-pixel-art icons, uno por cada módulo: Cambiar/Enviar/Guardar/Cobrar/Carlos)

---

## ⚠️ Anti-patterns a evitar

- ❌ NO uses palmeras genéricas tropicales tipo Hawaii/Bahamas — pierdes identidad VE
- ❌ NO metas la bandera de Venezuela LITERAL (queda político, hackeable, conflictivo)
- ❌ NO uses fotos realistas — Tropico es PIXEL ART por filosofía (nostalgia + lowfi + identidad)
- ❌ NO uses gradientes suavizados — pixel art tiene bordes crispy
- ❌ NO añadas TEXT/LETRAS al logo — ese es trabajo del wordmark separado
- ❌ NO uses el flag emoji 🇻🇪 como solución (es flojo)
- ❌ NO mezcles más de 8-10 colores — pixel art se ve mejor limitado
- ❌ NO incluyas dollares/SOL/símbolos cripto literales — te encasilla como "otra fintech cripto"

---

## 📞 Si la generación no convence después de 4-6 intentos

Considera contratar a un pixel artist en Fiverr o Upwork con este brief. Cobros típicos: $50-150 USD por logo profesional pixel art. Razonable para algo que va a vivir años representando la marca.

Buenos buscadores para encontrar pixel artists:
- Fiverr: search "pixel art logo design"
- DeviantArt: profiles con "pixel art commissions"
- Twitter/X: hashtag #PixelArt + DM
- Reddit: r/PixelArt → "Available for commissions" weekly thread

---

**Última actualización**: 2026-05-08. Si cambia el branding del proyecto, actualizar este doc primero.
