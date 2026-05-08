#!/usr/bin/env python3
"""
Capability: jupiter_quote
Cotiza un swap entre 2 tokens del catálogo Tropico vía Jupiter v6 con platformFeeBps=50.
Llamado por la skill `tropico-swap` del kit Tropico Wallet.

NO firma transacciones — solo cotiza. La firma queda al frontend (con la wallet del usuario)
o a OpenClaw (con session key delegada en Modo Agente).

Uso:
    python3 jupiter_quote.py --instance tropico-mvp --from SOL --to USDC --amount 0.1 [--pretty]

Output: JSON con amountIn, amountOut, priceImpact, platformFee, route, validUntil.
"""

import argparse
import json
import sys
from datetime import datetime, timezone, timedelta
from urllib.parse import urlencode
from urllib.request import urlopen, Request
from urllib.error import URLError

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

JUPITER_QUOTE_URL = "https://lite-api.jup.ag/swap/v1/quote"
PLATFORM_FEE_BPS = 50  # 0.5% — modelo de revenue de Tropico
SLIPPAGE_BPS = 50      # 0.5%
TIMEOUT_SECONDS = 5


def get_quote(from_symbol: str, to_symbol: str, amount: float) -> dict:
    if from_symbol not in TROPICO_TOKENS:
        return {"ok": False, "error": f"Token origen '{from_symbol}' no en catálogo"}
    if to_symbol not in TROPICO_TOKENS:
        return {"ok": False, "error": f"Token destino '{to_symbol}' no en catálogo"}
    if amount <= 0:
        return {"ok": False, "error": "Amount debe ser > 0"}

    from_mint, from_decimals = TROPICO_TOKENS[from_symbol]
    to_mint, to_decimals = TROPICO_TOKENS[to_symbol]

    raw_amount = int(round(amount * (10 ** from_decimals)))

    params = {
        "inputMint": from_mint,
        "outputMint": to_mint,
        "amount": raw_amount,
        "slippageBps": SLIPPAGE_BPS,
        "platformFeeBps": PLATFORM_FEE_BPS,
        "swapMode": "ExactIn",
    }

    url = f"{JUPITER_QUOTE_URL}?{urlencode(params)}"

    try:
        req = Request(url, headers={"User-Agent": "tropico-lumen/0.1"})
        with urlopen(req, timeout=TIMEOUT_SECONDS) as response:
            data = json.loads(response.read().decode("utf-8"))
    except URLError as e:
        return {"ok": False, "error": f"Jupiter API unreachable: {e.reason}"}
    except Exception as e:
        return {"ok": False, "error": f"Error fetching quote: {str(e)}"}

    out_amount_raw = int(data.get("outAmount", 0))
    out_amount = out_amount_raw / (10 ** to_decimals)

    platform_fee_raw = int(data.get("platformFee", {}).get("amount", 0))
    platform_fee_human = platform_fee_raw / (10 ** to_decimals)

    rate = out_amount / amount if amount > 0 else 0

    route_plan = data.get("routePlan", [])
    route_names = [
        step.get("swapInfo", {}).get("label", "?")
        for step in route_plan
    ]
    route_str = " → ".join(route_names) if route_names else "Direct"

    valid_until = (datetime.now(timezone.utc) + timedelta(seconds=10)).isoformat()

    return {
        "ok": True,
        "from": from_symbol,
        "to": to_symbol,
        "amountIn": amount,
        "amountOut": out_amount,
        "priceImpactPct": float(data.get("priceImpactPct", 0)),
        "platformFee": {
            "amount": platform_fee_human,
            "feeBps": PLATFORM_FEE_BPS,
        },
        "rate": f"1 {from_symbol} = {rate:.6f} {to_symbol}",
        "route": f"via Jupiter ({route_str})",
        "slippageBps": SLIPPAGE_BPS,
        "validUntil": valid_until,
    }


def main():
    parser = argparse.ArgumentParser(description="Get Jupiter v6 quote with Tropico platformFeeBps")
    parser.add_argument("--instance", required=True, help="Tropico instance ID")
    parser.add_argument("--from", dest="from_token", required=True, help="From token symbol")
    parser.add_argument("--to", dest="to_token", required=True, help="To token symbol")
    parser.add_argument("--amount", type=float, required=True, help="Amount to swap (human readable)")
    parser.add_argument("--pretty", action="store_true", help="Pretty print JSON")
    args = parser.parse_args()

    result = get_quote(args.from_token, args.to_token, args.amount)

    if args.pretty:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(json.dumps(result, ensure_ascii=False))

    sys.exit(0 if result.get("ok") else 1)


if __name__ == "__main__":
    main()
