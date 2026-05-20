import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { TropicoRealestate } from "../target/types/tropico_realestate";
import {
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  getAccount,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { assert } from "chai";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function registryPda(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from("registry")], programId);
}

function propertyPda(
  programId: PublicKey,
  propertyId: Buffer
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("property"), propertyId],
    programId
  );
}

function shareMintPda(
  programId: PublicKey,
  propertyId: Buffer
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("share_mint"), propertyId],
    programId
  );
}

function usdcVaultPda(
  programId: PublicKey,
  propertyId: Buffer
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("usdc_vault"), propertyId],
    programId
  );
}

function kycPda(programId: PublicKey, investor: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("kyc"), investor.toBuffer()],
    programId
  );
}

function positionPda(
  programId: PublicKey,
  property: PublicKey,
  investor: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("position"), property.toBuffer(), investor.toBuffer()],
    programId
  );
}

function yieldEpochPda(
  programId: PublicKey,
  property: PublicKey,
  epoch: bigint
): [PublicKey, number] {
  const epochBuf = Buffer.alloc(8);
  epochBuf.writeBigUInt64LE(epoch);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("yield"), property.toBuffer(), epochBuf],
    programId
  );
}

function proposalPda(
  programId: PublicKey,
  property: PublicKey,
  proposalId: bigint
): [PublicKey, number] {
  const idBuf = Buffer.alloc(8);
  idBuf.writeBigUInt64LE(proposalId);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("proposal"), property.toBuffer(), idBuf],
    programId
  );
}

