# tropico_bs — BsX Protocol

Synthetic Venezuelan Bolívar on Solana. 1:1 backed by USDC reserves held in a
program-owned vault, with on-chain reserve transparency and an oracle-set
Bs/USD exchange rate.

## Why This Exists

No other LatAm DeFi project has a fully on-chain, transparent, redeemable
synthetic representation of their local currency. BsX closes that gap for
Venezuelans: hold Bolívares on Solana, redeem USDC at any time, and verify the
backing yourself — no trust required, no black box.

## Architecture

```
User USDC ──deposit──► Treasury Vault (PDA)
                              │
                    ProtocolConfig PDA
                    (peg_rate, admin, oracle)
                              │
           ◄──mint BsX──── BsX SPL Mint (PDA)
```

All three on-chain accounts (`ProtocolConfig`, treasury vault, BsX mint) are
PDAs derived from seeds — no privileged keypair holds custody.

## Math

### Mint (USDC → BsX)
```
bsx_amount = usdc_amount * peg_rate / 1_000_000
```
Example: 10 USDC at 36.5 Bs/USD (peg_rate = 36_500_000) → 365 BsX.

### Burn (BsX → USDC)
```
usdc_amount = bsx_amount * 1_000_000 / peg_rate
```
Example: 365 BsX at 36.5 Bs/USD → 10 USDC.

`peg_rate` is stored scaled by `1_000_000` to preserve 6 decimal places of
precision without floating point.

## Instructions

| Instruction | Who | What |
|---|---|---|
| `initialize` | admin (once) | Creates ProtocolConfig PDA, BsX mint PDA (authority = config), treasury vault PDA. |
| `update_peg` | oracle_authority | Sets a new `peg_rate`. Emits `PegUpdated`. |
| `mint_bsx` | any user | Deposits USDC → receives BsX at current peg. Emits `BsxMinted`. |
| `burn_bsx` | any user | Burns BsX → receives USDC at current peg. Emits `BsxBurned`. |
| `attest_reserves` | anyone | Snapshots treasury balance + BsX supply into `ReservesAttestation` PDA. Emits `ReservesAttested`. |
| `set_pause` | admin | Pauses or unpauses `mint_bsx` / `burn_bsx`. Emits `ProtocolPauseToggled`. |

## Reserve Attestation — The Transparency Primitive

`attest_reserves` is callable by **anyone**. It reads:
- `treasury_vault.amount` — USDC locked in the program vault
- `bsx_mint.supply` — total BsX in circulation

…and writes them to the `ReservesAttestation` PDA with a timestamp and the
caller's pubkey. This means:

- Users can verify 1:1 backing at any time, on-chain, without trusting Tropico.
- Frontends can display live reserve ratios from a single account read.
- Auditors can call the instruction themselves to create a timestamped snapshot.

## PDAs

| Account | Seeds | Purpose |
|---|---|---|
| `ProtocolConfig` | `["config"]` | Protocol state, peg rate, admin keys |
| BsX Mint | `["bsx_mint"]` | SPL mint for the BsX token |
| Treasury Vault | `["treasury_vault"]` | USDC reserve vault |
| `ReservesAttestation` | `["attestation"]` | Latest reserve snapshot |

## Errors

| Code | Meaning |
|---|---|
| `Unauthorized` | Caller is not the admin or oracle authority |
| `ProtocolPaused` | mint/burn attempted while paused |
| `InvalidPegRate` | peg_rate is zero or amount resolves to zero |
| `InsufficientReserves` | Treasury lacks USDC to cover a burn |
| `MathOverflow` | u64 overflow in amount calculation |

## Integration Points (TODO before mainnet)

- Replace placeholder program ID `BsX1111...` with a real keypair via `anchor keys list`.
- Set `oracle_authority` to a dedicated oracle keypair (not the admin).
- Wire devnet USDC mint address (`Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr` on devnet).
- Frontend: call `attest_reserves` on page load, display ratio in the reserve widget.
- Consider a Pyth price feed integration for automated peg updates.
