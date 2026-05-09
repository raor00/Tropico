# Guión Video Demo — Tropico
## dev3pack Hackathon · Solana Ecosystem

---

| Campo            | Valor                                                        |
|------------------|--------------------------------------------------------------|
| **Duración**     | 3:00 minutos (180 segundos)                                  |
| **Audiencia**    | Jurado dev3pack + inversores ecosistema Solana               |
| **Tono**         | Caribeño venezolano, energía alta, claridad técnica          |
| **Formato**      | 1 presentador en cámara + screen recording lado a lado       |
| **Idioma**       | Español tuteo venezolano (tú / puedes / tienes)              |
| **Resolución**   | 1080p 30fps mínimo · audio limpio (mic de solapa o shotgun)  |

---

## STORYBOARD SEGUNDO A SEGUNDO

---

### BLOQUE 1 — El problema · `0:00 – 0:20` (20 seg)

**Pantalla:** Fondo negro → texto animado en blanco:
- `"95% del cripto venezolano = USDT/Tron"`
- `"Fee POS tradicional = 4.5%"`
- `"Bs devalúa. Otra vez."`

*(Puedes usar un splash screen en la landing `/` con el hero principal visible)*

**Presentador dice (palabra por palabra):**

> "¿Sabes cuánto paga un comerciante venezolano cada vez que acepta una tarjeta?
> Cuatro punto cinco por ciento. Y espera hasta tres días para ver ese dinero.
> Mientras tanto, el bolívar se devalúa, y el 95% del cripto venezolano sigue
> atrapado en Tron pagando fee en cada operación. Venezuela necesita otra cosa.
> Venezuela necesita Tropico."

**Tip de cámara / energía vocal:**
- Arranca mirando directo a cámara, voz firme y tranquila
- En "cuatro punto cinco por ciento" — levanta las cejas, pequeña pausa
- En "Venezuela necesita Tropico" — baja el tono, dilo con convicción, NO lo grités
- Pausa de 0.5 seg después de "Tropico" antes de cortar a la demo

---

### BLOQUE 2 — La solución + crear wallet · `0:20 – 0:35` (15 seg)

**Pantalla:** Screen recording abre `/` → landing de Tropico con hero y tagline → click en "Crear wallet" → navega a `/wallet/crear`

```
Navegación: / → click "Crear wallet" → /wallet/crear
   Mostrar: animación del Keypair generándose en browser
   Destacar: badge "Non-custodial" + badge "AES-GCM 256"
```

**Presentador dice:**

> "Tropico es la red económica del venezolano en Solana.
> Non-custodial, en español, y con un clic tienes tu wallet —
> generada en tu dispositivo, encriptada con AES-256.
> Tu llave. Tu plata. Nadie más la toca."

**Tip de cámara / energía vocal:**
- Mientras hablas, tu mano señala la pantalla donde aparece el Keypair
- "Tu llave. Tu plata. Nadie más la toca." — tres frases cortas con pausa entre cada una, como martillazos
- Esta es la frase de posicionamiento central: dila despacio

---

### BLOQUE 3 — El momento red: cobrar en bodega · `0:35 – 1:10` (35 seg)

**Pantalla:** Split-screen: izquierda = merchant en `/cobrar`, derecha = cliente simulando el pago

```
IZQUIERDA (merchant):
  /cobrar → escribe "$5.00" → genera QR Solana Pay
  Se ve el QR grande en pantalla

DERECHA (cliente):
  Simula escaneo del QR → aparece confirmation "$5.05"
  → click "Confirmar pago"
  → pantalla del merchant: "✅ Pago recibido $5.00"

Destacar: el número "$5.00" llega exacto al merchant
          el cliente pagó "$5.05" (fee HACIA ARRIBA)
          "Confirmado en Solana" debajo del check verde
```

**Presentador dice:**

> "Mira esto, pana. Una bodega quiere cobrar $5. Genera el QR acá en Tropico Comercios.
> El cliente lo escanea — ve $5.05 porque el fee va HACIA ARRIBA: tú pagas el fee,
> el comercio recibe el precio exacto que pidió.
> Un segundo. Un check verde. $5.00 exactos en la wallet del bodeguero.
> Sin POS. Sin contrato bancario. Sin chargebacks.
> Eso es lo que ningún banco te puede dar hoy en Venezuela."

**Tip de cámara / energía vocal:**
- En "mira esto, pana" — señala la pantalla con entusiasmo genuino, sonrisa
- En "el comercio recibe el precio exacto" — énfasis, esto es el diferencial técnico
- En "Un segundo" — levanta un dedo, pausa real de 1 segundo (efecto dramático)
- Después del check verde, pausa larga de 1.5 seg para que el jurado lo vea

