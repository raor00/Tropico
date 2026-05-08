# Guión de entrevista — Tropico

> **Cómo usar este guión**: lee los bloques 1-9 hasta sentirlos naturales. NO memorices palabra por palabra — entendé la lógica de cada bloque. La sección 10 son respuestas a preguntas típicas que te van a hacer; léelas para tener munición lista.
>
> **Si la entrevista es con audiencia NO técnica** (inversores LATAM no-cripto, prensa generalista, familia, amigos): empieza con el **Bloque 0** abajo. Es la versión simple, sin jerga, lista para que cualquiera entienda en 30 segundos.

---

## Bloque 0 — Versión simple para audiencias no técnicas (1 minuto hablado)

> *"Te explico fácil: en Venezuela todos vivimos peleándole a la inflación. El bolívar se devalúa, el USDT te lo cobran cada operación, y el comercio que te quiere cobrar con POS tradicional le sacan casi 5%.*
>
> *Tropico resuelve eso de un solo tiro. Es una app donde guardas tu plata en dólares digitales que no se devalúan. Mientras está ahí guardada, gana intereses sola — como un 5% al año, automático, sin que tengas que activar nada.*
>
> *Y cuando vas a pagar a una bodega o a un freelancer afiliado, escaneás un código con tu teléfono y la plata le llega en menos de un segundo. Sin tarjeta, sin POS, sin contrato bancario. El comercio paga 1% de comisión en vez de 5% — y esa diferencia te la puede devolver como cashback.*
>
> *La gracia es que tu plata es tuya — Tropico nunca la toca. Es como tener efectivo en el bolsillo, pero en dólares, ganando intereses, y aceptado en una red de comercios que crece todos los días.*
>
> *Es la primera vez que un venezolano tiene algo así. Ahí está lo grande."*

**Tips de entrega:**
- Leélo de corrido, sin frenar entre párrafos — suena más natural
- 1 minuto exacto a velocidad normal — practicalo cronometrado 3 veces
- Si la persona ya conoce cripto, saltá el primer párrafo y arranca con "Tropico es una app donde…"
- Cierre firme: *"Ahí está lo grande"* — dilo mirando a los ojos, después callate y espera la próxima pregunta

---

## Bloque 1 — Tu apertura (45 segundos)

> **"Soy [tu nombre], desarrollador venezolano. Construí Tropico, que es la red económica del venezolano en Solana. No es una wallet más — es una red de pagos paralela al sistema bancario, donde el usuario ahorra en USDC generando rendimiento automático y los comercios cobran con un fee del 1% en lugar del 4.5% que cobra Banesco. Todo non-custodial, todo en español venezolano, todo en una sola app."**

**Tip de entrega**: habla con calma. La frase clave es "red económica paralela al sistema bancario" — esa es la que te diferencia de cualquier wallet.

---

## Bloque 2 — El problema (1 minuto)

> **"En Venezuela, el 95% del volumen cripto vive atrapado en USDT/Tron por Binance P2P. La gente paga 1-3% en cada operación P2P, sus ahorros en bolívares pierden valor cada día por la inflación, y los comercios pagan 4.5% en POS tradicional más esperan 24-72 horas para ver la plata. Las apps en español que existen — Reserve, Kontigo, Zinli — son custodias y solo guardan dólares. Phantom es non-custodial pero asume que ya sabés cripto, lo cual deja afuera al 95% del mercado venezolano. **No existe una plataforma multi-feature, non-custodial, en español, sobre Solana, para Venezuela. Esa es la oportunidad.**"**

**Tip**: cuando digas los números (95%, 4.5%, 24-72h), pausá un beat. Los números entregados con confianza generan credibilidad inmediata.

---

## Bloque 3 — La solución (1 minuto)

> **"Tropico tiene dos productos integrados bajo una marca paraguas:**
>
> **Tropico Wallet, para el consumidor: login con email vía Privy — sin instalar Phantom, sin seed phrases. Su saldo en USDC genera ~5% de rendimiento automático sin que tenga que hacer nada. Puede cambiar entre tokens al mejor precio vía Jupiter, enviar dinero por WhatsApp con un link, y tiene a Carlos, un copiloto de IA que le explica todo en venezolano sin jerga.**
>
> **Tropico Comercios, para el merchant: genera un código QR, su cliente paga con cualquier wallet de Solana, y la plata aterriza en su wallet en menos de un segundo, con un fee del 1% en vez del 4.5% que paga con Banesco. Sin chargebacks, sin contrato bancario, sin POS hardware caro.**
>
> **Cuando ambos lados están dentro de la red, el dinero gira en USDC sin pasar por bancos. Es una red de pagos caribeña en USDC, non-custodial — sin bancos en el medio."**

