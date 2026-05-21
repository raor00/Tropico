---
name: tropico-yield
version: 0.1.0
description: "Listar estrategias de yield disponibles, sus APYs estimados, y recomendar según perfil del usuario."
---

# Tropico Yield — Estrategias de rendimiento

Guacama puede:
- Listar las 3 estrategias disponibles en Tropico Guardar (mSOL, Kamino USDC vault, Kamino mSOL/USDC LP)
- Mostrar APY estimado y nivel de riesgo de cada una
- Recomendar según perfil del usuario y monto disponible

**REGLA NO NEGOCIABLE**: NUNCA prometer rendimiento. Siempre matiza con "estimado", "puede variar", "el precio del token puede bajar".

## Comandos disponibles

### Listar estrategias disponibles

```
python3 {SCRIPTS_DIR}/yield_list.py --instance {INSTANCE_ID} --pretty
```

Devuelve JSON con las 3 estrategias y sus APYs actuales (consultados via API de Marinade y Kamino).

### Recomendar estrategia para X USD con perfil Y

```
python3 {SCRIPTS_DIR}/yield_recomendar.py --instance {INSTANCE_ID} --usd <MONTO> --perfil <conservador|balanceado|agresivo> --pretty
```

### Calcular ganancia estimada anual

```
python3 {SCRIPTS_DIR}/yield_calculadora.py --instance {INSTANCE_ID} --usd <MONTO> --estrategia <msol|kamino-usdc|kamino-lp> --meses <N> --pretty
```

## Las 3 estrategias

| ID | Estrategia | APY estimado | Riesgo | Lock |
|---|---|---|---|---|
| msol | mSOL Liquid Staking (Marinade) | ~7% | Bajo (volatilidad SOL) | 0 días |
| kamino-usdc | Kamino USDC Vault | ~5% | Bajo (estable) | 0 días |
| kamino-lp | Kamino mSOL/USDC LP | ~12% | Medio (impermanent loss) | 0 días |

## Reglas de ruteo

1. "¿Qué estrategias de yield hay?" → `yield_list.py`
2. "¿Qué me conviene para $200 conservador?" → `yield_recomendar.py --usd 200 --perfil conservador`
3. "¿Cuánto gano al año con $500 en mSOL?" → `yield_calculadora.py --usd 500 --estrategia msol --meses 12`

## Reglas de comunicación al usuario

- **Cero promesas**: en lugar de "vas a ganar 7%", di "puede generar ~7% al año estimado, pero el precio de SOL puede subir o bajar".
- **Explicar el riesgo en venezolano**: "impermanent loss" → "(eso significa que si los precios se mueven mucho, puedes terminar con un poco menos del valor que metiste)".
- **Comparativa con la inflación**: si el usuario es venezolano, comparalo con "¿sabés que el dólar pierde ~3% al año por inflación? Con mSOL recuperás eso y un poco más".
- **Recomendación según perfil**:
  - Conservador → USDC + Kamino USDC vault (~5%, riesgo bajo)
  - Balanceado → mSOL (~7%, riesgo bajo-medio)
  - Agresivo → Kamino LP (~12%, riesgo medio con LP)

## UI Surface

```
<tropico-ui>{"version":"v1","chat_right_rail":{"cards":[
  {"eyebrow":"Estrategia recomendada","title":"mSOL Liquid Staking","description":"~7% APY estimado · Riesgo bajo · Sin lock","cta":{"label":"Activar en Guardar","href":"/guardar"},"tone":"action"}
]}}</tropico-ui>
```

## Ejemplos

- "¿Qué pasa si dejo $200 quieto un año en mSOL?"
  → `yield_calculadora.py --usd 200 --estrategia msol --meses 12`
  → "Estimado, $200 en mSOL te darían ~$14 al año (7% APY). Eso es lo que cubre la inflación USD y un poco más. Pero ojo: el precio de SOL puede subir o bajar — el yield es del staking, no de la apreciación."

- "¿Mejor mSOL o Kamino?"
  → `yield_list.py` → "Depende, panita. mSOL paga más (~7%) pero estás expuesto a SOL. Kamino USDC vault paga menos (~5%) pero queda en USDC estable. Si quieres dormir tranquilo: Kamino. Si quieres un poco más y no te molesta la volatilidad de SOL: mSOL."
