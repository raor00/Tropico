# Banner del README — Prompt para generar

> Prompt para generar el **banner horizontal del README** (NO el logo app icon — ese está en `LOGO_PROMPT.md`). Este banner va arriba de todo en el README de GitHub, formato 16:9.

**Última actualización**: 2026-05-08 (v2 — refactorizado a caribeño dominante después del feedback "muy Solana corporativo")

---

## 🌅 Prompt principal — Caribeño vívido (RECOMENDADO)

### Versión completa para Midjourney v6+ / Flux 1.1 Pro / Recraft V3

```
Wide horizontal banner, 16:9 aspect ratio, 1920x1080. Premium brand banner combining tropical Caribbean warmth with subtle cyberpunk-tech edges. Background: deep dark teal-purple gradient (top: #1a0d2e dark twilight purple, bottom: #0a1f2e deep ocean teal — NOT pure black, must feel warm and atmospheric).

LEFT SIDE (centered around 25% from left): A glowing tropical icon — a tall slender Venezuelan Caribbean coconut palm (Tucacas-coast style, slightly leaning right, lush detailed fronds) with a vibrant scarlet macaw (guacamaya) perched on the lower trunk. The icon is rendered with a warm, vivid neon glow (NOT cold purple) — palm fronds in glowing tropical sea-green (#06D6A0) with subtle aqua highlights, palm trunk in warm amber (#d49b1f), coconuts glowing golden yellow (#FFD166), the macaw with iconic vivid red body (#EF476F coral), bright yellow-orange wing accents, and turquoise-blue tail feathers. A radiant golden sun (#FFD166 warm yellow) sits behind the palm crown emitting visible warm light rays. The whole composition is enclosed within a circular halo of tiny glowing dots — half warm yellow-coral particles, half cool purple-green ones (suggesting the bridge between Caribbean tradition and Solana tech). Subtle circuit-board trace lines emerge from the base of the palm in dim teal and amber, blending tech with tropical roots. Small gold sparkles around.

RIGHT SIDE (centered around 65% from left): Bold metallic 3D wordmark "TROPICO" in massive uppercase geometric sans-serif font (similar to Bricolage Grotesque Bold). The letters are rendered with a warm sunset gradient — top of letters in coral pink (#EF476F), middle in golden yellow (#FFD166), bottom in sea green (#06D6A0). Each letter has a soft glowing halo in golden-coral. Below the wordmark: a thin horizontal divider line in glowing gold-to-coral gradient with three small circular dots evenly spaced. Below the divider, three taglines in clean sans-serif glowing soft warm white: "Wallet · Comercios · Carlos AI" — separated by small golden dots.

OVERALL: Vivid Caribbean tropical sunset energy meets premium fintech brand. Warm golden hour lighting, lush vibrant greens, hot coral pink, deep sky purple-teal background. NOT a cold tech logo — this should feel like sunset on a Venezuelan beach with subtle tech vibe layered in. Sharp edges, no blur, premium polish. NO text other than specified words. Banner-format horizontal, very legible at small sizes. --ar 16:9 --style raw --stylize 220 --quality 2
```

### Versión simplificada para DALL-E 3 / ChatGPT

```
Wide 16:9 horizontal banner, dark warm teal-purple gradient background (NOT pure black, atmospheric sunset). LEFT: glowing tropical icon of Venezuelan Caribbean coconut palm (Tucacas style) with scarlet macaw perched on trunk. Palm fronds glow tropical sea-green #06D6A0, trunk amber #d49b1f, coconuts golden yellow #FFD166, macaw vivid coral red #EF476F with yellow + turquoise wings. A radiant golden sun #FFD166 sits behind the palm crown emitting warm light rays. Circular halo of glowing particles (half warm yellow-coral, half cool purple-green). Subtle circuit-board traces at base. RIGHT: bold metallic 3D wordmark "TROPICO" massive uppercase, vertical sunset gradient (coral pink top, golden yellow middle, sea green bottom), each letter with soft glow halo. Below: thin horizontal divider line gold-to-coral with 3 dots, then 3 taglines "Wallet · Comercios · Carlos AI" in soft warm white. Vivid Caribbean tropical sunset meets premium fintech. NO other text.
```

---

