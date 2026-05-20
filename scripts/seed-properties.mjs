#!/usr/bin/env node
/**
 * Seed de propiedades para tropico_realestate en devnet.
 *
 * Pre-req:
 *   - ~/.config/solana/tropico-devnet.json con SOL devnet (>= 0.2 SOL)
 *   - NEXT_PUBLIC_REALESTATE_PROGRAM_ID en .env.local
 *   - Programa desplegado en devnet (anchor deploy)
 *
 * Uso:
 *   node scripts/seed-properties.mjs
 *
 * Qué hace:
 *   1. initialize_registry (idempotente si ya existe)
 *   2. list_property para las 3 propiedades demo
 *   3. set_kyc para el wallet demo del investor
 *   4. Imprime PDAs + Solscan links
 */

import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Buffer } from "node:buffer";

// ─── Config ────────────────────────────────────────────────────────────────

const KEYPAIR_PATH = `${homedir()}/.config/solana/tropico-devnet.json`;
const RPC = "https://devnet.helius-rpc.com/?api-key=24344eaf-3604-408d-9b49-54b59cb658c4";

// Replace with real program ID after `anchor deploy`
const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_REALESTATE_PROGRAM_ID ??
  "REaLEsTaTePLaCeHoLDer11111111111111111111111"
);

const USDC_DEVNET_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

// Demo properties — mirror lib/properties.ts
const PROPERTIES = [
  {
    id: "residencias-avila-001",
    totalShares: 2400,
    pricePerShare: 50_000_000, // $50 USDC (6 decimals)
    apyBps: 870,               // 8.7%
    name: "Residencias Ávila",
  },
  {
    id: "la-candelaria-002",
    totalShares: 3200,
    pricePerShare: 30_000_000, // $30 USDC
    apyBps: 920,               // 9.2%
    name: "La Candelaria Apt 4B",
  },
  {
    id: "maracaibo-lago-003",
    totalShares: 5000,
    pricePerShare: 25_000_000, // $25 USDC
    apyBps: 1050,              // 10.5%
    name: "Maracaibo Lago Suite",
  },
];

// ─── PDA helpers ────────────────────────────────────────────────────────────

function registryPda() {
  return PublicKey.findProgramAddressSync([Buffer.from("registry")], PROGRAM_ID);
}

function propertyPda(propertyId) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("property"), Buffer.from(propertyId)],
    PROGRAM_ID
  );
}

function shareMintPda(propertyId) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("share_mint"), Buffer.from(propertyId)],
    PROGRAM_ID
  );
}

function usdcVaultPda(propertyId) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("usdc_vault"), Buffer.from(propertyId)],
    PROGRAM_ID
  );
}

function kycPda(investor) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("kyc"), investor.toBuffer()],
    PROGRAM_ID
  );
}

// ─── Discriminators (sha256("global:<ix>")[0..8]) ──────────────────────────
// These MUST be verified against the built IDL. For Fase 0 seeding we use
// the manual approach; after `anchor build` generate and replace.

function discriminator(name) {
  // Anchor discriminator = sha256("global:" + name)[0..8]
  // We import crypto lazily here for Node compat
  const crypto = await import("node:crypto");
  const hash = crypto.createHash("sha256").update(`global:${name}`).digest();
  return hash.slice(0, 8);
}

// ─── Instruction builders ───────────────────────────────────────────────────

async function buildInitializeRegistry(payer) {
  const [registry] = registryPda();
  const disc = discriminator("initialize_registry");
  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      { pubkey: registry, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(disc),
  });
}

async function buildListProperty(payer, prop) {
  const [registry] = registryPda();
  const [property] = propertyPda(prop.id);
  const [shareMint] = shareMintPda(prop.id);
  const [usdcVault] = usdcVaultPda(prop.id);
  const disc = discriminator("list_property");

  // Args: property_id (string: 4-byte len prefix + bytes), total_shares (u64), price_per_share (u64), apy_bps (u16)
  const idBytes = Buffer.from(prop.id, "utf-8");
  const args = Buffer.alloc(4 + idBytes.length + 8 + 8 + 2);
  let offset = 0;
  args.writeUInt32LE(idBytes.length, offset); offset += 4;
  idBytes.copy(args, offset); offset += idBytes.length;
  args.writeBigUInt64LE(BigInt(prop.totalShares), offset); offset += 8;
  args.writeBigUInt64LE(BigInt(prop.pricePerShare), offset); offset += 8;
  args.writeUInt16LE(prop.apyBps, offset);

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      { pubkey: registry, isSigner: false, isWritable: true },
      { pubkey: property, isSigner: false, isWritable: true },
      { pubkey: shareMint, isSigner: false, isWritable: true },
      { pubkey: USDC_DEVNET_MINT, isSigner: false, isWritable: false },
      { pubkey: usdcVault, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([Buffer.from(disc), args]),
  });
}

