# Tropico — Demo Readiness

> **Cómo usar este doc**: este es el mapa vivo del progreso al demo. Siempre actualizado. Si algo cambia, primero acá.

**Última actualización**: 2026-05-08 (sprint 5 — TODAS LAS 11 RUTAS LIVE 🎉)

---

## 🟢 Estado actual — DEMO COMPLETO RUNNABLE SIN API KEYS

Las 11 rutas devuelven 200 OK. El flow end-to-end está demoable:

| Pantalla | URL | Estado | Detalle |
|---|---|---|---|
| **Landing** | `/` | ✅ FULL | Hero + 3 cards módulos + CTAs Privy/Phantom |
| **Descubrir** | `/descubrir` | ✅ FULL | 8 tokens curados con copy venezolano |
| **Home / Portfolio** | `/home` | ✅ FULL (mock) | Saldo $348 + yield + cashback notif + DCA notif + 6 ModuleCards + BalanceList |
| **Cambiar (swap)** | `/cambiar` | ✅ FULL | Jupiter Quote API REAL (cotizaciones reales) + UI completa + banner demo (no firma sin wallet) |
| **Cobrar (QR)** | `/cobrar` | ✅ FULL | QR Solana Pay generado real con `qrcode` lib + listener simulado con botón "Simular pago" + WhatsApp share |
| **Enviar** | `/enviar` | ✅ FULL | Form send + generación de claim link real + WhatsApp deep link funcional |
| **Guardar** | `/guardar` | ✅ FULL | Yield UI con saldo + ganado + 3 estrategias (mSOL, Kamino USDC, Kamino LP) |
| **Depositar** | `/depositar` | ✅ FULL | On-ramp stub honesto + form simulado + faucet button funcional |
| **Tropico Comercios** | `/comercios` | ✅ FULL | Landing merchant con comparativa vs POS tradicional + form afiliación |
| **Carlos AI** | `/carlos` | 🟡 UI shell | Greeting + quick prompts (chat real necesita Gemini API key) |
| **Carlos Modo Agente** | `/carlos/agente` | ✅ FULL | Toggle + 4 acciones + historial + arquitectura híbrida Hermes+OpenClaw |
| **API tasa bs** | `/api/precio-bs` | ✅ Live | ve.dolarapi.com (paralelo + BCV) |

**Demo posible AHORA (sin keys, 4-5 min)**: flow completo de los dos lados de la red económica.

---

## 🔴 Lo que SÍ requiere API keys reales (post sprint sin keys)

| Feature | Requiere | Quién lo configura |
|---|---|---|
| Login real con email vía Privy | `NEXT_PUBLIC_PRIVY_APP_ID` | Tú en https://dashboard.privy.io |
| Lectura de balances reales en mainnet | `NEXT_PUBLIC_HELIUS_RPC` | Tú en https://dashboard.helius.dev |
| Carlos chat funcional | `GOOGLE_GENERATIVE_AI_API_KEY` | Tú en https://aistudio.google.com/apikey |
| Swap real con fee llegando a wallet de Tropico | Wallet de fees + ATAs creadas | Tú via `solana-keygen` y `spl-token` |
| Cobros reales que aterrizan en wallet del merchant | Wallet del merchant conectada | Setup wallet del merchant en Privy |

**Sin estas keys**: el demo es 100% UX/UI con simulaciones honestas.
**Con estas keys**: el demo es 100% real con tx verificable on-chain.

---

## 🎬 Script del demo de 5 minutos (versión live)

> **Cuándo se puede grabar**: en cuanto terminemos las pantallas en construcción (próximo sprint, ~6-8h). Sin API keys da para 4 minutos sólidos. Con keys reales da para 5 minutos completos con momento "wow on-chain".

### Versión SIN API keys (demo simulado, 4 min)

