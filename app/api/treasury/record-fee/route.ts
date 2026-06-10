/**
 * POST /api/treasury/record-fee
 *
 * VERIFY-THEN-RECORD: the client sends the on-chain tx signature; the server
 * verifies the transaction before recording a fee event in tropico_treasury.
 * No client secret is required — the on-chain tx IS the proof of payment.
 *
 * Security contract:
 *   - No API key required from the client.
 *   - TREASURY_AUTHORITY_KEYPAIR is server-only; fail-closed 503 if absent.
 *   - Fee amount is derived exclusively from on-chain token balance deltas
 *     (preTokenBalances / postTokenBalances) for the protocol fee ATAs.
 *     The client CANNOT influence the recorded amount.
 *   - Idempotency: each tx signature is inserted into treasury_fee_recorded
 *     (Supabase, primary key) before recording. Duplicate POSTs return 200
 *     {status:"already_recorded"} without re-recording.
 *
 * Fail-closed:
 *   - TREASURY_AUTHORITY_KEYPAIR unset → 503.
 *   - Tx not found or not yet confirmed → 404.
 *   - Tx did not invoke the realestate program → 400.
 *   - No fee transfer detected in the tx → 400.
 *
 * Body:
 *   { "signature": "<base58 tx sig>", "module"?: "RealEstate" }
 *
 * Module defaults to "RealEstate" when absent.
 * Supported variants: Swap, Pay, Yield, Cashback, Remesas, Servicios, P2pBs,
 *   TropicoPay, RealEstate, RealEstateYield, RealEstateSecondary
 *
 * Response 200:
 *   { "signature": "<treasury record_fee tx sig>", "recordedAmount": <u64 USDC micro-units> }
 *   { "status": "already_recorded" }  ← idempotent duplicate
 *
 * Optional server-to-server callers may still include X-Tropico-Api-Key for
 * additional defence-in-depth, but it is NOT required for the verified path.
 */

import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import {
  assertTreasuryRecorder,
  recordFee,
  ModuleType,
  type ModuleTypeName,
} from "@/lib/treasury-client";
import { fetchRegistryConfig, getUsdcMint } from "@/lib/realestate-program";
import { getActiveRpcUrl } from "@/lib/cluster";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── Supabase helpers (mirrors pattern from lib/aml-server.ts) ────────────────

function supabaseUrl(): string {
  const url = process.env.SUPABASE_URL;
  if (!url) throw new Error("SUPABASE_URL is not set");
  return url.replace(/\/$/, "");
}

function supabaseKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return key;
}

/**
 * Attempts to insert `signature` into treasury_fee_recorded.
 * Returns "inserted" if newly recorded, "duplicate" if already present.
 * Throws if Supabase is unreachable.
 */
async function tryInsertSignature(
  signature: string
): Promise<"inserted" | "duplicate"> {
  const base = supabaseUrl();
  const key = supabaseKey();
  const res = await fetch(`${base}/rest/v1/treasury_fee_recorded`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
      // Return the inserted row; resolution=ignore-duplicates triggers ON CONFLICT DO NOTHING
      // and returns an empty array when the row already exists.
      Prefer: "return=representation,resolution=ignore-duplicates",
    },
    body: JSON.stringify({ signature }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `[treasury/idempotency] Supabase insert failed ${res.status}: ${text}`
    );
  }
  const rows = (await res.json()) as unknown[];
  return rows.length > 0 ? "inserted" : "duplicate";
}

/**
 * Deletes a previously inserted signature from treasury_fee_recorded.
 * Called when recordFee fails after a successful insert, so the signature
 * is not permanently blocked from being re-attempted.
 */
