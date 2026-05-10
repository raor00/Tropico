# Guía de Demo para Jueces — Tropico Wallet

> Esta guía explica cómo cualquier juez del hackathon puede probar Tropico end-to-end en menos de 2 minutos sin pagarle a nadie y sin dependencias del equipo Tropico.

---

## TL;DR — 3 pasos

1. Andá al deploy live: `https://<vercel-url>.vercel.app`
2. **Login con tu email** (Privy abre modal con email/Google/wallet). Privy crea automático tu wallet Solana embedded — tuya, no custodia Tropico.
3. En `/home` click el botón **"Modo demo · devnet"** debajo de "Saldo disponible". Se abre modal con:
   - Tu pubkey lista para copiar
   - Link a `faucet.solana.com` → 1 SOL devnet (gas)
   - Link a `faucet.circle.com` → 10 USDC devnet
   
   Total: ~30 segundos. Tu wallet queda fondeada con tokens de prueba (sin valor real).

Listo. Probá: enviar, recibir QR, swap, Pago Móvil VE, etc.

---

## Cómo funciona el "Modo demo · devnet"

### Frontend
Componente `components/DevnetFaucetButton.tsx`:
1. Click → llama `setActiveCluster("devnet")` que persiste en localStorage.
2. Dispara evento `tropico:cluster-changed` para que `HomeBalances` re-fetch.
3. Abre modal con tu pubkey + dos faucets públicos.

**No usa API server-side, no consume fondos del equipo Tropico.** Vos sos dueño de tu wallet, vos pedís los tokens de prueba a los faucets oficiales.

### Faucets que se abren (públicos, oficiales)

| Faucet | URL | Qué da |
|---|---|---|
| Solana Foundation | `faucet.solana.com` | 1 SOL devnet por request (gas + rent ATAs) |
| Circle | `faucet.circle.com` | 10 USDC devnet (mint `4zMMC9srt5...`) |

---

## Por qué no hay deployer central

Tropico es **non-custodial estricto**. El equipo no:
- Custodia llaves del usuario (Privy MPC = vos sos único firmante)
- Mantiene wallet "central" para fondear jurados
- Toca tus fondos en ningún momento

El "Modo demo · devnet" respeta esto: el usuario fondea su wallet propia desde faucets públicos, exactamente como fondearía una wallet mainnet (excepto que devnet es gratis).

---

## Qué probar después del Modo Demo

| Flow | URL | Qué se demuestra |
|---|---|---|
| **Saldo on-chain** | `/home` | Balance real via Helius RPC, refresca cada 30s |
| **Enviar** | `/enviar` → tab "A wallet" | Firma SPL Token con Privy embedded → broadcast Solana devnet |
| **Cobrar (QR)** | `/cobrar` | Genera QR Solana Pay con `reference` único |
| **Swap** | `/cambiar` → tab "Tokens" | Quote real Jupiter v6 con `platformFeeBps=50` (mainnet) |
| **Bs ↔ USDC** | `/cambiar` → tab "Bolívares" | Pool propio Tropico, settlement <1s |
| **Pago Móvil VE** | `/pagar-servicios` | Scan QR Suiche7B (cámara) o entrada manual → pool Bs Tropico paga al banco destino |
| **Carlos AI** | `/carlos` | Chat + 4 acciones agentic (DCA, auto-yield, cashback, rebalance) |
| **Perfil** | `/perfil` | Editar nombre, ver email Privy, eliminar wallet |
| **Idiomas** | Header → globo | ES / EN / PT / FR |

---

## Troubleshooting

| Problema | Solución |
|---|---|
| Faucet rate-limit (429) | Esperá 1 min y volvé a pedir. O usá la opción CLI desde otro device. |
| QR cámara no abre | Permitir cámara en browser. Alternativa: botón "✍️ Colocar datos manualmente" |
| Privy login no abre | Verificar `NEXT_PUBLIC_PRIVY_APP_ID` + dominios autorizados en Privy dashboard |
| Saldo no aparece después de fondear | Click el icono refresh del saldo. RPC devnet a veces tarda 5-10s en confirmar |
| TROPI no aparece | TROPI mint solo existe en devnet. Asegurate que cluster = DEV (badge en saldo card). El mint está en `AbkCW6BA2ZVoTw4Q6M1NvATiZjn2aMS3WvWZQbhRQf6K` |

---

## Direcciones útiles on-chain

| Recurso | Cluster | Address |
|---|---|---|
| TROPI mint | devnet | `AbkCW6BA2ZVoTw4Q6M1NvATiZjn2aMS3WvWZQbhRQf6K` |
| USDC mint | devnet | `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU` |
| USDC mint | mainnet | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| SPL Token Program | both | `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` |
| Jupiter v6 | mainnet | `JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4` |

Solscan TROPI: https://solscan.io/token/AbkCW6BA2ZVoTw4Q6M1NvATiZjn2aMS3WvWZQbhRQf6K?cluster=devnet
