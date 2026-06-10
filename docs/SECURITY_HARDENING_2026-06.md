# Security Hardening — June 2026

## Summary

A security audit of the Tropico monorepo (on-chain programs + Next.js client) identified **8 vulnerabilities** across three Anchor programs and the web app. All confirmed findings were remediated in source. No commit was made; builds and migrations must be run manually before deploy (see Residual Steps).

---

## Vulnerabilities Found & Fixed

| # | Title | Severity | Program / File |
|---|-------|----------|----------------|
| 1 | Fee theft in `buy_shares` | HIGH | `tropico_realestate/src/lib.rs` |
| 2 | KYC bypass + stale-position double yield | HIGH | `tropico_realestate/src/lib.rs` |
| 3 | Secondary 1 % transfer fee never collected | HIGH/MED | `tropico_realestate/src/lib.rs` |
| 4 | Transfer creates position at `last_claimed_epoch = 0` | HIGH | `tropico_realestate/src/lib.rs` |
| 5 | `treasury::record_fee` — no authority check | HIGH | `tropico_treasury/src/lib.rs` |
| 6 | BS peg oracle — no rate/frequency guards | MED | `tropico_bs/src/lib.rs` |
| 7 | AML limits enforced client-side only | MED | `lib/aml-server.ts`, `app/api/checkout/create/route.ts` |
| 8 | Checkout auth fails open when API key unset | MED | `app/api/checkout/create/route.ts` |

---

### 1. Fee theft in `buy_shares` (HIGH)

**Root cause.** Fee ATAs passed to `BuyShares`, `TransferShares`, and `DepositYield` lacked owner binding. A buyer could pass their own ATA as the fee account and redirect the full 150 bps fee to themselves.

**Fix.**
- Added `crixto_fee_wallet` and `tropico_fee_wallet` pubkeys to `RegistryConfig` (account size 106 → 170 bytes).
- `initialize_registry` now accepts 2 new parameters for those pubkeys.
- Fee ATAs in `BuyShares`, `TransferShares`, and `DepositYield` are now constrained: `owner == registry.crixto_fee_wallet` / `registry.tropico_fee_wallet`.
- New error variant: `InvalidFeeAccount`.

**File:** `programs/tropico_realestate/src/lib.rs`

---

### 2. KYC bypass + stale-position double yield (HIGH)

**Root cause.** Shares were standard SPL tokens with no freeze authority. A holder could transfer them via a raw SPL instruction, bypassing `transfer_shares`. The recipient skipped KYC. The sender's `InvestorPosition.shares_owned` was never decremented, making both parties able to call `claim_reward` against the same shares — draining the vault.

**Fix.**
- Share mint `freeze_authority` is now set to the `property` PDA.
- `buy_shares` and `transfer_shares` thaw the relevant ATA → execute the CPI token move → re-freeze, using helper CPIs. Tokens cannot move outside program-mediated instructions.
- `transfer_shares` now syncs `shares_owned` on both the sender's and recipient's `InvestorPosition`.

**File:** `programs/tropico_realestate/src/lib.rs`

---

### 3. Secondary 1 % transfer fee never collected (HIGH/MED)

**Root cause.** `transfer_shares` promised a 1 % protocol fee in comments and docs but collected nothing — the accounts were absent from the instruction context.

**Fix.**
- Added `from_usdc_ata`, `crixto_fee_ata`, and `tropico_fee_ata` to the `TransferShares` account context.
- Fee = `amount × valuation_usdc / total_shares × (50 + 50) bps`, computed in `u128` with checked arithmetic to prevent overflow.
- Fee is collected before the share move.

**File:** `programs/tropico_realestate/src/lib.rs`

---

### 4. Transfer creates position at `last_claimed_epoch = 0` (HIGH)

**Root cause.** When `buy_shares` or `transfer_shares` created a new `InvestorPosition`, `last_claimed_epoch` was initialized to `0`. On the next `claim_reward` call the new holder could claim yield from all epochs since genesis, draining the vault.

