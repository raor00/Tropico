---
name: tropico-prices
version: 0.1.0
description: "Consultar precios USD de tokens Solana y la tasa USD/VES paralelo de Venezuela."
---

# Tropico Prices — Precios USD + tasa Bs

Carlos puede consultar:
- Precio USD actual de cualquier token del catálogo Tropico (SOL, USDC, USDT, JUP, JTO, mSOL, KMNO, RAY, BONK) vía Jupiter Price API
- Tasa paralelo USD/VES desde ve.dolarapi.com (la realidad para el venezolano)

## Comandos disponibles

### Consultar precio USD de un token

```
python3 {SCRIPTS_DIR}/precio_usd.py --instance {INSTANCE_ID} --token <SYMBOL> --pretty
```

Devuelve JSON: `{ "symbol": "SOL", "priceUSD": 142.31, "timestamp": "..." }`

### Consultar tasa USD/VES paralelo

```
python3 {SCRIPTS_DIR}/precio_bs.py --instance {INSTANCE_ID} --pretty
```

Devuelve JSON: `{ "usdToBs": 650.51, "usdToBsOficial": 499.86, "fuente": "ve.dolarapi.com", "fetchedAt": "..." }`

### Convertir USD a Bs (incluye lookup de tasa)

```
python3 {SCRIPTS_DIR}/convertir_usd_bs.py --instance {INSTANCE_ID} --usd <MONTO> --pretty
```

Devuelve JSON: `{ "usd": 50, "bs": 32525.5, "tasa": 650.51 }`

## Reglas de ruteo

1. Usuario pregunta "¿Cuánto vale SOL?" → `precio_usd.py --token SOL`
2. Usuario pregunta "¿A cuánto está el dólar?" → `precio_bs.py`
3. Usuario pregunta "¿Cuánto son $50 en bs?" → `convertir_usd_bs.py --usd 50`
4. Si el script falla (red, API down) → responde "No pude consultar el precio en este momento, pana. Intenta en un minuto."
5. **NUNCA** uses tasas hardcoded — siempre llama al script, aunque tengas un valor reciente.

## Ejemplos

- "¿Cuánto está SOL?" → `precio_usd.py --token SOL` → "SOL está en $142.31."
- "Dame la tasa del paralelo" → `precio_bs.py` → "Tasa paralelo: Bs. 650.51 por dólar. Oficial BCV: Bs. 499.86."
- "¿$10 en bolívares?" → `convertir_usd_bs.py --usd 10` → "$10 son aproximadamente Bs. 6.505,10 al cambio paralelo."

## Formato de respuesta al usuario

- Para precios USD: usar formato `$1,234.56`
- Para Bs: usar formato `Bs. 1.234,56` (separador miles con punto, decimal con coma — formato venezolano)
- Si la tasa cambió mucho desde la última consulta del usuario, mencionalo: "Ojo, la tasa subió X% desde la última vez que la viste"
