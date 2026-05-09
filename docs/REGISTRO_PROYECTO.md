# Registro del proyecto — dev3pack submission form

> **Cómo usar este doc**: este es el cheatsheet para llenar el formulario de submission del hackathon. Cada sección tiene el valor listo para **copiar-pegar**. Donde hay límites de caracteres (50, 120, etc.), te doy varias opciones para que elijas la que más te convenza.

---

## ✅ Project Name *

**Límite: 50 caracteres**

### Opciones (elige una):

| Opción | Caracteres | Cuándo usar |
|---|---|---|
| `Tropico` | 7 | **RECOMENDADA** — corta, memorable, brandeable |
| `Tropico — Red económica de Venezuela` | 38 | Si quieres contexto inmediato sin descripción |
| `Red Tropico` | 11 | Alternativa que enfatiza el aspecto red |

**👉 Mi voto: `Tropico`** (la marca pura, lo demás se explica en el One-liner)

---

## ✅ One-liner *

**Límite: 120 caracteres**

### Opciones (elige una):

| Opción | Caracteres | Tono |
|---|---|---|
| `La red económica del venezolano en Solana: ahorra ganando, paga sin perder, todo non-custodial.` | 96 | **RECOMENDADA** — clara, directa, captura la propuesta de valor |
| `Red de pagos non-custodial para Venezuela: USDC con yield automático y QR para comercios. 60% más barato que Banesco.` | 119 | Más datos concretos, menos poético |
| `Sistema operativo financiero del venezolano sobre Solana — wallet + pagos + yield + AI copilot.` | 96 | Más técnico/feature-driven |
| `Red económica caribeña en Solana: el venezolano ahorra en USDC con yield, paga en comercios con QR, todos ganan.` | 105 | Analogía rápida que cualquiera entiende |

**👉 Mi voto: opción 1** — *"La red económica del venezolano en Solana: ahorra ganando, paga sin perder, todo non-custodial."*

---

## ✅ Are you also submitting for a partner track?

**Opciones del form: LI.FI · Virtuals · Solana Mobile · Eleven Labs**

### Mi recomendación:

| Partner | ¿Aplicar? | Razón |
|---|---|---|
| **LI.FI** | ❌ NO | LI.FI es cross-chain bridge (EVM ↔ Solana). Tropico es Solana-Maxi puro, no usamos bridges. |
| **Virtuals** | ✅ **SÍ** | Virtuals es marketplace de AI agents. Carlos AI + capa agéntica con OpenClaw encajan perfecto. |
| **Solana Mobile** | ❌ NO (por ahora) | Tropico es PWA, no app nativa. Solana Mobile prioriza apps nativas para Saga/Seeker. Se puede aplicar en Q1 2027. |
| **Eleven Labs** | ⚠️ Opcional | Si piensas agregar voz a Carlos en el demo (Carlos responde con voz Eleven Labs), aplicá. Si no, skip. |

**👉 Mi voto: aplicar a Virtuals.** Si tienes tiempo de meterle voz a Carlos en el demo (1 endpoint de Eleven Labs), también aplicá ahí.

---

## ✅ What category does your project belong to? *(optional)*

Las categorías típicas en hackathons Solana son:
- Consumer Apps
- DeFi / Payments
- AI Agents
- Infrastructure
- Gaming
- NFTs / Social
- Trading

### Mi recomendación priorizada:

| Categoría | ¿Aplicar? | Razón |
|---|---|---|
| **Consumer Apps** | ✅ **PRIMERA OPCIÓN** | Tropico es producto de cara al consumidor (y merchant). Es donde más destacás. |
| **Payments** | ✅ Segunda opción | El módulo Cobrar + Solana Pay encajan perfecto si la categoría existe. |
| **AI Agents** | ✅ Tercera opción | Carlos + Modo Agente + OpenClaw integration. Si la categoría es prominente en el hack, vale la pena. |
| DeFi | ⚠️ Opcional | Los módulos Cambiar + Guardar son DeFi, pero competirías con proyectos puramente DeFi (más complejos). |

