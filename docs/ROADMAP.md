# Tropico — Roadmap

> Visión a 12-18 meses post-hackathon. El MVP de 48h ship 5 módulos — este roadmap define cómo se convierten en una plataforma financiera de referencia para LATAM.

---

## Filosofía de evolución

Tropico crece en 4 dimensiones simultáneas:

1. **Profundidad por lado de la red** — Tropico Wallet (consumidor) y Tropico Comercios (merchant) escalan en paralelo. Sin uno, el otro no tiene valor.
2. **Network effects** — el motor real es 2-sided: cada nuevo merchant aumenta el valor de la wallet, cada nuevo usuario aumenta el valor de Comercios.
3. **Nuevos módulos** — Card, Vaults curados, Lending, Earn (cashback), eventualmente facturación electrónica para merchants.
4. **Geografía** — Venezuela primero; luego Colombia, Argentina, México, Perú.

**Principios no negociables**: non-custodial siempre; Carlos AI transversal; cero EVM/Tron/Bitcoin (Solana Maxi); copy localizado por país; **confianza radical: cada fee de Tropico es público y verificable on-chain**; cero política.

---

## Q3 2026 — Sprint post-hackathon (semanas 1-12)

### Cambiar (de MVP a producto)
- DCA (Dollar Cost Averaging): el usuario configura "compro $50 de SOL cada lunes"
- Limit orders vía Jupiter Limit Orders API
- Slippage settings expuestos al usuario
- Histórico de swaps con totales en USD/bs
- Comparador de tasas vs Binance P2P (transparencia)

### Enviar (claim link real)
- Backend mínimo (Cloudflare Worker + KV) para almacenar claim links sin localStorage
- Escrow temporal vía programa Anchor MUY simple (esto es la única excepción al "cero Anchor" — un programa de escrow para claim) o usando token-2022 transfer hook
- Multi-currency: enviar SOL, USDC, USDT
- Notificaciones por email al receptor

### Guardar (yield real)
- Activación real de mSOL via Jupiter route
- Integración Kamino USDC vault via SDK oficial
- Auto-yield switch: cuando el usuario tiene >$X en USDC, propone activar
- Histórico de yield ganado en USD/bs
- Estrategias adicionales: Jito Restaking, Sanctum LSTs

### Cobrar (POS-as-a-Service)
- Listener real de Solana Pay con `findReference`
- Multi-merchant: un usuario puede tener múltiples "cuentas de cobro" (negocio principal, freelance, propinas)
- Recibos PDF generados client-side
- Integración WhatsApp Business API para recibos automáticos
- Dashboard de ingresos con totales en USD/bs/día/mes

### Carlos (contexto + memoria)
- Memoria por usuario (vía Privy session): Carlos recuerda conversaciones previas
- Recomendaciones proactivas: "Hace 2 semanas hablamos de mSOL. ¿Activamos yield ahora?"
- Voz: input por micrófono + respuesta TTS (Gemini supports audio)
- Modo agente: "Carlos, swap $50 de USDC a JTO" → propone tx + usuario firma

### Capa agéntica REAL con OpenClaw (lo que reemplaza al MVP showcase)

- Setup en ClawHub: registrar app de Tropico, obtener API key OpenClaw
- Privy policies: policy engine en dashboard de Privy con reglas por acción (max amount, frequency, time windows)
- Server-side `/api/agent/*` routes en Next.js para cada una de las 4 acciones agentic
- Cron jobs en Vercel Cron / Cloudflare Workers para DCA y auto-cashback
- Webhook listener en Helius para auto-yield al detectar deposits
- Policy testing en devnet primero
- Auditoría externa antes de mainnet (CRÍTICO porque es plata real con autonomía)
- Bug bounty público post-launch
- Costo estimado: 8-12h dev + 4h testing + 4h auditoría = ~20h en sprint post-hackathon

### On-ramp real (NUEVO módulo en home)
- Partner con Reserve: depositar bs en cuenta Reserve → USDC en wallet Tropico
- Partner con trader P2P verificado (Binance P2P top sellers): API o frontend embebido
- Off-ramp también: vender USDC → recibir bs en Banesco/Mercantil

---

## Q4 2026 — Plataforma de pagos (semanas 13-24)

### Tropico Card (módulo nuevo)
- Tarjeta debit visa/mastercard backed por USDC
- Partner con Reap, Rain, o similar (issuer + procesador)
- KYC mínimo (solo cuando se solicita la card)
- Cashback: 1% en USDC sobre cada compra → vuelve al usuario en USDC, sumando posible swap a token de elección
- Disponible inicialmente en VE/CO/AR

### Tropico Pay Plus (Cobrar v2)
- POS hardware (lector NFC + receipt printer) opcional para merchants
- Tap-to-pay con NFC
- Sucursales múltiples por merchant
- Reportes contables exportables (CSV, PDF)

### Tropico Vaults (módulo nuevo)
- Estrategias DeFi curadas vía Kamino multiply / Drift / Marginfi
- Risk levels claros: estable / balanceado / agresivo
- APY históricos visibles
- Auto-rebalance opcional
- Performance fee 10% del yield

### Tropico Earn (módulo nuevo)
- Cashback/loyalty layer transversal: usar Cambiar, Enviar, Cobrar genera puntos $TROPICO (token interno o solo airdrops puntuales)
- Referidos: invita a un amigo, ganan ambos $5 de USDC en su próximo swap

