# Tropico — FAQ para jueces de Colosseum

> Preguntas duras que esperamos del jurado. Respuestas francas, sin marketing.

**Última actualización**: 2026-05-11

---

## Producto y posicionamiento

### 1. ¿Por qué no usar USDT/USDC directamente? ¿Para qué inventar BsX?

USDC resuelve la **reserva de valor** pero no la **unidad de cuenta cotidiana**. El venezolano:
- Piensa precios en Bs ("la harina cuesta 80 bolívares").
- Necesita pagar Pago Móvil VE, que opera en Bs.
- Acepta un cobro en moneda local con menos fricción cognitiva que en "puntos digitales".

BsX es un Bs digital 1:1 respaldado por USDC con peg transparente atestable onchain. El usuario tiene la estabilidad del dólar (vía respaldo) + la familiaridad del Bs (vía unidad de cuenta) + interoperabilidad con Pago Móvil. Eso USDC solo no lo resuelve.

Además, BsX es el **primer primitivo monetario nacional onchain con reservas auditables públicamente** para Venezuela. Es un moat técnico, no un gimmick.

---

### 2. ¿Qué pasa si Sudeban o SUNACRIP prohíben esto?

Tropico es **non-custodial**: el protocolo BsX es código Solana público. No hay servidor central que apagar, no hay custodia que congelar.

- El programa BsX vive en mainnet — no se puede "quitar".
- Tropico Wallet es la UI; si nos bloquean el dominio, el usuario sigue teniendo control de sus llaves Privy MPC + puede importar a Phantom/Solflare.
- El rail Pago Móvil es público (los mismos endpoints que apps móviles oficiales). No requiere convenio con Sudeban.

**Lo que sí mitigaríamos**: si hay enforcement contra el equipo, operamos desde jurisdicción amigable (España, El Salvador, Panamá). El protocolo sigue vivo independientemente del equipo.

Históricamente, ni Sudeban ni SUNACRIP han cerrado el uso de USDT en VE — sería contradictorio con la dolarización de facto que el propio gobierno tolera.

---

### 3. ¿Cómo respaldan el peg si el bolívar paralelo se mueve a diario?

**Multi-source oracle** + **incentivos de arbitraje**:

- El `peg_rate` en `ProtocolConfig` se actualiza por un `oracle_authority` separado del admin. La idea es alimentar con un agregador (DolarAPI paralelo + BCV oficial + Binance P2P + Reserve rate).
- Si el peg onchain queda atrás del paralelo real, hay arbitraje natural: el usuario mintea BsX al peg viejo y vende caro en mercado secundario (o burnea para tomar USDC barato).
- Roadmap Q3–Q4: integrar Pyth price feed cuando publiquen Bs/USD, o construir oracle propio con economic incentives.

**Edge case**: si el paralelo se mueve >10% en una hora, el `set_pause` admin pausa mint/burn hasta que oracle estabilice. Mejor pausar 2 horas que romper el peg.

---

### 4. ¿Quién pone el USDC inicial para el minting?

Modelo: **user-deposit-then-mint**. No requiere capital semilla del protocolo.

- Usuario deposita 100 USDC al `treasury_vault` PDA.
- Protocolo mintea BsX equivalente al peg actual (ej. 3,650 BsX a 36.5 Bs/USD).
- Para burnear, el usuario quema BsX y recibe USDC del mismo vault.

El vault siempre tiene 1:1 USDC = BsX en circulación (verificable via `attest_reserves`). No hay "fondo de reserva externo" que cubrir.

**Riesgo**: si Tropico aplica spread (0.3–0.5%) al mint, el vault crece ligeramente más rápido que el BsX en circulación. Ese excedente es revenue del protocolo, no descobertura.

---

### 5. ¿Riesgo regulatorio para usuarios en US/España diáspora?

Tropico no opera fiat directamente en US o EU. Para onramp internacional usamos **partners regulados** (MoonPay, Stripe Crypto, Transak) que tienen sus propias licencias.

- En US: el partner (ej. Stripe Crypto) maneja KYC y compliance. El usuario interactúa con un servicio US-regulado.
- En España: igual, partner regulado bajo MiCA.
- Tropico Wallet en sí es non-custodial: el usuario es dueño de sus llaves. No estamos siendo un "money transmitter" en el sentido legal — somos software.

**Comparable**: Phantom, Solflare, Backpack operan globalmente bajo este modelo (software non-custodial). No es novedad legal.

---

### 6. ¿Carlos AI / Lumen es solo un wrapper de LLM?

