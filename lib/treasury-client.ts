/**
 * Cliente TS para tropico_treasury::record_fee.
 * Primer cliente TS del programa treasury — reutilizable por cualquier módulo.
 */

import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { getActiveRpcUrl } from "./cluster";

export enum ModuleType {
  Swap = 0,
  Pay = 1,
  Yield = 2,
  Cashback = 3,
  Remesas = 4,
  Servicios = 5,
  P2pBs = 6,
  TropicoPay = 7,
  RealEstate = 8,
  RealEstateYield = 9,
  RealEstateSecondary = 10,
}

const TREASURY_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_TREASURY_PROGRAM_ID ??
    "3a5NkTssAsVaarUPqx4YokNwUcfxHnNebGugrgBBxe8S"
);

function treasuryStatePda(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury")],
    TREASURY_PROGRAM_ID
  );
  return pda;
}

/**
 * Construye una tx de record_fee lista para firmar.
 * El recorder (signer) puede ser cualquier wallet — open-permission en hackathon.
 */
export function buildRecordFeeTx(
  amountLamports: bigint,
  module: ModuleType,
  user: PublicKey,
  recorder: PublicKey
): Transaction {
  const stateKey = treasuryStatePda();

  // Discriminator Anchor para record_fee (primeros 8 bytes del sha256("global:record_fee"))
  // Calculado off-chain: [82, 214, 99, 152, 90, 96, 55, 209]
  const discriminator = Buffer.from([82, 214, 99, 152, 90, 96, 55, 209]);

  // Serialización manual de los args (Anchor borsh):
  // amount_lamports: u64 LE, module: u8, user: [u8;32]
  const argsBuf = Buffer.alloc(8 + 1 + 32);
  argsBuf.writeBigUInt64LE(amountLamports, 0);
  argsBuf.writeUInt8(module, 8);
  user.toBuffer().copy(argsBuf, 9);

  const data = Buffer.concat([discriminator, argsBuf]);

  const ix = new TransactionInstruction({
    programId: TREASURY_PROGRAM_ID,
    keys: [
      { pubkey: stateKey, isSigner: false, isWritable: true },
      { pubkey: recorder, isSigner: true, isWritable: false },
    ],
    data,
  });

  return new Transaction().add(ix);
}

/** Lee el estado del treasury (total fees + tx count) */
export async function fetchTreasuryStats(): Promise<{
  totalFeesLamports: bigint;
  totalTxCount: bigint;
} | null> {
  try {
    const conn = new Connection(getActiveRpcUrl(), "confirmed");
    const stateKey = treasuryStatePda();
    const info = await conn.getAccountInfo(stateKey);
    if (!info) return null;

    // Layout: 8 discriminator + 32 authority + 8 total_fees + 8 tx_count + 1 bump
    const data = info.data;
    const totalFeesLamports = data.readBigUInt64LE(8 + 32);
    const totalTxCount = data.readBigUInt64LE(8 + 32 + 8);
    return { totalFeesLamports, totalTxCount };
  } catch {
    return null;
  }
}