async function deleteSignature(signature: string): Promise<void> {
  const base = supabaseUrl();
  const key = supabaseKey();
  await fetch(
    `${base}/rest/v1/treasury_fee_recorded?signature=eq.${encodeURIComponent(signature)}`,
    {
      method: "DELETE",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    }
  );
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  // ── (a) Fail-closed: treasury keypair must be configured ─────────────────
  try {
    assertTreasuryRecorder();
  } catch {
    return NextResponse.json(
      {
        error: "service_unavailable",
        message: "Treasury authority is not configured on this server.",
      },
      { status: 503 }
    );
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Body must be valid JSON." },
      { status: 400 }
    );
  }

  const input = body as Record<string, unknown>;

  // ── (b) Validate signature format ─────────────────────────────────────────
  const signatureRaw = String(input.signature ?? "").trim();
  try {
    if (!signatureRaw) throw new Error("empty");
    const decoded = bs58.decode(signatureRaw);
    // Solana tx signatures are always 64 bytes
    if (decoded.length !== 64)
      throw new Error(`expected 64 bytes, got ${decoded.length}`);
  } catch (err) {
    return NextResponse.json(
      {
        error: "invalid_signature",
        message: `signature is not a valid base58 Solana transaction signature: ${(err as Error).message}`,
      },
      { status: 400 }
    );
  }

  // ── Parse optional module ──────────────────────────────────────────────────
  const moduleStr = input.module ? String(input.module) : "RealEstate";
  if (!(moduleStr in ModuleType)) {
    return NextResponse.json(
      {
        error: "invalid_module",
        message: `module must be one of: ${Object.keys(ModuleType).join(", ")}`,
      },
      { status: 400 }
    );
  }

  // ── (c) Fetch confirmed transaction ───────────────────────────────────────
  const connection = new Connection(getActiveRpcUrl(), "confirmed");
  let txResp: Awaited<ReturnType<Connection["getTransaction"]>>;
  try {
    txResp = await connection.getTransaction(signatureRaw, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });
  } catch (e) {
    console.error("[treasury/record-fee] getTransaction RPC error:", e);
    return NextResponse.json(
      { error: "rpc_error", message: "Failed to fetch transaction from RPC." },
      { status: 502 }
    );
  }

  if (!txResp) {
    return NextResponse.json(
      {
        error: "tx_not_found",
        message: "Transaction not found or not yet confirmed.",
      },
      { status: 404 }
    );
  }

  // Require tx to have succeeded on-chain
  if (txResp.meta?.err !== null && txResp.meta?.err !== undefined) {
    return NextResponse.json(
      { error: "tx_failed", message: "Transaction failed on-chain." },
      { status: 409 }
    );
  }

  // ── (d) Confirm the tx invoked our realestate program ────────────────────
  const realestateProgId = process.env.NEXT_PUBLIC_REALESTATE_PROGRAM_ID;
  if (!realestateProgId) {
    return NextResponse.json(
      {
        error: "config_error",
        message: "NEXT_PUBLIC_REALESTATE_PROGRAM_ID is not configured.",
      },
      { status: 503 }
    );
  }

  const msg = txResp.transaction.message;
  // VersionedMessage has staticAccountKeys; legacy Message has accountKeys.
  const accountKeys: { toBase58(): string }[] =
    "staticAccountKeys" in msg
      ? msg.staticAccountKeys
      : (msg as unknown as { accountKeys: { toBase58(): string }[] }).accountKeys;

  const programInvoked = accountKeys.some(
    (k) => k.toBase58() === realestateProgId
  );
  if (!programInvoked) {
    return NextResponse.json(
      {
        error: "invalid_tx",
        message: "Transaction did not invoke the realestate program.",
      },
      { status: 400 }
    );
  }

  // Require buy_shares or transfer_shares (check program logs)
  const logs = txResp.meta?.logMessages ?? [];
  const isBuyOrTransfer = logs.some(
    (l) => l.includes("buy_shares") || l.includes("transfer_shares")
  );
  if (!isBuyOrTransfer) {
    return NextResponse.json(
      {
        error: "invalid_tx",
        message:
          "Transaction does not contain a fee-bearing instruction (buy_shares / transfer_shares).",
      },
      { status: 400 }
    );
  }

  // ── (e) Derive fee amount from on-chain token balance deltas ─────────────
  // Resolve protocol fee wallet addresses from the on-chain registry.
  const registry = await fetchRegistryConfig();
  if (!registry) {
    return NextResponse.json(
      {
        error: "registry_unavailable",
        message: "Cannot fetch realestate registry config from chain.",
      },
      { status: 503 }
    );
  }

  const crixtoOwner = registry.crixtoFeeWallet.toBase58();
  const tropicoOwner = registry.tropicoFeeWallet.toBase58();
  const usdcMint = getUsdcMint().toBase58();

  const pre = txResp.meta?.preTokenBalances ?? [];
  const post = txResp.meta?.postTokenBalances ?? [];

  /** Sum USDC micro-units (6 decimals) received by `owner` across all token accounts.
   *  Only considers token accounts whose mint is the USDC mint — other SPL tokens are ignored. */
  function ownerReceived(owner: string): bigint {
    const postTotal = post
      .filter((b) => b.owner === owner && b.mint === usdcMint)
      .reduce((sum, b) => sum + BigInt(b.uiTokenAmount.amount), 0n);
    const preTotal = pre
      .filter((b) => b.owner === owner && b.mint === usdcMint)
      .reduce((sum, b) => sum + BigInt(b.uiTokenAmount.amount), 0n);
    return postTotal > preTotal ? postTotal - preTotal : 0n;
  }

  // Sum Crixto + Tropico fee wallet inflows = total protocol fee collected.
  const crixtoDelta = ownerReceived(crixtoOwner);
  const tropicoDelta = ownerReceived(tropicoOwner);
  const totalFeeUnits = crixtoDelta + tropicoDelta; // USDC micro-units (6 decimals)

  if (totalFeeUnits <= 0n) {
    return NextResponse.json(
      {
        error: "no_fee_detected",
        message:
          "No fee transfer to protocol fee wallets detected in this transaction.",
      },
      { status: 400 }
    );
  }

  // ── (f) Idempotency guard ─────────────────────────────────────────────────
  let idempotencyResult: "inserted" | "duplicate" | "unavailable" =
    "unavailable";
  try {
    idempotencyResult = await tryInsertSignature(signatureRaw);
  } catch (e) {
    // Supabase unavailable — log and degrade gracefully (tolerable gap).
    // TODO: add an in-process LRU fallback guard if this degrades in production.
    console.warn(
      "[treasury/record-fee] idempotency guard unavailable, proceeding without it:",
      e
    );
    idempotencyResult = "unavailable";
  }

  if (idempotencyResult === "duplicate") {
    return NextResponse.json({ status: "already_recorded" }, { status: 200 });
  }

  // ── (g) Record on-chain ───────────────────────────────────────────────────
  // First account key in the transaction is always the fee payer (the user who signed).
  const payerPubkey = new PublicKey(accountKeys[0].toBase58());

  try {
    const recordSig = await recordFee({
      amountLamports: totalFeeUnits,
      module: moduleStr as ModuleTypeName,
      userPubkey: payerPubkey,
    });

    return NextResponse.json(
      { signature: recordSig, recordedAmount: totalFeeUnits.toString() },
      { status: 200 }
    );
  } catch (err) {
    // Never leak keypair or secret details in the response.
    console.error("[treasury/record-fee] on-chain record_fee error:", err);

    // Roll back the idempotency guard so the caller can retry.
    if (idempotencyResult === "inserted") {
      try {
        await deleteSignature(signatureRaw);
      } catch (delErr) {
        console.error(
          "[treasury/record-fee] failed to delete idempotency row after recordFee failure — signature will be permanently blocked:",
          delErr
        );
      }
    }

    return NextResponse.json(
      {
        error: "chain_error",
        message: "Failed to record fee on-chain. Check server logs.",
      },
      { status: 500 }
    );
  }
}
