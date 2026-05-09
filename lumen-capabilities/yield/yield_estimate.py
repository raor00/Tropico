#!/usr/bin/env python3
"""
Capability: yield_estimate
Returns mock yield estimates for the 3 Tropico Guardar strategies.
Called by the `tropico-yield` skill of the Tropico Lumen kit.

Usage:
    python3 yield_estimate.py --instance tropico-mvp --strategy msol --amount 200 [--pretty]

Strategies: msol | kamino-usdc | kamino-lp
Output: JSON with strategy, apy_pct, projected_year_usd, risk.
"""

import argparse
import json
import sys

# Static strategy data — APYs are estimates sourced from Marinade and Kamino dashboards.
# NEVER present these as guaranteed. Always label as "estimado" in UI.
STRATEGIES = {
    "msol": {
        "id": "msol",
        "name": "mSOL Liquid Staking (Marinade)",
        "apy_pct": 7.0,
        "risk": "low",
        "risk_note": "Volatilidad de precio SOL; el yield es del staking, no de apreciación.",
        "lock_days": 0,
        "token": "mSOL",
        "source": "Marinade Finance (estimado)",
    },
    "kamino-usdc": {
        "id": "kamino-usdc",
        "name": "Kamino USDC Vault",
        "apy_pct": 5.2,
        "risk": "low",
        "risk_note": "Stablecoin USDC; riesgo de smart contract de Kamino.",
        "lock_days": 0,
        "token": "USDC",
        "source": "Kamino Finance (estimado)",
    },
    "kamino-lp": {
        "id": "kamino-lp",
        "name": "Kamino mSOL/USDC LP",
        "apy_pct": 12.4,
        "risk": "medium",
        "risk_note": "Impermanent loss si los precios divergen; riesgo mayor que vault simple.",
        "lock_days": 0,
        "token": "mSOL/USDC",
        "source": "Kamino Finance LP (estimado)",
    },
}

VALID_STRATEGIES = list(STRATEGIES.keys())


def estimate_yield(strategy_id: str, amount_usd: float) -> dict:
    if strategy_id not in STRATEGIES:
        return {
            "ok": False,
            "error": f"Unknown strategy '{strategy_id}'. Valid: {', '.join(VALID_STRATEGIES)}",
        }
    if amount_usd <= 0:
        return {"ok": False, "error": "amount must be > 0"}

    s = STRATEGIES[strategy_id]
    apy = s["apy_pct"]
    projected_year = round(amount_usd * apy / 100, 4)
    projected_month = round(projected_year / 12, 4)

    return {
        "ok": True,
        "strategy": s["id"],
        "name": s["name"],
        "apy_pct": apy,
        "amountUSD": amount_usd,
        "projected_year_usd": projected_year,
        "projected_month_usd": projected_month,
        "risk": s["risk"],
        "risk_note": s["risk_note"],
        "lock_days": s["lock_days"],
        "token": s["token"],
        "source": s["source"],
        "disclaimer": "Rendimiento estimado, puede variar. El precio del token puede subir o bajar.",
    }


def main():
    parser = argparse.ArgumentParser(description="Estimate yield for Tropico Guardar strategies")
    parser.add_argument("--instance", required=True, help="Tropico instance ID")
    parser.add_argument(
        "--strategy",
        required=True,
        choices=VALID_STRATEGIES,
        help="Strategy ID: msol | kamino-usdc | kamino-lp",
    )
    parser.add_argument("--amount", type=float, required=True, help="Amount in USD to invest")
    parser.add_argument("--pretty", action="store_true", help="Pretty print JSON")
    args = parser.parse_args()

    result = estimate_yield(args.strategy, args.amount)

    if args.pretty:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(json.dumps(result, ensure_ascii=False))

    sys.exit(0 if result.get("ok") else 1)


if __name__ == "__main__":
    main()
