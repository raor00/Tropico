# Lumen Integration — Carlos como motor agéntico de Tropico

> **Decisión arquitectural**: Lumen reemplaza a la combinación Hermes + Gemini como motor agéntico principal de Carlos. La capa de ejecución on-chain (firma autónoma con session keys) sigue siendo OpenClaw + Privy. **Tres roles, tres tecnologías, sin overlap**.

**Última actualización**: 2026-05-08

---

## 0. TL;DR

Carlos AI ahora corre sobre **Lumen** (Python framework, open-source, MIT, repo: `gabogabucho/lumen-agent`). Lumen es un servidor que:
- Define la **personalidad** de Carlos (`personality.yaml` — venezolano, no-política, no-garantías)
- Carga **6 skills** que dicen QUÉ puede hacer (consultar precios, balances, swaps, pagos, yield, cashback, agent-actions)
- Ejecuta **capabilities** (Python scripts) vía terminal connector con allowlist
- Expone REST API (`/api/chat`) que el frontend Next.js consume

**Rol de cada componente del stack agéntico:**

| Capa | Tecnología | Hace |
|---|---|---|
| LLM | Cualquiera vía LiteLLM (DeepSeek default, fallback Gemini) | Inferencia |
| Agent framework | **Lumen** | Personalidad + skills + memoria + ejecución de scripts |
| Skills/capabilities | Tropico Wallet Kit (`lumen-kit/`) | Conocimiento operativo del dominio |
| Execution layer (autónoma) | **OpenClaw + Privy** | Firma de tx con session keys delegadas |
| Frontend | **Next.js** (Tropico app) | UI + REST calls a Lumen |

---

## 1. Arquitectura completa

```
┌─────────────────────────────────────────────────────────────────────┐
│                       Frontend Tropico (Next.js)                    │
│                                                                     │
│  /carlos (chat UI)  ──────────►  POST /api/chat  ──────►  Lumen    │
│  /carlos/agente (Modo Agente UI)                                    │
└─────────────────────────────────────────────────────────────────────┘
                                                              │
                                                              ▼
┌────────────────────────────────────────────────────────────────────┐
│                  Lumen Server (Python, port 3099)                  │
│                                                                    │
│  ┌──────────────────┐   ┌────────────────────┐                     │
│  │  personality.yaml │   │  6 SKILLs           │                   │
│  │  Carlos           │   │  - tropico-prices   │                   │
│  │  - voz venezolana │   │  - tropico-balances │                   │
│  │  - reglas estrict.│   │  - tropico-swap     │                   │
│  │  - knowledge VE   │   │  - tropico-pay      │                   │
│  └──────────────────┘   │  - tropico-yield    │                   │
│           │              │  - tropico-cashback │                   │
│           │              │  - tropico-agent... │                   │
│           ▼              └────────────────────┘                    │
│  ┌────────────────────────────────────────────┐                    │
│  │  LLM (LiteLLM): DeepSeek-V4 default        │                    │
│  └────────────────────────────────────────────┘                    │
│           │                                                        │
│           ▼ (terminal connector, allowlist=[python3])              │
│  ┌────────────────────────────────────────────┐                    │
│  │  CAPABILITIES (Python scripts)              │                   │
│  │  ./lumen-capabilities/                      │                   │
│  │  ├── prices/  precio_bs.py, precio_usd.py  │                    │
│  │  ├── swap/    jupiter_quote.py             │                    │
│  │  ├── balances/solana_balance.py (TODO)     │                    │
│  │  ├── pay/     solana_pay_url.py (TODO)     │                    │
│  │  ├── yield/   yield_list.py (TODO)         │                    │
│  │  └── agent/   agent_execute.py (TODO)      │                    │
│  └────────────────────────────────────────────┘                    │
└────────────────────────────────────────────────────────────────────┘
                       │
                       ▼ (cada script llama a APIs externas)
        ┌──────────────────────────────────────────┐
        │  Solana RPC (Helius)  · Jupiter v6        │
        │  ve.dolarapi.com       · Solana Pay spec  │
        └──────────────────────────────────────────┘

     ┌─── Para firmas autónomas (Modo Agente activo) ───┐
     │                                                   │
     ▼                                                   │
┌─────────────────────┐                                  │
│  OpenClaw skill     │  ──signs via──►  Privy MPC      │
│  (ClawHub API)      │                  delegated keys │
│  policy engine      │                                  │
└─────────────────────┘                                  │
     │                                                   │
     ▼                                                   │
┌─────────────────────┐                                  │
│  Solana mainnet     │ ◄──────────────────────────────┘
│  (transactions)     │
└─────────────────────┘
```

