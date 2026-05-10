#!/usr/bin/env bash
# scripts/faucet.sh — Tropico dev faucet
#
# Envía 100 TROPI-TEST a cualquier wallet de devnet.
# Requiere: Solana CLI, SPL Token CLI, keypair con mint authority.
#
# Uso:
#   bash scripts/faucet.sh <WALLET_PUBKEY>
#
# Ejemplo:
#   bash scripts/faucet.sh 7xKXtABCDEF123456789abcdefghijkl

set -euo pipefail

# ─── Config ────────────────────────────────────────────────────────────────────
# Mint TROPI test deployado en devnet (ver scripts/create-tropi-token.mjs)
MINT_ADDRESS="${TROPI_TEST_MINT:-AbkCW6BA2ZVoTw4Q6M1NvATiZjn2aMS3WvWZQbhRQf6K}"
KEYPAIR="${TROPICO_DEV_KEYPAIR:-$HOME/.config/solana/devnet-test.json}"
AMOUNT=100
CLUSTER="devnet"
# ───────────────────────────────────────────────────────────────────────────────

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

usage() {
  echo "Uso: $0 <WALLET_PUBKEY>"
  echo ""
  echo "Ejemplo:"
  echo "  $0 7xKXtABCDEF123456789abcdefghijkl"
  exit 1
}

# Validar argumento
if [[ $# -lt 1 ]]; then
  echo -e "${RED}Error: falta la wallet de destino.${NC}"
  usage
fi

RECIPIENT_WALLET="$1"

# Validar que el mint está configurado
if [[ "$MINT_ADDRESS" == "REEMPLAZAR_CON_EL_MINT_DEVNET" ]]; then
  echo -e "${RED}Error: MINT_ADDRESS no está configurado.${NC}"
  echo "Editá scripts/faucet.sh con el mint address real de TROPI-TEST."
  echo "Para crear uno desde cero: node scripts/create-tropi-token.mjs"
  exit 1
fi

# Validar que el keypair existe
if [[ ! -f "$KEYPAIR" ]]; then
  echo -e "${RED}Error: keypair no encontrado en $KEYPAIR${NC}"
  echo "Creá uno con: solana-keygen new -o $KEYPAIR"
  exit 1
fi

echo -e "${YELLOW}Tropico Dev Faucet — TROPI-TEST${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Cluster:    $CLUSTER"
echo "Mint:       $MINT_ADDRESS"
echo "Recipient:  $RECIPIENT_WALLET"
echo "Amount:     $AMOUNT TROPI-TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Transferir tokens — --fund-recipient crea la ATA si no existe
echo -e "\nEnviando tokens..."
SIGNATURE=$(spl-token transfer \
  --url "$CLUSTER" \
  --owner "$KEYPAIR" \
  --fund-recipient \
  "$MINT_ADDRESS" \
  "$AMOUNT" \
  "$RECIPIENT_WALLET" \
  2>&1 | grep "Signature:" | awk '{print $2}')

if [[ -z "$SIGNATURE" ]]; then
  echo -e "${RED}Error: la transacción falló. Revisá que tenés SOL para fees.${NC}"
  echo "Intentá: solana airdrop 2 --url devnet"
  exit 1
fi

echo -e "${GREEN}Listo!${NC}"
echo "Signature: $SIGNATURE"
echo "Explorer:  https://solscan.io/tx/${SIGNATURE}?cluster=devnet"
echo ""
echo "$RECIPIENT_WALLET ya tiene $AMOUNT TROPI-TEST para probar."
