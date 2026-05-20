#!/usr/bin/env node
/**
 * Deposita renta (deposit_yield) en una propiedad — re-ejecutable.
 *
 * Corré ESTO DESPUÉS de que el inversor (ej. 96Bj…) compre, para que el
 * snapshot del nuevo epoch incluya sus acciones y pueda reclamar (claim_reward).
 * El índice de epoch se autodetecta (primer PDA "yield" inexistente).
 *
 * Pre-req: ~/.config/solana/tropico-devnet.json con SOL + USDC (operator_authority).
 *
 * Uso:
 *   node scripts/deposit-yield.mjs                 # Maracaibo, 2 USDC gross
 *   PROPERTY_ID=la-candelaria-v2 GROSS_USDC=3 node scripts/deposit-yield.mjs
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
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";

const KEYPAIR_PATH = `${homedir()}/.config/solana/tropico-devnet.json`;
const RPC = "https://devnet.helius-rpc.com/?api-key=24344eaf-3604-408d-9b49-54b59cb658c4";
const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_REALESTATE_PROGRAM_ID ??
    "3V49YdnmbsHPoguFWhDhyAJhbUASq9s9LAXjxSfBPoWK"
);
const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
const USDC = 1_000_000n;
const FEE_ATA = new PublicKey("rzE5XcurQWJGTb63e37dFWqqfhZ6gc82GEk1fFu1k3f");

const PROPERTY_ID = process.env.PROPERTY_ID ?? "maracaibo-lago-v2";
const GROSS = BigInt(process.env.GROSS_USDC ?? "2") * USDC;

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
const pda = (seeds) => PublicKey.findProgramAddressSync(seeds, PROGRAM_ID)[0];
const registryPda = () => pda([Buffer.from("registry")]);
const propertyPda = (id) => pda([Buffer.from("property"), propertyIdBytes(id)]);
const usdcVaultPda = (id) => pda([Buffer.from("usdc_vault"), propertyIdBytes(id)]);
const yieldEpochPda = (prop, epoch) =>
  pda([Buffer.from("yield"), prop.toBuffer(), u64(epoch)]);

async function main() {
  const admin = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(readFileSync(KEYPAIR_PATH, "utf-8")))
  );
  const conn = new Connection(RPC, "confirmed");

  const property = propertyPda(PROPERTY_ID);
  const usdcVault = usdcVaultPda(PROPERTY_ID);
  const adminUsdcAta = getAssociatedTokenAddressSync(USDC_MINT, admin.publicKey);

  // Autodetecta el próximo epoch: primer PDA "yield" que no existe.
  let epoch = 0n;
  while (await conn.getAccountInfo(yieldEpochPda(property, epoch))) epoch += 1n;

  console.log(`Property: ${PROPERTY_ID}`);
  console.log(`Próximo epoch: ${epoch}`);
  console.log(`Gross: ${Number(GROSS) / 1e6} USDC\n`);

  const ix = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: admin.publicKey, isSigner: true, isWritable: true },
      { pubkey: registryPda(), isSigner: false, isWritable: false },
      { pubkey: property, isSigner: false, isWritable: true },
      { pubkey: usdcVault, isSigner: false, isWritable: true },
      { pubkey: adminUsdcAta, isSigner: false, isWritable: true },
      { pubkey: FEE_ATA, isSigner: false, isWritable: true },
      { pubkey: FEE_ATA, isSigner: false, isWritable: true },
      { pubkey: yieldEpochPda(property, epoch), isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([disc("deposit_yield"), u64(GROSS), Buffer.alloc(32)]),
  });

  const tx = new Transaction().add(ix);
  tx.feePayer = admin.publicKey;
  tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;
  tx.sign(admin);
  const sig = await conn.sendRawTransaction(tx.serialize(), { skipPreflight: false });
  await conn.confirmTransaction(sig, "confirmed");

  console.log(`✅ deposit_yield epoch ${epoch} → ${sig}`);
  console.log(`   Ahora los holders de ${PROPERTY_ID} pueden reclamar epoch ${epoch}.`);
}

main().catch((e) => {
  console.error("❌", e.message);
  if (e.logs) e.logs.forEach((l) => console.error("  log:", l));
  process.exit(1);
});