```
0:00–0:30  Landing /
   "Soy [tu nombre]. Tropico es la red económica del venezolano en Solana —
    no es una wallet más, es una red de pagos non-custodial paralela al banco."
   Mostrar landing, hero, las 3 cards.

0:30–1:00  Descubrir /descubrir
   Click en "Descubrir tokens" → grid de 8 tokens con copy en venezolano.
   "El venezolano cripto solo conoce USDT. Tropico le abre el ecosistema."

1:00–1:45  Tropico Comercios /comercios
   Click pestaña merchant → comparativa visual vs POS tradicional.
   "Por cada $1.000 vendidos, el comercio ahorra $35 al mes."
   Scroll: features, 3 pasos, form de afiliación.
   "Esto es el efecto red bilateral — usuarios + merchants en una sola app."

1:45–3:00  Carlos AI Modo Agente /carlos/agente
   "Acá está el wow técnico. Carlos puede ejecutar acciones con permisos limitados."
   Activar toggle global → activar DCA → "Simular ejecución" → ver historial.
   Activar Auto-yield → "Simular ejecución" → mostrar el detalle.
   Mostrar arquitectura híbrida Hermes (cerebro) + OpenClaw (manos).
   "Hoy es showcase. En Q3 va con execution real on-chain."

3:00–3:30  Modelo de negocio (slide o ad-lib)
   "Cinco streams de revenue. Mes 12: $250K MRR sobre $44M de volumen."
   Mostrar pitch deck con números.

3:30–4:00  Visión + cierre
   "Q3: integración real. Q4: Tropico Card. Q1 2027: LATAM expansion.
    Tropico no es una wallet. Es la infraestructura económica que el venezolano necesita."
```

### Versión CON API keys (demo real, 5 min)

```
0:00–0:30  Landing + onboarding
   Click "Empezar con email" → Privy crea wallet con MPC en 15s → llegamos a /home.
   "El venezolano sin cripto puede entrar en 15 segundos."

0:30–1:30  /home → Cambiar SOL → JTO con fee real
   "Saldo $50 USDC. Yield acumulado $0.21 esta semana."
   Click Cambiar → SOL → JTO con $10 → Jupiter quote → "Comisión Tropico 0.5%".
   Confirmar → split screen mostrando Solscan con la fee aterrizando en cuenta de Tropico.
   "Esto es revenue real desde el primer swap. Verificable on-chain."

1:30–2:30  /cobrar — el momento red económica
   Abrir otra ventana como merchant → ingresar $5 → generar QR.
   En la primera ventana, escanear el QR con la wallet de cliente → confirmar pago.
   Split screen: cliente "-$5 +$0.05 cashback", merchant "+$4.95", Tropico "+$0.05" en <1s.
   "Esto es lo que ningún POS hace en 1 segundo."

2:30–3:00  Carlos AI con respuesta real Gemini
   "¿Por qué tengo yield si no activé nada?" → respuesta venezolana en <2s.

3:00–3:45  /carlos/agente Modo Agente
   Activar 2 acciones, simular ejecución, mostrar histórico, mostrar arquitectura híbrida.

3:45–4:15  /comercios tour + modelo de negocio
   Comparativa POS tradicional, números, proyección $250K MRR mes 12.

4:15–5:00  Visión Q3/Q4/2027 + cierre
   "Tropico no es una wallet. Es la infraestructura económica que LATAM necesita."
```

---

## 📋 Pre-demo checklist (todos los puntos a verificar antes de presentar)

### Técnico

- [ ] `npm run dev` corriendo sin errores
- [ ] `npm run build` compila sin warnings críticos
- [ ] Todas las pantallas devuelven 200 OK
- [ ] `/api/precio-bs` devuelve tasa real (no fallback)
- [ ] Modo Agente toggle persiste tras refresh
- [ ] Las acciones agentic guardan correctamente en historial
- [ ] Form de afiliación de comercios guarda en localStorage
- [ ] Mobile-first verificado en 360px ancho
- [ ] PWA instalable en Android Chrome

### Visual