### Carlos AI proactivo (Q4 2026)
- Carlos detecta oportunidades sin que el usuario configure
- Ejemplos: flagea inactividad de USDC ("tenés $500 USDC parados desde hace 2 semanas, ¿activamos yield?"), sugiere DCA basado en patrón de gastos, alerta de oportunidades de mercado relevantes para el portfolio del usuario
- Sigue siendo non-custodial — Carlos solo SUGIERE, usuario firma

---

## Q1 2027 — LATAM expansion (semanas 25-36)

### Países
- Colombia (COP)
- Argentina (ARS — voseo, dólar blue)
- México (MXN)
- Perú (PEN)
- Chile (CLP)

Cada país requiere:
- Localización de copy (Carlos habla colombiano/argentino/mexicano/etc.)
- Tasa local en API (replicar `ve.dolarapi.com` con `co.dolarapi.com`, etc., o usar exchange rate APIs)
- Partners de on-ramp locales (Bitso para MX, Lemon para AR, Bitnovo para CO)
- Compliance / legal por país

### Solana Mobile
- App nativa optimizada para Saga / Seeker
- Hardware-level signing
- Distribución vía Solana dApp Store

---

## Roadmap visual (mental model)

```
TODAY (MVP)         Q3 2026              Q4 2026             Q1 2027
─────────────       ─────────────        ─────────────       ─────────────
Cambiar (full)      Cambiar + DCA        Cambiar + signals   LATAM Cambiar
Enviar (UI)         Enviar (real)        Enviar multi-curr   LATAM Enviar
Guardar (UI)        Guardar (real)       Guardar + Vaults    LATAM Guardar
Cobrar (UI)         Cobrar (real)        Cobrar + Card POS   LATAM Cobrar
Carlos (full)       Carlos + memoria     Carlos + agente     Carlos polyglot
                    On-ramp real         Tropico Card        Solana Mobile
                                         Tropico Vaults      
                                         Tropico Earn        
```

---

## Métricas objetivo

| Métrica | Mes 1 | Mes 6 | Mes 12 | Mes 18 |
|---|---|---|---|---|
| Usuarios activos | 1k | 10k | 50k | 200k |
| Países activos | 1 (VE) | 1 (VE) | 3 (VE/CO/AR) | 5 (+MX+PE) |
| Volumen mensual | $200k | $2.5M | $15M | $80M |
| Revenue mensual | $1k | $12k | $73k | $400k |
| Módulos activos | 5 | 5 | 8 (+Card+Vaults+Earn) | 8 |
| Idioma | es-VE | es-VE | es-VE/CO/AR | + es-MX/PE/CL |

---

## Lo que NUNCA hace Tropico

Para mantener foco, hay 6 cosas que **nunca** estarán en el roadmap:

1. **Custodia de fondos** — Tropico jamás toca llaves privadas. Si necesitamos custodia parcial (ej. para Card), partner con un licenciado, no construimos custody.
2. **Soporte multi-chain (EVM/BTC/Tron)** — Solana Maxi para siempre. Si un usuario quiere puentear, recomendamos Wormhole y se va a otra app.
3. **Asesoría financiera personalizada** — Carlos educa, no recomienda comprar X o Y. Siempre disclaimer.
4. **Yield "garantizado"** — todo yield se muestra con su riesgo. Cero promesas.
5. **Política / propaganda** — cero opinión sobre gobiernos, sanciones, regímenes. Carlos redirige.
6. **Datos vendibles** — Tropico no vende datos del usuario a terceros. Privacy-first como compromiso público.

---

## Cómo se monetiza el roadmap (5 → 8 streams en Q4)

| Stream | MVP | Q3 | Q4 | Q1 2027 |
|---|---|---|---|---|
| Swap fee 0.5% | ✓ | ✓ + DCA | ✓ | ✓ + LATAM |
| Send spread 0.3% | UI only | ✓ real | ✓ multi-curr | ✓ LATAM |
| Save performance 5-10% | UI only | ✓ real | ✓ + Vaults | ✓ LATAM |
| Pay merchant 1% | UI only | ✓ real | ✓ + Card POS | ✓ LATAM |
| Card interchange | — | — | ✓ ~1.5% | ✓ |
| Vaults performance 10% | — | — | ✓ | ✓ |
| Premium subscription $5/mes | — | — | ✓ | ✓ |
| Sponsored discoveries (tokens) | — | — | ✓ | ✓ |

---

## Dependencias críticas externas

| Vendor | Función | Riesgo si fallan | Backup |
|---|---|---|---|
| Privy | Embedded wallet | Alto — single point of auth | Wallet Adapter directo (peor UX) |
| Jupiter | Swap aggregator | Crítico para Cambiar | Raydium SDK directo |
| Helius | RPC | Medio | api.mainnet-beta + QuickNode |
| Gemini | Carlos AI | Medio | Groq Llama 3.3 + OpenAI |
| ve.dolarapi.com | Tasa bs | Bajo | Cache + scraper propio |
| Reap/Rain | Card issuer (Q4) | Alto si dependemos | Multi-issuer strategy |
| Reserve | On-ramp partner | Medio | Multiple P2P partners |
| Vercel | Hosting | Bajo | Cloudflare Pages + AWS |

---

## FIN DEL ROADMAP

Visión viva. Actualizar al final de cada sprint según learnings reales del producto en mercado.

**Última actualización**: 2026-05-08.
