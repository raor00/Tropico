#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo ""
echo "=== Tropico Wallet — Dev Setup ==="
echo ""

# --- Version checks ---
echo "Checking required tools..."

NODE_VERSION=$(node --version 2>/dev/null || echo "NOT FOUND")
echo "  node:   $NODE_VERSION"

if command -v pnpm &>/dev/null; then
  PNPM_VERSION=$(pnpm --version 2>/dev/null)
  echo "  pnpm:   $PNPM_VERSION"
else
  NPM_VERSION=$(npm --version 2>/dev/null || echo "NOT FOUND")
  echo "  npm:    $NPM_VERSION"
fi

SOLANA_VERSION=$(solana --version 2>/dev/null || echo "NOT FOUND — install: https://docs.solana.com/cli/install-solana-cli-tools")
echo "  solana: $SOLANA_VERSION"

ANCHOR_VERSION=$(anchor --version 2>/dev/null || echo "NOT FOUND — install: https://www.anchor-lang.com/docs/installation")
echo "  anchor: $ANCHOR_VERSION"

echo ""

# --- Copy .env.local if missing ---
ENV_EXAMPLE="$REPO_ROOT/.env.example"
ENV_LOCAL="$REPO_ROOT/.env.local"

if [ ! -f "$ENV_LOCAL" ]; then
  if [ -f "$ENV_EXAMPLE" ]; then
    cp "$ENV_EXAMPLE" "$ENV_LOCAL"
    echo "Copied .env.example -> .env.local"
    echo "  Edit .env.local and fill in your API keys before running the app."
  else
    echo "WARNING: .env.example not found, skipping .env.local creation."
  fi
else
  echo ".env.local already exists, skipping copy."
fi

echo ""

# --- Install dependencies ---
echo "Installing npm dependencies..."
cd "$REPO_ROOT" && npm install

echo ""
echo "Tropico dev environment ready"
echo ""