## 🎨 Por qué este prompt funciona (y el anterior no)

| Elemento | Prompt anterior (frío) | Prompt nuevo (caribeño) |
|---|---|---|
| Background | Pure black `#0a0a14` | Gradient warm `#1a0d2e` (top) → `#0a1f2e` (bottom) |
| Glow palmera | Solana purple frío | **Sea-green tropical + amber tronco + amarillo cocos** |
| Sol | Inexistente | **Sol dorado detrás de la palmera con rays visibles** |
| Guacamaya | Verde-cyan corporativo | **Coral rojo + amarillo + turquesa (auténtica)** |
| Wordmark | Gradient purple→green Solana | **Gradient sunset coral→sun→sea** |
| Halo dots | Solo purple+green | **Mitad warm yellow-coral + mitad purple-green** (puente cultural) |
| Sensación | "Logo cripto frío" | "Atardecer en playa venezolana con vibe tech sutil" |

---

## 📋 Cómo usar este prompt

### Paso 1: Generar variantes

```bash
# Midjourney (Discord)
/imagine [pegá el prompt completo]

# Recraft (web)
recraft.ai → New Image → Style: Vector → pegá prompt simplificado

# Ideogram
ideogram.ai → pegá prompt → Style: Auto

# DALL-E 3 (ChatGPT Plus)
"Generate this image: [pegá prompt simplificado]"
```

Generá **4-6 variantes**. La AI suele tener problemas con texto exacto en imágenes — si "TROPICO" sale mal escrito, generá el icon solo y agregá el wordmark a mano en Figma/Canva (más control).

### Paso 2: Guardar en el repo

```bash
# Una vez tengas el banner final descargado
mv ~/Downloads/banner-tropico.png /Users/Jefemac/Documents/GitHub/Hackathon/docs/images/banner.png
```

Crear la carpeta primero si no existe:
```bash
mkdir -p docs/images
```

### Paso 3: Agregar al README

El README ya tiene el placeholder esperando el archivo en `docs/images/banner.png`. Una vez subido, GitHub lo va a renderizar automáticamente arriba del título.

---

## 🌴 Variantes alternativas si no te convence

### Versión 1: Más warm (max calor caribeño)

Cambiar en el prompt:
- Background: `gradient warm sunset orange-purple (top: #2a1a3e mauve, bottom: #3d2415 sunset orange-brown)`
- Palmera: agregar `with golden-hour rim lighting on every frond`

### Versión 2: Más tech (más Solana, menos sunset)

Cambiar en el prompt:
- Background: keep `#0a0a14` puro
- Halo dots: 70% purple+green, 30% sun-coral
- Wordmark gradient: 50% top en sun, 50% bottom en sea

### Versión 3: Minimalista premium (menos elementos)

Quitar del prompt:
- Cerro El Ávila silhouette
- Circuit traces at base
- Particles esparcidas

Mantener solo: palmera + guacamaya + sol + halo dots + wordmark.

---

## 🎯 Checklist de calidad antes de adoptar el banner final

- [ ] Texto "TROPICO" se lee perfectamente sin distorsión
- [ ] Texto "Wallet · Comercios · Carlos AI" se lee
- [ ] Palmera se ve venezolana (no Hawaii, no Florida)
- [ ] Guacamaya tiene los colores rojo + amarillo + azul (bandera VE oculta)
- [ ] Sol detrás de la palmera, dorado cálido
- [ ] No hay texto extra/random/glitched
- [ ] Composición horizontal balanceada (icon left, wordmark right)
- [ ] Ratio 16:9 exacto (1920×1080 o múltiplo)
- [ ] Filesize <500KB optimizado (usá [tinypng.com](https://tinypng.com) si es muy pesado)

---

## 📝 Después de adoptar el banner

Actualizar:

1. **README.md** — agregar `![Tropico](docs/images/banner.png)` arriba del título principal
2. **Pitch deck slide 1** — usar el banner como background
3. **Open Graph image** — versión cuadrada del banner en `public/og-image.png` para social shares
4. **GitHub repo social preview** — Settings → Social Preview → upload el banner

---

**Vinculado con**: `LOGO_PROMPT.md` (logo del app icon, complementario), `ASSETS_REPO.md` (inventario completo de imágenes del repo).