No. Lumen es un framework con arquitectura de 3 capas:

- **Personality YAML**: define quién es Carlos (voseo venezolano, reglas no-política, no-garantías).
- **Skills**: 7 skills tipadas con descripción + parámetros + capability mapping.
- **Capabilities**: scripts Python ejecutables (consultan precios reales en Jupiter v6, balances en Helius, etc.).

El LLM (DeepSeek default, Gemini fallback) solo **enruta intent** del usuario a la skill correcta. La ejecución es código determinista. Eso es muy diferente de "le mando el prompt a GPT y rezo".

Además, Modo Agente tiene **policy engine** (vía OpenClaw + Privy delegated keys, Q3): cada acción autónoma valida `max_amount`, `frequency`, `time_window` antes de firmar. Eso no es LLM, es control de seguridad.

---

### 7. Si las reservas BsX son 1:1 USDC, el protocolo no genera nada — ¿cómo capturas valor?

Tres vías:

1. **Spread en mint/burn** (0.3–0.5%): cada conversión USDC↔BsX deja un pequeño excedente en el vault que es revenue del protocolo. Acumulado sobre miles de transacciones es significativo.
2. **Yield share opcional** (Q4): con consentimiento del usuario, parte del USDC ocioso en el vault se rutea a yield USDC (Kamino, Marinade). 20% del rendimiento queda en Tropico. El usuario sigue pudiendo burnear 1:1 — el yield es sobre la fracción excedente.
3. **Merchant fee + Premium Carlos + SDK**: estos son streams aledaños al BsX core, pero alimentados por la red que BsX habilita.

Tropico no captura valor "robándole" al usuario — captura del flujo, igual que Stripe captura sobre cada transacción procesada.

---

## Equipo y ejecución

### 8. ¿Por qué Solana y no Ethereum L2?

- **Velocidad**: <1s settlement es no-negociable para POS retail venezolano. Solana lo cumple consistentemente.
- **Costo**: gas fees en lamports vs $0.10–0.50 en L2 marca diferencia en pagos pequeños ($3–8 promedio en bodega VE).
- **Solana Pay** está maduro como spec. Mobile wallet adapter funciona.
- **Stack listo**: Privy MPC, Jupiter v6 con `platformFeeBps`, Helius RPC, Marinade, Kamino — todo el ecosistema necesario está en producción.
- **Solana Mobile Seeker** es una ventaja distributiva única que ningún L2 tiene.

No es decisión religiosa — es la chain que técnicamente cumple los requisitos del caso de uso hoy.

---

### 9. ¿Cuánto del producto está construido? ¿Cuánto es slideware?

**Construido y vivo en `tropico-rho.vercel.app`**:
- 9 módulos navegables (Home, Cambiar, Cobrar, Enviar, Guardar, Pago Móvil VE, Carlos AI, Remesas, Perfil).
- Privy MPC integration funcional.
- Jupiter v6 quotes reales con `platformFeeBps=50`.
- Solana Pay QR generation client-side.
- Carlos AI con LLM real (DeepSeek/Gemini) y fallback inteligente.
- i18n 4 idiomas (es, en, pt, fr).
- Modo demo devnet con faucets públicos para jueces.
- Token TROPI deployado en devnet con mint tx verificable.
- BsX program scaffolded en Anchor (`programs/tropico_bs/`).

**No construido todavía (honestidad)**:
- BsX en mainnet (Q3 con audit).
- Pago Móvil VE rail real con bancos (UI completa, ejecución bancaria pendiente).
- Yield real (UI completa, ejecución mSOL/Kamino pendiente).
- OpenClaw delegated keys para Modo Agente (UI lista, firma autónoma Q3).
- @tropico/sdk en npm (Q3).

**Por qué importa esta honestidad**: en Colosseum, prometer lo que no se entrega es penalizado. Mejor decir "X módulos live + Y módulos en roadmap claro" que inflar.

---

### 10. ¿Por qué este equipo gana en este mercado?

Tres razones:

1. **Founder-market fit**: somos venezolanos, vivimos el problema. La María de la bodega y el Carlos del freelance NO son personas en un slide — son nuestros vecinos.
2. **Track record**: dev3pack 2026 #1 Venezuela, #28 global, #10 LatAm de 386 proyectos. Validación pre-Colosseum.
3. **Velocidad de shipping**: 9 módulos live en demo público + BsX program scaffolded en el hackathon window. Demuestra capacidad de ejecución bajo presión.

Detalle en [`FOUNDER_NARRATIVE.md`](FOUNDER_NARRATIVE.md).

