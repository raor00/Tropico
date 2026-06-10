/**
 * AML — Server-side velocity accumulator.
 *
 * Tracks daily and monthly USD totals per wallet address in Supabase.
 * Call recordAndCheck() BEFORE creating any checkout session.
 *
 * Required environment variables:
 *   SUPABASE_URL              — e.g. https://xyzxyz.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY — service-role JWT (bypasses RLS)
 *
 * Table schema:   see supabase/migrations/0002_aml_ledger.sql
 * Atomic RPC:     see supabase/migrations/0003_aml_check_rpc.sql
 *
 * NOTE: recordAndCheck() delegates to the Postgres RPC aml_record_and_check,
 * which runs inside a single transaction with SELECT … FOR UPDATE row locks.
 * This eliminates the TOCTOU race that existed in the old SELECT → check →
 * UPSERT approach.
 */

import { AML_LIMITS } from "./aml";

export interface AmlServerResult {
  allowed: boolean;
  /** Human-readable reasons why the transaction was blocked (empty when allowed). */
  reasons: string[];
}

// ─── Supabase REST helpers ────────────────────────────────────────────────────

function supabaseUrl(): string {
  const url = process.env.SUPABASE_URL;
  if (!url) throw new AmlConfigError("SUPABASE_URL is not set");
  return url.replace(/\/$/, "");
}

function supabaseKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new AmlConfigError("SUPABASE_SERVICE_ROLE_KEY is not set");
  return key;
}

export class AmlConfigError extends Error {
  constructor(message: string) {
    super(`[aml-server] ${message}`);
    this.name = "AmlConfigError";
  }
}

function rpcHeaders(key: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    apikey: key,
    Authorization: `Bearer ${key}`,
  };
}

// ─── RPC response shape ───────────────────────────────────────────────────────

interface AmlRpcRow {
  allowed: boolean;
  /** Null when allowed === true. */
  reason: string | null;
  daily_total: number;
  monthly_total: number;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Atomically checks per-tx, daily, and monthly AML limits for `wallet`
 * against server-side accumulated totals, then records the amount if allowed.
 *
 * Delegates to the Postgres function `aml_record_and_check` (defined in
 * supabase/migrations/0003_aml_check_rpc.sql) via a single REST call.
 * The function holds SELECT … FOR UPDATE row locks for the duration of the
 * transaction, preventing concurrent requests from bypassing limits.
 *
 * Throws AmlConfigError if SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are absent.
 */
export async function recordAndCheck(
  wallet: string,
  amountUsd: number
): Promise<AmlServerResult> {
  const base = supabaseUrl();
  const key = supabaseKey();

  const res = await fetch(`${base}/rest/v1/rpc/aml_record_and_check`, {
    method: "POST",
    headers: rpcHeaders(key),
    body: JSON.stringify({
      p_wallet: wallet,
      p_amount: amountUsd,
      p_daily_limit: AML_LIMITS.PER_DAY_USD,
      p_monthly_limit: AML_LIMITS.PER_MONTH_USD,
      p_per_tx_limit: AML_LIMITS.PER_TX_USD,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `[aml-server] aml_record_and_check RPC failed: ${res.status} ${text}`
    );
  }

  // Supabase returns SETOF rows as a JSON array.
  const rows = (await res.json()) as AmlRpcRow[];
  if (!rows || rows.length === 0) {
    throw new Error("[aml-server] aml_record_and_check returned no rows");
  }

  const row = rows[0];
  return {
    allowed: row.allowed,
    reasons: row.reason ? [row.reason] : [],
  };
}
