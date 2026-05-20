#!/usr/bin/env node
/**
 * Admin demo enablement for tropico_realestate on devnet.
 *
 * Runs, in order, with the admin/yield-authority keypair:
 *   1. buy_shares      → admin becomes a shareholder (required to create a proposal)
 *   2. deposit_yield   → creates a YieldEpoch with snapshot > 0 (enables claim_reward)
 *   3. create_proposal → opens a governance proposal (enables vote)
 *
 * Pre-req:
 *   - ~/.config/solana/tropico-devnet.json funded with SOL + USDC (mint 4zMMC9…)
 *   - Program deployed, registry initialized, properties listed, admin KYC'd (seed step)
 *
 * Usage:
 *   node scripts/admin-demo.mjs
 */

import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

// ─── Config ────────────────────────────────────────────────────────────────

const KEYPAIR_PATH = `${homedir()}/.config/solana/tropico-devnet.json`;
const RPC = "https://devnet.helius-rpc.com/?api-key=24344eaf-3604-408d-9b49-54b59cb658c4";

const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_REALESTATE_PROGRAM_ID ??
    "3V49YdnmbsHPoguFWhDhyAJhbUASq9s9LAXjxSfBPoWK"
);

const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
const USDC = 1_000_000n; // 6 decimals

// Fee ATAs (demo: any USDC token account; constraint only checks mint == usdc).
const CRIXTO_FEE_ATA = new PublicKey("rzE5XcurQWJGTb63e37dFWqqfhZ6gc82GEk1fFu1k3f");
const TROPICO_FEE_ATA = new PublicKey("rzE5XcurQWJGTb63e37dFWqqfhZ6gc82GEk1fFu1k3f");

// Target property + demo amounts
const PROPERTY_ID = "maracaibo-lago-v2"; // cheapest, 2 USDC/share
const SHARES_TO_BUY = 2n;
const YIELD_GROSS = 2n * USDC; // 2 USDC of gross rent to distribute
const PROPOSAL_ID = 1n;
const PROPOSAL_URI = "https://tropico.app/gov/maracaibo-001";
const PROPOSAL_TITLE = "Repintar fachada y áreas comunes (Q3)";

// ─── Encoding ────────────────────────────────────────────────────────────────

function disc(name) {
  return createHash("sha256").update(`global:${name}`).digest().subarray(0, 8);
}
function propertyIdBytes(id) {
  const buf = Buffer.alloc(32);
  Buffer.from(id, "utf-8").copy(buf);
  return buf;
}
function u64(n) {
  const b = Buffer.alloc(8);
  b.writeBigUInt64LE(BigInt(n), 0);
  return b;
}
function i64(n) {
  const b = Buffer.alloc(8);
  b.writeBigInt64LE(BigInt(n), 0);
  return b;
}
function encodeString(s) {
  const bytes = Buffer.from(s, "utf-8");
  const len = Buffer.alloc(4);
  len.writeUInt32LE(bytes.length, 0);
  return Buffer.concat([len, bytes]);
}
function sha256_32(s) {
  return createHash("sha256").update(s, "utf-8").digest(); // 32 bytes
}

// ─── PDAs ────────────────────────────────────────────────────────────────────

const pda = (seeds) => PublicKey.findProgramAddressSync(seeds, PROGRAM_ID)[0];
const registryPda = () => pda([Buffer.from("registry")]);
const propertyPda = (id) => pda([Buffer.from("property"), propertyIdBytes(id)]);
const shareMintPda = (id) => pda([Buffer.from("share_mint"), propertyIdBytes(id)]);
const usdcVaultPda = (id) => pda([Buffer.from("usdc_vault"), propertyIdBytes(id)]);
const kycPda = (inv) => pda([Buffer.from("kyc"), inv.toBuffer()]);
const positionPda = (prop, inv) =>
  pda([Buffer.from("position"), prop.toBuffer(), inv.toBuffer()]);
const yieldEpochPda = (prop, epoch) =>
  pda([Buffer.from("yield"), prop.toBuffer(), u64(epoch)]);
const proposalPda = (prop, id) =>
  pda([Buffer.from("proposal"), prop.toBuffer(), u64(id)]);

// ─── Tx helper ────────────────────────────────────────────────────────────────

