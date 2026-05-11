/**
 * @tropico/sdk — BsX on-chain program interactions
 *
 * Wraps Anchor program calls for the BsX (Bolívares Onchain) protocol.
 * PDAs, seeds, and discriminators match the Anchor program in `programs/bsx`.
 *
 * NOTE: Raw discriminators are stubbed — replace with actual Anchor IDL
 * discriminators once the program is fully compiled.
 */

import {
  PublicKey,
  TransactionInstruction,
  type Connection,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type { BsXAmount, PegRate, ReserveAttestation, TropicoClientConfig, UsdcAmount } from "./types.js";
import { BsXError } from "./errors.js";

// --- Constants ---

/** BsX program ID — configured via declare_id!() in programs/tropico_bs/src/lib.rs */
export const BSX_PROGRAM_ID = new PublicKey(
  "EdWuyZDXao86mTcUSpRVzNXaT9Tb5muU6YGubFhADWdN"
);

export const PROTOCOL_CONFIG_SEED = "protocol_config";
export const TREASURY_VAULT_SEED = "treasury_vault";
export const RESERVES_ATTESTATION_SEED = "reserves_attestation";

// USDC mint on mainnet-beta. Use devnet mint for testing.
export const USDC_MINT = new PublicKey(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);
export const USDC_MINT_DEVNET = new PublicKey(
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);

// --- PDA helpers ---

export function getProtocolConfigPDA(
  programId: PublicKey = BSX_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(PROTOCOL_CONFIG_SEED)],
    programId
  );
}

export function getTreasuryVaultPDA(
  programId: PublicKey = BSX_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(TREASURY_VAULT_SEED)],
    programId
  );
}

export function getReservesAttestationPDA(
  programId: PublicKey = BSX_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(RESERVES_ATTESTATION_SEED)],
    programId
  );
}

// --- BsXModule ---

export class BsXModule {
  private readonly connection: Connection;
  private readonly programId: PublicKey;
  private readonly usdcMint: PublicKey;

  constructor(connection: Connection, config: TropicoClientConfig) {
    this.connection = connection;
    this.programId = config.programIds?.bsx
      ? new PublicKey(config.programIds.bsx)
      : BSX_PROGRAM_ID;
    this.usdcMint =
      config.network === "devnet" ? USDC_MINT_DEVNET : USDC_MINT;
  }

  /**
   * Fetch and decode the ReservesAttestation PDA.
   *
   * TODO: Replace manual buffer decode with Anchor IDL-generated account codec
   * once the full IDL is available.
   */
  async getReserves(): Promise<ReserveAttestation> {
    const [pda] = getReservesAttestationPDA(this.programId);
    const info = await this.connection.getAccountInfo(pda);
    if (!info) {
      throw new BsXError(
        "ReservesAttestation account not found — has the program been initialized?",
        "ACCOUNT_NOT_FOUND"
      );
    }

    // Skip the 8-byte Anchor account discriminator
    const data = info.data.slice(8);

    // TODO: Replace this manual decode with Anchor IDL codec
    // Layout (little-endian):
    //   u64  total_usdc         (bytes 0..8)
    //   u64  total_bsx_supply   (bytes 8..16)
    //   u64  peg_rate           (bytes 16..24)
    //   i64  attested_at        (bytes 24..32)
    const totalUsdc = data.readBigUInt64LE(0);
    const totalBsxSupply = data.readBigUInt64LE(8);
    const pegRate = data.readBigUInt64LE(16);
    const attestedAt = data.readBigInt64LE(24);

    const totalUsdcNum = Number(totalUsdc) as UsdcAmount;
    const totalBsxNum = Number(totalBsxSupply) as BsXAmount;
    const ratio =
      totalBsxNum > 0 ? totalUsdcNum / totalBsxNum : 0;

    return {
      total_usdc: totalUsdcNum,
      total_bsx_supply: totalBsxNum,
      peg_rate: Number(pegRate) as PegRate,
      attested_at: Number(attestedAt),
      ratio,
    };
  }

