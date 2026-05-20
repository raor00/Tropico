/**
 * Cliente para tropico_realestate on-chain.
 * Fase 0: fetch de PDAs via getAccountInfo + tx builders manuales.
 * Post-build: sustituir con Anchor IDL types generados.
 */

import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { getActiveRpcUrl, getActiveCluster } from "./cluster";

const USDC_DEVNET_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
const USDC_MAINNET_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export function getUsdcMint(): PublicKey {
  const cluster = getActiveCluster();
  return new PublicKey(
    cluster === "devnet" ? USDC_DEVNET_MINT : USDC_MAINNET_MINT
  );
}

export function getRealEstateProgramId(): PublicKey {
  return new PublicKey(
    process.env.NEXT_PUBLIC_REALESTATE_PROGRAM_ID ??
      "REaLEsTaTePLaCeHoLDer11111111111111111111111"
  );
}

// ---------------------------------------------------------------------------
// PDA derivation
// ---------------------------------------------------------------------------

export function registryPda(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("registry")],
    getRealEstateProgramId()
  );
  return pda;
}

export function propertyPda(propertyId: string): PublicKey {
  const idBuf = Buffer.alloc(32);
  Buffer.from(propertyId).copy(idBuf);
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("property"), idBuf],
    getRealEstateProgramId()
  );
  return pda;
}

export function shareMintPda(propertyId: string): PublicKey {
  const idBuf = Buffer.alloc(32);
  Buffer.from(propertyId).copy(idBuf);
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("share_mint"), idBuf],
    getRealEstateProgramId()
  );
  return pda;
}

export function usdcVaultPda(propertyId: string): PublicKey {
  const idBuf = Buffer.alloc(32);
  Buffer.from(propertyId).copy(idBuf);
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("usdc_vault"), idBuf],
    getRealEstateProgramId()
  );
  return pda;
}

export function kycPda(investor: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("kyc"), investor.toBuffer()],
    getRealEstateProgramId()
  );
  return pda;
}

export function positionPda(property: PublicKey, investor: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("position"), property.toBuffer(), investor.toBuffer()],
    getRealEstateProgramId()
  );
  return pda;
}

export function yieldEpochPda(property: PublicKey, epoch: bigint): PublicKey {
  const epochBuf = Buffer.alloc(8);
  epochBuf.writeBigUInt64LE(epoch);
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("yield"), property.toBuffer(), epochBuf],
    getRealEstateProgramId()
  );
  return pda;
}

export function proposalPda(property: PublicKey, proposalId: bigint): PublicKey {
  const idBuf = Buffer.alloc(8);
  idBuf.writeBigUInt64LE(proposalId);
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("proposal"), property.toBuffer(), idBuf],
    getRealEstateProgramId()
  );
  return pda;
}

// ---------------------------------------------------------------------------
// On-chain fetch
// ---------------------------------------------------------------------------

export type PropertyOnChain = {
  totalShares: bigint;
  pricePerShare: bigint;
  sharesSold: bigint;
  valuationUsdc: bigint;
  status: number;
  epochCount: bigint;
};

export type InvestorPositionOnChain = {
  sharesOwned: bigint;
  lastClaimedEpoch: bigint;
};

export async function fetchPropertyConfig(
  propertyId: string
): Promise<PropertyOnChain | null> {
  try {
    const conn = new Connection(getActiveRpcUrl(), "confirmed");
    const pda = propertyPda(propertyId);
    const info = await conn.getAccountInfo(pda);
    if (!info) return null;

    // Layout (offset 8 discriminator):
    // [u8;32] id + [u8;32] share_mint + [u8;32] usdc_vault + u64 total + u64 price +
    // u64 sold + [u8;32] legal + u64 valuation + u8 status + u64 crixto_bps +
    // u64 tropico_bps + u64 epoch_count + u8 bump
    const d = info.data;
    let off = 8 + 32 + 32 + 32; // skip discriminator + property_id + share_mint + usdc_vault
    const totalShares = d.readBigUInt64LE(off); off += 8;
    const pricePerShare = d.readBigUInt64LE(off); off += 8;
    const sharesSold = d.readBigUInt64LE(off); off += 8;
    off += 32; // legal_doc_hash
    const valuationUsdc = d.readBigUInt64LE(off); off += 8;
    const status = d.readUInt8(off); off += 1;
    off += 8 + 8; // crixto_fee_bps + tropico_fee_bps
    const epochCount = d.readBigUInt64LE(off);

    return { totalShares, pricePerShare, sharesSold, valuationUsdc, status, epochCount };
  } catch {
    return null;
  }
}