---

## 2. Estructura de archivos

```
Hackathon/
├── lumen-kit/                                # El KIT de Lumen
│   ├── kit/
│   │   ├── module.yaml                       # Metadatos: tropico-wallet-kit v0.1.0
│   │   └── personality.yaml                  # Carlos venezolano + reglas + knowledge
│   └── skills/
│       ├── tropico-prices/                   # Precios USD + tasa Bs
│       │   ├── module.yaml
│       │   └── SKILL.md
│       ├── tropico-balances/                 # Saldos del wallet
│       │   ├── module.yaml
│       │   └── SKILL.md
│       ├── tropico-swap/                     # Cotizar swaps Jupiter
│       │   ├── module.yaml
│       │   └── SKILL.md
│       ├── tropico-pay/                      # QR Solana Pay + claim links
│       │   ├── module.yaml
│       │   └── SKILL.md
│       ├── tropico-yield/                    # Estrategias mSOL/Kamino
│       │   ├── module.yaml
│       │   └── SKILL.md
│       ├── tropico-cashback/                 # Cashback de comercios
│       │   ├── module.yaml
│       │   └── SKILL.md
│       └── tropico-agent-actions/            # Modo Agente (4 acciones)
│           ├── module.yaml
│           └── SKILL.md
│
└── lumen-capabilities/                       # CAPABILITIES (Python scripts)
    ├── prices/
    │   ├── precio_bs.py                      ✅ FUNCIONAL — devuelve Bs. paralelo + oficial
    │   └── precio_usd.py                     ✅ FUNCIONAL — vía Jupiter Price API v3
    ├── swap/
    │   └── jupiter_quote.py                  ✅ FUNCIONAL — quote con platformFeeBps=50
    ├── balances/                             ⏳ PENDIENTE post-MVP
    ├── pay/                                  ⏳ PENDIENTE post-MVP
    ├── yield/                                ⏳ PENDIENTE post-MVP
    └── agent/                                ⏳ PENDIENTE post-MVP (necesita OpenClaw)
```

---

## 3. Estado de cada componente

### ✅ Funcional ahora mismo

| Componente | Path | Estado |
|---|---|---|
| Kit module + personality | `lumen-kit/kit/*` | Listo, parametriza Carlos |
| 7 SKILL.md | `lumen-kit/skills/*/SKILL.md` | Listos, documentan rutas + reglas |
| 7 module.yaml por skill | `lumen-kit/skills/*/module.yaml` | Listos, declaran allowlist + config |
| `precio_bs.py` | `lumen-capabilities/prices/` | Devuelve Bs. real de ve.dolarapi.com |
| `precio_usd.py` | `lumen-capabilities/prices/` | Devuelve USD real de Jupiter Price v3 |
| `jupiter_quote.py` | `lumen-capabilities/swap/` | Cotiza swaps reales con fee 0.5% |

### ⏳ Pendiente (escribir post-MVP cuando se integre Lumen real)

