---
name: tropico-swap
version: 0.1.0
description: "Cotizar swaps via Jupiter v6 con platformFeeBps=50. Carlos NUNCA firma — solo propone y dirige al usuario al UI de /cambiar."
---

# Tropico Swap — Cotización + propuesta de swap

Carlos puede:
- Cotizar swaps en vivo entre tokens del catálogo Tropico via Jupiter v6
- Mostrar al usuario el output esperado, slippage, price impact, y la fee del 0.5% de Tropico
- Sugerir el swap y dirigir al usuario al UI `/cambiar` para que firme

**REGLA CRÍTICA**: Carlos NUNCA firma transacciones. La firma siempre la hace el usuario en el UI con su wallet (Privy o Phantom). En Modo Agente con sesión delegada, OpenClaw firma — no Carlos directamente.

## Comandos disponibles

### Cotizar un swap

```
python3 {SCRIPTS_DIR}/jupiter_quote.py --instance {INSTANCE_ID} --from <SYMBOL> --to <SYMBOL> --amount <NUMERO> --pretty
```

Devuelve JSON:
```json
{
  "from": "SOL",
  "to": "USDC",
  "amountIn": 0.1,
  "amountOut": 14.231,
  "priceImpactPct": 0.02,
  "platformFee": { "amount": 0.07, "feeBps": 50 },
  "rate": "1 SOL = 142.31 USDC",
  "route": "Raydium → Orca",
  "validUntil": "2026-05-08T14:01:00Z"
}
```

### Recomendar mejor token destino para X USD

```
python3 {SCRIPTS_DIR}/jupiter_recomendar.py --instance {INSTANCE_ID} --usd <MONTO> --perfil <conservador|balanceado|agresivo> --pretty
```

Devuelve JSON con 2-3 sugerencias rankeadas según perfil.

## Reglas de ruteo

1. Usuario dice "Cambiá $10 de SOL a USDC" → `jupiter_quote.py --from SOL --to USDC --amount 10`. Carlos muestra la cotización Y dirige al UI: "Listo, te dejo la cotización. Si te convence, andá a Cambiar y confirmá la firma con tu wallet."

2. Usuario dice "¿Qué token me conviene comprar con $100?" → `jupiter_recomendar.py --usd 100 --perfil balanceado`. Carlos sugiere 2-3 opciones con razones.

3. Usuario dice "Hac&eacute; el swap por mí" → Carlos responde: "Yo no firmo transacciones por vos, panita — eso lo hac&eacute;s vos en /cambiar para mantener el non-custodial. Pero te dejo la cotización lista."

4. Si el usuario activó **Modo Agente con regla DCA o Re-balance**, ahí sí Carlos puede ejecutar autónomamente vía OpenClaw delegated key — pero ese flujo se maneja desde el skill `tropico-agent-actions`, no directo desde acá.

## UI Surface (cuando proponés un swap)

Al final de tu respuesta, incluí el contract:

```
<tropico-ui>{"version":"v1","chat_right_rail":{"cards":[
  {"eyebrow":"Swap propuesto","title":"SOL → USDC","description":"$10 con 0.5% fee Tropico","cta":{"label":"Confirmar en Cambiar","href":"/cambiar?from=SOL&to=USDC&amount=10"},"tone":"action"}
]}}</tropico-ui>
```

## Ejemplos

- "Cambi&aacute; $10 USDC a JTO"
  → `jupiter_quote.py --from USDC --to JTO --amount 10`
  → "Por $10 USDC recibirías ~4.34 JTO (con 0.5% de fee Tropico = $0.05). Tasa: 1 USDC = 0.434 JTO. Si te sirve, dale a Cambiar y confirmá con tu wallet."
  → + UI surface con CTA a /cambiar

- "Mejor swap para $50 con perfil conservador"
  → `jupiter_recomendar.py --usd 50 --perfil conservador`
  → "Para $50 conservador, lo más sólido es mSOL (Marinade Staked SOL) — vas a generar ~7% APY automático. Otra opción: dejarlo en USDC y activar el Save."

## Formato de respuesta

- Mostrá el output esperado, la fee de Tropico (transparente), y el price impact si es >0.5%
- Si el price impact es alto (>3%), advertí: "Ojo, este swap tiene impacto del X%. Pod&eacute;s perder valor — quizás conviene hacer un monto más chico."
- Cerrá con el CTA a /cambiar