  /**
   * Fetch the current peg rate from the ProtocolConfig PDA.
   *
   * TODO: Replace buffer decode with Anchor IDL codec.
   */
  async getPegRate(): Promise<PegRate> {
    const [pda] = getProtocolConfigPDA(this.programId);
    const info = await this.connection.getAccountInfo(pda);
    if (!info) {
      throw new BsXError(
        "ProtocolConfig account not found — has the program been initialized?",
        "ACCOUNT_NOT_FOUND"
      );
    }

    // Skip 8-byte discriminator; peg_rate field starts at offset 8
    // TODO: adjust offset once actual IDL layout is confirmed
    const pegRate = info.data.readBigUInt64LE(8);
    return Number(pegRate) as PegRate;
  }

  /**
   * Build the transaction instructions to mint BsX by depositing USDC.
   *
   * @param user       User's wallet public key
   * @param usdcAmount Amount of USDC to deposit (6-decimal integer units)
   */
  buildMintIx({
    user,
    usdcAmount,
  }: {
    user: PublicKey;
    usdcAmount: UsdcAmount;
  }): TransactionInstruction[] {
    const [protocolConfig] = getProtocolConfigPDA(this.programId);
    const [treasuryVault] = getTreasuryVaultPDA(this.programId);

    const userUsdcAta = getAssociatedTokenAddressSync(this.usdcMint, user);

    // TODO: replace with actual Anchor discriminator derived from IDL
    // sha256("global:mint_bsx")[0..8]
    const discriminator = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]); // TODO: replace

    const amountBuf = Buffer.alloc(8);
    amountBuf.writeBigUInt64LE(BigInt(usdcAmount), 0);

    const data = Buffer.concat([discriminator, amountBuf]);

    const mintIx = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: user, isSigner: true, isWritable: true },
        { pubkey: userUsdcAta, isSigner: false, isWritable: true },
        { pubkey: treasuryVault, isSigner: false, isWritable: true },
        { pubkey: protocolConfig, isSigner: false, isWritable: false },
        { pubkey: this.usdcMint, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      data,
    });

    return [mintIx];
  }

  /**
   * Build the transaction instructions to burn BsX and receive USDC.
   *
   * @param user      User's wallet public key
   * @param bsxAmount Amount of BsX to burn (lamports)
   */
  buildBurnIx({
    user,
    bsxAmount,
  }: {
    user: PublicKey;
    bsxAmount: BsXAmount;
  }): TransactionInstruction[] {
    const [protocolConfig] = getProtocolConfigPDA(this.programId);
    const [treasuryVault] = getTreasuryVaultPDA(this.programId);

    const userUsdcAta = getAssociatedTokenAddressSync(this.usdcMint, user);

    // TODO: replace with actual Anchor discriminator from IDL
    // sha256("global:burn_bsx")[0..8]
    const discriminator = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]); // TODO: replace

    const amountBuf = Buffer.alloc(8);
    amountBuf.writeBigUInt64LE(BigInt(bsxAmount), 0);

    const data = Buffer.concat([discriminator, amountBuf]);

    const burnIx = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: user, isSigner: true, isWritable: true },
        { pubkey: userUsdcAta, isSigner: false, isWritable: true },
        { pubkey: treasuryVault, isSigner: false, isWritable: true },
        { pubkey: protocolConfig, isSigner: false, isWritable: false },
        { pubkey: this.usdcMint, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      data,
    });

    return [burnIx];
  }

  /**
   * Build the instruction to attest the current reserve ratio on-chain.
   * Only callable by the oracle authority configured in ProtocolConfig.
   *
   * @param attester The oracle authority public key
   */
  buildAttestIx({ attester }: { attester: PublicKey }): TransactionInstruction[] {
    const [protocolConfig] = getProtocolConfigPDA(this.programId);
    const [reservesAttestation] = getReservesAttestationPDA(this.programId);
    const [treasuryVault] = getTreasuryVaultPDA(this.programId);

    // TODO: replace with actual Anchor discriminator from IDL
    // sha256("global:attest_reserves")[0..8]
    const discriminator = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]); // TODO: replace

    const attestIx = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: attester, isSigner: true, isWritable: false },
        { pubkey: protocolConfig, isSigner: false, isWritable: false },
        { pubkey: treasuryVault, isSigner: false, isWritable: false },
        { pubkey: reservesAttestation, isSigner: false, isWritable: true },
      ],
      data: discriminator,
    });

    return [attestIx];
  }
}
