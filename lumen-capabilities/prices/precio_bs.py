#!/usr/bin/env python3
"""
Capability: precio_bs
Devuelve la tasa USD/VES paralelo y oficial desde ve.dolarapi.com.
Llamado por la skill `tropico-prices` del kit Tropico Wallet.

Uso:
    python3 precio_bs.py --instance tropico-mvp [--pretty]

Output: JSON estructurado con `usdToBs`, `usdToBsOficial`, `fuente`, `fetchedAt`.
"""

import argparse
import json
import sys
from datetime import datetime, timezone
from urllib.request import urlopen, Request
from urllib.error import URLError

DOLARAPI_URL = "https://ve.dolarapi.com/v1/dolares"
TIMEOUT_SECONDS = 5


def fetch_precio_bs() -> dict:
    """Fetch tasa from ve.dolarapi.com. Returns dict with usdToBs (paralelo), usdToBsOficial (BCV)."""
    try:
        req = Request(DOLARAPI_URL, headers={"User-Agent": "tropico-lumen/0.1"})
        with urlopen(req, timeout=TIMEOUT_SECONDS) as response:
            data = json.loads(response.read().decode("utf-8"))
    except URLError as e:
        return {
            "ok": False,
            "error": f"Network error: {e.reason}",
            "fuente": "fallback",
        }
    except Exception as e:
        return {
            "ok": False,
            "error": f"Error fetching precio: {str(e)}",
            "fuente": "fallback",
        }

    paralelo = next((d for d in data if d.get("fuente") == "paralelo"), None)
    oficial = next((d for d in data if d.get("fuente") == "oficial"), None)

    paralelo_rate = paralelo and (paralelo.get("promedio") or paralelo.get("venta") or paralelo.get("compra"))
    oficial_rate = oficial and (oficial.get("promedio") or oficial.get("venta") or oficial.get("compra"))

    if not paralelo_rate or paralelo_rate <= 0:
        return {
            "ok": False,
            "error": "Invalid paralelo rate from API",
            "fuente": "fallback",
        }

    return {
        "ok": True,
        "usdToBs": paralelo_rate,
        "usdToBsOficial": oficial_rate,
        "fuente": "ve.dolarapi.com",
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
    }


def main():
    parser = argparse.ArgumentParser(description="Get USD/VES rate from ve.dolarapi.com")
    parser.add_argument("--instance", required=True, help="Tropico instance ID")
    parser.add_argument("--pretty", action="store_true", help="Pretty print JSON")
    args = parser.parse_args()

    result = fetch_precio_bs()

    if args.pretty:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(json.dumps(result, ensure_ascii=False))

    sys.exit(0 if result.get("ok") else 1)


if __name__ == "__main__":
    main()
