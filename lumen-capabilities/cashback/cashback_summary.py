#!/usr/bin/env python3
"""
Capability: cashback_summary
Reads accumulated cashback from store.json for a given wallet.
Called by the `tropico-cashback` skill of the Tropico Lumen kit.

Usage:
    python3 cashback_summary.py --instance tropico-mvp --wallet <PUBKEY> [--pretty]

Output: JSON with totalUSD, totalBs, comercios, ultimoClaim.
"""

import argparse
import json
import os
import sys
from urllib.request import urlopen, Request

# store.json lives alongside this script
STORE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "store.json")
BS_PER_USD_FALLBACK = 50.0
TIMEOUT_SECONDS = 4


def fetch_bs_rate() -> float:
    try:
        url = "https://pydolarve.org/api/v1/dollar?page=bcv"
        req = Request(url, headers={"User-Agent": "tropico-lumen/0.1"})
        with urlopen(req, timeout=TIMEOUT_SECONDS) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        price = data.get("monitors", {}).get("usd", {}).get("price")
        if price:
            return float(price)
    except Exception:
        pass
    return BS_PER_USD_FALLBACK


def get_cashback_summary(wallet: str) -> dict:
    if not os.path.exists(STORE_PATH):
        return {"ok": False, "error": f"Cashback store not found at {STORE_PATH}"}

    try:
        with open(STORE_PATH, "r", encoding="utf-8") as f:
            store = json.load(f)
    except (json.JSONDecodeError, OSError) as e:
        return {"ok": False, "error": f"Failed to read cashback store: {str(e)}"}

    merchants = store.get("merchants", [])
    total_usd = sum(m.get("amount", 0) for m in merchants)

    tasa_bs = fetch_bs_rate()
    total_bs = total_usd * tasa_bs

    comercios = [
        {
            "nombre": m["nombre"],
            "amount": m["amount"],
            "ultimoCobro": m.get("ultimoCobro"),
            "cashback_pct": m.get("cashback_pct"),
        }
        for m in merchants
        if m.get("amount", 0) > 0
    ]

    return {
        "ok": True,
        "wallet": wallet,
        "totalUSD": round(total_usd, 4),
        "totalBs": round(total_bs, 2),
        "tasaBs": tasa_bs,
        "comercios": comercios,
        "ultimoClaim": store.get("ultimoClaim"),
    }


def main():
    parser = argparse.ArgumentParser(description="Fetch Tropico cashback summary for a wallet")
    parser.add_argument("--instance", required=True, help="Tropico instance ID")
    parser.add_argument("--wallet", required=True, help="Solana wallet public key")
    parser.add_argument("--pretty", action="store_true", help="Pretty print JSON")
    args = parser.parse_args()

    result = get_cashback_summary(args.wallet)

    if args.pretty:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(json.dumps(result, ensure_ascii=False))

    sys.exit(0 if result.get("ok") else 1)


if __name__ == "__main__":
    main()
