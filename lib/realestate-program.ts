/**
 * Cliente para tropico_realestate on-chain.
 * Fase 0: fetch de PDAs via getAccountInfo + tx builders manuales.
 * Post-build: sustituir con Anchor IDL types generados.
 *
 * NOTE — No IDL/types files found under target/idl or target/types (cargo not
 * available on this machine). Manual byte-offset parsing is kept throughout.
 * Every layout section is annotated with named constants; if lib.rs changes,
 * update the corresponding LAYOUT_* object here.
 */

import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
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

// WARNING: These layout objects MUST stay in sync with lib.rs account structs.
// If the Rust layout changes, update the corresponding LAYOUT_* object below.

/**
 * RegistryConfig account layout (total 170 bytes).
 * Mirrors the Rust struct field order in lib.rs:
 *   8 discriminator
 *   + 32 admin              (off 8)
 *   + 32 operator_authority (off 40)
 *   + 32 usdc_mint          (off 72)
 *   + 32 crixto_fee_wallet  (off 104)
 *   + 32 tropico_fee_wallet (off 136)
 *   + 1  paused             (off 168)
 *   + 1  bump               (off 169)
 *   = 170 total
 * The two fee-wallet fields were inserted AFTER usdc_mint and BEFORE paused/bump,
 * so they sit at 104 and 136 (NOT after the old 106-byte struct).
 */
const LAYOUT_REGISTRY = {
  DISC: 8,
  ADMIN: 32,           // off   8
  OPERATOR: 32,        // off  40
  USDC_MINT: 32,       // off  72
  CRIXTO_FEE_WALLET_OFF: 104,  // off 104
  TROPICO_FEE_WALLET_OFF: 136, // off 136
  PAUSED_OFF: 168,     // off 168
  BUMP_OFF: 169,       // off 169
  TOTAL_LEN: 170,
} as const;

export type RegistryConfig = {
  crixtoFeeWallet: PublicKey;
  tropicoFeeWallet: PublicKey;
};

export async function fetchRegistryConfig(): Promise<RegistryConfig | null> {
  try {
    const conn = new Connection(getActiveRpcUrl(), "confirmed");
    const info = await conn.getAccountInfo(registryPda());
    if (!info || info.data.length < LAYOUT_REGISTRY.TOTAL_LEN) return null;
    const d = info.data;
    const crixtoFeeWallet = new PublicKey(
      d.slice(LAYOUT_REGISTRY.CRIXTO_FEE_WALLET_OFF, LAYOUT_REGISTRY.CRIXTO_FEE_WALLET_OFF + 32)
    );
    const tropicoFeeWallet = new PublicKey(
      d.slice(LAYOUT_REGISTRY.TROPICO_FEE_WALLET_OFF, LAYOUT_REGISTRY.TROPICO_FEE_WALLET_OFF + 32)
    );
    return { crixtoFeeWallet, tropicoFeeWallet };
  } catch {
    return null;
  }
}

const LAYOUT_PROPERTY = {
  DISC: 8,
  PROPERTY_ID: 32,  // off 8
  SHARE_MINT: 32,   // off 40
  USDC_VAULT: 32,   // off 72
  TOTAL_SHARES: 8,  // off 104
  PRICE_PER_SHARE: 8, // off 112
  SHARES_SOLD: 8,   // off 120
  LEGAL_DOC_HASH: 32, // off 128
  VALUATION_USDC: 8,  // off 160
  STATUS: 1,          // off 168
  CRIXTO_FEE_BPS: 8,  // off 169
  TROPICO_FEE_BPS: 8, // off 177
  EPOCH_COUNT: 8,     // off 185
} as const;

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

    // WARNING: offsets derived from LAYOUT_PROPERTY — keep in sync with lib.rs PropertyConfig.
    const d = info.data;
    const off = LAYOUT_PROPERTY.DISC + LAYOUT_PROPERTY.PROPERTY_ID + LAYOUT_PROPERTY.SHARE_MINT + LAYOUT_PROPERTY.USDC_VAULT;
    let cursor = off;
    const totalShares = d.readBigUInt64LE(cursor); cursor += 8;
    const pricePerShare = d.readBigUInt64LE(cursor); cursor += 8;
    const sharesSold = d.readBigUInt64LE(cursor); cursor += 8;
    cursor += LAYOUT_PROPERTY.LEGAL_DOC_HASH; // skip legal_doc_hash
    const valuationUsdc = d.readBigUInt64LE(cursor); cursor += 8;
    const status = d.readUInt8(cursor); cursor += 1;
    cursor += 8 + 8; // crixto_fee_bps + tropico_fee_bps
    const epochCount = d.readBigUInt64LE(cursor);

    return { totalShares, pricePerShare, sharesSold, valuationUsdc, status, epochCount };
  } catch {
    return null;
  }
}