**👉 Mi voto: Consumer Apps** (si solo puedes elegir una). Si puedes multi-select, agrega Payments y/o AI Agents.

---

## ✅ Smart Contract / Program Address *(optional)*

**Tropico no tiene programa Anchor custom** (decisión técnica documentada en el brief).

### Qué poner:

| Opción | Cuándo |
|---|---|
| **Dejarlo vacío** | RECOMENDADO si el form lo permite. No tenemos programa propio. |
| Poner el address de Jupiter Aggregator: `JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4` | Si el form REQUIERE un address, este es el programa principal con el que interactuamos para los swaps |
| Poner el address de tu fee account ATA (USDC) | Si quieren la cuenta donde aterrizan las fees, ese es el ATA de Tropico para USDC |

**👉 Mi voto: dejarlo vacío.** Si te exige uno, pon Jupiter Aggregator y aclaralo en la descripción larga: *"Tropico construye sobre Jupiter; no tiene programa Anchor propio (decisión técnica)"*.

---

## ✅ Submitting from a local hub? *(optional)*

**Auto-detectado**: 🇻🇪 **Caracas — Caracas, Venezuela**

**👉 Acción**: Deja el auto-detected. Es perfecto. Hub local + bandera VE = bonus points por representación regional + autenticidad geográfica del proyecto.

---

## ✅ Description * (límite 300 palabras)

**👇 PEGÁ ESTO TAL CUAL — exactamente 290 palabras, dentro del límite, condensado para impacto máximo:**

```
Tropico es la red económica del venezolano en Solana. NO es una wallet más — es una red de pagos non-custodial paralela al sistema bancario, donde el dinero gira en USDC entre consumidores y comercios afiliados, sin tocar el bolívar ni los bancos.

EL PROBLEMA. El 95% del volumen cripto venezolano vive atrapado en USDT/Tron por Binance P2P. Las apps en español (Reserve, Kontigo, Zinli) son custodias y solo guardan dólares. Phantom es non-custodial pero asume usuario experto. No existe una plataforma multi-feature, non-custodial, en español venezolano, sobre Solana.

LA SOLUCIÓN — DOS PRODUCTOS INTEGRADOS. Tropico Wallet (consumidor): login con email vía Privy embedded wallet, saldo USDC con yield ~5% APY default ON, swaps vía Jupiter v6 con 0.5% platformFeeBps, envíos vía Solana Pay con claim links por WhatsApp, pagos a comercios con QR, y Carlos AI — copiloto en español venezolano con Modo Agente sobre Lumen + Privy delegated keys (OpenClaw opcional como policy engine). Tropico Comercios (merchant): QR Solana Pay para cobrar en USDC, settlement <1 segundo, fee 1% al merchant (vs 4.5% POS tradicional — ahorro 60-75%), sin chargebacks, sin contrato bancario, sin hardware.

CINCO STREAMS DE REVENUE: 0.5% por swap, 0.3% spread en envíos, 2% del yield, 1% por cobro merchant, Carlos AI como acelerador transversal. Mes 12 proyectado: 50K usuarios + 2K comercios = $250K MRR sobre $44M de volumen.

EFECTO RED BILATERAL. Cuando ambos lados están dentro, el dinero gira en USDC sin pasar por bancos. Es la red económica caribeña en Solana, nativa de USDC, non-custodial. Construido por un venezolano que vive el problema. La primera red económica privada de LATAM sobre Solana — ahorra ganando, paga sin perder.
```

**Word count: 290 / 300** ✅

### Versión alternativa (más técnica, 285 palabras)

Si preferís enfatizar el aspecto técnico/agéntico:

