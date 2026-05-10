/**
 * Devnet Faucet — endpoint que mintea TROPI test tokens al pubkey del jurado.
 *
 * Uso: POST { pubkey: "<base58>" }
 * Devuelve: { ok, signature?, error? }
 *
 * El deployer keypair vive como env var server-only (no expuesta al browser).
 * Por seguridad: rate limit por pubkey via memoria del proceso (1 mint / 5 min).
 *
 * Pre-req env (Vercel + .env.local):
 *   - DEPLOYER_SECRET_KEY_JSON: secret key array como JSON, ej "[12,34,56,...]"
 *     (mismo formato que ~/.config/solana/tropico-devnet.json)
 *   - NEXT_PUBLIC_HELIUS_RPC: opcional, RPC mainnet (no se usa aquí)
 */

import { NextResponse } from "next/server";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";

const DEVNET_RPC =
  process.env.NEXT_PUBLIC_HELIUS_DEVNET_RPC ??
  "https://devnet.helius-rpc.com/?api-key=24344eaf-3604-408d-9b49-54b59cb658c4";

const TROPI_MINT = "AbkCW6BA2ZVoTw4Q6M1NvATiZjn2aMS3WvWZQbhRQf6K";
const MINT_AMOUNT_TROPI = 100; // 100 TROPI por demo
const MIN_INTERVAL_MS = 5 * 60 * 1000; // 5 min entre solicitudes por pubkey
const SEND_SOL_LAMPORTS = Math.floor(0.05 * LAMPORTS_PER_SOL); // 0.05 SOL gas

const lastMintByPubkey = new Map<string, number>();

export async function POST(req: Request) {
  let body: { pubkey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body invalido" }, { status: 400 });
  }
  const pubkey = body.pubkey?.trim();
  if (!pubkey) {
    return NextResponse.json({ ok: false, error: "pubkey requerido" }, { status: 400 });
  }
  let userPub: PublicKey;
  try {
    userPub = new PublicKey(pubkey);
  } catch {
    return NextResponse.json({ ok: false, error: "pubkey invalido" }, { status: 400 });
  }

  // Rate limit por pubkey
  const last = lastMintByPubkey.get(pubkey);
  if (last && Date.now() - last < MIN_INTERVAL_MS) {
    const wait = Math.ceil((MIN_INTERVAL_MS - (Date.now() - last)) / 1000);
    return NextResponse.json(
      { ok: false, error: `Probá de nuevo en ${wait}s. Ya recibiste tokens recientemente.` },
      { status: 429 }
    );
  }

  // Cargar deployer keypair desde env
  const deployerJson = process.env.DEPLOYER_SECRET_KEY_JSON;
  if (!deployerJson) {
    return NextResponse.json(
      { ok: false, error: "Faucet no configurado en este deployment (falta env DEPLOYER_SECRET_KEY_JSON)" },
      { status: 503 }
    );
  }
  let deployer: Keypair;
  try {
    const arr = JSON.parse(deployerJson) as number[];
    deployer = Keypair.fromSecretKey(new Uint8Array(arr));
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "DEPLOYER_SECRET_KEY_JSON malformado" },
      { status: 500 }
    );
  }

  const conn = new Connection(DEVNET_RPC, "confirmed");

  try {
    // 1. Mandar 0.05 SOL para gas + rent ATA (si el deployer tiene saldo)
    const deployerSol = await conn.getBalance(deployer.publicKey);
    const userSol = await conn.getBalance(userPub);
    let solSig: string | null = null;
    if (userSol < 0.01 * LAMPORTS_PER_SOL && deployerSol > SEND_SOL_LAMPORTS + 5000) {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: deployer.publicKey,
          toPubkey: userPub,
          lamports: SEND_SOL_LAMPORTS,
        })
      );
      const { blockhash } = await conn.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = deployer.publicKey;
      tx.sign(deployer);
      solSig = await conn.sendRawTransaction(tx.serialize());
      await conn.confirmTransaction(solSig, "confirmed");
    }

    // 2. Mintear TROPI a la ATA del usuario (la crea si no existe)
    const mintPub = new PublicKey(TROPI_MINT);
    const ata = await getOrCreateAssociatedTokenAccount(
      conn,
      deployer,
      mintPub,
      userPub
    );
    const decimals = 6;
    const tropiSig = await mintTo(
      conn,
      deployer,
      mintPub,
      ata.address,
      deployer,
      BigInt(MINT_AMOUNT_TROPI * 10 ** decimals)
    );

    lastMintByPubkey.set(pubkey, Date.now());

    return NextResponse.json({
      ok: true,
      tropi: {
        amount: MINT_AMOUNT_TROPI,
        mint: TROPI_MINT,
        signature: tropiSig,
        explorer: `https://solscan.io/tx/${tropiSig}?cluster=devnet`,
      },
      sol: solSig
        ? {
            amount: SEND_SOL_LAMPORTS / LAMPORTS_PER_SOL,
            signature: solSig,
            explorer: `https://solscan.io/tx/${solSig}?cluster=devnet`,
          }
        : null,
      hint: "Para más SOL devnet visitá https://faucet.solana.com",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
