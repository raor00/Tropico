---
marp: true
theme: default
size: 16:9
paginate: true
backgroundColor: "#0a0a14"
color: "#e9e9f1"
style: |
  section {
    font-family: 'Inter', sans-serif;
    padding: 60px;
  }
  h1, h2, h3 {
    font-family: 'Bricolage Grotesque', 'Inter', sans-serif;
    color: #e9e9f1;
  }
  h1 {
    font-size: 72px;
    line-height: 1.1;
    letter-spacing: -2px;
  }
  h2 {
    font-size: 48px;
    line-height: 1.15;
  }
  h3 {
    font-size: 28px;
    color: #14F195;
  }
  .gradient {
    background: linear-gradient(135deg, #9945FF 0%, #14F195 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .accent-coral { color: #EF476F; }
  .accent-sea   { color: #06D6A0; }
  .accent-sun   { color: #FFD166; }
  .accent-green { color: #14F195; }
  .accent-purple{ color: #9945FF; }
  .muted { color: #5a5a6e; }
  .panel {
    background: #13131f;
    border: 1px solid #1f1f30;
    border-radius: 16px;
    padding: 24px;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    font-size: 22px;
  }
  th, td {
    border: 1px solid #1f1f30;
    padding: 10px 14px;
    text-align: left;
  }
  th { background: #13131f; }
  ul {
    line-height: 1.6;
  }
  footer {
    color: #5a5a6e;
    font-size: 14px;
  }
---

<!--
PITCH DECK — Tropico
Hackathon: dev3pack (Solana, mayo 2026)
Duración: 4-5 minutos
Cómo renderizarlo:
  npx @marp-team/marp-cli@latest docs/PITCH_DECK.md --pdf -o docs/pitch.pdf
  npx @marp-team/marp-cli@latest docs/PITCH_DECK.md --pptx -o docs/pitch.pptx
-->

# Tropico

## La red económica del venezolano <span class="gradient">en Solana</span>

<br/>

**Ahorra ganando intereses. Paga sin perder valor.**
**Sin bancos. Sin custodios. Sin USDT atrapado.**

<br/>
<br/>

<span class="muted">[tu nombre] · dev3pack hackathon · Caracas, Venezuela</span>

<!--
SPEAKER NOTES (slide 1 — 25 segundos):
"Soy [nombre], desarrollador venezolano. Construí Tropico — la red económica del venezolano
en Solana. No es una wallet más, es una red de pagos paralela al sistema bancario."

TIMING: 0:00 → 0:25
PAUSA después del título. Mira a la jury. Habla despacio.
-->

---

# El problema

<div class="panel">

### El venezolano cripto vive atrapado

- **95% del volumen** vive en USDT/Tron por Binance P2P
- Las apps locales en español son <span class="accent-coral">**custodias**</span> y solo guardan dólares
- Phantom es non-custodial pero asume usuario experto
- Los comercios pagan **<span class="accent-coral">4.5%</span> en POS tradicional** + esperan 24-72h
- El bolívar **se devalúa entre la venta y el cierre del día**

</div>

<br/>

## **No existe una plataforma multi-feature, non-custodial, en español venezolano, sobre Solana.**

<!--
SPEAKER NOTES (slide 2 — 50 segundos):
"En Venezuela, el 95% del volumen cripto vive atrapado en USDT/Tron por Binance.
Las apps en español son custodias y solo guardan dólares. Phantom es non-custodial
pero asume usuario experto. Los comercios pagan 4.5% en POS tradicional y esperan
3 días para ver la plata. Ahí está el agujero."

TIMING: 0:25 → 1:15
ENFASIS en los números: '95%', '4.5%', '24-72 horas'. Deja pausar el final.
-->

---

# La solución: dos productos, una red

<table>
<tr>
<th width="50%">

### 🌴 Tropico Wallet
**(consumidor)**

</th>
<th width="50%">

### 💳 Tropico Comercios
**(merchant)**

</th>
</tr>
<tr>
<td>

- Login con email (Privy MPC)
- Saldo USDC + yield <span class="accent-green">~5% APY default ON</span>
- Swap via Jupiter <span class="accent-green">0.5% fee</span>
- QR Solana Pay para pagar
- Carlos AI copiloto venezolano

</td>
<td>

- Cobro con QR USDC
- Settlement <span class="accent-green">**<1 segundo**</span>
- Fee al merchant <span class="accent-green">**1%**</span>
- Sin chargebacks, sin POS hardware
- Logo "Acepta Tropico" para vidriera

</td>
</tr>
</table>

<br/>

## Cuando ambos están dentro: el dinero gira en USDC <span class="gradient">sin pasar por bancos</span>

### Y se extiende: <span class="accent-sun">Tropico Pay</span> integra cualquier plataforma — delivery, e-commerce, ticketing, SaaS — con 3 patrones (link Solana Pay, REST + webhook, drop-in JS). El comercio recibe USDC, su precio exacto, en 1 segundo.

<!--
SPEAKER NOTES (slide 3 — 55 segundos):
"Tropico es UNA app con dos productos integrados.
Tropico Wallet para el consumidor: login con email vía Privy, su saldo USDC genera
~5% APY automático sin activar nada, swap a cualquier token con 0.5% de fee.
Tropico Comercios para el merchant: QR de cobro, settlement en menos de 1 segundo,
fee 1% en lugar del 4.5% de POS tradicional — sin chargebacks, sin contrato.

Cuando ambos están dentro de Tropico, el dinero gira en USDC sin pasar por bancos.
Es la red económica caribeña en Solana, non-custodial."

TIMING: 1:15 → 2:10
La frase clave es la última. Dila firme.
-->

---

# Demo en vivo

<table>
<tr>
<td width="60%">

### El momento red económica

1. **Bodega** pide cobrar <span class="accent-green">$5</span> → genera QR
2. **Cliente** abre Tropico → escanea → ve "Pagas $5.05" → confirma
3. **Bodega** recibe <span class="accent-green">+$5.00 exactos en <1 segundo</span>
4. **Tropico** recibe <span class="accent-green">+$0.05</span> (verificable en Solscan)
5. **Cliente** recibe <span class="accent-sun">$0.05 cashback</span> en su próxima compra

> **Fee hacia arriba**: el merchant cobra el precio que pidió, el cliente absorbe el fee. Cero "el merchant trabaja para el procesador".

<br/>

**Esto es lo que ningún POS hace en 1 segundo.**

</td>
<td width="40%">

<div class="panel">

🌐 **Live demo**
`tropico.vercel.app`

🤖 **Modo Agente**
Carlos ejecuta DCA, auto-yield, cashback, re-balance con permisos limitados

🧠 **Powered by Lumen**
Open-source agent framework
+ OpenClaw para firmas autónomas

</div>

</td>
</tr>
</table>

<!--
SPEAKER NOTES (slide 4 — 90 segundos):
"Voy a mostrarles el flow completo en vivo."
[Mostrar /home → /cobrar → escaneo simulado → split-screen del cobro]

"En 1 segundo el cliente paga, el comercio recibe, Tropico cobra su 1%, el cashback vuelve.
TODO esto sin pasar por banco, sin Visa, sin Banesco. Eso es la red económica."

[Mostrar /carlos/agente → activar DCA → simular ejecución]

"Carlos puede ejecutar acciones autónomas con permisos limitados via OpenClaw + Privy.
DCA semanal, auto-yield, auto-cashback, re-balance. La parte agéntica es el wow técnico
del meta AI Agents 2026."

TIMING: 2:10 → 3:40
ESTO es la mitad del pitch. Mostrar el split-screen del pago en /cobrar es CRÍTICO.
Si la WiFi falla, hay video grabado de respaldo.
-->

---

# Modelo de negocio

<table>
<tr>
<th>Stream</th>
<th>Tasa</th>
<th>Mecánica</th>
</tr>
<tr><td>Swap</td><td><span class="accent-green">0.5%</span></td><td>Jupiter <code>platformFeeBps</code> al ATA Tropico</td></tr>
<tr><td>Send</td><td><span class="accent-green">0.3%</span></td><td>Spread USDC en envíos peer-to-peer</td></tr>
<tr><td>Yield (Save)</td><td><span class="accent-green">2% del yield</span></td><td>Performance fee sobre mSOL/Kamino</td></tr>
<tr><td>Merchant</td><td><span class="accent-green">1%</span></td><td>Fee al comercio por cada cobro</td></tr>
<tr><td>Carlos AI</td><td><span class="muted">acelerador</span></td><td>Multiplica retention 2-3×</td></tr>
</table>

<br/>

### Proyección Year 1

<table>
<tr><th></th><th>Mes 1</th><th>Mes 6</th><th>Mes 12</th></tr>
<tr><td>Usuarios activos</td><td>1,000</td><td>10,000</td><td><span class="accent-green">50,000</span></td></tr>
<tr><td>Comercios afiliados</td><td>20</td><td>300</td><td><span class="accent-green">2,000</span></td></tr>
<tr><td>Volumen mensual</td><td>$300k</td><td>$5.4M</td><td><span class="accent-green">$44M</span></td></tr>
<tr><td>**Revenue mensual**</td><td>**$1.5k**</td><td>**$30k**</td><td><span class="accent-green">**$250k MRR**</span></td></tr>
</table>

<!--
SPEAKER NOTES (slide 5 — 50 segundos):
"5 streams de revenue desde el día uno. Mes 12: 50.000 usuarios + 2.000 comercios
generan 250 mil dólares de revenue mensual sobre 44 millones de volumen procesado.
El motor real de crecimiento es el efecto red bilateral: cada nuevo merchant
aumenta el valor para los usuarios y viceversa. Modelo bilateral clásico: cada lado aumenta el valor del otro."

TIMING: 3:40 → 4:30
Énfasis en el '250k MRR mes 12' y 'efecto red bilateral'.
-->

---

# Stack + Roadmap + Ask

<table>
<tr>
<td width="50%">

### Stack actual

- **Frontend**: Next.js 15 + Privy MPC + Tailwind
- **Swap**: Jupiter v6 (`platformFeeBps=50`)
- **Pay**: Solana Pay spec + QR + Tropico Pay REST API
- **AI 3-layer kit**: Lumen (MVP) + Hermes (Q3) + OpenClaw (Q3)
- **Capabilities**: Python stdlib (RPC, Jupiter, DolarAPI)
- **RPC**: Helius
- **Cero programa Anchor custom · Cero backend persistente**

</td>
<td width="50%">

### Roadmap

- **Q3 2026**: Hermes (memoria) + OpenClaw real (delegated keys) + Tropico Pay GA
- **Q4 2026**: <span class="accent-sun">Tropico Card</span> (debit USDC + cashback)
- **Q1 2027**: <span class="accent-sea">LATAM expansion</span> (CO, AR, MX, PE, CL) + Solana Mobile

<br/>

### Ask

<div class="panel">
<span class="accent-green">**$250k seed**</span> para 12 meses:
40% producto · 35% growth · 25% compliance/partnerships
</div>

</td>
</tr>
</table>

<br/>

## **Tropico no es una wallet. Es la <span class="gradient">infraestructura económica</span> que el venezolano necesita.**

<!--
SPEAKER NOTES (slide 6 — 60 segundos):
"Stack 100% open-source: Next.js + Privy + Jupiter + Solana Pay + Lumen + OpenClaw.
Cero programa Anchor custom — usamos los protocolos abiertos de Solana.

Roadmap: Q3 2026 integración real con OpenClaw + on-ramp con partners. Q4 sale Tropico Card,
debit Visa backed por USDC con cashback. Q1 2027 expandimos a Colombia, Argentina, México,
Perú y Chile, más app nativa para Solana Mobile.

Buscamos 250 mil dólares para los próximos 12 meses: 40% producto, 35% growth, 25%
compliance y partnerships bancarios para la Card.

Tropico no es una wallet. Es la infraestructura económica que el venezolano necesita
y que nadie le está dando. Hasta hoy."

TIMING: 4:30 → 5:30
La última frase es el MIC-DROP. Dila mirando a los ojos. Pausa. Gracias.
-->

---

<!-- _backgroundColor: #13131f -->

# Gracias 🌴

<br/>

### Tropico es real, hoy

<br/>

🌐 **Demo live**: `tropico.vercel.app`
📂 **Repo**: `github.com/[tu-usuario]/Hackathon`
🎬 **Video pitch**: `youtu.be/[unlisted]`

<br/>

<span class="muted">Hecho en Venezuela, para Venezuela. Construido sobre Solana.</span>

<!--
SPEAKER NOTES (slide 7 — slide opcional de cierre):
Mostrar mientras se va (15-30 segundos extra). Da tiempo a que la jury lea los links.

Si tienes que cortar para preguntas, deja esta slide proyectada mientras respondés.
-->

---

# 📋 Anexo — Cómo renderizar este deck

## Opción 1 — PDF/PNG con Marp CLI

```bash
# instalar
npm install -g @marp-team/marp-cli

# renderizar a PDF
marp docs/PITCH_DECK.md --pdf -o docs/pitch.pdf

# renderizar a PowerPoint editable
marp docs/PITCH_DECK.md --pptx -o docs/pitch.pptx

# renderizar a PNG (slides individuales)
marp docs/PITCH_DECK.md --images png --output-dir docs/slides/

# servir live (con preview en browser)
marp docs/PITCH_DECK.md -s docs/
```

## Opción 2 — Copiar a Google Slides / Keynote

Cada bloque entre `---` es UNA slide. Copia el texto a tu herramienta favorita
manteniendo estos elementos:
- Headline grande
- Bullets con énfasis en colores Tropico
- Tablas para comparativas y proyección
- Última línea destacada (mic-drop)

## Opción 3 — Slidev (para presentación interactiva)

```bash
npm install -g @slidev/cli
slidev docs/PITCH_DECK.md
```

---

# 🎤 Speaker cheat-sheet (1 página para tener al lado)

## Timing total: **5:30 minutos** (+ 30s buffer)

| Slide | Tiempo | Frase clave para clavar |
|---|---|---|
| **1. Title** | 0:00 → 0:25 | "La red económica del venezolano en Solana" |
| **2. Problem** | 0:25 → 1:15 | "95% atrapado en USDT/Tron · Banesco 4.5% · 24-72h settlement" |
| **3. Solution** | 1:15 → 2:10 | "Cuando ambos están dentro, el dinero gira sin pasar por bancos" |
| **4. Demo** | 2:10 → 3:40 | "Esto es lo que ningún POS hace en 1 segundo" |
| **5. Business** | 3:40 → 4:30 | "$250K MRR mes 12 sobre $44M volumen procesado" |
| **6. Stack+Roadmap+Ask** | 4:30 → 5:30 | "**Tropico no es una wallet. Es infraestructura.**" |

## Backup obligatorio

- ✅ Demo grabado (4-5 min) en YouTube unlisted como respaldo si la WiFi falla
- ✅ PDF del pitch en USB/Drive accesible offline
- ✅ Tu nombre + email visibles desde el primer slide
- ✅ Repo público en GitHub con licencia MIT

## Si te trabás

- "Buena pregunta — déjame pensarlo un segundo." Pausa. Respirá. Contestá.
- Si no sabés algo: "No estoy seguro de eso, te lo paso por correo después."
- Si la demo se rompe: "Por las dudas tengo el video grabado, déjenme mostrarles."

## Lo que NUNCA decir

- ❌ "Vamos a reemplazar a los bancos" → suena ingenuo
- ❌ "Garantizamos rendimientos" → ilegal
- ❌ Cualquier opinión política sobre Venezuela
- ❌ "Hicimos esto en 48 horas" — di: "MVP del hackathon de un proyecto serio que continúa"