---

### BLOQUE 4 — Carlos AI by Lumen · `1:10 – 1:40` (30 seg)

**Pantalla:** Navega a `/carlos` → se ven las 7 capability cards → escribe en el chat

```
Acción 1 — Chat simple:
  Escribe: "¿cuánto está el dólar hoy?"
  Carlos responde con la tasa BCV + paralelo en tiempo real
  (fuente: /api/precio-bs → ve.dolarapi.com)

Acción 2 — Modo Agente:
  Click en "Modo Agente" → /carlos/agente
  Toggle "DCA automático" → configurar: $20/semana en SOL
  Carlos muestra: "Configurado. Próxima compra: lunes 09:00"
```

**Presentador dice:**

> "Carlos AI — el copiloto financiero de Tropico, construido sobre Lumen,
> framework open source de agentes en español.
> Le pregunto cuánto está el dólar y me da BCV y paralelo en tiempo real.
> Pero Carlos no solo informa — actúa.
> En Modo Agente, le digo que quiero comprar $20 en SOL cada semana
> y él lo configura solo. DCA automático, monitoring de cada epoch,
> sin que tú tengas que recordar nada.
> Es el primer copiloto financiero que habla venezolano de verdad."

**Tip de cámara / energía vocal:**
- En "no solo informa — actúa" — pausa después del dash, baja la voz en "actúa"
- Esto sorprende al jurado técnico — deja que la pantalla hable 1 seg antes de seguir
- "habla venezolano de verdad" — ligera sonrisa, cómplice

---

### BLOQUE 5 — P2P Bs↔USDC con matching aleatorio · `1:40 – 2:05` (25 seg)

**Pantalla:** Navega al módulo P2P Bs↔USDC

```
Mostrar:
  - Formulario P2P: quiero vender 100 Bs por USDC
  - UI muestra: "Buscando contraparte... matching aleatorio"
  - Match encontrado → ambas partes confirman → 
    transacción completada via liquidity pool
  - Badge: "Carlos monitorea este epoch"
  - Si P2P no está disponible en ruta, mostrar la arquitectura
    como slide/diagrama con overlay sobre la app
```

**Presentador dice:**

> "Y ahora el feature que acabamos de lanzar: P2P Bs a USDC
> con matching aleatorio.
> Quiero convertir bolívares a USDC — Tropico busca una contraparte
> dentro de la red, hace el match de forma aleatoria para eliminar
> front-running, y la operación liquida a través del liquidity pool propio.
> Carlos monitorea cada epoch para detectar condiciones de mercado
> y alertarte si el tipo de cambio se mueve más de lo esperado.
> Esto es DeFi real para el venezolano de a pie.
> Sin Binance. Sin P2P con desconocidos de Telegram."

**Tip de cámara / energía vocal:**
- "acaba de lanzar" — di esto con energía, es nuevo
- "Sin Binance. Sin P2P con desconocidos de Telegram." — dos pausas cortas, cada frase es un golpe
- Este bloque es el WOW moment técnico — permite que el jurado asimile

---

### BLOQUE 6 — Remesas + Pagar Servicios VE · `2:05 – 2:30` (25 seg)

**Pantalla:** Navega a `/enviar` → luego a módulo Pagar Servicios

```
Enviar (remesas):
  /enviar → escribe wallet destino o número de teléfono
  → genera claim link para WhatsApp
  → botón "Compartir por WhatsApp" — deep link real
  → badge: "Llega en < 1 segundo"

Pagar Servicios:
  Módulo servicios VE → ícono Electricidad → escribe número de contrato
  → monto → confirmar
  (mostrar los servicios disponibles: luz, teléfono, internet)
```

**Presentador dice:**

> "Tropico también es la wallet para toda la vida cotidiana venezolana.
> ¿Quieres enviar dinero a tu familia? Generas un link, lo mandas por WhatsApp,
> y llega en menos de un segundo a cualquier wallet Solana del mundo.
> ¿Tienes que pagar la luz o el teléfono? Lo haces desde la misma app,
> en USDC, sin ir a la sucursal y sin colas.
> Una wallet. Todo adentro. Ninguna app en Venezuela te da eso hoy."

**Tip de cámara / energía vocal:**
- Ritmo rápido en este bloque — son features que demuestran amplitud del producto
- "Una wallet. Todo adentro." — pausa entre las dos frases, sonrisa confiada
- Señala la pantalla en cada feature mientras lo nombras