export async function fetchInvestorPosition(
  propertyId: string,
  investor: PublicKey
): Promise<InvestorPositionOnChain | null> {
  try {
    const conn = new Connection(getActiveRpcUrl(), "confirmed");
    const propKey = propertyPda(propertyId);
    const pda = positionPda(propKey, investor);
    const info = await conn.getAccountInfo(pda);
    if (!info) return null;

    // Layout: 8 disc + 32 investor + 32 property + u64 shares_owned + u64 last_claimed + u8 bump
    const d = info.data;
    const sharesOwned = d.readBigUInt64LE(8 + 32 + 32);
    const lastClaimedEpoch = d.readBigUInt64LE(8 + 32 + 32 + 8);
    return { sharesOwned, lastClaimedEpoch };
  } catch {
    return null;
  }
}

export async function fetchShareBalance(
  propertyId: string,
  investor: PublicKey
): Promise<bigint> {
  try {
    const conn = new Connection(getActiveRpcUrl(), "confirmed");
    const mint = shareMintPda(propertyId);
    const ata = await getAssociatedTokenAddress(mint, investor);
    const info = await conn.getAccountInfo(ata);
    if (!info) return BigInt(0);
    // SPL token account amount at offset 64
    return info.data.readBigUInt64LE(64);
  } catch {
    return BigInt(0);
  }
}

// ---------------------------------------------------------------------------
// Tx builders
// ---------------------------------------------------------------------------

// Anchor discriminators (sha256("global:<ix_name>")[0..8])
const DISC = {
  buyShares: Buffer.from([0x28, 0xef, 0x8a, 0x9a, 0x08, 0x25, 0x6a, 0x6c]),
  claimReward: Buffer.from([0x95, 0x5f, 0xb5, 0xf2, 0x5e, 0x5a, 0x9e, 0xa2]),
  vote: Buffer.from([0xe3, 0x6e, 0x9b, 0x17, 0x88, 0x7e, 0xac, 0x19]),
};

