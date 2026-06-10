"use client";

import {
  CheckCircle2,
  ExternalLink,
  Gift,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { Connection, Transaction } from "@solana/web3.js";
import type { Signer } from "@/lib/send-tx";
import { getActiveCluster, getActiveRpcUrl } from "@/lib/cluster";
import { buildClaimRewardTx } from "@/lib/realestate-program";

type Props = {
  propertyId: string;
  propertyName: string;
  claimableUsdc: number;
  epoch: number;
  signer: Signer | null;
};

/** Sign and broadcast a pre-built transaction; returns the confirmed signature. */
async function sendAndConfirm(tx: Transaction, signer: Signer): Promise<string> {
  const conn = new Connection(getActiveRpcUrl(), "confirmed");
  if (signer.type === "keypair") {
    tx.sign(signer.kp);
    const sig = await conn.sendRawTransaction(tx.serialize());
    await conn.confirmTransaction(sig, "confirmed");
    return sig;
  }
  const signed = await signer.signTransaction(tx);
  const sig = await conn.sendRawTransaction(signed.serialize());
  await conn.confirmTransaction(sig, "confirmed");
  return sig;
}

export function RewardClaimCard({
  propertyId,
  propertyName,
  claimableUsdc,
  epoch,
  signer,
}: Props) {
  const [claiming, setClaiming] = useState(false);
  const [confirmed, setConfirmed] = useState<{
    txSig: string;
    onchain: boolean;
    explorer?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cluster = getActiveCluster();

  // Render the card when there is a real unclaimed epoch (epoch > 0) even if the
  // exact USDC amount is not yet known (claimableUsdc=0). Computing exact USDC
  // requires a fetchYieldEpoch helper that reads total_yield_usdc + snapshot shares
  // from the YieldEpoch PDA — not yet implemented. The on-chain claim instruction
  // calculates the pro-rata amount correctly at settlement time.
  if (claimableUsdc <= 0 && epoch <= 0) return null;

  async function claim() {
    setError(null);
    setClaiming(true);
    try {
      if (!signer) {
        // Demo mode — no real wallet connected
        await new Promise((r) => setTimeout(r, 800));
        setConfirmed({
          txSig: `DEMO_${Math.random().toString(36).slice(2, 14)}`,
          onchain: false,
        });
        return;
      }

      const { PublicKey } = await import("@solana/web3.js");
      const investor = new PublicKey(signer.address);
      const tx = await buildClaimRewardTx(propertyId, investor, BigInt(epoch));
      const sig = await sendAndConfirm(tx, signer);
      setConfirmed({
        txSig: sig,
        onchain: true,
        explorer: `https://solscan.io/tx/${sig}${cluster === "devnet" ? "?cluster=devnet" : ""}`,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      // Always reset button state, even on confirmation timeout
      setClaiming(false);
    }
  }

  return (
    <div className="panel flex flex-col gap-3 border-tropico-sun/30 bg-tropico-sun/5 p-4">
      <header className="flex items-center gap-2">
        <Gift className="size-4 text-tropico-sun" />
        <span className="text-sm font-semibold text-tropico-sun">
          Renta disponible
        </span>
        <span className="ml-auto font-display text-lg font-bold text-tropico-sun">
          {claimableUsdc > 0 ? `$${claimableUsdc.toFixed(2)} USDC` : "Pendiente de cálculo"}
        </span>
      </header>
      <p className="text-xs text-tropico-mute">
        {propertyName} · Epoch {epoch} · Pro-rata según tus acciones
      </p>

      {error && (
        <p className="rounded-md border border-tropico-coral/30 bg-tropico-coral/5 p-2 text-xs text-tropico-coral">
          {error}
        </p>
      )}

      {confirmed ? (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-tropico-green">
            <CheckCircle2 className="size-4" />
            <span>¡Renta reclamada!</span>
            {!confirmed.onchain && (
              <span className="text-[10px] text-tropico-mute">(demo)</span>
            )}
          </div>
          {confirmed.explorer && (
            <a
              href={confirmed.explorer}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[11px] text-tropico-green hover:underline"
            >
              Ver en Solscan <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={claim}
          disabled={claiming}
          className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {claiming ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Reclamando…
            </>
          ) : (
            <>
              <Gift className="size-4" />
              {claimableUsdc > 0
                ? `Reclamar $${claimableUsdc.toFixed(2)} USDC`
                : "Reclamar renta"}
            </>
          )}
        </button>
      )}
    </div>
  );
}