---

### BLOQUE 7 — Tropico Pay para integraciones B2B · `2:30 – 2:50` (20 seg)

**Pantalla:** Navega a `/comercios` → muestra el dashboard merchant → luego API docs o snippet de integración

```
Mostrar:
  - Landing /comercios con comparativa fee 1% vs 4.5%
  - Sección "Tropico Pay" → REST API + drop-in widget
  - Código de ejemplo:
```

```javascript
// Integración Tropico Pay — 3 líneas
const tropico = new TropicoPay({ merchantId: 'MERCH_001' })
const order = await tropico.createOrder({ amount: 5.00, currency: 'USDC' })
window.location = order.checkoutUrl // hosted checkout listo
```

```
  - Mencionar: "Yummy Rides, PedidosYa, cualquier plataforma puede integrar esto"
```

**Presentador dice:**

> "Y para las plataformas que quieren integrar pagos Solana sin construir nada:
> Tropico Pay. REST API, widget drop-in, o checkout hosted.
> Tres líneas de código y tu plataforma acepta USDC.
> El merchant recibe el precio exacto, el fee va hacia arriba,
> y tú no tocas ni una llave privada.
> Cualquier marketplace, app de delivery, o servicio en Venezuela
> puede tener pagos on-chain en una tarde."

**Tip de cámara / energía vocal:**
- Muestra el snippet de código en pantalla, dale 2 segundos de vida
- "Tres líneas de código" — levanta tres dedos, gesto simple pero efectivo
- "en una tarde" — ligera sonrisa de orgullo técnico

---

### BLOQUE 8 — Cierre · `2:50 – 3:00` (10 seg)

**Pantalla:** Fondo oscuro → logo Tropico centrado → URL del demo → URL del GitHub

```
Texto en pantalla (aparece animado):
  TROPICO
  tropico.app/demo
  github.com/[tu-usuario]/hackathon
  dev3pack · Solana · 2026
```

**Presentador dice:**

> "La wallet caribeña en Solana.
> No vinimos a competir con custodios.
> Vinimos a darte tu wallet de verdad."

**Tip de cámara / energía vocal:**
- Mira directo a la cámara, sin parpadear
- Tres frases, tres latidos. Silencio después de cada una
- La tercera frase — "Vinimos a darte tu wallet de verdad" — dila más lento que las anteriores
- Después de la última frase: SILENCIO de 1 segundo completo antes de que el video corte a negro
- Este es el cierre que se va a recordar. No lo apures.

---

## FRASE DE CIERRE — Grabá 3 tomas y elegí la mejor

Grabá esta frase sola, sin el resto del video, tres veces seguidas en distintos matices:

**Toma 1 — Directa y fría** *(como afirmación de hecho)*
> "La wallet caribeña en Solana. No vinimos a competir con custodios. Vinimos a darte tu wallet de verdad."

**Toma 2 — Con calor venezolano** *(como si se lo dijeras a un pana)*
> "La wallet caribeña en Solana. No vinimos a competir con custodios. Vinimos a darte tu wallet de verdad."

**Toma 3 — Con pausa dramática entre frases** *(para el jurado técnico)*
> "La wallet caribeña en Solana. *(pausa 0.8s)* No vinimos a competir con custodios. *(pausa 0.8s)* Vinimos a darte tu wallet de verdad."

**Criterio para elegir:** la que se sienta más auténtica tuya, no la más "producida". El jurado detecta cuando algo está sobreactuado.

---

## RESUMEN VISUAL DE TIMING

| Bloque | Rango     | Duración | Contenido                                   |
|--------|-----------|----------|---------------------------------------------|
| 1      | 0:00–0:20 | 20 seg   | Hook + problema venezolano                  |
| 2      | 0:20–0:35 | 15 seg   | Solución + crear wallet en vivo             |
| 3      | 0:35–1:10 | 35 seg   | Momento red: bodega cobra $5 exactos        |
| 4      | 1:10–1:40 | 30 seg   | Carlos AI — chat + Modo Agente DCA          |
| 5      | 1:40–2:05 | 25 seg   | P2P Bs↔USDC matching aleatorio (NUEVO)      |
| 6      | 2:05–2:30 | 25 seg   | Remesas 1 seg + Pagar Servicios VE          |
| 7      | 2:30–2:50 | 20 seg   | Tropico Pay para integraciones B2B          |
| 8      | 2:50–3:00 | 10 seg   | Cierre + URL demo + GitHub                  |
| **TOTAL** | **0:00–3:00** | **180 seg** | — |