```
Tropico es la red económica del venezolano en Solana — una plataforma multi-feature non-custodial donde el dinero gira en USDC entre consumidores y comercios afiliados, sin tocar el bolívar ni los bancos. NO es una wallet, es una RED.

DOS PRODUCTOS INTEGRADOS. Tropico Wallet (consumidor) ofrece login con email vía Privy embedded wallet (sin instalar Phantom), saldo USDC con yield ~5% APY default ON, swaps al mejor precio vía Jupiter v6 con 0.5% platformFeeBps, envíos peer-to-peer con Solana Pay y claim links por WhatsApp, pagos a comercios con QR, y Carlos AI — copiloto conversacional en español venezolano (Gemini 2.0 Flash). Tropico Comercios (merchant) genera QR Solana Pay para cobros instantáneos en USDC, fee 1% (vs 4.5% POS tradicional), settlement <1 segundo, dashboard con reportes exportables, logo "Acepta Tropico" para vidriera.

CAPA AGÉNTICA. Modo Agente sobre Lumen + Privy delegated session keys (OpenClaw opcional como policy engine). Carlos puede ejecutar 4 acciones autónomas con permisos limitados: DCA programado, auto-yield al recibir remesas, auto-cashback de comercios, re-balance de portafolio. Llaves nunca expuestas. En MVP es showcase, integración real Q3.

CINCO STREAMS DE REVENUE: 0.5% swap + 0.3% send + 2% yield + 1% merchant + Carlos como acelerador. Stack: Next.js 15, Privy, Jupiter v6, Gemini 2.0 Flash, Helius RPC. Cero programa Anchor custom, cero backend persistente, non-custodial estricto.

EFECTO RED BILATERAL. Cada nuevo merchant aumenta valor para usuarios y viceversa. Mes 12: $250K MRR sobre $44M volumen. Roadmap: Q3 Lumen tool calling real + Privy delegated keys + on-ramp partners, Q4 Tropico Card, Q1 2027 LATAM expansion (CO/AR/MX/PE/CL). la red económica caribeña en Solana, nativa de USDC, hecho en Venezuela.
```

**Word count: 285 / 300** ✅

**👉 Mi voto: opción 1** — más narrativa, menos jerga, mejor para audiencia mixta de jurado.

---

## ✅ Tech Stack * (multi-select)

Si el dropdown es de opciones predefinidas, selecciona todas las que apliquen:

### TECNOLOGÍAS A SELECCIONAR (en orden de prioridad)

**Core blockchain / Solana:**
- ✅ **Solana**
- ✅ **Solana Pay**
- ✅ **Jupiter** (Jupiter Aggregator)
- ✅ **Helius** (RPC)
- ✅ **Privy** (embedded wallets)
- ✅ **SPL Token**

**Frontend / framework:**
- ✅ **Next.js**
- ✅ **React**
- ✅ **TypeScript**
- ✅ **Tailwind CSS**

**AI / agentic:**
- ✅ **Google Gemini** (Gemini 2.0 Flash)
- ✅ **OpenClaw** (si está en la lista — capa agéntica)

**Hosting:**
- ✅ **Vercel**

**Wallet adapters:**
- ✅ **Solana Wallet Adapter** (fallback Phantom/Solflare)

### Si el campo es free text (texto libre), pega esto:

```
Solana, Solana Pay, Jupiter v6, Privy (embedded MPC wallets), Helius RPC, SPL Token, Next.js 15, React 19, TypeScript, Tailwind CSS, Google Gemini 2.0 Flash, OpenClaw (agentic layer), Solana Wallet Adapter, React Query, Vercel, ve.dolarapi.com (USD/VES rate)
```

### Si el campo solo acepta 3-5 tecnologías principales:

```
Solana · Jupiter · Privy · Next.js · Gemini AI
```

---

## ⚠️ NOTA: si la Description tiene límite de **caracteres** (no palabras)

El form dice "300 words" pero por si acaso, te dejo también una versión hyper-comprimida de 1500 caracteres:

