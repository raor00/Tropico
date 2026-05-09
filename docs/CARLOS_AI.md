# Carlos AI by Lumen — Doc completa

> Cómo funciona Carlos, qué puede hacer, qué NO puede, cómo correr LLM real, arquitectura end-to-end.

**Última actualización**: 2026-05-09
**Estado MVP**: API funcional, fallback inteligente sin keys, soporte LLM real con DeepSeek o Gemini.

---

## TL;DR

```
Usuario en /carlos
    │
    │ POST /api/carlos { message, history, currentScreen }
    ▼
┌────────────────────────────────────────────────────────────┐
│  app/api/carlos/route.ts                                   │
│   1. Lee CARLOS_SYSTEM_PROMPT de lib/carlos-prompt.ts     │
│   2. Provider priority:                                    │
│       DEEPSEEK_API_KEY → DeepSeek-V4 chat                 │
│       GEMINI_API_KEY   → Gemini 2.0 Flash                 │
│       ninguna          → smart fallback (keyword routing) │
│   3. Devuelve { text, model, capabilitiesUsed? }          │
└────────────────────────────────────────────────────────────┘
    │
    ▼
Carlos responde en español venezolano + sugiere capability
```

---

## 1. ¿Qué es Carlos AI?

Carlos AI by Lumen es el **copiloto financiero de Tropico**. Vive en `/carlos`, habla español venezolano natural (tuteo), conoce el ecosistema Solana al detalle, y puede ejecutar acciones via las 7 capabilities del Lumen Web3 Kit.

**Atribución**: Carlos corre sobre [Lumen](https://github.com/gabogabucho/lumen-agent), framework open source de agentes en español por @gabogabucho. El Tropico Web3 Kit (KIT + 7 SKILLS + 8 capabilities Python) está en `lumen-kit/` y `lumen-capabilities/`.

---

## 2. Arquitectura

### 2.1 Tres capas

```
┌─────────────────────────────────────────────────────────────┐
│  UI Layer — app/carlos/page.tsx                             │
│  - "use client" React component                             │
│  - Chat input + history                                     │
│  - 7 capability cards visibles (educational)                │
│  - Quick prompts disparables                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ fetch POST /api/carlos
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  API Layer — app/api/carlos/route.ts                        │
│  - Provider router (DeepSeek > Gemini > fallback)           │
│  - Inject CARLOS_SYSTEM_PROMPT + history + screen context   │
│  - Devuelve { text, model, capabilitiesUsed }               │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP a LLM externo
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  LLM Layer                                                   │
│  - DeepSeek-V4 chat (api.deepseek.com/v1/chat/completions)  │
│  - Gemini 2.0 Flash (generativelanguage.googleapis.com)     │
│  - Smart fallback (keyword routing — sin red, sin key)      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ (Q3 2026) tool calling → capabilities
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Capability Layer (Lumen) — lumen-capabilities/*.py         │
│  - balances/ · prices/ · swap/ · pay/ · yield/ · cashback/ │
│  - agent/ (OpenClaw stub Q3)                                │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Por qué esta arquitectura

- **UI desacoplada del LLM** — puedes cambiar de DeepSeek a Claude a Gemini sin tocar UI
- **Fallback siempre disponible** — sin internet, sin key, Carlos sigue dando guidance
- **Capabilities son scripts Python** — ejecutables independientes, testeables, no dependen de Next.js

---

## 3. Cómo correr Carlos

### 3.1 Sin LLM (modo demo, funciona out-of-the-box)

```bash
git clone https://github.com/raor00/Tropico.git tropico
cd tropico
npm install
npm run dev
# → http://localhost:3000/carlos
```

Carlos responde con keyword routing inteligente. Por ejemplo:
- "cuánto vale el dólar?" → menciona la capability `tropico-prices` + sugiere config
- "cómo cobro?" → guía a `/cobrar` + explica modelo fee HACIA ARRIBA
- "configurame DCA" → guía a `/carlos/agente`

Util para demos sin gastar API credits.

### 3.2 Con DeepSeek (recomendado — barato + bueno en español)

1. Ve a https://platform.deepseek.com → crea cuenta → API Keys → genera key
2. Agrega a `.env.local`:
   ```bash
   DEEPSEEK_API_KEY=sk-...
   ```
3. Reinicia dev server
4. `/carlos` chat real

**Costo**: ~$0.14 / 1M input tokens, ~$0.28 / 1M output tokens. Para un chat completo de Carlos (~600 max output) eso es $0.0002 por respuesta. Un usuario activo cuesta ~$0.05/mes.

### 3.3 Con Gemini 2.0 Flash

1. Ve a https://aistudio.google.com → "Get API key"
2. Agrega a `.env.local`:
   ```bash
   GEMINI_API_KEY=AIza...
   # o equivalente:
   # GOOGLE_GENERATIVE_AI_API_KEY=AIza...
   ```
3. Reinicia
4. Free tier: 1500 requests/día gratis. Suficiente para demo.

### 3.4 Verificar provider activo

```bash
curl http://localhost:3000/api/carlos
```

Devuelve:

```json
{
  "name": "Carlos AI by Lumen",
  "version": "0.1.0",
  "providers": { "deepseek": true, "gemini": false },
  "capabilities": ["tropico-balances", "tropico-prices", ...],
  "docs": "/docs/CARLOS_AI.md"
}
```

---

## 4. Funcionamiento de la API

### 4.1 Endpoint

```
POST /api/carlos
Content-Type: application/json
```

### 4.2 Request body

```typescript
{
  message: string;                                  // pregunta del usuario
  history?: { role: "user" | "carlos", text }[];   // últimos turnos (opcional)
  currentScreen?: string;                           // "carlos" | "home" | "cobrar" | etc.
}
```

### 4.3 Response

```typescript
{
  text: string;                       // respuesta de Carlos
  model: "deepseek-chat" | "gemini-2.0-flash" | "fallback";
  capabilitiesUsed?: string[];        // solo en fallback (heurística)
}
```

### 4.4 Errores

| Status | Body | Cuándo |
|---|---|---|
| 400 | `{ error: "invalid_json" }` | Body no es JSON |
| 400 | `{ error: "missing_message" }` | Falta `message` |
| 200 | `{ text: "...", model: "fallback" }` | LLM falló — fallback en lugar de 500 |

**Decisión clave**: si DeepSeek/Gemini fallan (rate limit, network), caemos a fallback en vez de tirar 500. Mejor UX.

### 4.5 Curl de prueba

```bash
curl -X POST http://localhost:3000/api/carlos \
  -H "Content-Type: application/json" \
  -d '{
    "message": "¿Cuánto vale el dólar paralelo hoy?",
    "currentScreen": "home"
  }'