- [ ] Logo final en `/public/icons/` (cuando esté generado)
- [ ] DualPrice (USD + bs) visible en todas las pantallas con valores
- [ ] Animaciones fade-up funcionan en mounts
- [ ] Cero copy en inglés (excepto nombres tokens y "swap")
- [ ] Loading states visibles cuando aplica
- [ ] Error states claros si la API falla

### Demo en vivo

- [ ] Demo grabado en YouTube unlisted (BACKUP CRÍTICO)
- [ ] Pitch deck (5 slides) listo en Google Slides público
- [ ] WiFi del lugar verificado, 4G tethering como respaldo
- [ ] 2 dispositivos disponibles (laptop + teléfono para demo de QR)
- [ ] Wallets de demo precargadas con SOL/USDC en devnet
- [ ] (Si se usa mainnet) wallet de fees de Tropico con al menos un swap previo verificable en Solscan

### Submit del hackathon

- [ ] Form de submission completo con datos de `docs/REGISTRO_PROYECTO.md`
- [ ] Repo público en GitHub con licencia MIT
- [ ] README.md con problema, demo gif, stack, decisiones
- [ ] Live demo deployado en Vercel
- [ ] Demo video link en submission
- [ ] Pitch deck link en submission

---

## ⏱️ Plan estimado al primer demo grabable

| Bloque | Tiempo | Tarea | Estado |
|---|---|---|---|
| 1 | DONE | Foundation Next.js + providers + Tailwind | ✅ |
| 2 | DONE | Landing + Descubrir + Comercios + Modo Agente | ✅ |
| 3 | DONE | 6 Tropico Claude Code skills + LOGO_PROMPT | ✅ |
| **4** | **2-3h** | **Mock /home con saldo + balances + ModuleCards** | 🟡 ahora |
| **5** | **2h** | **Mock /cambiar con Jupiter Quote real (no requiere wallet) + demo banner** | Próximo |
| **6** | **1.5h** | **Mock /cobrar con QR generation real + listener simulado** | Próximo |
| **7** | **1h** | **Mock /enviar con claim link + WhatsApp share** | Próximo |
| **8** | **1h** | **Mock /guardar yield UI** | Próximo |
| **9** | **0.5h** | **Mock /depositar onramp stub** | Próximo |
| 10 | 1h | Polish + responsive + verificación cross-screen | |
| 11 | 1h | Deploy Vercel + grabar demo (4 min sin keys) | |
| 12 | 0.5h | README + submit form | |

**Total al primer demo grabable**: ~10-12h de trabajo desde HOY.
**Para demo con tx real**: agregar API keys (Privy/Gemini/Helius) y wallet de fees → +2h.

---

## 🎯 Siguiente paso INMEDIATO

Construir `/home` con datos mock — es la pantalla que conecta TODO. Saldo + yield + 5 ModuleCards + lista de balances. Sin esto el demo no tiene "centro".

Después: cambiar, cobrar, enviar, guardar, depositar (en ese orden de prioridad).

---

## 📞 Cuándo me dices "ya tengo las API keys"

En cuanto las tengas:

1. Pegás el bloque `.env.local` que está en `docs/REGISTRO_PROYECTO.md` con valores reales
2. Reiniciamos `npm run dev`
3. Reemplazo los mocks por las llamadas reales (Privy login, Helius RPC, Gemini chat, Jupiter swap real con fee)
4. Verificamos en Solscan que la fee del primer swap aterriza en la wallet de Tropico
5. Grabamos demo versión 5min con tx real

Ese momento "fee llegando en Solscan en vivo" es **el momento ganador del pitch**.

---

**Estado a hoy**: 🟢 100% del demo runnable sin keys. Listo para grabar versión 4-5min.
**Estado con keys (Privy + Helius + Gemini + wallet de fees)**: 🟢 demo de 5min con momento "wow on-chain real" verificable en Solscan.

---

## 🎯 Demo flow completo — script paso a paso

### Para grabar HOY (sin API keys, 5 min)