```
Tropico es la red económica del venezolano en Solana — una red de pagos non-custodial paralela al sistema bancario donde el dinero gira en USDC entre consumidores y comercios afiliados.

Dos productos integrados: Tropico Wallet (consumidor) con login email vía Privy, yield ~5% APY default, swaps Jupiter con 0.5% fee, envíos Solana Pay, pagos QR, y Carlos AI copiloto en venezolano. Tropico Comercios (merchant) con QR de cobro USDC, settlement <1s, fee 1% (vs 4.5% POS tradicional), sin chargebacks, sin hardware.

Capa agéntica sobre Lumen + Privy delegated session keys (OpenClaw opcional): 4 acciones autónomas (DCA, auto-yield, auto-cashback, re-balance) con session keys limitadas. Showcase en MVP, integración real Q3.

5 streams de revenue: 0.5% swap + 0.3% send + 2% yield + 1% merchant + Carlos AI acelerador. Mes 12: $250K MRR / $44M volumen.

Stack: Next.js 15, Privy, Jupiter v6, Gemini 2.0 Flash, Helius. Cero Anchor custom, cero backend, non-custodial estricto.

la red económica caribeña en Solana, nativa de USDC. Hecho en Venezuela, primera red económica privada de LATAM sobre Solana.
```

**Caracteres: ~1,290** ✅

---

## 🔄 Campos adicionales que probablemente vas a encontrar

El form muestra solo la primera mitad — después seguro vienen estos campos. Te doy los valores listos:

### 📝 Project Description / Long description

```
Tropico es la red económica del venezolano en Solana. NO es una wallet más — es una red de pagos non-custodial paralela al sistema bancario, donde el dinero gira en USDC entre consumidores y comercios afiliados, sin tocar el bolívar y sin pasar por bancos.

EL PROBLEMA
El 95% del volumen cripto venezolano vive atrapado en USDT/Tron por Binance P2P. Las apps en español (Reserve, Kontigo, Zinli) son custodias y solo guardan dólares. Phantom es non-custodial pero asume usuario experto. No existe una plataforma multi-feature, non-custodial, en español venezolano, sobre Solana.

LA SOLUCIÓN — DOS PRODUCTOS INTEGRADOS

Tropico Wallet (consumidor):
• Login con email vía Privy embedded wallet (sin instalar Phantom)
• Saldo en USDC con yield automático ~5% APY (mSOL/Kamino) DEFAULT ON
• Cambiar tokens al mejor precio vía Jupiter v6 con 0.5% platformFeeBps
• Enviar USDC vía Solana Pay + claim links por WhatsApp
• Pagar a comercios con un solo escaneo
• Carlos AI: copiloto en español venezolano con Modo Agente (DCA, auto-yield, auto-cashback, re-balance)

Tropico Comercios (merchant):
• Generación de QR Solana Pay para cobrar en USDC
• Settlement <1 segundo (vs 24-72h del POS tradicional)
• Fee 1% al merchant (vs 4.5% del POS bancario — ahorro 60-75%)
• Sin chargebacks, sin contrato bancario, sin POS hardware
• Dashboard con reportes exportables, logo "Acepta Tropico" para vidriera

CINCO STREAMS DE REVENUE
• 0.5% por swap (Jupiter platformFeeBps)
• 0.3% spread en envíos USDC
• 2% del yield generado en Guardar
• 1% por cobro al merchant
• Carlos AI como acelerador de los anteriores

EFECTO RED BILATERAL
Cuando ambos lados (consumidor + merchant) están en Tropico, el dinero gira en USDC sin pasar por bancos. El merchant ahorra 60% en fees y puede devolver cashback al cliente. El cliente gana yield automático y paga sin perder valor. Todos ganan, menos el banco. Es la red económica caribeña en Solana, nativa de USDC, non-custodial.

CAPA AGÉNTICA CON OPENCLAW
Modo Agente sobre Lumen + Privy delegated session keys (OpenClaw opcional como policy engine) (showcase en MVP, integración real Q3). Carlos puede ejecutar 4 acciones autónomas con permisos limitados: DCA programado, auto-yield al recibir remesas, auto-cashback de comercios, re-balance de portafolio. Llaves nunca expuestas, policies con límites estrictos, sesiones que expiran.

CONFIANZA RADICAL
• Auditoría on-chain pública (link al fee account de Tropico en Solscan)
• Tropico nunca toca llaves del usuario
• Comparativas transparentes vs POS tradicional
• Open source del frontend (post-MVP)

ROADMAP
• Q3 2026: Lumen tool calling real + Privy delegated keys + on-ramp (OpenClaw opcional) con partners P2P / Reserve
• Q4 2026: Tropico Card (debit USDC con interchange + cashback)
• Q1 2027: LATAM expansion (CO, AR, MX, PE, CL) + Solana Mobile

Hecho en Venezuela, para Venezuela. Una app que combate la inflación, devuelve poder al venezolano, y construye la primera red económica privada de LATAM sobre Solana.
```