const LAYOUT_POSITION = {
  DISC: 8,
  INVESTOR: 32,      // off 8
  PROPERTY: 32,      // off 40
  SHARES_OWNED: 8,   // off 72
  LAST_CLAIMED: 8,   // off 80
} as const;

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

    // WARNING: offsets derived from LAYOUT_POSITION — keep in sync with lib.rs InvestorPosition.
    const d = info.data;
    const sharesOwnedOff = LAYOUT_POSITION.DISC + LAYOUT_POSITION.INVESTOR + LAYOUT_POSITION.PROPERTY;
    const sharesOwned = d.readBigUInt64LE(sharesOwnedOff);
    const lastClaimedEpoch = d.readBigUInt64LE(sharesOwnedOff + 8);
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
// NOTE: transfer_shares discriminator must be verified against the generated IDL
// or computed via: Buffer.from(sha256("global:transfer_shares")).slice(0, 8)
const DISC = {
  buyShares:     Buffer.from([0x28, 0xef, 0x8a, 0x9a, 0x08, 0x25, 0x6a, 0x6c]),
  claimReward:   Buffer.from([0x95, 0x5f, 0xb5, 0xf2, 0x5e, 0x5a, 0x9e, 0xa2]),
  vote:          Buffer.from([0xe3, 0x6e, 0x9b, 0x17, 0x88, 0x7e, 0xac, 0x19]),
  // sha256("global:transfer_shares")[0..8] — verified via node crypto.
  transferShares: Buffer.from([0x17, 0x88, 0x8c, 0x0f, 0xb5, 0x36, 0x78, 0xaf]),
};

/**
 * Builds a buy_shares transaction.
 * Fee ATAs are derived from the on-chain RegistryConfig (crixtoFeeWallet /
 * tropicoFeeWallet). Throws if registry cannot be fetched.
 */
