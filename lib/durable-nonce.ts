/**
 * Durable Nonces — Offline-first payments para Tropico Wallet.
 *
 * Problema: las transacciones de Solana tienen blockhash con TTL ~90s.
 * Si el usuario firma offline (sin conexión) y no puede broadcast en ese
 * ventana, la tx expira.
 *
 * Solución: Durable Nonces (SystemProgram.nonceAdvance + NonceAccount).
 * La tx usa el nonce del NonceAccount como "recent blockhash". El nonce
 * NO cambia hasta que se avanza on-chain — la tx puede ser firmada offline
 * y broadcast días después.
 *
 * Flujo en producción:
 *  1. Mientras online: crear NonceAccount (tx barata: ~0.001 SOL rent)
 *  2. Guardar nonce pubkey + nonce hash en localStorage
 *  3. Construir tx con SystemProgram.nonceAdvance + instrucción real
 *  4. Firmar offline (keypair local desbloqueado con password)
 *  5. Serializar tx → guardar en cola offline (localStorage)
 *  6. Cuando vuelve la conexión: broadcast desde la cola
 *
 * MVP: simulamos los pasos 1, 3 y 4 con datos demo realistas.
 * Producción Q3: integración completa con NonceAccount on-chain.
 */

export type PendingNonceTx = {
  id: string;
  description: string;
  toAddress: string;
  amountUsdc: number;
  nonceAccount: string;
  nonceHash: string;
  serializedTx: string; // base64 — tx firmada, lista para broadcast
  createdAt: string;
  status: "pending" | "broadcasting" | "confirmed" | "failed";
  signature?: string;
  error?: string;
};

const STORAGE_KEY = "tropico:offline:pending-txs";

export function getPendingQueue(): PendingNonceTx[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function savePendingQueue(queue: PendingNonceTx[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function addPendingTx(
  tx: Omit<PendingNonceTx, "id" | "createdAt" | "status">,
): PendingNonceTx {
  const queue = getPendingQueue();
  const entry: PendingNonceTx = {
    ...tx,
    id: `nonce-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  queue.push(entry);
  savePendingQueue(queue);
  return entry;
}

export function removePendingTx(id: string) {
  savePendingQueue(getPendingQueue().filter((t) => t.id !== id));
}

export function updateTxStatus(
  id: string,
  status: PendingNonceTx["status"],
  extra?: Partial<PendingNonceTx>,
) {
  savePendingQueue(
    getPendingQueue().map((t) =>
      t.id === id ? { ...t, status, ...extra } : t,
    ),
  );
}

/**
 * Simula broadcast de una tx pendiente.
 * En producción: conn.sendRawTransaction(Buffer.from(tx.serializedTx, "base64"))
 */
export async function broadcastDemoTx(
  id: string,
): Promise<{ ok: boolean; signature?: string; error?: string }> {
  updateTxStatus(id, "broadcasting");

  await new Promise((r) => setTimeout(r, 2200));

  const sig = `Demo${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  updateTxStatus(id, "confirmed", { signature: sig });
  return { ok: true, signature: sig };
}

/**
 * Crea una tx demo offline firmada con nonce durable (simulado).
 *
 * En producción real:
 *  const noncePubkey = new PublicKey(nonceAccountAddress);
 *  tx.add(SystemProgram.nonceAdvance({ noncePubkey, authorizedPubkey: fromPub }));
 *  tx.recentBlockhash = nonceHash; // del NonceAccount.nonce on-chain
 *  tx.feePayer = fromPub;
 *  tx.sign(keypair); // firma offline, sin RPC
 */
export function createDemoOfflineTx(
  description: string,
  toAddress: string,
  amountUsdc: number,
): PendingNonceTx {
  const nonceAccount = `NncDemo${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  const nonceHash = `DurNonce${Math.random().toString(36).slice(2, 12).toUpperCase()}`;

  const payload = {
    type: "SPL_TRANSFER",
    token: "USDC",
    to: toAddress,
    amount: amountUsdc,
    nonce: nonceHash,
    nonceAccount,
    signedOfflineAt: new Date().toISOString(),
  };
  const serializedTx = Buffer.from(JSON.stringify(payload)).toString("base64");

  return addPendingTx({
    description,
    toAddress,
    amountUsdc,
    nonceAccount,
    nonceHash,
    serializedTx,
  });
}
