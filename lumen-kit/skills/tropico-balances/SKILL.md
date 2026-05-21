---
name: tropico-balances
version: 0.1.0
description: "Leer saldos del wallet del usuario: SOL nativo + Associated Token Accounts del catálogo Tropico."
---

# Tropico Balances — Saldos del wallet

Guacama puede consultar el saldo del wallet del usuario en Solana:
- SOL nativo
- USDC, USDT, JUP, JTO, mSOL, KMNO, RAY, BONK (SPL tokens)
- Valor total USD + equivalente en Bs paralelo

## Comandos disponibles

### Saldo total + holdings detallados

```
python3 {SCRIPTS_DIR}/solana_balance.py --instance {INSTANCE_ID} --wallet <PUBKEY> --pretty
```

Devuelve JSON:
```json
{
  "wallet": "7xKXt3...",
  "totalUSD": 348.65,
  "totalBs": 226753.55,
  "holdings": [
    { "symbol": "USDC", "amount": 247.30, "valueUSD": 247.30, "decimals": 6 },
    { "symbol": "SOL", "amount": 0.428, "valueUSD": 64.20, "decimals": 9 }
  ],
  "tasaBs": 650.51,
  "fetchedAt": "2026-05-08T14:00:00Z"
}
```

### Saldo de un token específico

```
python3 {SCRIPTS_DIR}/solana_balance.py --instance {INSTANCE_ID} --wallet <PUBKEY> --token <SYMBOL> --pretty
```

### Yield acumulado (para holdings de mSOL/Kamino)

```
python3 {SCRIPTS_DIR}/yield_acumulado.py --instance {INSTANCE_ID} --wallet <PUBKEY> --pretty
```

Devuelve JSON: `{ "yieldSemana": 0.48, "yieldMes": 2.05, "apyActual": 5.2 }`

## Reglas de ruteo

1. Usuario pregunta "¿Cuánto tengo?" → `solana_balance.py --wallet <pubkey>`
2. Usuario pregunta "¿Cuánto SOL tengo?" → `solana_balance.py --wallet <pubkey> --token SOL`
3. Usuario pregunta "¿Cuánto generé esta semana?" → `yield_acumulado.py --wallet <pubkey>`
4. Si el wallet no tiene cuentas SPL para algunos tokens → es normal, muestra solo los que sí tiene
5. Si el RPC falla → "No puedo leer tu saldo ahora, pana. Verifica tu conexión."

## Privacidad

- **NO loguees el pubkey en plain text** en el output del script
- **NO menciones internals** (RPC, ATAs, decimals) al usuario — presenta los datos limpios
- El usuario NO debería saber que hay scripts corriendo

## Ejemplos

- "¿Cuánto tengo en mi wallet?"
  → `solana_balance.py` → "Tienes $348.65 en total (Bs. 226.753,55 al paralelo). Repartido en 247.30 USDC, 0.428 SOL, 12.5 JTO, y 0.05 mSOL."

- "¿Y mi yield esta semana?"
  → `yield_acumulado.py` → "Esta semana ganaste $0.48 en yield (Bs. 312,24). APY actual: 5.2% — sólido para algo automático."

## Formato de respuesta

- Saldos en USD con `$` prefix y formato US (1,234.56)
- Bs con `Bs.` prefix y formato VE (1.234,56)
- Si el usuario tiene <$1, muestra centavos con 2 decimales
- Si tiene >$10,000, puedes usar formato compacto ($12.5k)