**Fix.** New positions (in both `buy_shares` and `transfer_shares` for the recipient) are now initialized to the current latest epoch so only yield accrued after entry is claimable.

**File:** `programs/tropico_realestate/src/lib.rs`

---

### 5. `treasury::record_fee` — no authority check (HIGH)

**Root cause.** `record_fee` accepted any signer, allowing anyone to write arbitrary fee records and corrupt the transparency dashboard.

**Fix.** Added `require!(recorder.key() == state.authority, Unauthorized)` at the top of the instruction handler.

**File:** `programs/tropico_treasury/src/lib.rs`

---

### 6. BS peg oracle — no rate/frequency guards (MED)

**Root cause.** `update_peg` accepted any exchange rate without bounds or cooldown. A compromised oracle keypair could set an extreme rate and drain the shared vault in a single transaction.

**Fix.**
- Added constant `MAX_RATE_CHANGE_BPS = 2000` (±20 % deviation cap from the previous peg).
- Added `min_interval = 300 s`; new field `last_peg_update_ts` on the state account (bootstrap sentinel: `0` bypasses the interval check on first call only).
- New errors: `PegDeviationTooLarge`, `PegUpdateTooFrequent`.

**File:** `programs/tropico_bs/src/lib.rs`

---

### 7. AML limits enforced client-side only (MED)

**Root cause.** Daily and monthly transfer limits were checked in `lib/aml.ts` using `localStorage`, trivially bypassed by any client that skips the UI.

**Fix.**
- New `lib/aml-server.ts` exports `recordAndCheck()` backed by Supabase (`aml_ledger` table).
- Migration: `supabase/migrations/0002_aml_ledger.sql`.
- `app/api/checkout/create/route.ts` now calls `recordAndCheck()` server-side before processing.
- `lib/aml.ts` is now marked non-authoritative (client-side display only).

**Files:** `lib/aml-server.ts`, `lib/aml.ts`, `app/api/checkout/create/route.ts`, `supabase/migrations/0002_aml_ledger.sql`

---

### 8. Checkout auth fails open when API key unset (MED)

**Root cause.** When `TROPICO_PAY_API_KEY` was not set in the environment, the auth check was skipped and all requests were admitted.

**Fix.** Handler now returns `503 Service Unavailable` when the env var is absent, failing closed.

**File:** `app/api/checkout/create/route.ts`

---

## Client Changes

| File | Change |
|------|--------|
| `lib/realestate-program.ts` | Added `fetchRegistryConfig`; named layout offset constants for registry fee wallets (offsets 104 and 136); `buildBuySharesTx` derives fee ATAs from registry config instead of env vars; `buildTransferShareTx` now invokes the real `transfer_shares` discriminator (`sha256("global:transfer_shares")[:8]` = `17 88 8c 0f b5 36 78 af`) with a full 15-account list. |
| `lib/treasury-client.ts` | Added `assertTreasuryRecorder()` helper to guard `record_fee` calls on the client. |
| `components/PropertyBuyForm.tsx` | Removed obsolete fee ATA env var references (`NEXT_PUBLIC_CRIXTO_FEE_ATA_USDC`, `NEXT_PUBLIC_TROPICO_FEE_ATA_USDC`). |

---

## False Positives (Investigated, Not Vulnerabilities)

- **`GET /api/guacama` provider booleans** — flags in the response payload are informational feature toggles, not a security issue.

---

## New / Changed Environment Variables

| Variable | Scope | Status | Notes |
|----------|-------|--------|-------|
| `TREASURY_AUTHORITY_KEYPAIR` | Server (base58) | **Required** | Signs `record_fee`; must be the treasury program authority. |
| `SUPABASE_URL` | Server | **Required** | For server-side AML ledger. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | **Required** | Service-role key for `aml_ledger` writes. |
| `NEXT_PUBLIC_CRIXTO_FEE_ATA_USDC` | Client | **Obsolete** | Fee ATAs now derived from `RegistryConfig` on-chain. Remove from `.env`. |
| `NEXT_PUBLIC_TROPICO_FEE_ATA_USDC` | Client | **Obsolete** | Same as above. |

