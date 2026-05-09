/**
 * Wallet local — 100% self-hosted, sin dependencia de Privy/Magic/Turnkey/etc.
 *
 * Crea un Solana Keypair en el browser, lo encripta con la password del usuario
 * (PBKDF2-SHA256 100k iterations + AES-GCM 256), lo guarda en localStorage.
 *
 * - Crypto: WebCrypto API (nativo del browser, sin libs externas)
 * - Storage: localStorage (clave: "tropico:wallet:v1")
 * - Recovery: el usuario debe guardar su seed (secretKey hex) ANTES de cerrar
 *   la pantalla de creación. Lo mostramos UNA SOLA VEZ. Sin backup, no hay recovery.
 *
 * Trade-offs vs Privy MPC:
 * + Cero dependencia externa, cero costo, cero PII al cloud
 * + Auditable (60 LOC de crypto)
 * - Sin recovery por email — si pierdes password Y seed, plata bloqueada
 * - Sin MPC — toda la llave vive en una sola máquina
 *
 * Para producción crítica: combinar con Privy MPC como recovery layer.
 */

import { Keypair } from "@solana/web3.js";

const STORAGE_KEY = "tropico:wallet:v1";
const PBKDF2_ITERATIONS = 100_000;

export type EncryptedWallet = {
  /** Pubkey base58 — pública, segura de mostrar */
  publicKey: string;
  /** secretKey encriptado con AES-GCM, base64 */
  ciphertext: string;
  /** Salt random para PBKDF2, base64 */
  salt: string;
  /** IV random para AES-GCM, base64 */
  iv: string;
  /** ISO 8601 */
  createdAt: string;
  /** Versión del schema para futuras migraciones */
  v: 1;
};

export type CreateResult = {
  wallet: EncryptedWallet;
  /** Hex de la secretKey de Solana (64 bytes = 128 chars hex). MOSTRAR UNA SOLA VEZ. */
  secretKeyHex: string;
};

/* ─────────────────────────────────────────────────────────── */
/* API pública                                                 */
/* ─────────────────────────────────────────────────────────── */

/** Detecta si ya hay una wallet creada en este browser */
export function hasLocalWallet(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/** Lee la pubkey sin desbloquear (para mostrar en UI cuando está locked) */
export function getLocalWalletPubkey(): string | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return (JSON.parse(raw) as EncryptedWallet).publicKey;
  } catch {
    return null;
  }
}

/** Crea una wallet nueva, encriptada con password. Devuelve seed para backup. */
export async function createLocalWallet(password: string): Promise<CreateResult> {
  if (password.length < 8) throw new Error("Password debe tener al menos 8 caracteres");
  const keypair = Keypair.generate();
  const secretKey = keypair.secretKey; // 64 bytes
  const enc = await encryptBytes(secretKey, password);
  const wallet: EncryptedWallet = {
    publicKey: keypair.publicKey.toBase58(),
    ciphertext: enc.ciphertext,
    salt: enc.salt,
    iv: enc.iv,
    createdAt: new Date().toISOString(),
    v: 1,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
  return { wallet, secretKeyHex: bytesToHex(secretKey) };
}

/** Importa una wallet existente desde su secretKey hex + protege con password */
export async function importLocalWallet(
  secretKeyHex: string,
  password: string
): Promise<EncryptedWallet> {
  if (password.length < 8) throw new Error("Password debe tener al menos 8 caracteres");
  const bytes = hexToBytes(secretKeyHex);
  if (bytes.length !== 64) throw new Error("secretKey debe ser 64 bytes (128 hex chars)");
  const keypair = Keypair.fromSecretKey(bytes);
  const enc = await encryptBytes(bytes, password);
  const wallet: EncryptedWallet = {
    publicKey: keypair.publicKey.toBase58(),
    ciphertext: enc.ciphertext,
    salt: enc.salt,
    iv: enc.iv,
    createdAt: new Date().toISOString(),
    v: 1,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
  return wallet;
}

/** Desbloquea la wallet local con la password. Devuelve null si password incorrecto. */
export async function unlockLocalWallet(password: string): Promise<Keypair | null> {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const wallet = JSON.parse(raw) as EncryptedWallet;
  const secretKey = await decryptBytes(wallet, password);
  if (!secretKey) return null;
  return Keypair.fromSecretKey(secretKey);
}

/** Elimina la wallet del browser (sin recovery — usar con cuidado) */
export function deleteLocalWallet() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/* ─────────────────────────────────────────────────────────── */
/* Crypto — WebCrypto API                                      */
/* ─────────────────────────────────────────────────────────── */

async function encryptBytes(plaintext: Uint8Array, password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(password, salt);
  // Cast a BufferSource explícito — TS5 estricto distingue Uint8Array<ArrayBufferLike> vs <ArrayBuffer>
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    plaintext as BufferSource
  );
  return {
    ciphertext: bufToBase64(ciphertext),
    salt: bufToBase64(salt),
    iv: bufToBase64(iv),
  };
}

async function decryptBytes(
  wallet: EncryptedWallet,
  password: string
): Promise<Uint8Array | null> {
  try {
    const salt = base64ToBuf(wallet.salt);
    const iv = base64ToBuf(wallet.iv);
    const key = await deriveAesKey(password, salt);
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      key,
      base64ToBuf(wallet.ciphertext) as BufferSource
    );
    return new Uint8Array(plain);
  } catch {
    return null;
  }
}

async function deriveAesKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const passwordBuf = new TextEncoder().encode(password) as BufferSource;
  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordBuf,
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Helpers de encoding                                          */
/* ─────────────────────────────────────────────────────────── */

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/\s+/g, "").toLowerCase();
  if (!/^[0-9a-f]+$/.test(clean) || clean.length % 2 !== 0) {
    throw new Error("Hex inválido");
  }
  const arr = new Uint8Array(clean.length / 2);
  for (let i = 0; i < arr.length; i++) arr[i] = parseInt(clean.substr(i * 2, 2), 16);
  return arr;
}

function bufToBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function base64ToBuf(b64: string): Uint8Array {
  const s = atob(b64);
  const bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
  return bytes;
}