```

---

## 5. Las 7 capacidades de Carlos

Cada capability es un skill declarado en `lumen-kit/skills/<name>/SKILL.md` + script Python en `lumen-capabilities/<topic>/*.py`. El LLM las invoca conceptualmente; en MVP el frontend las muestra como cards para guiar al usuario.

| # | Capability | Skill (`lumen-kit/skills/`) | Script Python | Para qué |
|---|---|---|---|---|
| 1 | **Saldos** | `tropico-balances` | `balances/wallet_balances.py` | Consulta SOL + SPL via Helius RPC |
| 2 | **Precios** | `tropico-prices` | `prices/{precio_bs,precio_usd}.py` | USD/Bs + tokens via DolarAPI + Jupiter Price |
| 3 | **Swap** | `tropico-swap` | `swap/jupiter_quote.py` | Quote + tx via Jupiter v6 + fee 0.5% |
| 4 | **Pago QR** | `tropico-pay` | `pay/solana_pay_url.py` | Solana Pay URL + reference base58 |
| 5 | **Yield** | `tropico-yield` | `yield/yield_estimate.py` | mSOL 7%, Kamino 5.2%, LP 12.4% |
| 6 | **Cashback** | `tropico-cashback` | `cashback/cashback_summary.py` | Saldo acumulado por merchant (mock store.json) |
| 7 | **Modo Agente** | `tropico-agent-actions` | `agent/agent_execute.py` | DCA · auto-yield · cashback · rebalance (stub OpenClaw) |

**Cada capability es ejecutable standalone:**

```bash
python3 lumen-capabilities/yield/yield_estimate.py --instance demo --strategy msol --amount 200 --pretty
python3 lumen-capabilities/pay/solana_pay_url.py --instance demo --recipient Mer7Gh... --amount 5 --label "Bodega" --token USDC
```

---

## 6. Alcance — qué puede + qué NO puede

### 6.1 Lo que SÍ puede

✅ Educar sobre tokens del ecosistema Solana (SOL, USDC, USDT, JUP, JTO, mSOL, KMNO, RAY, BONK)
✅ Explicar conceptos: staking, yield, swap, AMM, MPC wallet, fee on-top, claim links
✅ Guiar al usuario a la pantalla correcta de Tropico ("vamos a /cambiar")
✅ Convertir USD ↔ Bs en vivo (con LLM + capability prices)
✅ Sugerir estrategias de yield basadas en perfil de riesgo
✅ Activar/configurar Modo Agente (DCA, auto-yield, etc.)
✅ Generar QRs de cobro con monto específico
✅ Recordar conversaciones previas (cuando Hermes esté en Q3)
✅ Hablar venezolano natural sin jerga gringa

### 6.2 Lo que NO puede

❌ **Política venezolana** — gobierno, sanciones, BCV. Redirige amable.
❌ **Garantizar rendimientos** — siempre matiza "puede generar X% pero el precio del token puede bajar"
❌ **Consejo financiero personalizado** — no dice "comprá X", dice "muchos usuarios consideran X porque..."
❌ **Operar fuera de Solana** — Bitcoin, Ethereum, Tron → "eso es de otra red, en Solana lo más parecido sería..."
❌ **Tocar tus llaves privadas** — non-custodial estricto, principio #1 del producto
❌ **Inventar datos** — si una capability falla, dice "no pude consultar tu saldo en este momento, panita"

### 6.3 Reglas estrictas (en `lib/carlos-prompt.ts`)

Definidas en el system prompt. Inviolables incluso si el usuario insiste:

- Cero garantías financieras
- Cero política
- Cero jerga sin explicar
- Respuestas cortas (máx 4-5 oraciones)
- "Tú" no "vos" (tuteo VE, no voseo argentino)

---

## 7. Modo Agente — Carlos puede actuar

`/carlos/agente` muestra el showcase de las 4 acciones autónomas:

1. **DCA semanal** — compra programada de un token
2. **Auto-yield al recibir remesa** — mueve excedente a Save
3. **Auto-cashback claim** — reclama cashback acumulado periódicamente
4. **Re-balance de portafolio** — vende parcial cuando un token sube X%

**MVP hoy**: Carlos sobre Lumen confirma con el usuario y ejecuta manual con un click.

**Q3 2026 (opcional)**: si Tropico decide sumar memoria + firma delegada:
- **Hermes** — memoria persistente por usuario (decide CUÁNDO proponer). Opcional.
- **OpenClaw** — session keys delegadas con policy engine pre-tx. Opcional.
- **Privy** — firma server-side con la session key (siempre presente, ya integrado).

Importante: **Lumen es el motor**. Hermes y OpenClaw son **alternativas portables**, no combinación obligatoria. Otros equipos pueden usar el Tropico Web3 Kit con Hermes solo, OpenClaw solo, o cualquier mix. Doc completa: `docs/LUMEN_INTEGRATION.md` sección 13 (adapter pseudocode).

---

## 8. Lumen — el motor que mueve todo

[Lumen](https://github.com/gabogabucho/lumen-agent) es framework open source de agentes en español por @gabogabucho. Tropico construyó el primer Web3 Kit para Lumen.

### 8.1 Estructura del kit

```
lumen-kit/
├── kit/
│   ├── module.yaml         # Metadatos (name: tropico-wallet-kit)
│   └── personality.yaml    # Identity + tone + rules + knowledge
└── skills/
    ├── tropico-balances/SKILL.md + module.yaml
    ├── tropico-prices/SKILL.md   + module.yaml
    ├── tropico-swap/SKILL.md     + module.yaml
    ├── tropico-pay/SKILL.md      + module.yaml
    ├── tropico-yield/SKILL.md    + module.yaml
    ├── tropico-cashback/SKILL.md + module.yaml
    └── tropico-agent-actions/SKILL.md + module.yaml

lumen-capabilities/
├── balances/wallet_balances.py
├── prices/{precio_bs.py, precio_usd.py}
├── swap/jupiter_quote.py
├── pay/solana_pay_url.py
├── yield/yield_estimate.py
├── cashback/{cashback_summary.py, store.json}
└── agent/agent_execute.py
```

### 8.2 Cómo correr Carlos sobre Lumen real (post-MVP)

En MVP, `/api/carlos/route.ts` llama directo al LLM y la inyección de capabilities es vía system prompt. **En producción Q3** correría sobre un servidor Lumen local:

```bash
# 1. Instalar Lumen (Python framework)
pip install lumen-agent

# 2. Instalar el kit
cd /path/to/Tropico
lumen module install ./lumen-kit/skills/tropico-balances
lumen module install ./lumen-kit/skills/tropico-prices
# ... resto de skills
lumen module install ./lumen-kit

# 3. Configurar instance
cat > config.yaml <<EOF
model: deepseek/deepseek-v4-flash
api_key_env: DEEPSEEK_API_KEY
active_personality: tropico-wallet-kit
server_mode: true
host: 0.0.0.0
port: 3099
language: es
security:
  confirm_terminal: false  # CRÍTICO para tool calls fluidos
terminal:
  allowlist: [python3]
  env:
    public:
      INSTANCE_ID: tropico-prod-01
      SCRIPTS_DIR: /path/to/lumen-capabilities
EOF

# 4. Arrancar
lumen server --instance tropico-prod-01 --port 3099

# 5. En .env.local de Tropico
LUMEN_API_URL=http://localhost:3099
LUMEN_API_KEY=<tu-key>

# 6. Cambiar /api/carlos/route.ts para llamar a Lumen en lugar de LLM directo
```

Doc paso a paso: `/Users/Jefemac/Downloads/GUIA-CREACION-KIT-LUMEN.md` (referencia local del autor del framework).

### 8.3 Replicabilidad — Hermes y OpenClaw

El kit es portable. Adapter de ~30 líneas convierte el mismo `module.yaml + SKILL.md + scripts` a formato Hermes (memoria persistente) o OpenClaw (delegated keys + policy). Doc: `docs/LUMEN_INTEGRATION.md` sección 13.

---

## 9. Roadmap de Carlos

| Fecha | Feature |
|---|---|
| Q2 2026 (MVP — hoy) | API `/api/carlos` con DeepSeek/Gemini + smart fallback. UI con 7 capability cards. Modo Agente UI showcase. |
| Q3 2026 | Lumen server local en lugar de LLM directo. Tool calling real → capabilities ejecutables. Hermes para memoria persistente. OpenClaw para acciones on-chain reales. |
| Q3 2026 | Streaming de respuestas (Server-Sent Events) en lugar de JSON único. |
| Q4 2026 | Carlos en WhatsApp + Telegram (multi-canal vía Hermes). |
| Q4 2026 | Carlos proactivo — detecta oportunidades sin que el usuario pregunte (ej. "tu USDC lleva 3 meses parado, te sugiero mover a Save"). |
| Q1 2027 | Multi-idioma (es, en, pt-BR para LATAM expansion). |

---

## 10. Seguridad y compliance

- **System prompt versionado** en `lib/carlos-prompt.ts` — cualquier cambio impacta voz del producto
- **Cero política** — hard-coded en system prompt
- **Cero garantías** — hard-coded en system prompt
- **Logs sin PII** — no logueamos contenido de chats en producción
- **Rate limit** (Q3) — 60 req/min por IP, 200 req/hora por usuario logueado
- **Auditoría de respuestas** (Q3) — sample 1% de respuestas para QA manual de calidad

---

## 11. Archivos relacionados

| Archivo | Para qué |
|---|---|
| `app/carlos/page.tsx` | UI chat + 7 capability cards |
| `app/carlos/agente/page.tsx` | Modo Agente UI showcase |
| `app/api/carlos/route.ts` | Endpoint POST + GET (info) |
| `lib/carlos-prompt.ts` | System prompt + greeting |
| `lib/agent-actions.ts` | Definición de las 4 acciones autónomas |
| `lumen-kit/kit/personality.yaml` | Identidad + tono + reglas |
| `lumen-kit/skills/*/SKILL.md` | 7 skills declaradas |
| `lumen-capabilities/**/*.py` | 8 scripts Python ejecutables |
| `docs/LUMEN_INTEGRATION.md` | Doc maestro de Lumen + adapter |
| `docs/CARLOS_AI.md` | Este doc |

---

## 12. FAQ

**Q: Si no tengo API key, ¿Carlos sirve para algo?**
A: Sí. El smart fallback usa keyword routing — sigue dando guidance útil + sugiere capabilities. Suficiente para demo del hackathon.

**Q: ¿Por qué DeepSeek y no GPT-4?**
A: DeepSeek-V4 es ~50x más barato, español es excelente, OpenAI-compatible API. Para un fintech LATAM el costo importa.

**Q: ¿Carlos puede firmar transacciones por mí?**
A: Hoy no — siempre confirma contigo. Carlos sobre Lumen propone, tú apruebas con un click. Q3 2026 sumamos firma delegada vía Privy session keys (opcionalmente con OpenClaw policy engine encima) para que las acciones corran 100% autónomas dentro de policies que tú defines (ej. max $200/sem en DCA). Tú revocas cuando quieras. Lumen sigue siendo el motor.

**Q: ¿Y si Carlos dice algo incorrecto sobre mi plata?**
A: Avísanos. Carlos NUNCA debería garantizar rendimientos, dar consejo financiero personalizado, o inventar datos. Si lo hace, es bug del system prompt.

**Q: ¿Funciona offline?**
A: El fallback sí (no necesita red). El LLM real obviamente no.

**Q: ¿Puedo usar Carlos para mi propio agente?**
A: Sí — el Tropico Web3 Kit es MIT, copia `lumen-kit/` y adáptalo. Los skills son markdown + YAML, las capabilities son Python estándar.