---

## Residual / Manual Steps Before Deploy

> **These steps are REQUIRED. The on-chain fixes are not live until programs are rebuilt and redeployed.**

1. **Build programs.** Run `anchor build` for all three programs (`tropico_realestate`, `tropico_treasury`, `tropico_bs`). The work environment had a broken `.zshenv` (`~/.cargo/env` missing); fix Rust/Cargo paths first.

2. **Regenerate IDL.** After a successful build, regenerate IDLs. Ideally replace the manual byte-offset parsing and hand-written discriminators in `lib/realestate-program.ts` with generated TypeScript types from the IDL.

3. **Run Supabase migration.** Apply `supabase/migrations/0002_aml_ledger.sql` via `supabase db push` before enabling checkout in production.

4. **Atomify AML check-upsert.** The current `recordAndCheck()` in `lib/aml-server.ts` performs a check then an upsert in two round-trips — not atomic. Wrap in a Postgres RPC for production to eliminate the TOCTOU window.

5. **Deploy treasury program + update authority atomically.** The new `record_fee` authority check requires the server keypair (`TREASURY_AUTHORITY_KEYPAIR`) to match the on-chain `state.authority`. Deploy the program and update the server env var in the same release window to avoid a gap where `record_fee` is broken.

---

## record_fee Wiring (2026-06)

The `record_fee` instruction is now wired with a VERIFY-THEN-RECORD model. No client secret is required.

### Files

| File | Purpose |
|---|---|
| `lib/treasury-client.ts` | SERVER ONLY. Loads `TREASURY_AUTHORITY_KEYPAIR`, builds + signs + confirms the `record_fee` instruction. |
| `app/api/treasury/record-fee/route.ts` | POST endpoint. Auth via on-chain tx verification — no API key required from client. |
| `supabase/migrations/0004_treasury_fee_recorded.sql` | Idempotency table (`treasury_fee_recorded`). **Pending `supabase db push`**. |

### Trust model

The route accepts `{ signature: string, module?: string }` from the browser. It:
1. Fetches the tx from chain (`getTransaction`).
2. Confirms the tx invoked `NEXT_PUBLIC_REALESTATE_PROGRAM_ID`.
3. Confirms logs contain `buy_shares` or `transfer_shares`.
4. Reads `preTokenBalances`/`postTokenBalances` to derive the total fee paid to the protocol fee wallets (crixto + tropico ATA inflows). The client CANNOT influence this amount.
5. Inserts the signature into `treasury_fee_recorded` (primary key) before recording. Duplicate → `{status:"already_recorded"}` without re-recording.
6. Calls `recordFee()` with the verified amount and payer pubkey.

### Required env vars

| Variable | Value | Notes |
|---|---|---|
| `TREASURY_AUTHORITY_KEYPAIR` | base58-encoded 64-byte Solana secret key | Must match `state.authority` on-chain. Server-only — NEVER in `NEXT_PUBLIC_*`. |
| `NEXT_PUBLIC_REALESTATE_PROGRAM_ID` | Program ID | Used to verify the tx invoked the right program. |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Required for idempotency guard. If unavailable, route degrades gracefully (logs warning, proceeds). |

`TROPICO_API_KEY` is no longer required from clients. Server-to-server callers may still pass `X-Tropico-Api-Key` for optional defence-in-depth.

### Fail-closed guarantees

- `TREASURY_AUTHORITY_KEYPAIR` unset → **503** before touching any state.
- Tx not found or not confirmed → **404 / 409**.
- Tx did not invoke realestate program → **400**.
- No fee detected in token balance deltas → **400**.
- Chain error → **500** with a generic message; no secret details in response.

### Client call sites

| Component | Event | Module |
|---|---|---|
| `components/PropertyBuyForm.tsx` | After `conn.confirmTransaction` succeeds | `RealEstate` |
| `components/ShareTransferCard.tsx` | After `conn.confirmTransaction` succeeds | `RealEstateSecondary` |

Both calls are fire-and-forget (`fetch(...).catch(() => {})`). Recording failure never surfaces to the user.
