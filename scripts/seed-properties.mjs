#!/usr/bin/env node
/**
 * Seed de propiedades para tropico_realestate en devnet.
 *
 * Pre-req:
 *   - ~/.config/solana/tropico-devnet.json con SOL devnet (>= 0.2 SOL)
 *   - NEXT_PUBLIC_REALESTATE_PROGRAM_ID en el entorno (o el real tras anchor deploy)
 *   - Programa desplegado en devnet (anchor deploy)
 *
 * Uso:
 *   NEXT_PUBLIC_REALESTATE_PROGRAM_ID=<id> node scripts/seed-properties.mjs
 *
 * Qué hace:
 *   1. initialize_registry (idempotente — admin == crixto_authority en demo)
 *   2. list_property x3 (Ávila, Candelaria, Maracaibo)
 *   3. set_kyc del wallet demo (self) → verified = true
 *
 * NOTA: property_id on-chain es [u8; 32]. Convención: UTF-8 del id
 *       right-padded a 32 bytes con 0x00. Debe coincidir con lib/realestate-program.ts.
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
  SYSVAR_RENT_PUBKEY,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

// ─── Config ────────────────────────────────────────────────────────────────

const KEYPAIR_PATH = `${homedir()}/.config/solana/tropico-devnet.json`;
const RPC = "https://devnet.helius-rpc.com/?api-key=24344eaf-3604-408d-9b49-54b59cb658c4";

const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_REALESTATE_PROGRAM_ID ??
    "3V49YdnmbsHPoguFWhDhyAJhbUASq9s9LAXjxSfBPoWK"
);

const USDC_DEVNET_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

const USDC_DECIMALS = 1_000_000n; // 6 decimals

// Wallets a aprobar en KYC además del seed (self). El wallet de la app del demo
// debe estar acá o buy_shares falla por whitelist faltante.
// Override: DEMO_INVESTORS="pubkey1,pubkey2" node scripts/seed-properties.mjs
const DEMO_INVESTORS = (
  process.env.DEMO_INVESTORS ?? "96BjLBarLCAqZMU1FBun6VbtrCUkKoGg2xq5N8xSDY8i"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Demo properties — mirror lib/properties.ts (montos en micro-USDC)
const PROPERTIES = [
  {
    id: "residencias-avila-v2",
    totalShares: 2400n,
    pricePerShare: 5n * USDC_DECIMALS,
    valuationUsdc: 120_000n * USDC_DECIMALS,
    legalDocHash: "abababababababababababababababababababababababababababababababab",
    tourUrl: "https://tour.tropico.app/avila-001",
    name: "Residencias Ávila #1",
  },
  {
    id: "la-candelaria-v2",
    totalShares: 1500n,
    pricePerShare: 3n * USDC_DECIMALS,
    valuationUsdc: 45_000n * USDC_DECIMALS,
    legalDocHash: "cdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcd",
    tourUrl: "https://tour.tropico.app/candelaria-002",
    name: "La Candelaria Centro #2",
  },
  {
    id: "maracaibo-lago-v2",
    totalShares: 3200n,
    pricePerShare: 2n * USDC_DECIMALS,
    valuationUsdc: 80_000n * USDC_DECIMALS,
    legalDocHash: "efefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefef",
    tourUrl: "https://tour.tropico.app/maracaibo-003",
    name: "Lago Towers Maracaibo #3",
  },
];

// ─── Encoding helpers ────────────────────────────────────────────────────────

// Anchor discriminator = sha256("global:<ix>")[0..8]
function discriminator(name) {
  return createHash("sha256").update(`global:${name}`).digest().subarray(0, 8);
}

// property_id → [u8; 32] right-padded UTF-8 (matches on-chain seed + arg)
function propertyIdBytes(id) {
  const buf = Buffer.alloc(32);
  Buffer.from(id, "utf-8").copy(buf);
  return buf;
}

// hex string → [u8; 32] (pad/truncate to 32 bytes)
function hash32(hex) {
  const buf = Buffer.alloc(32);
  Buffer.from(hex, "hex").copy(buf);
  return buf;
}

// Borsh string = u32 LE length prefix + utf8 bytes
function encodeString(s) {
  const bytes = Buffer.from(s, "utf-8");
  const len = Buffer.alloc(4);
  len.writeUInt32LE(bytes.length, 0);
  return Buffer.concat([len, bytes]);
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

// ─── PDA helpers ────────────────────────────────────────────────────────────

function registryPda() {
  return PublicKey.findProgramAddressSync([Buffer.from("registry")], PROGRAM_ID);
}

function propertyPda(id) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("property"), propertyIdBytes(id)],
    PROGRAM_ID
  );
}

function shareMintPda(id) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("share_mint"), propertyIdBytes(id)],
    PROGRAM_ID
  );
}

function usdcVaultPda(id) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("usdc_vault"), propertyIdBytes(id)],
    PROGRAM_ID
  );
}

function kycPda(investor) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("kyc"), investor.toBuffer()],
    PROGRAM_ID
  );
}

// ─── Instruction builders (signatures from programs/tropico_realestate/src/lib.rs) ──

// initialize_registry(crixto_authority: Pubkey)
// accounts: admin(signer,mut), usdc_mint, registry(init), system_program
function buildInitializeRegistry(payer) {
  const [registry] = registryPda();
  const data = Buffer.concat([discriminator("initialize_registry"), payer.publicKey.toBuffer()]);
  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      { pubkey: USDC_DEVNET_MINT, isSigner: false, isWritable: false },
      { pubkey: registry, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

// list_property(property_id:[u8;32], total_shares:u64, price_per_share:u64,
//               legal_doc_hash:[u8;32], valuation_usdc:u64, tour_url:String)
// accounts: admin, registry, property, share_mint, usdc_vault, usdc_mint,
//           token_program, system_program, rent
function buildListProperty(payer, prop) {
  const [registry] = registryPda();
  const [property] = propertyPda(prop.id);
  const [shareMint] = shareMintPda(prop.id);
  const [usdcVault] = usdcVaultPda(prop.id);

  const data = Buffer.concat([
    discriminator("list_property"),
    propertyIdBytes(prop.id),
    u64(prop.totalShares),
    u64(prop.pricePerShare),
    hash32(prop.legalDocHash),
    u64(prop.valuationUsdc),
    encodeString(prop.tourUrl),
  ]);

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      { pubkey: registry, isSigner: false, isWritable: false },
      { pubkey: property, isSigner: false, isWritable: true },
      { pubkey: shareMint, isSigner: false, isWritable: true },
      { pubkey: usdcVault, isSigner: false, isWritable: true },
      { pubkey: USDC_DEVNET_MINT, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    data,
  });
}

// set_kyc(investor: Pubkey, verified: bool, expires_at: i64)
// accounts: crixto(signer,mut), registry, whitelist(init_if_needed), system_program
function buildSetKyc(crixto, investor) {
  const [registry] = registryPda();
  const [whitelist] = kycPda(investor);

  const data = Buffer.concat([
    discriminator("set_kyc"),
    investor.toBuffer(),
    Buffer.from([1]), // verified = true
    i64(0),           // expires_at = 0 (never)
  ]);

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: crixto.publicKey, isSigner: true, isWritable: true },
      { pubkey: registry, isSigner: false, isWritable: false },
      { pubkey: whitelist, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

// ─── Tx helper ────────────────────────────────────────────────────────────────

async function sendTx(conn, payer, ix) {
  const tx = new Transaction().add(ix);
  tx.feePayer = payer.publicKey;
  tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;
  tx.sign(payer);
  const sig = await conn.sendRawTransaction(tx.serialize(), { skipPreflight: false });
  await conn.confirmTransaction(sig, "confirmed");
  return sig;
}

function isAlreadyExists(e) {
  return (
    e.message?.includes("already in use") ||
    e.logs?.some((l) => l.includes("already in use"))
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const secret = JSON.parse(readFileSync(KEYPAIR_PATH, "utf-8"));
  const payer = Keypair.fromSecretKey(new Uint8Array(secret));
  const conn = new Connection(RPC, "confirmed");

  console.log(`Admin/Crixto: ${payer.publicKey.toBase58()}`);
  console.log(`Program:      ${PROGRAM_ID.toBase58()}`);

  const balance = await conn.getBalance(payer.publicKey);
  console.log(`SOL:          ${(balance / LAMPORTS_PER_SOL).toFixed(4)}`);
  if (balance < 0.1 * LAMPORTS_PER_SOL) {
    console.error("❌ Need >= 0.1 SOL devnet. Faucet: https://faucet.solana.com");
    process.exit(1);
  }

  // 1. Initialize registry
  console.log("\n[1/3] initialize_registry...");
  try {
    const sig = await sendTx(conn, payer, buildInitializeRegistry(payer));
    console.log(`  ✓ ${sig}`);
  } catch (e) {
    if (isAlreadyExists(e)) console.log("  ↩ Registry already initialized");
    else throw e;
  }

  // 2. List properties
  console.log("\n[2/3] list_property x3...");
  for (const prop of PROPERTIES) {
    const [propPda] = propertyPda(prop.id);
    const [mint] = shareMintPda(prop.id);
    const [vault] = usdcVaultPda(prop.id);
    try {
      const sig = await sendTx(conn, payer, buildListProperty(payer, prop));
      console.log(`  ✓ ${prop.name}`);
      console.log(`    Sig: ${sig}`);
    } catch (e) {
      if (isAlreadyExists(e)) console.log(`  ↩ ${prop.name} already listed`);
      else {
        console.error(`  ❌ ${prop.name}: ${e.message}`);
        if (e.logs) e.logs.forEach((l) => console.error("     ", l));
      }
    }
    console.log(`    Property:   https://solscan.io/account/${propPda.toBase58()}?cluster=devnet`);
    console.log(`    Share Mint: https://solscan.io/token/${mint.toBase58()}?cluster=devnet`);
    console.log(`    USDC Vault: https://solscan.io/account/${vault.toBase58()}?cluster=devnet`);
  }

  // 3. KYC demo investors (self + wallets de la app)
  const kycTargets = [
    payer.publicKey,
    ...DEMO_INVESTORS.map((s) => new PublicKey(s)),
  ];
  console.log(`\n[3/3] set_kyc x${kycTargets.length}...`);
  for (const investor of kycTargets) {
    try {
      const sig = await sendTx(conn, payer, buildSetKyc(payer, investor));
      console.log(`  ✓ KYC verified for ${investor.toBase58()}`);
      console.log(`    Sig: ${sig}`);
    } catch (e) {
      if (isAlreadyExists(e)) {
        console.log(`  ↩ KYC already set for ${investor.toBase58()}`);
      } else {
        console.error(`  ❌ ${investor.toBase58()}: ${e.message}`);
        if (e.logs) e.logs.forEach((l) => console.error("     ", l));
      }
    }
  }

  console.log("\n══════════════════════════════════════════════════════════");
  console.log("✅ Seed complete — devnet properties ready");
  console.log("══════════════════════════════════════════════════════════");
  console.log(`Set in .env.local: NEXT_PUBLIC_REALESTATE_PROGRAM_ID=${PROGRAM_ID.toBase58()}`);
  console.log("Then: yarn dev → /inmuebles");
  console.log("══════════════════════════════════════════════════════════\n");
}

main().catch((e) => {
  console.error("❌ Error:", e);
  if (e.logs) e.logs.forEach((l) => console.error("  log:", l));
  process.exit(1);
});