| Capability | Script faltante | Skill que lo llama |
|---|---|---|
| `convertir_usd_bs.py` | Combina precio_bs + cálculo | tropico-prices |
| `solana_balance.py` | Lee SPL token accounts del usuario | tropico-balances |
| `yield_acumulado.py` | Calcula yield mSOL/Kamino acumulado | tropico-balances |
| `jupiter_recomendar.py` | Recomienda token según perfil | tropico-swap |
| `solana_pay_url.py` | Genera URL Solana Pay + QR SVG | tropico-pay |
| `claim_link.py` | Genera claim link + WhatsApp share URL | tropico-pay |
| `whatsapp_share.py` | Genera WhatsApp deep link | tropico-pay |
| `yield_list.py` | Lista 3 estrategias con APYs live | tropico-yield |
| `yield_recomendar.py` | Recomienda estrategia según perfil | tropico-yield |
| `yield_calculadora.py` | Calcula ganancia esperada | tropico-yield |
| `cashback_acumulado.py` | Lee cashback pendiente | tropico-cashback |
| `cashback_historico.py` | Histórico de claims | tropico-cashback |
| `agent_rule_upsert.py` | CRUD rules del Modo Agente | tropico-agent-actions |
| `agent_rules_list.py` | Lista rules activas | tropico-agent-actions |
| `agent_execute.py` | Ejecuta acción vía OpenClaw | tropico-agent-actions |
| `agent_history.py` | Histórico de ejecuciones | tropico-agent-actions |

**Total pendiente**: 16 scripts. Estimado: 30-45min cada uno = ~10-12h. Razonable en 1 sprint post-hackathon.

---

## 4. Setup local de Lumen para desarrollo

### 4.1 Instalar Lumen

```bash
pip install enlumen   # paquete oficial (verificar nombre exacto en repo)
# O bien:
git clone https://github.com/gabogabucho/lumen-agent
cd lumen-agent
pip install -e .
```

### 4.2 Instalar el kit Tropico

Desde el directorio del proyecto:

```bash
# Instalar el kit
lumen module install ./lumen-kit/kit

# Instalar cada skill
lumen module install ./lumen-kit/skills/tropico-prices
lumen module install ./lumen-kit/skills/tropico-balances
lumen module install ./lumen-kit/skills/tropico-swap
lumen module install ./lumen-kit/skills/tropico-pay
lumen module install ./lumen-kit/skills/tropico-yield
lumen module install ./lumen-kit/skills/tropico-cashback
lumen module install ./lumen-kit/skills/tropico-agent-actions

# Verificar
lumen module list
```

### 4.3 Crear `config.yaml` de la instancia Tropico