### 🎯 What did you build / Tech stack

```
TECH STACK
• Frontend: Next.js 15 (App Router) + React 19 + Tailwind 3
• Auth/Wallet: Privy (embedded MPC wallet) + Solana Wallet Adapter (Phantom/Solflare fallback)
• Swap: Jupiter v6 REST API con platformFeeBps=50
• Pagos: Solana Pay spec (URL solana: + reference tracking + findReference listener)
• AI: Google Gemini 2.0 Flash (Carlos AI copilot)
• RPC: Helius
• Tasa USD/VES: ve.dolarapi.com (paralelo)
• State: React Query 5
• Hosting: Vercel
• Capa agéntica: Lumen + Privy delegated keys (OpenClaw opcional, showcase MVP, integración real Q3)

DECISIONES TÉCNICAS CLAVE
• Cero programa Anchor custom — usamos protocolos abiertos de Solana (SPL Token, Jupiter, Solana Pay)
• Cero backend persistente / cero base de datos — solo /api/* routes (Edge runtime)
• Non-custodial estricto — Tropico nunca accede a llaves privadas
• Mobile-first PWA — instalable en Android viejo, sin Play Store
• Solana-Maxi branding — sin guiños a EVM/Tron
```

### 🔗 Links del proyecto

```
GitHub: https://github.com/[TU-USUARIO]/Hackathon
Demo en vivo: https://tropico.vercel.app  (cuando lo deployes)
Demo video (3-5 min): [URL YouTube unlisted del demo grabado]
Pitch deck: [URL Google Slides o PDF en repo]
Twitter/X: [si tienes cuenta del proyecto]
Telegram/WhatsApp: [grupo de comunidad si lo creaste]
```

### 👥 Team

```
[Tu nombre completo]
Solo founder & developer
LinkedIn: [tu URL]
Twitter/X: [tu handle]
GitHub: [tu username]
Email: rafa.oviedo2000@gmail.com

Background: developer venezolano, [años] de experiencia, primera vez construyendo en Solana.
```

### 🎬 Demo video script (para el campo "video URL")

Si te piden una descripción del video, puedes poner:

```
Demo de 4 minutos mostrando:
0:00–0:30  El problema (95% del cripto VE atrapado en USDT/Binance, POS tradicional 4.5%)
0:30–1:00  La visión Red Tropico (consumer + merchant, red caribeña en Solana)
1:00–1:30  Demo onboarding (login email vía Privy, wallet en 15s)
1:30–2:00  Demo Cambiar (swap SOL→JTO, fee 0.5% verificable en Solscan)
2:00–2:45  Demo Cobrar (split screen: cliente paga $5, comercio recibe $4.95, Tropico recibe $0.05, en <1s)
2:45–3:00  Demo Carlos AI (pregunta sobre yield, respuesta en venezolano)
3:00–3:30  Demo /comercios (comparativa visual vs Banesco)
3:30–4:00  Modelo + roadmap (5 streams, Q3 Lumen tool calling real + delegated keys, Q1 2027 LATAM)
```

### 🌟 What's special / Why should we win?

