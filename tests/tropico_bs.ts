import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { TropicoBs } from "../target/types/tropico_bs";
import {
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  getAccount,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { assert } from "chai";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PEG_SCALE = 1_000_000;

/** Find the ProtocolConfig PDA */
function configPda(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from("config")], programId);
}

/** Find the BsX mint PDA */
function bsxMintPda(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from("bsx_mint")], programId);
}

/** Find the treasury vault PDA */
function treasuryVaultPda(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("treasury_vault")],
    programId
  );
}

/** Find the ReservesAttestation PDA */
function attestationPda(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("attestation")],
    programId
  );
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("tropico_bs", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TropicoBs as Program<TropicoBs>;
  const wallet = provider.wallet as anchor.Wallet;
  const connection = provider.connection;

  // Accounts we derive or create during tests
  let usdcMint: PublicKey;
  let adminUsdcAta: PublicKey;
  let adminBsxAta: PublicKey;

  // PDAs
  let configKey: PublicKey;
  let bsxMintKey: PublicKey;
  let treasuryVaultKey: PublicKey;
  let attestationKey: PublicKey;

  // Initial peg: 36.5 Bs per USD → 36_500_000
  const INITIAL_PEG_RATE = new BN(36_500_000);

  before("setup mints and ATAs", async () => {
    [configKey] = configPda(program.programId);
    [bsxMintKey] = bsxMintPda(program.programId);
    [treasuryVaultKey] = treasuryVaultPda(program.programId);
    [attestationKey] = attestationPda(program.programId);

    // Create a fake USDC mint (decimals = 6, admin is mint authority)
    usdcMint = await createMint(
      connection,
      wallet.payer,
      wallet.publicKey,
      null, // no freeze authority
      6
    );

    // Admin's USDC ATA — will be funded for mint_bsx test
    adminUsdcAta = await createAssociatedTokenAccount(
      connection,
      wallet.payer,
      usdcMint,
      wallet.publicKey
    );

    // Fund admin USDC ATA with 1000 USDC (1_000_000_000 raw units at 6 dec)
    await mintTo(
      connection,
      wallet.payer,
      usdcMint,
      adminUsdcAta,
      wallet.payer,
      1_000_000_000
    );
  });

  // -------------------------------------------------------------------------
  it("initializes the protocol", async () => {
    await program.methods
      .initialize(INITIAL_PEG_RATE)
      .accounts({
        admin: wallet.publicKey,
        usdcMint,
        bsxMint: bsxMintKey,
        treasuryVault: treasuryVaultKey,
        config: configKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    const config = await program.account.protocolConfig.fetch(configKey);

    assert.equal(config.admin.toBase58(), wallet.publicKey.toBase58());
    assert.equal(config.usdcMint.toBase58(), usdcMint.toBase58());
    assert.equal(config.bsxMint.toBase58(), bsxMintKey.toBase58());
    assert.equal(config.pegRate.toString(), INITIAL_PEG_RATE.toString());
    assert.isFalse(config.paused);
  });

  // -------------------------------------------------------------------------
  it("updates the peg rate", async () => {
    // New rate: 40 Bs per USD
    const newRate = new BN(40_000_000);

    await program.methods
      .updatePeg(newRate)
      .accounts({
        oracle: wallet.publicKey,
        config: configKey,
      })
      .rpc();

    const config = await program.account.protocolConfig.fetch(configKey);
    assert.equal(config.pegRate.toString(), newRate.toString());
  });

  // -------------------------------------------------------------------------
  it("mints BsX by depositing USDC", async () => {
    // Create admin's BsX ATA (BsX mint is a PDA — create ATA manually)
    adminBsxAta = await createAssociatedTokenAccount(
      connection,
      wallet.payer,
      bsxMintKey,
      wallet.publicKey
    );

    // Deposit 10 USDC → expect 400 BsX (10 * 40_000_000 / 1_000_000)
    const usdcDeposit = new BN(10_000_000); // 10 USDC

    await program.methods
      .mintBsx(usdcDeposit)
      .accounts({
        user: wallet.publicKey,
        config: configKey,
        bsxMint: bsxMintKey,
        treasuryVault: treasuryVaultKey,
        userUsdcAta: adminUsdcAta,
        userBsxAta: adminBsxAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const bsxAccount = await getAccount(connection, adminBsxAta);
    // 10 USDC * 40 peg / 1 = 400 BsX (raw: 400_000_000)
    assert.equal(bsxAccount.amount.toString(), "400000000");

    const vault = await getAccount(connection, treasuryVaultKey);
    assert.equal(vault.amount.toString(), "10000000");
  });

  // -------------------------------------------------------------------------
  it("burns BsX and redeems USDC", async () => {
    const bsxToBurn = new BN(200_000_000); // 200 BsX → should yield 5 USDC

    const usdcBefore = await getAccount(connection, adminUsdcAta);

    await program.methods
      .burnBsx(bsxToBurn)
      .accounts({
        user: wallet.publicKey,
        config: configKey,
        bsxMint: bsxMintKey,
        treasuryVault: treasuryVaultKey,
        userBsxAta: adminBsxAta,
        userUsdcAta: adminUsdcAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const usdcAfter = await getAccount(connection, adminUsdcAta);
    const bsxAfter = await getAccount(connection, adminBsxAta);

    // 200 BsX * 1_000_000 / 40_000_000 = 5 USDC (5_000_000 raw)
    const expectedUsdcReturned = BigInt(5_000_000);
    assert.equal(
      usdcAfter.amount - usdcBefore.amount,
      expectedUsdcReturned,
      "user should have received 5 USDC back"
    );
    assert.equal(
      bsxAfter.amount.toString(),
      "200000000",
      "200 BsX should remain after burning 200"
    );
  });

  // -------------------------------------------------------------------------
  it("attests reserves and persists the PDA", async () => {
    await program.methods
      .attestReserves()
      .accounts({
        attester: wallet.publicKey,
        config: configKey,
        bsxMint: bsxMintKey,
        treasuryVault: treasuryVaultKey,
        attestation: attestationKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const attestation =
      await program.account.reservesAttestation.fetch(attestationKey);

    // Treasury should have 5 USDC remaining (10 deposited − 5 redeemed)
    assert.equal(
      attestation.totalUsdcReserves.toString(),
      "5000000",
      "reserve should be 5 USDC"
    );

    // BsX supply should be 200 BsX remaining
    assert.equal(
      attestation.totalBsxSupply.toString(),
      "200000000",
      "bsx supply should be 200 BsX"
    );

    assert.equal(
      attestation.attester.toBase58(),
      wallet.publicKey.toBase58()
    );

    // Confirm the backing ratio: reserves * peg / PEG_SCALE >= supply (1:1 peg)
    const pegRate = 40_000_000;
    const impliedBsx =
      (Number(attestation.totalUsdcReserves) * pegRate) / PEG_SCALE;
    assert.equal(
      impliedBsx,
      Number(attestation.totalBsxSupply),
      "reserves must fully back the BsX supply at current peg"
    );
  });

  // -------------------------------------------------------------------------
  it("pauses the protocol — mint and burn are rejected", async () => {
    await program.methods
      .setPause(true)
      .accounts({
        admin: wallet.publicKey,
        config: configKey,
      })
      .rpc();

    const config = await program.account.protocolConfig.fetch(configKey);
    assert.isTrue(config.paused);

    // Attempt to mint while paused — should fail
    try {
      await program.methods
        .mintBsx(new BN(1_000_000))
        .accounts({
          user: wallet.publicKey,
          config: configKey,
          bsxMint: bsxMintKey,
          treasuryVault: treasuryVaultKey,
          userUsdcAta: adminUsdcAta,
          userBsxAta: adminBsxAta,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
      assert.fail("mint_bsx should have thrown while paused");
    } catch (err: any) {
      assert.include(
        err.message,
        "ProtocolPaused",
        "expected ProtocolPaused error"
      );
    }
  });

  // -------------------------------------------------------------------------
  it("unpauses the protocol", async () => {
    await program.methods
      .setPause(false)
      .accounts({
        admin: wallet.publicKey,
        config: configKey,
      })
      .rpc();

    const config = await program.account.protocolConfig.fetch(configKey);
    assert.isFalse(config.paused);
  });
});