async function send(conn, payer, ixs) {
  const tx = new Transaction().add(...ixs);
  tx.feePayer = payer.publicKey;
  tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;
  tx.sign(payer);
  const sig = await conn.sendRawTransaction(tx.serialize(), { skipPreflight: false });
  await conn.confirmTransaction(sig, "confirmed");
  return sig;
}
const dump = (e) => {
  console.error("  ❌", e.message);
  if (e.logs) e.logs.forEach((l) => console.error("     ", l));
};

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const secret = JSON.parse(readFileSync(KEYPAIR_PATH, "utf-8"));
  const admin = Keypair.fromSecretKey(new Uint8Array(secret));
  const conn = new Connection(RPC, "confirmed");

  const property = propertyPda(PROPERTY_ID);
  const shareMint = shareMintPda(PROPERTY_ID);
  const usdcVault = usdcVaultPda(PROPERTY_ID);
  const adminUsdcAta = getAssociatedTokenAddressSync(USDC_MINT, admin.publicKey);
  const adminShareAta = getAssociatedTokenAddressSync(shareMint, admin.publicKey);

  console.log(`Admin:    ${admin.publicKey.toBase58()}`);
  console.log(`Property: ${PROPERTY_ID} (${property.toBase58()})\n`);

  // 1 ── buy_shares ───────────────────────────────────────────────────────────
  console.log(`[1/3] buy_shares (${SHARES_TO_BUY})...`);
  try {
    const ixs = [];
    if (!(await conn.getAccountInfo(adminShareAta))) {
      ixs.push(
        createAssociatedTokenAccountInstruction(
          admin.publicKey,
          adminShareAta,
          admin.publicKey,
          shareMint
        )
      );
    }
    ixs.push(
      new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
          { pubkey: admin.publicKey, isSigner: true, isWritable: true },
          { pubkey: registryPda(), isSigner: false, isWritable: false },
          { pubkey: property, isSigner: false, isWritable: true },
          { pubkey: kycPda(admin.publicKey), isSigner: false, isWritable: false },
          { pubkey: shareMint, isSigner: false, isWritable: true },
          { pubkey: usdcVault, isSigner: false, isWritable: true },
          { pubkey: adminUsdcAta, isSigner: false, isWritable: true },
          { pubkey: adminShareAta, isSigner: false, isWritable: true },
          { pubkey: CRIXTO_FEE_ATA, isSigner: false, isWritable: true },
          { pubkey: TROPICO_FEE_ATA, isSigner: false, isWritable: true },
          { pubkey: positionPda(property, admin.publicKey), isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: Buffer.concat([disc("buy_shares"), u64(SHARES_TO_BUY)]),
      })
    );
    console.log(`  ✓ ${await send(conn, admin, ixs)}`);
  } catch (e) {
    dump(e);
  }

  // 2 ── deposit_yield ──────────────────────────────────────────────────────────
  // epoch index = current property.epoch_count; first deposit → 0
  console.log(`\n[2/3] deposit_yield (${Number(YIELD_GROSS) / 1e6} USDC gross)...`);
  try {
    const yieldEpoch = yieldEpochPda(property, 0n);
    const ix = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: admin.publicKey, isSigner: true, isWritable: true },
        { pubkey: registryPda(), isSigner: false, isWritable: false },
        { pubkey: property, isSigner: false, isWritable: true },
        { pubkey: usdcVault, isSigner: false, isWritable: true },
        { pubkey: adminUsdcAta, isSigner: false, isWritable: true },
        { pubkey: CRIXTO_FEE_ATA, isSigner: false, isWritable: true },
        { pubkey: TROPICO_FEE_ATA, isSigner: false, isWritable: true },
        { pubkey: yieldEpoch, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.concat([disc("deposit_yield"), u64(YIELD_GROSS), Buffer.alloc(32)]),
    });
    console.log(`  ✓ ${await send(conn, admin, [ix])}`);
  } catch (e) {
    dump(e);
  }

  // 3 ── create_proposal ────────────────────────────────────────────────────────
  console.log(`\n[3/3] create_proposal (#${PROPOSAL_ID})...`);
  try {
    const proposal = proposalPda(property, PROPOSAL_ID);
    const endTs = Math.floor(Date.now() / 1000) + 7 * 86400; // +7 days
    const ix = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: admin.publicKey, isSigner: true, isWritable: true },
        { pubkey: registryPda(), isSigner: false, isWritable: false },
        { pubkey: property, isSigner: false, isWritable: false },
        { pubkey: adminShareAta, isSigner: false, isWritable: false },
        { pubkey: proposal, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.concat([
        disc("create_proposal"),
        u64(PROPOSAL_ID),
        sha256_32(PROPOSAL_TITLE),
        encodeString(PROPOSAL_URI),
        i64(endTs),
      ]),
    });
    console.log(`  ✓ ${await send(conn, admin, [ix])}`);
  } catch (e) {
    dump(e);
  }

  console.log("\n✅ admin-demo done");
}

main().catch((e) => {
  console.error("❌", e);
  if (e.logs) e.logs.forEach((l) => console.error("  log:", l));
  process.exit(1);
});