```
TROPICO ES LA PRIMERA PLATAFORMA MULTI-FEATURE NON-CUSTODIAL EN ESPAÑOL VENEZOLANO SOBRE SOLANA. Eso ya es un primero.

Pero más importante:
1. Modelo de negocio funcionando desde el día uno (verifiable en Solscan en vivo en el demo)
2. Efecto red bilateral genuino — cada merchant aumenta valor para usuarios y viceversa
3. Resuelve un dolor REAL de 28 millones de venezolanos (no es teoría — es necesidad diaria)
4. Construido por un venezolano que vive el problema, no un extranjero teorizando
5. Capa agéntica con OpenClaw posiciona el proyecto en el meta caliente del 2026 (AI Agents on Solana)
6. Plan honesto: lo que está real es real (Cambiar + Carlos), lo que es showcase está marcado como tal (Modo Agente, módulos UI-only). Cero deception.
7. 6 Tropico Claude Code skills creadas — código optimizado para colaboración con agentes IA, base para escalar el dev post-hackathon

No estamos haciendo un proof-of-concept. Estamos construyendo la infraestructura económica que LATAM necesita.
```

### 📊 Project metrics / KPIs (si te piden)

```
PROYECCIONES (Year 1)
• Mes 1: 1,000 usuarios + 20 comercios = $1.5K MRR
• Mes 6: 10,000 usuarios + 300 comercios = $30K MRR
• Mes 12: 50,000 usuarios + 2,000 comercios = $250K MRR
• Volumen procesado mes 12: $44M

ASUMPCIONES
• Volumen mensual promedio por usuario: $200-400
• Volumen mensual promedio por comercio: $5,000-12,000
• Customer acquisition cost: <$5 por usuario activo
• Payback: 5 meses
```

---

## 🎁 Bonus: nombres alternativos por si "Tropico" está tomado

Si "Tropico" ya está registrado en algún directorio:

1. **Red Tropico** (oficialmente la marca paraguas)
2. **Tropico Pay**
3. **Cumbre** (aspiracional, alternativa caribeña)
4. **Camino** (la travesía hacia libertad económica)
5. **Cardumen** (vibe colectivo / red)
6. **Catire** (slang VE para SOL/dorado — podría chocar)
7. **Bauche** (slang VE — informal, riesgoso)

---

## ⏱️ Checklist final antes de hacer submit

- [ ] Project Name: **Tropico**
- [ ] One-liner copiado tal cual (96 caracteres)
- [ ] Partner track: Virtuals (mínimo)
- [ ] Categoría: Consumer Apps
- [ ] Smart Contract address: vacío
- [ ] Local hub: Superteam Venezuela (si existe)
- [ ] Long description copiada
- [ ] Tech stack copiado
- [ ] GitHub repo público con licencia MIT
- [ ] Repo tiene README.md decente (mínimo: problema + demo gif + cómo correr)
- [ ] Demo video grabado y subido a YouTube unlisted (3-4 min)
- [ ] Live demo deployado en Vercel y funcionando
- [ ] Pitch deck (5-6 slides) en Google Slides público
- [ ] Wallet de fees con AL MENOS 1 swap demo recibido (link a Solscan en la descripción)
- [ ] Tu nombre + contacto en sección Team
- [ ] Releyé el form ANTES de submit — un typo en una URL te puede costar el premio

---

## 📞 Si tienes dudas durante el submit

- **Si te pide un campo que no sabés**: dejarlo vacío si es opcional. NO inventes URLs.
- **Si te pide un screenshot**: toma uno de la pantalla `/home` y otro de `/cobrar` con QR generado.
- **Si te pide un logo**: usa el placeholder gradient purple→green del header de Tropico (no diseño formal — eso viene post-hackathon).
- **Si el form se cae a mitad**: copia TODO el contenido de este doc primero a un Google Docs como backup. NO confíes en que el form guarde drafts.

---

**Última actualización**: 2026-05-08. Si cambia el alcance del proyecto, actualizar primero el brief, después este doc.