export async function buildBuySharesTx(
  propertyId: string,
  investor: PublicKey,
  numShares: bigint,
  crixtoFeeAta: PublicKey,
  tropicoFeeAta: PublicKey
): Promise<Transaction> {
  const conn = new Connection(getActiveRpcUrl(), "confirmed");
  const programId = getRealEstateProgramId();

  const registryKey = registryPda();
  const propertyKey = propertyPda(propertyId);
  const shareMintKey = shareMintPda(propertyId);
  const usdcVaultKey = usdcVaultPda(propertyId);
  const kycKey = kycPda(investor);
  const positionKey = positionPda(propertyKey, investor);
  const usdcMint = getUsdcMint();

  const investorUsdcAta = await getAssociatedTokenAddress(usdcMint, investor);
  const investorShareAta = await getAssociatedTokenAddress(shareMintKey, investor);

  const tx = new Transaction();

  // Crear ATA de shares si no existe
  const shareAtaInfo = await conn.getAccountInfo(investorShareAta);
  if (!shareAtaInfo) {
    tx.add(
      createAssociatedTokenAccountInstruction(
        investor,
        investorShareAta,
        investor,
        shareMintKey
      )
    );
  }

  // buy_shares instruction
  const argsBuf = Buffer.alloc(8);
  argsBuf.writeBigUInt64LE(numShares);

  tx.add(
    new TransactionInstruction({
      programId,
      keys: [
        { pubkey: investor, isSigner: true, isWritable: true },
        { pubkey: registryKey, isSigner: false, isWritable: false },
        { pubkey: propertyKey, isSigner: false, isWritable: true },
        { pubkey: kycKey, isSigner: false, isWritable: false },
        { pubkey: shareMintKey, isSigner: false, isWritable: true },
        { pubkey: usdcVaultKey, isSigner: false, isWritable: true },
        { pubkey: investorUsdcAta, isSigner: false, isWritable: true },
        { pubkey: investorShareAta, isSigner: false, isWritable: true },
        { pubkey: crixtoFeeAta, isSigner: false, isWritable: true },
        { pubkey: tropicoFeeAta, isSigner: false, isWritable: true },
        { pubkey: positionKey, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.concat([DISC.buyShares, argsBuf]),
    })
  );

  const { blockhash } = await conn.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = investor;

  return tx;
}

export async function buildClaimRewardTx(
  propertyId: string,
  investor: PublicKey,
  epoch: bigint
): Promise<Transaction> {
  const conn = new Connection(getActiveRpcUrl(), "confirmed");
  const programId = getRealEstateProgramId();
  const usdcMint = getUsdcMint();

  const registryKey = registryPda();
  const propertyKey = propertyPda(propertyId);
  const yieldKey = yieldEpochPda(propertyKey, epoch);
  const positionKey = positionPda(propertyKey, investor);
  const usdcVaultKey = usdcVaultPda(propertyId);
  const investorUsdcAta = await getAssociatedTokenAddress(usdcMint, investor);

  const argsBuf = Buffer.alloc(8);
  argsBuf.writeBigUInt64LE(epoch);

  const tx = new Transaction().add(
    new TransactionInstruction({
      programId,
      keys: [
        { pubkey: investor, isSigner: true, isWritable: true },
        { pubkey: registryKey, isSigner: false, isWritable: false },
        { pubkey: propertyKey, isSigner: false, isWritable: false },
        { pubkey: yieldKey, isSigner: false, isWritable: false },
        { pubkey: positionKey, isSigner: false, isWritable: true },
        { pubkey: usdcVaultKey, isSigner: false, isWritable: true },
        { pubkey: investorUsdcAta, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      data: Buffer.concat([DISC.claimReward, argsBuf]),
    })
  );

  const { blockhash } = await conn.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = investor;

  return tx;
}

export async function buildVoteTx(
  propertyId: string,
  voter: PublicKey,
  proposalId: bigint,
  approve: boolean
): Promise<Transaction> {
  const conn = new Connection(getActiveRpcUrl(), "confirmed");
  const programId = getRealEstateProgramId();

  const propertyKey = propertyPda(propertyId);
  const proposalKey = proposalPda(propertyKey, proposalId);
  const shareMintKey = shareMintPda(propertyId);
  const voterShareAta = await getAssociatedTokenAddress(shareMintKey, voter);
  const [voteReceiptKey] = PublicKey.findProgramAddressSync(
    [Buffer.from("vote"), proposalKey.toBuffer(), voter.toBuffer()],
    programId
  );

  const argsBuf = Buffer.alloc(1);
  argsBuf.writeUInt8(approve ? 1 : 0);

  const tx = new Transaction().add(
    new TransactionInstruction({
      programId,
      keys: [
        { pubkey: voter, isSigner: true, isWritable: true },
        { pubkey: propertyKey, isSigner: false, isWritable: false },
        { pubkey: proposalKey, isSigner: false, isWritable: true },
        { pubkey: voterShareAta, isSigner: false, isWritable: false },
        { pubkey: voteReceiptKey, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.concat([DISC.vote, argsBuf]),
    })
  );

  const { blockhash } = await conn.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = voter;

  return tx;
}

export async function fetchProposals(propertyId: string): Promise<
  Array<{
    proposalId: bigint;
    pubkey: PublicKey;
    yesWeight: bigint;
    noWeight: bigint;
    endTs: bigint;
    executed: boolean;
    snapshotTotalShares: bigint;
  }>
> {
  // Fase 0: retorna array vacío — la lista de proposals se alimenta del seed o admin UI
  // Producción: usar getProgramAccounts con memcmp en property_id
  return [];
}
