---
name: tropico-agent-actions
version: 0.1.0
description: "Coordinar las 4 acciones autónomas del Modo Agente con OpenClaw + Privy delegated session keys."
---

# Tropico Agent Actions — Modo Agente

Cuando el usuario activa Modo Agente en `/carlos/agente`, este skill se vuelve el orquestador de las 4 acciones agentic:

1. **DCA semanal** — compra programada de un token
2. **Auto-yield** — al recibir remesa, mueve excedente a Save
3. **Auto-cashback** — reclama cashback acumulado periódicamente
4. **Re-balance** — vende parcial cuando un token sube X% en Y días

## Arquitectura

```
Carlos (Lumen) ──→ OpenClaw skill (ClawHub) ──→ Privy delegated key ──→ Solana mainnet
                       (policy engine)              (server-side)
```

- Carlos DECIDE cuándo ejecutar (basándose en triggers)
- OpenClaw VALIDA la policy (max amount, frequency, time window)
- Privy FIRMA con session key delegada (expira en 1h default, max 24h)
- Tropico NUNCA toca llaves privadas

## Comandos disponibles

### Crear/actualizar regla del Modo Agente

```
python3 {SCRIPTS_DIR}/agent_rule_upsert.py --instance {INSTANCE_ID} --wallet <PUBKEY> --action <dca|auto-yield|auto-cashback|rebalance> --config '<JSON>' --pretty
```

### Listar reglas activas del usuario

```
python3 {SCRIPTS_DIR}/agent_rules_list.py --instance {INSTANCE_ID} --wallet <PUBKEY> --pretty
```

### Ejecutar una acción autónoma (vía OpenClaw)

```
python3 {SCRIPTS_DIR}/agent_execute.py --instance {INSTANCE_ID} --wallet <PUBKEY> --action <id> --pretty
```

Internamente este script:
1. Verifica que la regla esté activa
2. Verifica que la session key delegada esté vigente y dentro de policy
3. Llama a OpenClaw API (`{OPENCLAW_API_URL}/skills/tropico/execute`)
4. OpenClaw firma la tx vía Privy + envía a Solana
5. Devuelve la signature de la tx para histórico

### Histórico de ejecuciones

```
python3 {SCRIPTS_DIR}/agent_history.py --instance {INSTANCE_ID} --wallet <PUBKEY> --limit <N> --pretty
```

## Reglas de ruteo

1. "Activá DCA semanal de $50 a SOL los lunes" →
   - `agent_rule_upsert.py --action dca --config '{"monto":50,"tokenDestino":"SOL","diaSemana":1,"hora":10}'`
   - Confirmá con el usuario antes
   - Mostrá la policy: "Max $200/semana, max $50 por ejecución, sesión expira en 1h."

2. "¿Qué reglas tengo activas?" → `agent_rules_list.py`

3. "Ejecutá el DCA ahora" → confirmar primero, después `agent_execute.py --action dca`. Mostrar la signature al usuario al final.

4. "¿Cuántas veces se ejecutó el rebalance?" → `agent_history.py --limit 10`

## Reglas de seguridad (NO NEGOCIABLES)

- **Confirmación SIEMPRE**: antes de ejecutar una acción autónoma, mostrar al usuario los detalles (monto, token, destino, fee). NUNCA ejecutar sin confirmación, ni siquiera con regla activa.
- **Policy primero**: si OpenClaw rechaza por policy violation, mostrá el motivo claro al usuario: "No puedo ejecutar — supera el límite semanal de $200 que configuraste."
- **Sesión expirada**: si la session key delegada expiró, dirig&iacute; al usuario a reactivar Modo Agente: "La sesión del agente expiró por seguridad. Andá a /carlos/agente y volvé a activar para extender 24h."
- **Dry-run primero (opcional)**: para acciones de monto >$100, ofrec&eacute; un dry-run que simula sin ejecutar — el usuario aprueba después.

## UI Surface (cuando proponés activar/ejecutar una acción)

```
<tropico-ui>{"version":"v1","chat_right_rail":{"cards":[
  {"eyebrow":"Modo Agente","title":"DCA semanal lunes","description":"$50 USDC → SOL · Policy: max $200/sem","cta":{"label":"Configurar","href":"/carlos/agente"},"tone":"action"}
]}}</tropico-ui>
```

## Ejemplos

- "Configur&aacute; un DCA de $30 a JTO los viernes"
  → Confirmar: "Te configuro: $30 USDC → JTO cada viernes a las 10am. Policy: max $120/mes, sesión expira en 1h. ¿Lo activo?"
  → Si user dice s&iacute;: `agent_rule_upsert.py --action dca --config '...'`

- "Ejecut&aacute; el cashback ya"
  → Confirmar: "Acumulaste $3.20. ¿Lo reclamo a tu wallet ahora? La firma la hace OpenClaw con tu session key."
  → Si user dice s&iacute;: `agent_execute.py --action auto-cashback`
  → Mostrar tx signature: "Listo, signature: `5xK...abc`. Ya tenés los $3.20 en tu wallet. Verificalo en Solscan si querés."

## Disclaimer en cada respuesta de Modo Agente

Siempre cerrá con: "Pod&eacute;s pausar o revocar el agente cuando quieras desde /carlos/agente."