---

## TIPS DE GRABACIÓN

### Setup técnico recomendado

```
Resolución : 1080p (1920×1080), 30fps mínimo / 60fps ideal
OBS Studio : Scene con 2 sources: Webcam + Window Capture (browser)
Layout     : Webcam esquina inferior derecha, 20% del frame
             Screen recording ocupa el 80% restante
Audio      : Micrófono de solapa (lavalier) o micrófono de condensador
             NO usar audio del laptop/monitor — el ruido arruina el pitch
Iluminación: Una luz frontal suave (ring light o luz natural de ventana)
             Fondo limpio — pared plana o banner del proyecto
```

### Cómo manejar el split-screen del cobro (Bloque 3)

El momento bodega-cliente en `0:35–1:10` es el corazón del demo. Dos opciones:

**Opción A — OBS Side by Side (recomendado para demo en vivo)**
```
1. Abre 2 ventanas del browser: 
   Ventana izquierda  → /cobrar (merchant)
   Ventana derecha    → /cobrar simulado (cliente)
2. En OBS crea una Scene con Window Capture x2, escala cada una a 50%
3. La transición de pago es el botón "Simular pago" — ya está en la UI
```

**Opción B — Video pre-editado del split screen**
```
1. Graba cada lado por separado con pantalla completa
2. En Final Cut / DaVinci / Capcut: split screen 50/50 con sincronía manual
3. Importa como clip en OBS como "Media Source"
Ventaja: control total sobre el timing
```

### Plan B si la WiFi falla o un endpoint cae

El momento más crítico es el QR de Solana Pay (Bloque 3). Prepará esto:

```
Contingencia 1 — Endpoint /cobrar no carga:
  Tener un video de 30 seg pre-grabado del flow completo de cobro
  En OBS: Source "Video Cobro Backup" — switch con hotkey F5
  Di: "Para el demo voy a reproducir un flow que grabamos antes"
  Esto es honesto y profesional — el jurado lo entiende

Contingencia 2 — Jupiter API no responde en /cambiar:
  El UI muestra banner "Demo mode — sin firma real" de todas formas
  Sigue la demo normalmente, menciona que en mainnet con keys la tx es real

Contingencia 3 — /api/precio-bs no responde:
  Carlos tiene fallback de keyword routing sin API key
  La respuesta será genérica pero Carlos sigue funcionando
  Di: "Sin la API key de Gemini, Carlos usa su conocimiento base"

Contingencia 4 — Corte de internet total:
  Ten abierto un video de 3 min pre-grabado del demo completo
  Switch en OBS a "Full Demo Backup" — da el mismo pitch sobre el video
  Es tu seguro de vida — grábalo antes del evento aunque creas que no lo vas a necesitar
```

### Cosas que NO decir en el video

```
❌ NO mencionar competidores por nombre
   (en especial: el nombre del banco detrás del POS tradicional,
    ni plataformas custodiales de la región)

❌ NO garantizar rendimientos fijos
   Decir "genera rendimiento" o "~5% histórico" es OK
   NO decir "te garantizo el 5%" — es falso y es un problema legal

❌ NO hablar de política venezolana, gobierno, ni inflación como falla de gestión
   El framing correcto es: "Venezuela tiene condiciones únicas de mercado"
   No es una crítica política — es un argumento de product-market fit

❌ NO decir "como Phantom pero..." — posiciona a Tropico como derivado, no como original

❌ NO mencionar que algún feature está en construcción o que "viene pronto"
   Si no está en el demo, no existe para esta presentación
   Si el jurado pregunta después, ahí sí puedes hablar de roadmap

❌ NO pedir disculpas por errores técnicos durante el demo
   Si algo falla, di "eso lo tenemos cubierto en el plan B" y seguí
```

---

## ENSAYO RECOMENDADO

1. **Día -3**: Leer el guión completo en voz alta 3 veces cronometrando. Objetivo: 3:10 o menos.
2. **Día -2**: Grabar una toma completa sin editar. Ver el video y anotar qué sonó raro.
3. **Día -1**: Grabar la toma final con setup completo. Pre-grabar también el Plan B de contingencia.
4. **Día 0**: Tener el video editado ya listo para subir. No grabar el mismo día si podés evitarlo.

**Tiempo de habla vs silencio**: el 20% del tiempo son pausas. No las cortes en la edición — funcionan.

---

*Guión generado para dev3pack · Tropico Hackathon · Solana 2026*