---

## Mercado y negocio

### 11. ¿No es Venezuela un mercado demasiado pequeño / arriesgado?

Venezuela es la **punta de lanza**, no el mercado total.

- TAM efectivo en VE: $5–8B/año (remesas + comercio digital).
- TAM LatAm completo: $415B/año en cripto transactions (Chainalysis 2024).
- Estrategia: dominar VE primero (founder advantage), luego replicar a Colombia, Argentina, México con stablecoins locales (BsX → COP onchain → ARS onchain → MXN onchain).

Comparable: Bitso empezó en México con SPEI y escaló LatAm. Tropico hace lo mismo con Pago Móvil VE.

---

### 12. ¿Y si Binance / Coinbase / Phantom lanzan una versión venezolana?

Posible pero improbable a corto plazo:

- **Binance** ya tuvo Binance VE Wallet — fue descontinuada por compliance.
- **Coinbase** no opera retail en VE por sanctions.
- **Phantom** es non-custodial generalista, no construye verticales geográficos.

Aún si lo hicieran, nuestro moat es: Pago Móvil VE integration, brand local, Carlos AI con voseo, comercios físicos afiliados. Replicar eso desde Singapore/SF tarda 12–18 meses.

Para entonces nosotros tenemos PMF + capital + Card + 100k usuarios. Es el mismo playbook que Bitso defendió en México vs Coinbase.

---

### 13. ¿Cuál es el indicador clave que medirás los primeros 6 meses?

**GMV procesado vía BsX** (mint + burn + transfer) en términos USD.

Métricas secundarias:
- MAU (monthly active users).
- Comercios activos (al menos 1 transacción/mes).
- Volumen Pago Móvil VE ejecutado.
- Retention 30 / 60 / 90 días.
- LTV/CAC.

**Por qué GMV BsX**: es el proxy más limpio de "el producto está funcionando". Si BsX no se usa, todo lo demás es teatro.

---

### 14. ¿Cuándo serán profitable?

Break-even operacional proyectado a **15–18 meses** con ~50k MAU + ~1k comercios + 5 streams activos. Detalle financiero en [`BUSINESS_MODEL.md`](BUSINESS_MODEL.md).

Con seed de $500k–$1M, runway de 12–18 meses hasta Series A con ARR $1.5M+.

---

### 15. ¿Qué los detiene de pivotear si VE no funciona?

Honestidad: si en 6 meses GMV BsX no crece a >$5M, pivotamos a:
- **Plan B**: empezar por Colombia con COP onchain (mercado más estable, mismo playbook).
- **Plan C**: convertir Tropico en SDK pure-play (`@tropico/sdk` como rail B2B para apps que quieran USDC LatAm).

El moat técnico (BsX framework + Carlos AI + Pago Móvil knowledge) se transfiere a otros corredores LatAm con mínima reescritura.

---

## Técnico / chain

### 16. ¿Anchor program está auditado?

No todavía. El programa `tropico_bs` está scaffolded en el sprint Colosseum.

Plan:
- **T+0 a T+30**: refinamiento + tests + deploy devnet.
- **T+30 a T+60**: audit kickoff con Ottersec / Halborn / Neodyme.
- **T+60 a T+90**: deploy mainnet post-audit + bug bounty público.

Hasta entonces, BsX vive solo en devnet y el frontend deja claro que el módulo BsX es beta.

---

### 17. ¿Por qué `attest_reserves` callable por anyone?

Porque es la única forma de hacer **transparencia radical sin trust**.

- Cualquier usuario, juez, periodista, regulador puede llamar `attest_reserves` y el programa graba on-chain con timestamp: `treasury_vault.amount` y `bsx_mint.supply`.
- No se necesita confiar en Tropico para verificar el peg.
- Frontend muestra ratio reserve/supply en tiempo real leyendo el PDA `ReservesAttestation`.

Esto es lo que USDT/USDC nunca hicieron bien (las auditorías son trimestrales, privadas, y por contables tradicionales). BsX lo hace nativamente onchain.

---

### 18. ¿Qué pasa con MEV / sandwich attacks en mint/burn?

A escala de mint/burn USDC↔BsX al peg fijo (no AMM), MEV es marginal:
- No hay slippage curve para explotar.
- El spread es determinista (0.3–0.5%).
- Las swaps de USDC↔otros tokens van por Jupiter v6, que ya tiene mitigaciones MEV.

Un atacante no puede front-runear un mint BsX porque el precio es el `peg_rate` del oracle, no de un pool.