**0:00–0:20 — Landing (`/`)**
> "Soy [tu nombre]. Tropico es la red económica del venezolano en Solana — no es una wallet, es una red de pagos paralela al sistema bancario."
- Mostrar hero con gradient
- Click en "Empezar con email"

**0:20–0:50 — Home (`/home`)**
> "Saldo $348 USDC con yield del 5.2% APY automático. Yield esta semana: 48 centavos. Sin activar nada."
- Mostrar saldo total, yield acumulado, cards de notificación (cashback, DCA)
- Mencionar las 6 acciones disponibles

**0:50–1:30 — Cambiar (`/cambiar`)**
> "Cambiar SOL a JTO con $10. Cotización en vivo desde Jupiter v6."
- Click Cambiar → ingresar monto → ver Jupiter Quote real cargando
- Mostrar "Comisión Tropico 0.5% — $0.05" destacado
- "Esto es revenue desde el primer swap. Verificable on-chain en producción."

**1:30–2:30 — Cobrar (`/cobrar`)** ⭐ EL MOMENTO RED ECONÓMICA
> "Ahora del lado merchant. Soy una bodega cobrando $5."
- Ingresar $5 → generar QR REAL Solana Pay
- "El cliente escanea con su wallet, paga, settlement <1s"
- Click "Simular pago recibido" → animación de éxito
- "El comercio recibe $4.95, Tropico se queda $0.05, todos ganan"
- Compartir recibo por WhatsApp (deep link funciona)

**2:30–3:00 — Carlos Modo Agente (`/carlos/agente`)** ⭐ EL WOW TÉCNICO
> "Carlos puede ejecutar acciones autónomas con permisos limitados. Arquitectura híbrida Hermes + OpenClaw."
- Activar toggle global → activar DCA semanal
- Click "Simular ejecución" → ver historial actualizarse
- Mostrar las 4 acciones disponibles
- Mostrar la sección de arquitectura (cerebro + manos)

**3:00–3:30 — Tropico Comercios (`/comercios`)**
> "Lado merchant: comparativa visual."
- Scroll a la comparativa: $35/mes ahorro vs POS tradicional
- "Por cada $1.000 en ventas, el comercio se ahorra $35 al mes"
- Mostrar form de afiliación

**3:30–4:00 — Modelo de negocio + visión**
> "5 streams de revenue. Mes 12: 50K usuarios + 2K comercios = $250K MRR sobre $44M de volumen."
- Mostrar pitch deck o slide con números

**4:00–5:00 — Cierre con visión**
> "Q3: integración real OpenClaw + on-ramp con partners. Q4: Tropico Card. Q1 2027: LATAM expansion. Tropico no es una wallet. Es la infraestructura económica que LATAM necesita."

### Si tienes API keys agregás:
- Demo onboarding REAL con Privy (login con email → wallet en 15s)
- Swap REAL con la fee llegando a tu wallet (split-screen Solscan)
- Carlos chat respondiendo en venezolano con Gemini

---

## 🚀 Próximos pasos para mejorar el demo

| Prioridad | Tarea | Esfuerzo | Cuándo |
|---|---|---|---|
| 🔥 ALTA | Generar logo final pixel art | 30min externo | Inmediato (usa el prompt en `LOGO_PROMPT.md`) |
| 🔥 ALTA | Reemplazar placeholder gradient del header con logo real | 15min | Cuando tengas el logo |
| 🔥 ALTA | Deploy a Vercel | 30min | YA |
| 🔥 ALTA | Grabar demo video (4-5 min) en YouTube unlisted | 1h | Cuando deploy esté live |
| 🟡 MEDIA | Pitch deck (5-6 slides) en Google Slides | 2h | Antes del submit |
| 🟡 MEDIA | README.md con problema + demo gif + decisiones | 1h | Antes del submit |
| 🟢 BAJA | Agregar Privy + Gemini + Helius keys | 30min config + 2h integración | Si quieres demo con tx real |
| 🟢 BAJA | Crear wallet de fees + ATAs + hacer un swap demo | 1h | Para tener "fee real" en Solscan para mostrar en pitch |
