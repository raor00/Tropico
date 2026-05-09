#!/usr/bin/env python3
"""
Capability: solana_pay_url
Generates a Solana Pay URL for merchant checkout (Cobrar module).
Called by the `tropico-pay` skill of the Tropico Lumen kit.

Spec: https://docs.solanapay.com
URL format: solana:<recipient>?amount=<amount>&spl-token=<mint>&reference=<ref>&label=<label>

Usage:
    python3 solana_pay_url.py --instance tropico-mvp \
        --recipient <PUBKEY> --amount 5.00 --label "Bodega La Esquina" \
        --token USDC [--pretty]

Output: JSON with url, reference, token, amount, recipient.
"""

import argparse
import json
import os
import random
import string
import sys
from urllib.parse import quote

# Supported tokens for Solana Pay (SPL). SOL is native (no spl-token param).
SPL_TOKENS = {
    "USDC": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "USDT": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
}
NATIVE_SOL = "SOL"
VALID_TOKENS = list(SPL_TOKENS.keys()) + [NATIVE_SOL]

# Base58 alphabet (Bitcoin/Solana style, no 0/O/I/l)
BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"


def generate_reference(length: int = 32) -> str:
    """Generate a base58-like random reference string (simulates a Solana public key)."""
    rng = random.SystemRandom()
    return "".join(rng.choice(BASE58_ALPHABET) for _ in range(length))


def build_solana_pay_url(
    recipient: str,
    amount: float,
    label: str,
    token: str,
    reference: str,
) -> str:
    """
    Build a Solana Pay URL per spec:
    https://docs.solanapay.com/spec#transfer-request

    For SPL tokens: solana:<recipient>?amount=<amount>&spl-token=<mint>&reference=<ref>&label=<label>
    For SOL native: solana:<recipient>?amount=<amount>&reference=<ref>&label=<label>
    """
    # Amount formatted without trailing zeros for cleanliness
    amount_str = f"{amount:.9f}".rstrip("0").rstrip(".")

    label_encoded = quote(label, safe="")
    ref_encoded = quote(reference, safe="")

    if token == NATIVE_SOL:
        url = (
            f"solana:{recipient}"
            f"?amount={amount_str}"
            f"&reference={ref_encoded}"
            f"&label={label_encoded}"
        )
    else:
        mint = SPL_TOKENS[token]
        url = (
            f"solana:{recipient}"
            f"?amount={amount_str}"
            f"&spl-token={mint}"
            f"&reference={ref_encoded}"
            f"&label={label_encoded}"
        )

    return url


def generate_pay_url(
    recipient: str,
    amount: float,
    label: str,
    token: str,
) -> dict:
    token_upper = token.upper()
    if token_upper not in VALID_TOKENS:
        return {
            "ok": False,
            "error": f"Token '{token}' not supported. Valid: {', '.join(VALID_TOKENS)}",
        }
    if amount <= 0:
        return {"ok": False, "error": "amount must be > 0"}
    if not recipient or len(recipient) < 32:
        return {"ok": False, "error": "recipient must be a valid Solana public key (base58, 32-44 chars)"}

    reference = generate_reference(32)
    url = build_solana_pay_url(recipient, amount, label, token_upper, reference)

    result: dict = {
        "ok": True,
        "url": url,
        "reference": reference,
        "recipient": recipient,
        "amount": amount,
        "token": token_upper,
        "label": label,
    }

    if token_upper in SPL_TOKENS:
        result["splToken"] = SPL_TOKENS[token_upper]

    return result


def main():
    parser = argparse.ArgumentParser(description="Generate Solana Pay URL for Tropico Cobrar")
    parser.add_argument("--instance", required=True, help="Tropico instance ID")
    parser.add_argument("--recipient", required=True, help="Merchant Solana public key (base58)")
    parser.add_argument("--amount", type=float, required=True, help="Amount to charge in USD")
    parser.add_argument("--label", required=True, help="Merchant / business name")
    parser.add_argument(
        "--token",
        default="USDC",
        choices=VALID_TOKENS,
        help="Token to receive: USDC (default) | USDT | SOL",
    )
    parser.add_argument("--pretty", action="store_true", help="Pretty print JSON")
    args = parser.parse_args()

    result = generate_pay_url(args.recipient, args.amount, args.label, args.token)

    if args.pretty:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(json.dumps(result, ensure_ascii=False))

    sys.exit(0 if result.get("ok") else 1)


if __name__ == "__main__":
    main()
