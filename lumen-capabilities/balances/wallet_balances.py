#!/usr/bin/env python3
"""
Capability: wallet_balances
Fetches SOL native balance + SPL token balances for a Solana wallet via RPC.
Called by the `tropico-balances` skill of the Tropico Lumen kit.

Usage:
    python3 wallet_balances.py --instance tropico-mvp --wallet <PUBKEY> [--token SOL] [--pretty]

Output: JSON with wallet, totalUSD, totalBs, holdings, tasaBs, fetchedAt.
"""

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from typing import Dict, List, Optional
from urllib.request import urlopen, Request
from urllib.error import URLError

# Curated token catalog: symbol -> (mint, decimals)
TROPICO_TOKENS = {
    "SOL":  ("So11111111111111111111111111111111111111112", 9),
    "USDC": ("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", 6),
    "USDT": ("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", 6),
    "JUP":  ("JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", 6),
    "JTO":  ("jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL", 9),
    "mSOL": ("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", 9),
    "KMNO": ("KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS", 6),
    "RAY":  ("4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", 6),
    "BONK": ("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", 5),
}

MINT_TO_SYMBOL = {v[0]: k for k, v in TROPICO_TOKENS.items()}
JUPITER_PRICE_URL = "https://lite-api.jup.ag/price/v3"
TIMEOUT_SECONDS = 8

BS_PER_USD_FALLBACK = 50.0  # fallback if price fetch fails


def get_rpc_url() -> str:
    return os.environ.get("HELIUS_RPC", "https://api.mainnet-beta.solana.com")


def rpc_post(payload: dict) -> dict:
    rpc_url = get_rpc_url()
    body = json.dumps(payload).encode("utf-8")
    req = Request(
        rpc_url,
        data=body,
        headers={"Content-Type": "application/json", "User-Agent": "tropico-lumen/0.1"},
        method="POST",
    )
    with urlopen(req, timeout=TIMEOUT_SECONDS) as resp:
        return json.loads(resp.read().decode("utf-8"))


def fetch_sol_balance(wallet: str) -> float:
    """Returns SOL balance in human-readable units."""
    data = rpc_post({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getBalance",
        "params": [wallet, {"commitment": "confirmed"}],
    })
    if "error" in data:
        raise RuntimeError(f"RPC getBalance error: {data['error']}")
    lamports = data["result"]["value"]
    return lamports / 1e9


def fetch_spl_balances(wallet: str) -> List[dict]:
    """Returns list of {mint, amount, decimals} for all token accounts."""
    data = rpc_post({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getTokenAccountsByOwner",
        "params": [
            wallet,
            {"programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"},
            {"encoding": "jsonParsed", "commitment": "confirmed"},
        ],
    })
    if "error" in data:
        raise RuntimeError(f"RPC getTokenAccountsByOwner error: {data['error']}")

    accounts = []
    for acct in data["result"]["value"]:
        info = acct["account"]["data"]["parsed"]["info"]
        mint = info["mint"]
        token_amount = info["tokenAmount"]
        amount = float(token_amount["uiAmount"] or 0)
        decimals = int(token_amount["decimals"])
        if amount > 0:
            accounts.append({"mint": mint, "amount": amount, "decimals": decimals})
    return accounts


def fetch_usd_prices(symbols: List[str]) -> Dict[str, float]:
    """Returns {symbol: priceUSD} for the given symbols."""
    mints = [TROPICO_TOKENS[s][0] for s in symbols if s in TROPICO_TOKENS]
    if not mints:
        return {}
    ids_param = ",".join(mints)
    url = f"{JUPITER_PRICE_URL}?ids={ids_param}"
    req = Request(url, headers={"User-Agent": "tropico-lumen/0.1"})
    with urlopen(req, timeout=TIMEOUT_SECONDS) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    prices = {}
    for symbol in symbols:
        if symbol not in TROPICO_TOKENS:
            continue
        mint = TROPICO_TOKENS[symbol][0]
        entry = data.get(mint)
        if entry and entry.get("usdPrice"):
            prices[symbol] = float(entry["usdPrice"])
    return prices


