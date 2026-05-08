---
name: tropico-cashback
version: 0.1.0
description: "Consultar cashback acumulado de comercios Tropico afiliados y proponer reclamo."
---

# Tropico Cashback — Acumulado de comercios

Carlos puede:
- Consultar cuánto cashback tiene el usuario acumulado de comercios afiliados Tropico
- Listar de qué comercios viene
- Proponer reclamo (manual o vía Modo Agente automático)

## Comandos disponibles

### Consultar acumulado

```
python3 {SCRIPTS_DIR}/cashback_acumulado.py --instance {INSTANCE_ID} --wallet <PUBKEY> --pretty
```

Devuelve JSON:
```json
{
  "totalUSD": 3.20,
  "totalBs": 2081.63,
  "comercios": [
    { "nombre": "Bodega La Esquina", "amount": 1.20, "ultimoCobro": "2026-05-08T12:00:00Z" },
    { "nombre": "Panadería Nueva", "amount": 0.75, "ultimoCobro": "2026-05-07T18:30:00Z" }
  ],
  "ultimoClaim": "2026-04-30T10:00:00Z"
}
```

### Histórico de claims previos

```
python3 {SCRIPTS_DIR}/cashback_historico.py --instance {INSTANCE_ID} --wallet <PUBKEY> --meses <N> --pretty
```

## Reglas de ruteo

1. "¿Cuánto cashback tengo?" → `cashback_acumulado.py --wallet <pubkey>`
2. "¿De dónde viene?" → mismo, listar comercios
3. "Reclamame el cashback" → Carlos NO ejecuta — propone vía UI: "Te dejo el botón listo en el Modo Agente, dale Reclamar y firmás."
4. Si el usuario activó Modo Agente con regla `auto-cashback-claim`, Carlos coordina con OpenClaw para reclamo programado (semanal/mensual).

## UI Surface

```
<tropico-ui>{"version":"v1","chat_right_rail":{"cards":[
  {"eyebrow":"Cashback acumulado","title":"$3.20 listos para reclamar","description":"De 4 comercios afiliados","cta":{"label":"Reclamar","href":"/carlos/agente"},"tone":"action"}
]}}</tropico-ui>
```

## Ejemplos

- "¿Tengo cashback?"
  → `cashback_acumulado.py` → "S&iacute;, panita. Ten&eacute;s $3.20 acumulados (Bs. 2.081,63) de 4 comercios. La mayor parte vino de Bodega La Esquina ($1.20). ¿Te lo reclamo?"

- "¿Cómo funciona el cashback?"
  → "Cuando pag&aacute;s en un comercio afiliado a Tropico, el comercio te devuelve un porcentaje (típicamente 0.5-1%) porque ahorra en fees vs POS tradicional. Vos ganás siendo cliente; el comercio fideliza."
