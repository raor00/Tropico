#!/usr/bin/env node
/**
 * Crea el SPL token TROPI en devnet.
 *
 * Pre-req: pubkey EUSqhaDBVLtzjgqwxeTurcksyPqkW37nyyTBWEhKVXDd debe tener
 * al menos 0.05 SOL devnet (gas + rent del mint + ATA).
 *
 * Uso:
 *   node scripts/create-tropi-token.mjs
 *
 * Output: mint address impreso a stdout. Pega en README + tokens.ts.
 */

import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

const KEYPAIR_PATH = `${homedir()}/.config/solana/tropico-devnet.json`;
const RPC = "https://devnet.helius-rpc.com/?api-key=24344eaf-3604-408d-9b49-54b59cb658c4";
const DECIMALS = 6;
const INITIAL_SUPPLY = 1_000_000n; // 1M TROPI (con decimals = 1_000_000_000_000)

async function main() {
  const secret = JSON.parse(readFileSync(KEYPAIR_PATH, "utf-8"));
  const payer = Keypair.fromSecretKey(new Uint8Array(secret));

  console.log(`Deployer pubkey: ${payer.publicKey.toBase58()}`);

  const conn = new Connection(RPC, "confirmed");
  const balance = await conn.getBalance(payer.publicKey);
  console.log(`SOL balance: ${balance / LAMPORTS_PER_SOL} SOL`);
  if (balance < 0.05 * LAMPORTS_PER_SOL) {
    console.error("\n❌ Saldo insuficiente. Necesitas al menos 0.05 SOL devnet.");
    console.error(`   Manda SOL devnet a: ${payer.publicKey.toBase58()}`);
    console.error("   Faucet: https://faucet.solana.com");
    process.exit(1);
  }

  console.log("\nCreando mint TROPI (decimals=6)...");
  const mint = await createMint(
    conn,
    payer,
    payer.publicKey, // mint authority
    payer.publicKey, // freeze authority (Q4: null para inmutable)
    DECIMALS
  );
  console.log(`✓ Mint creado: ${mint.toBase58()}`);

  console.log("\nCreando ATA del deployer...");
  const ata = await getOrCreateAssociatedTokenAccount(
    conn,
    payer,
    mint,
    payer.publicKey
  );
  console.log(`✓ ATA: ${ata.address.toBase58()}`);

  console.log(`\nMinteando ${INITIAL_SUPPLY} TROPI a la ATA...`);
  const sig = await mintTo(
    conn,
    payer,
    mint,
    ata.address,
    payer,
    INITIAL_SUPPLY * BigInt(10 ** DECIMALS)
  );
  console.log(`✓ Mint tx: ${sig}`);

  console.log("\n══════════════════════════════════════════════════════════");
  console.log("✅ TROPI token deployed en Solana devnet");
  console.log("══════════════════════════════════════════════════════════");
  console.log(`Mint:        ${mint.toBase58()}`);
  console.log(`Deployer:    ${payer.publicKey.toBase58()}`);
  console.log(`Supply:      ${INITIAL_SUPPLY} TROPI`);
  console.log(`Decimals:    ${DECIMALS}`);
  console.log(`Solscan:     https://solscan.io/token/${mint.toBase58()}?cluster=devnet`);
  console.log("══════════════════════════════════════════════════════════\n");
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