async function buildSetKyc(admin, investor) {
  const [kycAccount] = kycPda(investor);
  const [registry] = registryPda();
  const disc = discriminator("set_kyc");

  // Args: approved (bool = 1 byte true)
  const args = Buffer.alloc(1);
  args.writeUInt8(1, 0);

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: admin.publicKey, isSigner: true, isWritable: true },
      { pubkey: registry, isSigner: false, isWritable: false },
      { pubkey: investor, isSigner: false, isWritable: false },
      { pubkey: kycAccount, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([Buffer.from(disc), args]),
  });
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function sendTx(conn, payer, ix) {
  const tx = new Transaction().add(ix);
  tx.feePayer = payer.publicKey;
  tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;
  tx.sign(payer);
  const sig = await conn.sendRawTransaction(tx.serialize(), { skipPreflight: false });
  await conn.confirmTransaction(sig, "confirmed");
  return sig;
}

async function main() {
  const secret = JSON.parse(readFileSync(KEYPAIR_PATH, "utf-8"));
  const payer = Keypair.fromSecretKey(new Uint8Array(secret));
  const conn = new Connection(RPC, "confirmed");

  console.log(`Admin:   ${payer.publicKey.toBase58()}`);
  console.log(`Program: ${PROGRAM_ID.toBase58()}`);

  const balance = await conn.getBalance(payer.publicKey);
  console.log(`SOL:     ${(balance / LAMPORTS_PER_SOL).toFixed(4)}`);
  if (balance < 0.1 * LAMPORTS_PER_SOL) {
    console.error("❌ Need >= 0.1 SOL devnet. Faucet: https://faucet.solana.com");
    process.exit(1);
  }

  // 1. Initialize registry (idempotente)
  console.log("\n[1/3] Initializing registry...");
  try {
    const sig = await sendTx(conn, payer, await buildInitializeRegistry(payer));
    console.log(`  ✓ ${sig}`);
  } catch (e) {
    if (e.message?.includes("already in use") || e.logs?.some((l) => l.includes("already"))) {
      console.log("  ↩ Registry already initialized, skipping");
    } else {
      throw e;
    }
  }

  // 2. List properties
  console.log("\n[2/3] Listing demo properties...");
  for (const prop of PROPERTIES) {
    const [propPda] = propertyPda(prop.id);
    const [mint] = shareMintPda(prop.id);
    const [vault] = usdcVaultPda(prop.id);

    try {
      const sig = await sendTx(conn, payer, await buildListProperty(payer, prop));
      console.log(`  ✓ ${prop.name} → ${propPda.toBase58().slice(0, 12)}…`);
      console.log(`    Sig: ${sig}`);
    } catch (e) {
      if (e.message?.includes("already in use") || e.logs?.some((l) => l.includes("already"))) {
        console.log(`  ↩ ${prop.name} already listed, skipping`);
      } else {
        console.error(`  ❌ ${prop.name}: ${e.message}`);
      }
    }

    console.log(`    Property PDA:  https://solscan.io/account/${propPda.toBase58()}?cluster=devnet`);
    console.log(`    Share Mint:    https://solscan.io/token/${mint.toBase58()}?cluster=devnet`);
    console.log(`    USDC Vault:    https://solscan.io/account/${vault.toBase58()}?cluster=devnet`);
  }

  // 3. KYC demo investor (self)
  console.log("\n[3/3] Setting KYC for demo investor (self)...");
  try {
    const sig = await sendTx(conn, payer, await buildSetKyc(payer, payer.publicKey));
    console.log(`  ✓ KYC approved for ${payer.publicKey.toBase58()}`);
    console.log(`  Sig: ${sig}`);
  } catch (e) {
    if (e.logs?.some((l) => l.includes("already"))) {
      console.log("  ↩ KYC already set");
    } else {
      throw e;
    }
  }

  console.log("\n══════════════════════════════════════════════════════════");
  console.log("✅ Seed complete — devnet properties ready for demo");
  console.log("══════════════════════════════════════════════════════════");
  console.log("Next: set NEXT_PUBLIC_REALESTATE_PROGRAM_ID in .env.local");
  console.log("Then: yarn dev → /inmuebles");
  console.log("══════════════════════════════════════════════════════════\n");
}

main().catch((e) => {
  console.error("❌ Error:", e);
  if (e.logs) e.logs.forEach((l) => console.error("  log:", l));
  process.exit(1);
});