---

## Bloque 4 — Cómo funciona técnicamente (45 segundos)

> **"El stack es Next.js 15 + Privy para embedded wallets + Jupiter v6 para swaps + Gemini 2.0 Flash para Carlos AI + Helius como RPC. Cero programa Anchor custom — usamos los protocolos abiertos de Solana directamente. Cero backend persistente — todo es client-side y server actions de Next.js. Cero base de datos — el estado vive en la blockchain o en Privy.**
>
> **El modelo de negocio es elegante: Jupiter expone un parámetro `platformFeeBps` que rutea automáticamente el 0.5% de cada swap a una cuenta nuestra de Solana. Eso es revenue real desde el primer swap, verificable on-chain en Solscan. Cinco streams de revenue distintos: swaps, envíos, yield share, merchant fees, y eventualmente Card."**

**Tip**: si no son técnicos, puedes saltar este bloque entero y pasar al modelo de negocio. Si son técnicos, este bloque te valida.

---

## Bloque 5 — El modelo de negocio (1 minuto)

> **"Tenemos 5 streams de revenue desde el día uno:**
>
> 1. **0.5% por cada swap** vía Jupiter platformFeeBps
> 2. **0.3% spread en envíos** USDC peer-to-peer
> 3. **2% del rendimiento generado** por el módulo Guardar (mSOL/Kamino)
> 4. **1% al merchant** por cada cobro vía QR
> 5. **Y el rol de Carlos AI** que multiplica la frecuencia de uso de los otros cuatro
>
> **Las proyecciones: mes 1, mil usuarios y veinte comercios → mil quinientos dólares de revenue mensual. Mes 12: cincuenta mil usuarios y dos mil comercios → 250 mil dólares de revenue mensual con un volumen de 44 millones procesados. Y eso sin contar add-ons que vienen en roadmap como Tropico Card o Vaults."**

---

## Bloque 6 — Por qué Solana, por qué ahora (45 segundos)

> **"Solana es la única blockchain que cierra todos los requisitos para esto: transacciones de menos de 0.001 dólar (en Tron son centavos pero variables, en Ethereum son dólares), settlement de menos de un segundo, ecosistema completo con Jupiter para swaps, mSOL para staking líquido, Solana Pay para QRs estándar, y embedded wallets vía Privy. **En Tron no puedes hacer esto sin custodia. En Ethereum los fees matarían el caso de uso para tickets de 5 dólares.** Solana es el único hogar posible para una red económica paralela en LATAM."**

---

## Bloque 7 — La capa agéntica (45 segundos, opcional pero impacta)

> **"Estamos construyendo una capa agéntica encima de Carlos AI usando OpenClaw — un framework open-source de agentes que se integra nativamente con Privy. Esto le permite al usuario delegar acciones autónomas a Carlos con permisos limitados: por ejemplo, 'Carlos, compra $50 de SOL cada lunes', o 'cuando reciba una remesa, mové automáticamente el excedente a yield'. Llaves nunca expuestas, policies con límites estrictos, sesiones que expiran. Es lo que ningún wallet en LATAM tiene hoy."**

---

## Bloque 8 — Diferenciación competitiva (30 segundos)

> **"Frente a Binance P2P, somos non-custodial. Frente a Reserve y Kontigo, somos multi-feature y abrimos el ecosistema completo de Solana en lugar de mantener al usuario atrapado en USD custodiado. Frente a Phantom, somos accesibles para alguien que nunca usó cripto: login con email, copy en venezolano, Carlos AI para preguntas. Y frente a cualquiera de ellos, somos los únicos con red de comercios afiliados — eso es el efecto red bilateral que hace que Tropico crezca exponencialmente, no linealmente."**

---

## Bloque 9 — Visión y cierre (30 segundos)