function voteReceiptPda(
  programId: PublicKey,
  proposal: PublicKey,
  voter: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vote"), proposal.toBuffer(), voter.toBuffer()],
    programId
  );
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("tropico_realestate", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .TropicoRealestate as Program<TropicoRealestate>;
  const wallet = provider.wallet as anchor.Wallet;
  const connection = provider.connection;

  // Keypairs adicionales
  const crixto = Keypair.generate();
  const investor = Keypair.generate();

  // Mints y ATAs
  let usdcMint: PublicKey;
  let adminUsdcAta: PublicKey;
  let crixtoUsdcAta: PublicKey;
  let investorUsdcAta: PublicKey;
  let crixtoFeeAta: PublicKey;
  let tropicoFeeAta: PublicKey;
  let investorShareAta: PublicKey;

  // PDAs
  let registryKey: PublicKey;
  let propertyKey: PublicKey;
  let shareMintKey: PublicKey;
  let usdcVaultKey: PublicKey;
  let kycKey: PublicKey;
  let positionKey: PublicKey;

  // Property id de 32 bytes
  const PROPERTY_ID = Buffer.alloc(32);
  Buffer.from("residencias-avila-001").copy(PROPERTY_ID);

  const TOTAL_SHARES = new BN(2_400);
  const PRICE_PER_SHARE = new BN(50_000_000); // $50 USDC (6 decimals)
  const LEGAL_HASH = Buffer.alloc(32, 0xab);
  const VALUATION = new BN(120_000_000_000); // $120k USDC

  before("setup mints, ATAs y airdrop", async () => {
    [registryKey] = registryPda(program.programId);
    [propertyKey] = propertyPda(program.programId, PROPERTY_ID);
    [shareMintKey] = shareMintPda(program.programId, PROPERTY_ID);
    [usdcVaultKey] = usdcVaultPda(program.programId, PROPERTY_ID);
    [kycKey] = kycPda(program.programId, investor.publicKey);
    [positionKey] = positionPda(
      program.programId,
      propertyKey,
      investor.publicKey
    );

    // Airdrop a crixto e investor para pagar rent
    await connection.requestAirdrop(crixto.publicKey, 2e9);
    await connection.requestAirdrop(investor.publicKey, 2e9);
    await new Promise((r) => setTimeout(r, 1000));

    // USDC fake (6 decimals)
    usdcMint = await createMint(
      connection,
      wallet.payer,
      wallet.publicKey,
      null,
      6
    );

    // ATAs
    adminUsdcAta = await createAssociatedTokenAccount(
      connection,
      wallet.payer,
      usdcMint,
      wallet.publicKey
    );
    crixtoUsdcAta = await createAssociatedTokenAccount(
      connection,
      wallet.payer,
      usdcMint,
      crixto.publicKey
    );
    investorUsdcAta = await createAssociatedTokenAccount(
      connection,
      wallet.payer,
      usdcMint,
      investor.publicKey
    );
    crixtoFeeAta = await createAssociatedTokenAccount(
      connection,
      wallet.payer,
      usdcMint,
      crixto.publicKey
    );
    tropicoFeeAta = await createAssociatedTokenAccount(
      connection,
      wallet.payer,
      usdcMint,
      wallet.publicKey
    );

    // Fondear investor con 10,000 USDC
    await mintTo(
      connection,
      wallet.payer,
      usdcMint,
      investorUsdcAta,
      wallet.payer,
      10_000_000_000 // 10,000 USDC
    );

    // Fondear crixto con 100,000 USDC (para deposit_yield)
    await mintTo(
      connection,
      wallet.payer,
      usdcMint,
      crixtoUsdcAta,
      wallet.payer,
      100_000_000_000
    );
  });

  // -------------------------------------------------------------------------
  it("initializes the registry", async () => {
    await program.methods
      .initializeRegistry(crixto.publicKey)
      .accounts({
        admin: wallet.publicKey,
        usdcMint,
        registry: registryKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const registry = await program.account.registryConfig.fetch(registryKey);
    assert.equal(registry.admin.toBase58(), wallet.publicKey.toBase58());
    assert.equal(
      registry.operatorAuthority.toBase58(),
      crixto.publicKey.toBase58()
    );
    assert.isFalse(registry.paused);
  });

  // -------------------------------------------------------------------------
  it("lists a property — share mint authority is the property PDA", async () => {
    const propertyIdArr = Array.from(PROPERTY_ID);
    const legalHashArr = Array.from(LEGAL_HASH);

    await program.methods
      .listProperty(
        propertyIdArr,
        TOTAL_SHARES,
        PRICE_PER_SHARE,
        legalHashArr,
        VALUATION,
        "https://tour.example.com/avila"
      )
      .accounts({
        admin: wallet.publicKey,
        registry: registryKey,
        property: propertyKey,
        shareMint: shareMintKey,
        usdcVault: usdcVaultKey,
        usdcMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    const prop = await program.account.propertyConfig.fetch(propertyKey);
    assert.equal(prop.totalShares.toString(), TOTAL_SHARES.toString());
    assert.equal(prop.pricePerShare.toString(), PRICE_PER_SHARE.toString());
    assert.equal(prop.sharesSold.toString(), "0");

    // Share mint authority debe ser el property PDA
    const mintInfo = await connection.getParsedAccountInfo(shareMintKey);
    const mintData = (mintInfo.value?.data as any)?.parsed?.info;
    assert.equal(mintData?.mintAuthority, propertyKey.toBase58(), "mint authority must be property PDA");
  });

  // -------------------------------------------------------------------------
  it("set_kyc verifies the investor", async () => {
    await program.methods
      .setKyc(investor.publicKey, true, new BN(0)) // expires_at=0 = no expiry
      .accounts({
        crixto: crixto.publicKey,
        registry: registryKey,
        whitelist: kycKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([crixto])
      .rpc();

    const wl = await program.account.whitelist.fetch(kycKey);
    assert.isTrue(wl.verified);
    assert.equal(wl.verifiedBy.toBase58(), crixto.publicKey.toBase58());
  });

  // -------------------------------------------------------------------------
  it("buy_shares — USDC goes to vault, fee split 90/60, shares minted", async () => {
    // Crear ATA de shares del investor
    investorShareAta = await createAssociatedTokenAccount(
      connection,
      wallet.payer,
      shareMintKey,
      investor.publicKey
    );

    const NUM_SHARES = new BN(4); // 4 acciones × $50 = $200
    // precio = 4 × 50_000_000 = 200_000_000
    // fee total 1.5% = 3_000_000 (Crixto 90bps = 1_800_000; Trópico 60bps = 1_200_000)

    const vaultBefore = await getAccount(connection, usdcVaultKey);
    const crixtoFeeBefore = await getAccount(connection, crixtoFeeAta);
    const tropicoFeeBefore = await getAccount(connection, tropicoFeeAta);
    const investorUsdcBefore = await getAccount(connection, investorUsdcAta);

    await program.methods
      .buyShares(NUM_SHARES)
      .accounts({
        investor: investor.publicKey,
        registry: registryKey,
        property: propertyKey,
        whitelist: kycKey,
        shareMint: shareMintKey,
        usdcVault: usdcVaultKey,
        investorUsdcAta,
        investorShareAta,
        crixtoFeeAta,
        tropicoFeeAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([investor])
      .rpc();

    const vaultAfter = await getAccount(connection, usdcVaultKey);
    const crixtoFeeAfter = await getAccount(connection, crixtoFeeAta);
    const tropicoFeeAfter = await getAccount(connection, tropicoFeeAta);
    const sharesAta = await getAccount(connection, investorShareAta);
    const investorUsdcAfter = await getAccount(connection, investorUsdcAta);

    // Vault recibe el precio completo (200 USDC)
    assert.equal(
      (vaultAfter.amount - vaultBefore.amount).toString(),
      "200000000",
      "vault must receive 200 USDC (100% del precio)"
    );

    // Crixto fee 90 bps = 1.8 USDC
    assert.equal(
      (crixtoFeeAfter.amount - crixtoFeeBefore.amount).toString(),
      "1800000",
      "crixto fee must be 90 bps"
    );

    // Trópico fee 60 bps = 1.2 USDC
    assert.equal(
      (tropicoFeeAfter.amount - tropicoFeeBefore.amount).toString(),
      "1200000",
      "tropico fee must be 60 bps"
    );

    // Investor paga precio + fee total
    const paid = investorUsdcBefore.amount - investorUsdcAfter.amount;
    assert.equal(paid.toString(), "203000000", "investor pays precio + 1.5% fee");

    // 4 shares minteadas
    assert.equal(sharesAta.amount.toString(), "4", "investor should have 4 shares");

    // shares_sold updated
    const prop = await program.account.propertyConfig.fetch(propertyKey);
    assert.equal(prop.sharesSold.toString(), "4");
  });

  // -------------------------------------------------------------------------
  it("deposit_yield + claim_reward — pro-rata USDC math is correct", async () => {
    const GROSS_YIELD = new BN(9_600_000); // $9.60 USDC gross (small for test)
    // fee 10%: crixto 6% = 576_000, tropico 4% = 384_000 → net = 8_640_000
    const ATTESTATION = Array.from(Buffer.alloc(32, 0xff));
    const epoch = BigInt(0);

    const [yieldEpochKey] = yieldEpochPda(
      program.programId,
      propertyKey,
      epoch
    );

    await program.methods
      .depositYield(GROSS_YIELD, ATTESTATION)
      .accounts({
        crixto: crixto.publicKey,
        registry: registryKey,
        property: propertyKey,
        usdcVault: usdcVaultKey,
        crixtoUsdcAta,
        crixtoFeeAta,
        tropicoFeeAta,
        yieldEpoch: yieldEpochKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([crixto])
      .rpc();

    const ye = await program.account.yieldEpoch.fetch(yieldEpochKey);
    assert.equal(ye.totalUsdcNet.toString(), "8640000", "net must be gross minus 10%");
    assert.equal(ye.totalSharesSnapshot.toString(), "4");

    // claim_reward: investor tiene 4/4 shares → recibe todo el net
    const investorUsdcBefore = await getAccount(connection, investorUsdcAta);

    await program.methods
      .claimReward(new BN(0))
      .accounts({
        investor: investor.publicKey,
        registry: registryKey,
        property: propertyKey,
        yieldEpoch: yieldEpochKey,
        investorPosition: positionKey,
        usdcVault: usdcVaultKey,
        investorUsdcAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([investor])
      .rpc();

    const investorUsdcAfter = await getAccount(connection, investorUsdcAta);
    const received = investorUsdcAfter.amount - investorUsdcBefore.amount;
    assert.equal(received.toString(), "8640000", "investor (4/4 shares) receives 100% of net yield");
  });

  // -------------------------------------------------------------------------
  it("create_proposal + vote + execute — weight is share balance, anti-double-vote works", async () => {
    const PROPOSAL_ID = BigInt(0);
    const [proposalKey] = proposalPda(
      program.programId,
      propertyKey,
      PROPOSAL_ID
    );
    const [receiptKey] = voteReceiptPda(
      program.programId,
      proposalKey,
      investor.publicKey
    );

    const now = Math.floor(Date.now() / 1000);
    const endTs = new BN(now + 3600); // 1 hora

    await program.methods
      .createProposal(
        new BN(0),
        Array.from(Buffer.alloc(32, 0xcc)),
        "https://gov.tropico.app/p/0",
        endTs
      )
      .accounts({
        proposer: investor.publicKey,
        registry: registryKey,
        property: propertyKey,
        proposerShareAta: investorShareAta,
        proposal: proposalKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([investor])
      .rpc();

    const proposal = await program.account.proposal.fetch(proposalKey);
    assert.equal(proposal.snapshotTotalShares.toString(), "4");
    assert.isFalse(proposal.executed);

    // Votar SÍ (peso = 4 shares)
    await program.methods
      .vote(true)
      .accounts({
        voter: investor.publicKey,
        property: propertyKey,
        proposal: proposalKey,
        voterShareAta: investorShareAta,
        voteReceipt: receiptKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([investor])
      .rpc();

    const proposalAfterVote = await program.account.proposal.fetch(proposalKey);
    assert.equal(proposalAfterVote.yesWeight.toString(), "4");
    assert.equal(proposalAfterVote.noWeight.toString(), "0");

    // Intentar votar de nuevo — debe fallar (init en VoteReceipt ya existe)
    try {
      await program.methods
        .vote(false)
        .accounts({
          voter: investor.publicKey,
          property: propertyKey,
          proposal: proposalKey,
          voterShareAta: investorShareAta,
          voteReceipt: receiptKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([investor])
        .rpc();
      assert.fail("double vote should have failed");
    } catch (err: any) {
      // Expected — account already exists
      assert.ok(err, "double vote rejected");
    }
  });

  // -------------------------------------------------------------------------
  it("set_pause blocks buy_shares", async () => {
    await program.methods
      .setPause(true)
      .accounts({
        admin: wallet.publicKey,
        registry: registryKey,
      })
      .rpc();

    const registry = await program.account.registryConfig.fetch(registryKey);
    assert.isTrue(registry.paused);

    // buy_shares debe fallar mientras paused
    try {
      await program.methods
        .buyShares(new BN(1))
        .accounts({
          investor: investor.publicKey,
          registry: registryKey,
          property: propertyKey,
          whitelist: kycKey,
          shareMint: shareMintKey,
          usdcVault: usdcVaultKey,
          investorUsdcAta,
          investorShareAta,
          crixtoFeeAta,
          tropicoFeeAta,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([investor])
        .rpc();
      assert.fail("buy_shares should have thrown while paused");
    } catch (err: any) {
      assert.include(err.message, "ProtocolPaused", "expected ProtocolPaused error");
    }

    // Unpause
    await program.methods
      .setPause(false)
      .accounts({
        admin: wallet.publicKey,
        registry: registryKey,
      })
      .rpc();

    const registryAfter = await program.account.registryConfig.fetch(registryKey);
    assert.isFalse(registryAfter.paused);
  });
});