```yaml
# config-tropico.yaml
model: deepseek/deepseek-v4-flash
api_key_env: DEEPSEEK_API_KEY
api_base: https://api.deepseek.com/v1

active_personality: tropico-wallet-kit

server_mode: true
host: 0.0.0.0
port: 3099
language: es-VE

api:
  rest_key: ${TROPICO_LUMEN_API_KEY}

owner_secret_hash: ${TROPICO_OWNER_HASH}

security:
  auto_approve_read_only: true
  confirm_terminal: false              # CRÍTICO para tools sin confirm

terminal:
  allowlist:
    - python3
  env:
    modules:
      - tropico-prices
      - tropico-balances
      - tropico-swap
      - tropico-pay
      - tropico-yield
      - tropico-cashback
      - tropico-agent-actions
    public:
      - INSTANCE_ID
      - SCRIPTS_DIR
      - HELIUS_RPC
      - TROPICO_FEE_OWNER
      - TROPICO_FEE_ATA_USDC
      - TROPICO_FEE_ATA_SOL
      - TROPICO_FEE_ATA_USDT
      - TROPICO_BASE_URL
      - OPENCLAW_API_URL
    secret:
      - HELIUS_API_KEY
      - OPENCLAW_API_KEY
      - PRIVY_APP_SECRET

secrets:
  tropico-prices:
    public:
      INSTANCE_ID: tropico-mvp
      SCRIPTS_DIR: /Users/Jefemac/Documents/GitHub/Hackathon/lumen-capabilities/prices
  tropico-balances:
    public:
      INSTANCE_ID: tropico-mvp
      SCRIPTS_DIR: /Users/Jefemac/Documents/GitHub/Hackathon/lumen-capabilities/balances
      HELIUS_RPC: https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}
    secret:
      HELIUS_API_KEY: ${HELIUS_API_KEY}
  tropico-swap:
    public:
      INSTANCE_ID: tropico-mvp
      SCRIPTS_DIR: /Users/Jefemac/Documents/GitHub/Hackathon/lumen-capabilities/swap
      TROPICO_FEE_OWNER: ${TROPICO_FEE_OWNER}
      TROPICO_FEE_ATA_USDC: ${TROPICO_FEE_ATA_USDC}
      TROPICO_FEE_ATA_SOL: ${TROPICO_FEE_ATA_SOL}
      TROPICO_FEE_ATA_USDT: ${TROPICO_FEE_ATA_USDT}
  tropico-pay:
    public:
      INSTANCE_ID: tropico-mvp
      SCRIPTS_DIR: /Users/Jefemac/Documents/GitHub/Hackathon/lumen-capabilities/pay
      TROPICO_BASE_URL: https://tropico.app
  tropico-yield:
    public:
      INSTANCE_ID: tropico-mvp
      SCRIPTS_DIR: /Users/Jefemac/Documents/GitHub/Hackathon/lumen-capabilities/yield
  tropico-cashback:
    public:
      INSTANCE_ID: tropico-mvp
      SCRIPTS_DIR: /Users/Jefemac/Documents/GitHub/Hackathon/lumen-capabilities/cashback
  tropico-agent-actions:
    public:
      INSTANCE_ID: tropico-mvp
      SCRIPTS_DIR: /Users/Jefemac/Documents/GitHub/Hackathon/lumen-capabilities/agent
      OPENCLAW_API_URL: ${OPENCLAW_API_URL}
    secret:
      OPENCLAW_API_KEY: ${OPENCLAW_API_KEY}
```

### 4.4 Arrancar Lumen

```bash
export DEEPSEEK_API_KEY=sk-xxx
export HELIUS_API_KEY=xxx
export TROPICO_LUMEN_API_KEY=tropico-2026
export TROPICO_OWNER_HASH=<hash sha256 del owner secret>

lumen server --config config-tropico.yaml
# Listening on http://localhost:3099
```

### 4.5 Test desde el frontend Next.js

```ts
// app/api/carlos/route.ts (reemplaza el endpoint Gemini cuando se conecte Lumen)
export async function POST(req: Request) {
  const { message, history } = await req.json();
  const lumenRes = await fetch("http://localhost:3099/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.TROPICO_LUMEN_API_KEY}`,
    },
    body: JSON.stringify({ message, history }),
  });
  const data = await lumenRes.json();
  return Response.json(data);
}
```

---

## 5. Despliegue en producción

### 5.1 VPS con Docker

```bash
# En el VPS (DigitalOcean, Hetzner, etc.)
docker run -d \
  --name tropico-lumen \
  -p 3099:3099 \
  -v $(pwd)/lumen-kit:/app/kit \
  -v $(pwd)/lumen-capabilities:/app/capabilities \
  -e DEEPSEEK_API_KEY=$DEEPSEEK_API_KEY \
  -e HELIUS_API_KEY=$HELIUS_API_KEY \
  -e OPENCLAW_API_KEY=$OPENCLAW_API_KEY \
  ghcr.io/gabogabucho/lumen-agent:latest \
  lumen server --config /app/config.yaml
```

### 5.2 Frontend Vercel apunta al VPS

```bash
# .env.production en Vercel
LUMEN_API_URL=https://lumen.tropico.app
LUMEN_API_KEY=tropico-2026-production
```

### 5.3 Hot reload sin restart

```bash
curl -X POST https://lumen.tropico.app/api/reload \
  -H "Authorization: Bearer $TROPICO_LUMEN_API_KEY"