export async function buildBuySharesTx(
  propertyId: string,
  investor: PublicKey,
  numShares: bigint
): Promise<Transaction> {
  const conn = new Connection(getActiveRpcUrl(), "confirmed");
  const programId = getRealEstateProgramId();
  const usdcMint = getUsdcMint();

  const registry = await fetchRegistryConfig();
  if (!registry) throw new Error("buildBuySharesTx: failed to fetch RegistryConfig");

  const crixtoFeeAta = await getAssociatedTokenAddress(usdcMint, registry.crixtoFeeWallet);
  const tropicoFeeAta = await getAssociatedTokenAddress(usdcMint, registry.tropicoFeeWallet);

  const registryKey = registryPda();
  const propertyKey = propertyPda(propertyId);
  const shareMintKey = shareMintPda(propertyId);
  const usdcVaultKey = usdcVaultPda(propertyId);
  const kycKey = kycPda(investor);
  const positionKey = positionPda(propertyKey, investor);

  const investorUsdcAta = await getAssociatedTokenAddress(usdcMint, investor);
  const investorShareAta = await getAssociatedTokenAddress(shareMintKey, investor);

  const tx = new Transaction();

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

  const argsBuf = Buffer.alloc(8);
  argsBuf.writeBigUInt64LE(numShares);

  tx.add(
    new TransactionInstruction({
      programId,
      keys: [
        { pubkey: investor,          isSigner: true,  isWritable: true  },
        { pubkey: registryKey,       isSigner: false, isWritable: false },
        { pubkey: propertyKey,       isSigner: false, isWritable: true  },
        { pubkey: kycKey,            isSigner: false, isWritable: false },
        { pubkey: shareMintKey,      isSigner: false, isWritable: true  },
        { pubkey: usdcVaultKey,      isSigner: false, isWritable: true  },
        { pubkey: investorUsdcAta,   isSigner: false, isWritable: true  },
        { pubkey: investorShareAta,  isSigner: false, isWritable: true  },
        { pubkey: crixtoFeeAta,      isSigner: false, isWritable: true  },
        { pubkey: tropicoFeeAta,     isSigner: false, isWritable: true  },
        { pubkey: positionKey,       isSigner: false, isWritable: true  },
        { pubkey: TOKEN_PROGRAM_ID,  isSigner: false, isWritable: false },
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
        { pubkey: investor,         isSigner: true,  isWritable: true  },
        { pubkey: registryKey,      isSigner: false, isWritable: false },
        { pubkey: propertyKey,      isSigner: false, isWritable: false },
        { pubkey: yieldKey,         isSigner: false, isWritable: false },
        { pubkey: positionKey,      isSigner: false, isWritable: true  },
        { pubkey: usdcVaultKey,     isSigner: false, isWritable: true  },
        { pubkey: investorUsdcAta,  isSigner: false, isWritable: true  },
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
        { pubkey: voter,               isSigner: true,  isWritable: true  },
        { pubkey: propertyKey,         isSigner: false, isWritable: false },
        { pubkey: proposalKey,         isSigner: false, isWritable: true  },
        { pubkey: voterShareAta,       isSigner: false, isWritable: false },
        { pubkey: voteReceiptKey,      isSigner: false, isWritable: true  },
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

/**
 * Transfers shares via the program's transfer_shares instruction.
 *
 * IMPORTANT: Raw SPL transfers are no longer valid — the share mint's
 * freeze_authority is set to the property PDA. The on-chain instruction
 * thaws both ATAs, performs the transfer, refreezes them, and collects a 1%
 * secondary-market fee in USDC from the sender.
 *
 * Fee ATAs are derived from the on-chain RegistryConfig. Throws if registry
 * cannot be fetched.
 *
 * NOTE: The transferShares discriminator bytes in DISC must be verified
 * against the compiled IDL once anchor-cli is available.
 */
export async function buildTransferShareTx(
  propertyId: string,
  owner: PublicKey,
  recipient: PublicKey,
  numShares: bigint
): Promise<Transaction> {
  const conn = new Connection(getActiveRpcUrl(), "confirmed");
  const programId = getRealEstateProgramId();
  const usdcMint = getUsdcMint();

  const registry = await fetchRegistryConfig();
  if (!registry) throw new Error("buildTransferShareTx: failed to fetch RegistryConfig");

  const registryKey = registryPda();
  const propertyKey = propertyPda(propertyId);
  const shareMintKey = shareMintPda(propertyId);
  const whitelistToKey = kycPda(recipient);
  const fromPositionKey = positionPda(propertyKey, owner);
  const toPositionKey = positionPda(propertyKey, recipient);

  const ownerShareAta    = await getAssociatedTokenAddress(shareMintKey, owner);
  const recipientShareAta = await getAssociatedTokenAddress(shareMintKey, recipient);
  const ownerUsdcAta     = await getAssociatedTokenAddress(usdcMint, owner);
  const crixtoFeeAta     = await getAssociatedTokenAddress(usdcMint, registry.crixtoFeeWallet);
  const tropicoFeeAta    = await getAssociatedTokenAddress(usdcMint, registry.tropicoFeeWallet);

  const tx = new Transaction();

  // Create recipient share ATA if absent (paid by owner)
  const recipientAtaInfo = await conn.getAccountInfo(recipientShareAta);
  if (!recipientAtaInfo) {
    tx.add(
      createAssociatedTokenAccountInstruction(
        owner,
        recipientShareAta,
        recipient,
        shareMintKey
      )
    );
  }

  // Encode num_shares arg (u64 LE)
  const argsBuf = Buffer.alloc(8);
  argsBuf.writeBigUInt64LE(numShares);

  tx.add(
    new TransactionInstruction({
      programId,
      // Order MUST match Rust TransferShares struct field order in lib.rs.
      keys: [
        { pubkey: owner,             isSigner: true,  isWritable: true  }, // sender
        { pubkey: recipient,         isSigner: false, isWritable: false },
        { pubkey: registryKey,       isSigner: false, isWritable: false },
        { pubkey: propertyKey,       isSigner: false, isWritable: false },
        { pubkey: whitelistToKey,    isSigner: false, isWritable: false }, // whitelist_to (kyc)
        { pubkey: shareMintKey,      isSigner: false, isWritable: true  },
        { pubkey: ownerShareAta,     isSigner: false, isWritable: true  }, // from_share_ata
        { pubkey: recipientShareAta, isSigner: false, isWritable: true  }, // to_share_ata
        { pubkey: ownerUsdcAta,      isSigner: false, isWritable: true  }, // from_usdc_ata
        { pubkey: crixtoFeeAta,      isSigner: false, isWritable: true  },
        { pubkey: tropicoFeeAta,     isSigner: false, isWritable: true  },
        { pubkey: fromPositionKey,   isSigner: false, isWritable: true  },
        { pubkey: toPositionKey,     isSigner: false, isWritable: true  },
        { pubkey: TOKEN_PROGRAM_ID,  isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.concat([DISC.transferShares, argsBuf]),
    })
  );

  const { blockhash } = await conn.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = owner;

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
