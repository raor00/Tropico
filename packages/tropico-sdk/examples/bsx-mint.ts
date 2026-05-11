/**
 * Example: BsX Mint
 *
 * Build the transaction instructions to mint BsX by depositing 10 USDC.
 * Logs the instruction accounts and data buffer.
 *
 * NOTE: Discriminators are stubbed — replace with actual IDL discriminators
 * before submitting to mainnet.
 */

import { PublicKey } from "@solana/web3.js";
import { TropicoClient } from "../src/index.js";

// Stub user wallet for illustration (replace with real Keypair in production)
const USER_PUBKEY = new PublicKey("USer111111111111111111111111111111111111111");
const USDC_AMOUNT = 10_000_000 as import("../src/types.js").UsdcAmount; // 10 USDC (6 decimals)

const client = new TropicoClient({
  rpcEndpoint: "https://api.devnet.solana.com",
  network: "devnet",
});

const instructions = client.bsx.buildMintIx({
  user: USER_PUBKEY,
  usdcAmount: USDC_AMOUNT,
});

console.log("=== BsX Mint Instructions ===");
console.log(`Instruction count: ${instructions.length}`);
for (const ix of instructions) {
  console.log("Program:", ix.programId.toBase58());
  console.log("Accounts:");
  for (const key of ix.keys) {
    console.log(
      `  ${key.pubkey.toBase58()} (signer=${key.isSigner}, writable=${key.isWritable})`
    );
  }
  console.log("Data (hex):", ix.data.toString("hex"));
  console.log(
    "NOTE: First 8 bytes are the Anchor discriminator stub — replace with IDL-derived value."
  );
}