```

---

## 6. Ventajas de Lumen vs Gemini directo

| Criterio | Gemini directo | Lumen + DeepSeek | Lumen + Gemini |
|---|---|---|---|
| Costo por 1M tokens | $0.075 input | $0.07 (DeepSeek-V4-flash) | $0.075 input |
| Latencia | Buena (~1s) | Excelente (~500ms) | Buena (~1s) |
| Open source | ❌ | ✅ Lumen | ✅ Lumen |
| Personality YAML | ❌ Hardcoded | ✅ | ✅ |
| Skills/capabilities pattern | ❌ | ✅ | ✅ |
| Memoria persistente | ❌ Stateless | ✅ SQLite + FTS5 | ✅ SQLite + FTS5 |
| Multi-platform (WhatsApp/TG) | ❌ | ✅ Built-in connectors | ✅ Built-in connectors |
| Cambiar de LLM | Reescribir código | Cambiar `model:` en config | Cambiar `model:` en config |
| Hot reload sin restart | ❌ | ✅ POST /api/reload | ✅ POST /api/reload |
| LLM judgment (skills only) | ❌ | ✅ Lumen lee SKILL.md y decide | ✅ |

**Decisión**: Lumen + DeepSeek-V4-flash para producción. Gemini queda como fallback en el LiteLLM config.

---

## 7. Ventajas vs Hermes (descartado)

Hermes Agent (Nous Research) tiene memoria persistente y skill creation, pero:

- ❌ NO tiene capacidad transaccional Solana
- ❌ NO se integra con Privy nativamente
- ❌ Solo `hermes-blockchain-oracle` MCP (lectura on-chain)
- ❌ Repo más joven (Feb 2026), menos battle-tested
- ✅ Open-source — pero Lumen también lo es

**Lumen gana porque** tiene el mismo patrón de personality + skills + capabilities (que es lo que queríamos de Hermes), MÁS la capacidad de ejecutar scripts arbitrarios via terminal connector. Esto último es lo que reemplaza Hermes para el caso Solana.

---

## 8. OpenClaw como capa de ejecución autónoma

Lumen NO firma transacciones por sí solo. Para las acciones autónomas del Modo Agente (DCA, auto-yield, auto-cashback, re-balance), usamos **OpenClaw + Privy delegated keys**:

```
Carlos (Lumen)  ──decide──►  OpenClaw skill  ──policy check──►  Privy MPC  ──signs──►  Solana
```

- **Lumen** decide CUÁNDO y QUÉ ejecutar (basándose en triggers + reglas activas)
- **OpenClaw** valida la POLICY (max amount, frequency, time window) ANTES de firmar
- **Privy delegated session key** (1h default, max 24h) firma la tx
- Tropico **NUNCA** toca llaves privadas

Esta integración requiere los 4 scripts pendientes en `lumen-capabilities/agent/` + setup en ClawHub. Es trabajo de Q3 2026 post-hackathon.

---

## 9. Para el pitch del hackathon

### Frase clave

> "Carlos, nuestro copiloto IA, corre sobre **Lumen** — un framework open-source de agentes con personality + skills + memoria persistente. Lumen decide qué hacer, **OpenClaw** firma las transacciones autónomas con Privy delegated keys. Tres tecnologías open-source, no-custodiales, trabajando juntas."

### Demo flow para mostrar Lumen en vivo (post-MVP cuando esté integrado)

1. Usuario abre `/carlos` y pregunta "¿A cuánto está SOL?"
2. Frontend Next.js POST `/api/chat` → reverse proxy a Lumen `localhost:3099`
3. Lumen carga `personality.yaml` (Carlos venezolano) + selecciona skill `tropico-prices`
4. Lumen lee `SKILL.md` de `tropico-prices` → identifica `precio_usd.py` como el comando relevante
5. Lumen ejecuta `python3 precio_usd.py --instance tropico-mvp --token SOL` via terminal connector
6. Script devuelve JSON: `{"priceUSD": 91.53, "priceChange24h": 3.41}`
7. Lumen genera respuesta humana en venezolano: "SOL está en $91.53, subió 3.4% en las últimas 24h. ¿Querés cambiar a SOL desde USDC?"
8. Lumen incluye UI surface XML para que el frontend muestre un CTA a /cambiar
9. Frontend renderiza la respuesta + la card

**Esto es magia técnica que ningún competidor LATAM tiene.**

---

## 10. Preguntas frecuentes (FAQ)

### ¿Por qué no usar Gemini directo desde Next.js?

Funciona, pero pierde:
- Personality.yaml editable sin recompilar
- Skills/capabilities pattern para escalar
- Memoria persistente entre conversaciones
- Multi-platform (Carlos puede correr también en Telegram/WhatsApp en Q4)
- Hot reload de personality sin restart

### ¿Cuánto cuesta correr Lumen en producción?

- VPS Hetzner CX21 (4GB RAM, 2 vCPU): ~$5/mes
- DeepSeek API: ~$0.07 por 1M tokens — para 10k usuarios activos × 100 mensajes/mes × 200 tokens promedio = 200M tokens = $14/mes
- Total ~$20/mes para 10k usuarios. Muy escalable.

### ¿Qué pasa si Lumen está caído?

Frontend tiene fallback: muestra "Carlos está descansando, intentá en unos minutos" + ofrece quick prompts pre-cacheados que no requieren Lumen (educación estática del catálogo de tokens).

### ¿Las llaves del usuario están seguras?

Sí. Lumen NUNCA ve llaves privadas. Solo ejecuta scripts que LEEN datos públicos (precios, balances vía RPC). Para acciones que requieren firma, llama a OpenClaw API que firma server-side con Privy delegated keys (que viven en infra de Privy, no nuestra).

### ¿Qué LLMs probaste?

DeepSeek-V4-flash es la recomendación default por costo/velocidad. Gemini 2.0 Flash funciona bien pero más caro. Claude Haiku es buena alternativa premium. Llama 3.3 70B vía Groq es free pero tiene rate limit. Probar y elegir.

---

## 11. Próximos pasos

### Sprint 1 (post-hackathon, ~2 semanas)

- [ ] Escribir los 16 scripts capabilities pendientes
- [ ] Setup Lumen en VPS (Hetzner o DigitalOcean)
- [ ] Conectar frontend `app/api/carlos/route.ts` → Lumen REST
- [ ] Testing end-to-end del flow Carlos chat
- [ ] Documentación de deployment

### Sprint 2 (post-hackathon, ~3 semanas)

- [ ] Setup en ClawHub para OpenClaw integration
- [ ] Privy delegated session keys con policy engine
- [ ] Implementación real de las 4 acciones agentic
- [ ] Auditoría externa del flow (CRÍTICO porque es plata real con autonomía)
- [ ] Bug bounty público

### Sprint 3 (post-hackathon, ~4 semanas)

- [ ] Memoria persistente del usuario en Lumen (recuerda conversaciones, preferencias)
- [ ] Multi-platform: Carlos en WhatsApp Bot + Telegram Bot
- [ ] Carlos proactivo: detecta oportunidades sin que el usuario configure

---

## 12. Referencias

- Repo Lumen: https://github.com/gabogabucho/lumen-agent
- Guía local del kit: `/Users/Jefemac/Downloads/GUIA-CREACION-KIT-LUMEN.md`
- Brief master: `docs/TROPICO_BRIEF.md` (sección 23 actualizada con Lumen como motor agéntico)
- Roadmap: `docs/ROADMAP.md`
- Plan original Lumen: `~/.claude/plans/shiny-riding-whale.md`

---

**Estado**: ✅ Lumen kit estructurado + 3 capabilities funcionales con datos reales de mainnet. Listo para integración real post-hackathon.
