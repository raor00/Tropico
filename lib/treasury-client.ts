/**
 * SERVER ONLY — imports TREASURY_AUTHORITY_KEYPAIR. Never import from client components.
 *
 * Wires the tropico_treasury `record_fee` instruction.
 *
 * Security contract:
 *  - `recorder` account in the instruction MUST equal `state.authority` — enforced on-chain.
 *  - The signer is always the treasury authority keypair loaded from TREASURY_AUTHORITY_KEYPAIR env.
 *  - TREASURY_AUTHORITY_KEYPAIR must NEVER be in NEXT_PUBLIC_* or sent to the browser.
 *
 * Callers after on-chain fee confirmation (realestate buy/transfer, Jupiter swap settle, etc.)
 * should POST to /api/treasury/record-fee with the X-Tropico-Api-Key header.
 *
 * IDL contract (target/idl/tropico_treasury.json):
 *   instruction: record_fee
 *   discriminator: [105, 252, 116, 139, 194, 37, 191, 113]
 *   accounts (ordered):
 *     0. state   — writable, PDA seeds=[b"treasury"]
 *     1. recorder — signer, must == state.authority
 *   args:
 *     amount_lamports: u64
 *     module: ModuleType (enum → u8 discriminant)
 *     user: pubkey (32 bytes)
 */

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import { getActiveRpcUrl } from "./cluster";

// ─── Program constants ────────────────────────────────────────────────────────

const TREASURY_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_TREASURY_PROGRAM_ID ??
    "3a5NkTssAsVaarUPqx4YokNwUcfxHnNebGugrgBBxe8S"
);

const RECORD_FEE_DISCRIMINATOR = Buffer.from([
  105, 252, 116, 139, 194, 37, 191, 113,
]);

// ─── ModuleType enum (matches IDL variant order exactly) ─────────────────────

export const ModuleType = {
  Swap: 0,
  Pay: 1,
  Yield: 2,
  Cashback: 3,
  Remesas: 4,
  Servicios: 5,
  P2pBs: 6,
  TropicoPay: 7,
  RealEstate: 8,
  RealEstateYield: 9,
  RealEstateSecondary: 10,
} as const;

export type ModuleTypeName = keyof typeof ModuleType;

export function moduleTypeFromString(s: string): number {
  const key = s as ModuleTypeName;
  if (!(key in ModuleType)) {
    throw new Error(`Unknown ModuleType: ${s}`);
  }
  return ModuleType[key];
}

// ─── Authority loading ────────────────────────────────────────────────────────

/**
 * Loads the treasury authority Keypair from TREASURY_AUTHORITY_KEYPAIR env var.
 * The env var must be the base58-encoded 64-byte secret key (standard Solana CLI / Phantom export format).
 * Throws with a clear message if the env var is missing or malformed.
 */
export function loadTreasuryAuthority(): Keypair {
  const raw = process.env.TREASURY_AUTHORITY_KEYPAIR;
  if (!raw) {
    throw new Error(
      "[treasury-client] TREASURY_AUTHORITY_KEYPAIR env var is not set. " +
        "This is required for on-chain fee recording. Service is unavailable."
    );
  }
  try {
    const secretKey = bs58.decode(raw);
    if (secretKey.length !== 64) {
      throw new Error(`Expected 64 bytes, got ${secretKey.length}`);
    }
    return Keypair.fromSecretKey(secretKey);
  } catch (err) {
    throw new Error(
      `[treasury-client] TREASURY_AUTHORITY_KEYPAIR is invalid: ${(err as Error).message}`
    );
  }
}

/**
 * Asserts that TREASURY_AUTHORITY_KEYPAIR is set and decodable.
 * Call this at request-start for fail-closed behaviour — returns 503 before doing any work.
 */
export function assertTreasuryRecorder(): void {
  // Throws if unset or invalid — caller converts to 503.
  loadTreasuryAuthority();
}

// ─── PDA ─────────────────────────────────────────────────────────────────────

export async function findTreasuryStatePda(): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddress(
    [Buffer.from("treasury")],
    TREASURY_PROGRAM_ID
  );
}

// ─── Instruction builder ──────────────────────────────────────────────────────

export type RecordFeeParams = {
  /** Fee amount in lamports (u64). 1 USDC = 1_000_000 lamports per IDL convention. */
  amountLamports: bigint | number;
  /** Module that generated the fee */
  module: ModuleTypeName;
  /** The user (payer / trader) whose action generated the fee */
  userPubkey: PublicKey;
};

/**
 * Builds a Transaction containing the record_fee instruction.
 * Does NOT sign — caller is responsible for signing with the authority keypair.
 */
export async function buildRecordFeeTx(
  connection: Connection,
  params: RecordFeeParams
): Promise<Transaction> {
  const authority = loadTreasuryAuthority();
  const [statePda] = await findTreasuryStatePda();

  const moduleVariant = moduleTypeFromString(params.module);
  const amount = BigInt(params.amountLamports);

  // Instruction data layout:
  //   [0..8)   discriminator (8 bytes)
  //   [8..16)  amount_lamports u64 LE (8 bytes)
  //   [16)     module u8 (1 byte — Anchor simple enum discriminant)
  //   [17..49) user pubkey (32 bytes)
  const data = Buffer.alloc(8 + 8 + 1 + 32);
  RECORD_FEE_DISCRIMINATOR.copy(data, 0);
  data.writeBigUInt64LE(amount, 8);
  data.writeUInt8(moduleVariant, 16);
  params.userPubkey.toBuffer().copy(data, 17);

  const ix = new TransactionInstruction({
    programId: TREASURY_PROGRAM_ID,
    keys: [
      { pubkey: statePda, isSigner: false, isWritable: true },
      { pubkey: authority.publicKey, isSigner: true, isWritable: false },
    ],
    data,
  });

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  const tx = new Transaction({
    blockhash,
    lastValidBlockHeight,
    feePayer: authority.publicKey,
  });
  tx.add(ix);
  return tx;
}

// ─── High-level call ──────────────────────────────────────────────────────────

/**
 * Builds, signs, and confirms a record_fee transaction on-chain.
 * Returns the transaction signature.
 *
 * NOTE: Callers (realestate buy/transfer, Jupiter swap settle) should call this
 * only AFTER the user's payment is confirmed on-chain. A failure here should be
 * caught and logged — do NOT surface it to the user as a payment failure.
 */
export async function recordFee(params: RecordFeeParams): Promise<string> {
  const authority = loadTreasuryAuthority();
  const rpcUrl = getActiveRpcUrl();
  const connection = new Connection(rpcUrl, "confirmed");

  const tx = await buildRecordFeeTx(connection, params);
  const signature = await sendAndConfirmTransaction(connection, tx, [
    authority,
  ]);
  return signature;
}
