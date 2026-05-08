#!/usr/bin/env python3
"""
Capability: precio_usd
Devuelve el precio USD actual de un token del catálogo Tropico vía Jupiter Price API.
Llamado por la skill `tropico-prices` del kit Tropico Wallet.

Uso:
    python3 precio_usd.py --instance tropico-mvp --token SOL [--pretty]

Output: JSON con symbol, priceUSD, mint, timestamp.
"""

import argparse
import json
import sys
from datetime import datetime, timezone
from urllib.request import urlopen, Request
from urllib.error import URLError

# Catálogo de mints Tropico (mainnet)
TROPICO_TOKENS = {
    "SOL": "So11111111111111111111111111111111111111112",
    "USDC": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "USDT": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    "JUP": "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    "JTO": "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL",
    "mSOL": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
    "KMNO": "KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS",
    "RAY": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
    "BONK": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
}

JUPITER_PRICE_URL = "https://lite-api.jup.ag/price/v3"
TIMEOUT_SECONDS = 5


def fetch_price_usd(symbol: str) -> dict:
    if symbol not in TROPICO_TOKENS and symbol.upper() not in TROPICO_TOKENS:
        return {
            "ok": False,
            "error": f"Token '{symbol}' not in Tropico catalog. Available: {', '.join(TROPICO_TOKENS.keys())}",
        }

    symbol_key = symbol if symbol in TROPICO_TOKENS else symbol.upper()
    mint = TROPICO_TOKENS[symbol_key]
    url = f"{JUPITER_PRICE_URL}?ids={mint}"

    try:
        req = Request(url, headers={"User-Agent": "tropico-lumen/0.1"})
        with urlopen(req, timeout=TIMEOUT_SECONDS) as response:
            data = json.loads(response.read().decode("utf-8"))
    except URLError as e:
        return {"ok": False, "error": f"Jupiter Price API unreachable: {e.reason}"}
    except Exception as e:
        return {"ok": False, "error": f"Error fetching price: {str(e)}"}

    # Jupiter Price API v3 response shape: { "<mint>": { "usdPrice": ..., "priceChange24h": ... } }
    price_data = data.get(mint)
    if not price_data:
        return {"ok": False, "error": f"No price data returned for {symbol}"}

    try:
        price = float(price_data.get("usdPrice", 0))
        change_24h = float(price_data.get("priceChange24h", 0))
    except (TypeError, ValueError):
        return {"ok": False, "error": f"Invalid price format from Jupiter"}

    return {
        "ok": True,
        "symbol": symbol_key,
        "mint": mint,
        "priceUSD": price,
        "priceChange24h": change_24h,
        "fuente": "Jupiter Price API v3 (lite-api.jup.ag)",
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
    }


def main():
    parser = argparse.ArgumentParser(description="Get USD price of Tropico catalog token via Jupiter")
    parser.add_argument("--instance", required=True, help="Tropico instance ID")
    parser.add_argument("--token", required=True, help="Token symbol (SOL, USDC, JTO, etc.)")
    parser.add_argument("--pretty", action="store_true", help="Pretty print JSON")
    args = parser.parse_args()

    result = fetch_price_usd(args.token)

    if args.pretty:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(json.dumps(result, ensure_ascii=False))

    sys.exit(0 if result.get("ok") else 1)


if __name__ == "__main__":
    main()