> **"Para los próximos 12 meses: tercer trimestre activamos on-ramp real con partners P2P y Reserve, y la integración real con OpenClaw. Cuarto trimestre lanzamos Tropico Card — debit Visa backed por USDC con cashback. Primer trimestre del 27 expandimos a Colombia, Argentina, México, Perú y Chile.**
>
> **Tropico no es una wallet. Es la infraestructura económica que el venezolano necesita y que nadie le está dando. Y arrancando hoy."**

**Tip de cierre**: termina con esa frase exacta — *"Tropico no es una wallet. Es la infraestructura económica que el venezolano necesita y que nadie le está dando."* Es tu mic-drop.

---

## Bloque 10 — Preguntas típicas y respuestas

### Q: "¿Y si los venezolanos no confían en cripto?"

> "La desconfianza no es con cripto, es con custodia. Los venezolanos confían en USDT — el problema es que están atados a una sola opción y a un único exchange. Tropico es non-custodial: la wallet es del usuario, Tropico nunca toca las llaves. Tenemos cuatro pilares de confianza visibles en la app: link directo al fee account de Tropico en Solscan para que cualquiera vea cuánto cobramos, banner permanente 'Tropico nunca toca tu plata', comparativas transparentes con Banesco y Binance, y el frontend será open source post-MVP."

### Q: "¿Hay algo parecido en LATAM o competidores cercanos?"

> "Wallets de pago tradicionales cobran 4-6% al merchant, operan en monedas locales que se devalúan, y son totalmente custodios. Tropico cobra 1%, opera en USDC estable, y es non-custodial — la wallet caribeña en Solana. Mismo efecto red bilateral, economía moderna sobre blockchain pública. Ningún wallet en LATAM combina esto: USDC estable + yield default + red de comercios + non-custodial."

### Q: "¿Cuál es tu ventaja competitiva sostenible?"

> "Tres capas: primero, **el efecto red bilateral** — cada nuevo merchant aumenta el valor para los usuarios y viceversa. Segundo, **el lock-in cultural** — Carlos AI en venezolano y la marca caribeña construyen una identidad que un competidor genérico no puede replicar fácilmente. Tercero, **la integración técnica con Solana** — somos los primeros en hacer esto en LATAM, lo que nos da 12-18 meses de ventaja antes de que aparezcan copycats."

### Q: "¿Qué pasa si el gobierno venezolano bloquea cripto?"

> "Históricamente Venezuela ha sido pro-cripto en términos regulatorios — la SUNACRIP existe desde 2018. Pero incluso si cambia, somos non-custodial: no hay servidor central que apagar. La app es PWA, distribuible vía link directo. Los fondos viven en wallets del usuario en blockchain pública. Como mucho podrían bloquear nuestro dominio, pero el usuario podría seguir operando con su wallet directamente."

### Q: "¿Por qué Solana y no Ethereum L2?"

> "Para tickets de 5 a 50 dólares — que es el ticket promedio de comercios venezolanos — los fees de Ethereum L2 todavía son altos relativamente. Solana es 0.0001 por transacción, instantáneo, y tiene el ecosistema de Jupiter, mSOL, Solana Pay listo. Ethereum L2 los tiene en versiones equivalentes pero más fragmentadas. Solana es el único hogar coherente para esto."

### Q: "¿Cómo planean adquirir usuarios?"

> "Estrategia tres-pasos: primero, comunidad cripto venezolana en Twitter y Telegram — ya están ahí, solo necesitan ver una opción mejor. Segundo, programa de referidos: usuario que invita merchant gana 10% del primer mes de fees del merchant. Tercero, asociación con creadores de contenido financiero venezolanos en YouTube — ellos enseñan, nosotros somos la herramienta. Costo de adquisición proyectado: menos de 5 dólares por usuario activo, payback en 5 meses."

### Q: "¿Cuál es el riesgo más grande del producto?"

> "Honestamente: la adopción del lado merchant. El usuario consumidor es relativamente fácil — son jóvenes, están en cripto, quieren mejores opciones. El merchant requiere más educación. Por eso construimos `/comercios` con comparativas visuales muy concretas — 'Banesco te cobra 4.5%, Tropico te cobra 1%, ahorrás 35 dólares por mes por cada mil de venta'. Y por eso el primer push es bodegueros jóvenes con WhatsApp avanzado, no toda la población merchant."

### Q: "¿Cuánto necesitan levantar y para qué?"