def fetch_bs_rate() -> float:
    """Fetch BCV/parallel rate from precio_bs logic (reuses Jupiter SOL price as proxy).
    Falls back to a static rate if unavailable."""
    # We try to get the rate from our own precio_bs module if importable,
    # otherwise use a reasonable fallback.
    try:
        url = "https://pydolarve.org/api/v1/dollar?page=bcv"
        req = Request(url, headers={"User-Agent": "tropico-lumen/0.1"})
        with urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        # pydolarve returns {"monitors": {"usd": {"price": ...}}}
        price = data.get("monitors", {}).get("usd", {}).get("price")
        if price:
            return float(price)
    except Exception:
        pass
    return BS_PER_USD_FALLBACK


def get_balances(wallet: str, filter_symbol: Optional[str] = None) -> dict:
    try:
        sol_amount = fetch_sol_balance(wallet)
    except Exception as e:
        return {"ok": False, "error": f"Failed to fetch SOL balance: {str(e)}"}

    try:
        spl_accounts = fetch_spl_balances(wallet)
    except Exception as e:
        return {"ok": False, "error": f"Failed to fetch SPL balances: {str(e)}"}

    # Build holdings list — only include tokens from our catalog
    holdings = []

    # SOL
    if filter_symbol is None or filter_symbol == "SOL":
        holdings.append({"symbol": "SOL", "amount": sol_amount, "decimals": 9, "mint": TROPICO_TOKENS["SOL"][0]})

    # SPL tokens from our catalog
    for acct in spl_accounts:
        mint = acct["mint"]
        symbol = MINT_TO_SYMBOL.get(mint)
        if symbol is None:
            continue  # not in our catalog, skip
        if filter_symbol is not None and filter_symbol != symbol:
            continue
        holdings.append({
            "symbol": symbol,
            "amount": acct["amount"],
            "decimals": acct["decimals"],
            "mint": mint,
        })

    # Fetch USD prices for all held symbols
    symbols_held = [h["symbol"] for h in holdings]
    try:
        prices = fetch_usd_prices(symbols_held)
    except Exception:
        prices = {}

    # Attach USD values
    total_usd = 0.0
    for h in holdings:
        price = prices.get(h["symbol"], 0.0)
        value_usd = h["amount"] * price
        h["valueUSD"] = round(value_usd, 4)
        h["priceUSD"] = round(price, 6)
        total_usd += value_usd

    try:
        tasa_bs = fetch_bs_rate()
    except Exception:
        tasa_bs = BS_PER_USD_FALLBACK

    total_bs = total_usd * tasa_bs

    return {
        "ok": True,
        "wallet": wallet,
        "totalUSD": round(total_usd, 4),
        "totalBs": round(total_bs, 2),
        "holdings": holdings,
        "tasaBs": tasa_bs,
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
    }


def main():
    parser = argparse.ArgumentParser(description="Fetch Solana wallet balances (SOL + SPL Tropico catalog)")
    parser.add_argument("--instance", required=True, help="Tropico instance ID")
    parser.add_argument("--wallet", required=True, help="Solana wallet public key")
    parser.add_argument("--token", help="Filter to a single token symbol (SOL, USDC, ...)")
    parser.add_argument("--pretty", action="store_true", help="Pretty print JSON")
    args = parser.parse_args()

    filter_symbol = args.token.upper() if args.token else None
    if filter_symbol and filter_symbol not in TROPICO_TOKENS:
        result = {
            "ok": False,
            "error": f"Token '{filter_symbol}' not in Tropico catalog. Available: {', '.join(TROPICO_TOKENS.keys())}",
        }
        print(json.dumps(result, ensure_ascii=False))
        sys.exit(1)

    result = get_balances(args.wallet, filter_symbol)

    if args.pretty:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(json.dumps(result, ensure_ascii=False))

    sys.exit(0 if result.get("ok") else 1)


if __name__ == "__main__":
    main()
