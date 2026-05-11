/**
 * @tropico/sdk — Solana Pay URL builder and parser
 *
 * Spec: https://docs.solanapay.com/spec
 */

import type { SolanaPayParams } from "./types.js";
import { InvalidSolanaPayUrlError } from "./errors.js";

const SOLANA_PAY_SCHEME = "solana";

/**
 * Build a Solana Pay URL from the given params.
 *
 * Format: `solana:<recipient>?amount=<n>[&spl-token=<mint>][&reference=<pubkey>][&label=<str>][&message=<str>][&memo=<str>]`
 */
export function buildSolanaPayUrl(params: SolanaPayParams): string {
  const {
    recipient,
    amount,
    splToken,
    reference,
    label,
    message,
    memo,
  } = params;

  if (!recipient) throw new InvalidSolanaPayUrlError("recipient is required");
  if (typeof amount !== "number" || amount <= 0) {
    throw new InvalidSolanaPayUrlError("amount must be a positive number");
  }

  // Use a URL object to safely encode query params, then swap scheme.
  // The URL constructor requires a valid absolute URL — we use https as a
  // placeholder host and replace it after building the query string.
  const placeholder = new URL(`https://placeholder.invalid/${recipient}`);
  placeholder.searchParams.set("amount", String(amount));

  if (splToken) placeholder.searchParams.set("spl-token", splToken);
  if (reference) placeholder.searchParams.set("reference", reference);
  if (label) placeholder.searchParams.set("label", label);
  if (message) placeholder.searchParams.set("message", message);
  if (memo) placeholder.searchParams.set("memo", memo);

  // Reconstruct as `solana:<recipient>?<query>`
  const query = placeholder.search; // includes leading `?`
  return `${SOLANA_PAY_SCHEME}:${recipient}${query}`;
}

/**
 * Parse a Solana Pay URL back into structured params.
 * Throws `InvalidSolanaPayUrlError` if the URL is malformed.
 */
export function parseSolanaPayUrl(url: string): SolanaPayParams {
  if (!url || typeof url !== "string") {
    throw new InvalidSolanaPayUrlError("URL must be a non-empty string");
  }

  if (!url.startsWith(`${SOLANA_PAY_SCHEME}:`)) {
    throw new InvalidSolanaPayUrlError(
      `URL must start with "${SOLANA_PAY_SCHEME}:" — got: ${url.slice(0, 20)}`
    );
  }

  // Strip the `solana:` prefix and parse the rest as a relative URL
  const withoutScheme = url.slice(`${SOLANA_PAY_SCHEME}:`.length);
  const [recipientRaw, ...rest] = withoutScheme.split("?");
  const recipient = recipientRaw.trim();

  if (!recipient) {
    throw new InvalidSolanaPayUrlError("URL has no recipient");
  }

  const queryString = rest.join("?");
  const params = new URLSearchParams(queryString);

  const amountRaw = params.get("amount");
  if (!amountRaw) {
    throw new InvalidSolanaPayUrlError("URL missing required `amount` parameter");
  }

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new InvalidSolanaPayUrlError(`Invalid amount: ${amountRaw}`);
  }

  const result: SolanaPayParams = { recipient, amount };

  const splToken = params.get("spl-token");
  const reference = params.get("reference");
  const label = params.get("label");
  const message = params.get("message");
  const memo = params.get("memo");

  if (splToken) result.splToken = splToken;
  if (reference) result.reference = reference;
  if (label) result.label = label;
  if (message) result.message = message;
  if (memo) result.memo = memo;

  return result;
}