> "Para los próximos 12 meses, alrededor de 250 mil dólares. 40% en producto — terminar la integración real de OpenClaw, lanzar la card, abrir on-ramp con partners. 35% en growth — programa de afiliados, marketing en LATAM. 25% en compliance y partnerships bancarios para Tropico Card. Esa ronda nos lleva a break-even en mes 12 con las proyecciones que mencioné."

### Q: "¿Qué los detiene de no ser comprados por un grande, como Binance?"

> "La filosofía non-custodial. Binance es custodial por diseño — comprar Tropico significaría destruir su propuesta de valor. Lo más probable es que Phantom o Backpack quieran adquirirnos para tener un brazo LATAM, o que Solana Foundation nos quiera estratégicamente. Pero el plan es construir un negocio independiente sostenible, no un exit rápido. Si llegan ofertas serias, evaluaremos."

### Q: "¿Cómo aseguran que Carlos AI no diga algo inapropiado?"

> "System prompt muy estricto: prohibido opinar sobre política, gobierno, sanciones. Prohibido prometer rendimientos garantizados. Si le preguntan algo no-Solana, redirige amablemente. Probamos con preguntas trampa antes de cada deploy. Y el modelo es Gemini 2.0 Flash con safety filters activados a máximo. Si en algún momento Carlos diera una respuesta problemática, tenemos kill-switch para desactivarlo en producción."

### Q: "¿Qué hacen distinto a las wallets agnósticas?"

> "Las wallets son herramientas — Tropico es producto. Una wallet te da acceso a Solana, tú te tienes que arreglar para encontrar swaps, yield, pagos. Tropico te lo da curado, en un flujo coherente, en tu idioma, con un asistente que te educa. La diferencia es Excel vs QuickBooks: ambos manejan números, pero uno es para expertos y el otro es para la realidad."

---

## Bloque 11 — Lo que NO debés decir nunca

- ❌ "Vamos a reemplazar a los bancos" → suena ingenuo. Di: "Ofrecemos una alternativa complementaria"
- ❌ "Es como Bitcoin pero..." → no compares con Bitcoin, son cosas distintas
- ❌ "Garantizamos rendimientos" → ilegal en muchas jurisdicciones, suena a fraude
- ❌ Cualquier opinión política sobre Venezuela → mantenete técnico/producto
- ❌ "Hicimos esto en 48 horas" → si te preguntan, di "el MVP del hackathon, pero es la base de un proyecto serio que continúa"
- ❌ "Solo somos un equipo de uno" → si eres solo, di "lidero el desarrollo con un equipo de asesores estratégicos detrás"

---

## Bloque 12 — Frases-llave para clavar

Ten estas listas para soltarlas cuando aporten:

1. **"Red económica paralela al sistema bancario."** (cuando te pregunten qué es Tropico)
2. **"60% más barato para el merchant que POS tradicional."** (cuando hablen de costos)
3. **"El dinero nunca toca el bolívar."** (cuando hablen de inflación)
4. **"La wallet caribeña en Solana, non-custodial — USDC estable, yield, comercios afiliados."** (pitch en una línea)
5. **"Cinco streams de revenue desde el primer día."** (cuando hablen de modelo)
6. **"El efecto red bilateral hace que crezcamos exponencialmente, no linealmente."** (cuando hablen de growth)
7. **"Tropico no es una wallet — es infraestructura."** (tu mic-drop final)

---

## Bloque 13 — Preparación pre-entrevista (10 minutos antes)

1. Lee Bloque 1 tres veces hasta que te salga natural
2. Lee las frases-llave del Bloque 12 — tenelas frescas
3. Toma agua, respirá hondo
4. Recuerda: tú sabés más del producto que el entrevistador. Habla con autoridad pero con calidez. Eres el dueño de la conversación.
5. Si te trabás con una pregunta, di: "Buena pregunta — déjame pensarlo un segundo." Pausa, respirá, contestá. Es mejor pausar que improvisar mal.

---

## Tip final

El entrevistador no quiere a alguien perfecto — quiere a alguien que **cree en lo que está construyendo y que tiene claridad de mente**. Si transmitís pasión real por el problema venezolano + claridad técnica + visión de mercado, ganas la entrevista incluso si te equivocás en un dato.

**Tu superpower**: eres venezolano construyendo para venezolanos. Eso le da a Tropico una autenticidad que ningún competidor extranjero puede igualar. Vendelo.

Mucha suerte. Vas a romperla.
