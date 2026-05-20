"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Send,
} from "lucide-react";
import { useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getActiveCluster, getActiveRpcUrl } from "@/lib/cluster";
import { makeKeypairSigner, type Signer } from "@/lib/send-tx";
import { unlockLocalWallet } from "@/lib/wallet-local";
import { buildTransferShareTx } from "@/lib/realestate-program";

type Props = {
  propertyId: string;
  propertyName: string;
  sharesOwned: number;
  signer: Signer | null;
  localPubkey: string | null;
  onTransferred?: () => void;
};

export function ShareTransferCard({
  propertyId,
  propertyName,
  sharesOwned,
  signer,
  localPubkey,
  onTransferred,
}: Props) {
  const [open, setOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [password, setPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ explorer?: string; onchain: boolean } | null>(null);

  const cluster = getActiveCluster();
  const num = parseInt(amount) || 0;
  const needsPassword = !signer && !!localPubkey;
  const canRealTx = !!signer || !!localPubkey;

  function requestSend() {
    setError(null);
    try {
      new PublicKey(recipient.trim());
    } catch {
      setError("Dirección de destino inválida");
      return;
    }
    if (num <= 0 || num > sharesOwned) {
      setError(`Cantidad inválida (1–${sharesOwned})`);
      return;
    }
    if (needsPassword && !password) {
      setError("Ingresa la contraseña de tu wallet");
      return;
    }
    setShowConfirm(true);
  }

  async function execute() {
    setShowConfirm(false);
    setError(null);
    setSending(true);

    // Demo mode (sin wallet real)
    if (!canRealTx) {
      await new Promise((r) => setTimeout(r, 800));
      setConfirmed({ onchain: false });
      setSending(false);
      return;
    }

    try {
      let activeSigner: Signer | null = signer;
      if (!activeSigner && localPubkey) {
        const kp = await unlockLocalWallet(password);
        if (!kp) {
          setError("Contraseña incorrecta");
          setSending(false);
          return;
        }
        activeSigner = makeKeypairSigner(kp);
      }
      if (!activeSigner) {
        setError("No hay wallet disponible");
        setSending(false);
        return;
      }

      const owner = new PublicKey(activeSigner.address);
      const dest = new PublicKey(recipient.trim());
      const tx = await buildTransferShareTx(propertyId, owner, dest, BigInt(num));

      const conn = new Connection(getActiveRpcUrl(), "confirmed");
      let sig: string;
      if (activeSigner.type === "keypair") {
        tx.sign(activeSigner.kp);
        sig = await conn.sendRawTransaction(tx.serialize());
      } else {
        const signed = await activeSigner.signTransaction(tx);
        sig = await conn.sendRawTransaction(signed.serialize());
      }
      await conn.confirmTransaction(sig, "confirmed");

      setConfirmed({
        onchain: true,
        explorer: `https://solscan.io/tx/${sig}${cluster === "devnet" ? "?cluster=devnet" : ""}`,
      });
      setRecipient("");
      setAmount("");
      setPassword("");
      onTransferred?.();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  if (confirmed) {
    return (
      <div className="panel flex flex-col gap-1 border-tropico-green/30 bg-tropico-green/5 p-3">
        <div className="flex items-center gap-2 text-sm text-tropico-green">
          <CheckCircle2 className="size-4" />
          <span>¡Acciones transferidas!</span>
          {!confirmed.onchain && <span className="text-[10px] text-tropico-mute">(demo)</span>}
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
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-1.5 rounded-lg border border-tropico-border bg-tropico-ink/40 py-2 text-xs font-semibold transition hover:border-tropico-sea"
      >
        <ArrowUpRight className="size-3.5" /> Transferir acciones
      </button>
    );
  }

  return (
    <div className="panel flex flex-col gap-3 p-4">
      <header className="flex items-center gap-2">
        <Send className="size-4 text-tropico-sea" />
        <span className="text-sm font-semibold text-tropico-text">Transferir acciones</span>
        <span className="ml-auto text-[11px] text-tropico-mute">{sharesOwned} disponibles</span>
      </header>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`dest-${propertyId}`} className="text-[11px] uppercase tracking-wider text-tropico-mute">
          Dirección de destino
        </label>
        <input
          id={`dest-${propertyId}`}
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Pubkey Solana del destinatario"
          className="h-10 rounded-md border border-tropico-border bg-tropico-ink px-3 font-mono text-xs focus:border-tropico-sea focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`amt-${propertyId}`} className="text-[11px] uppercase tracking-wider text-tropico-mute">
          Cantidad de acciones
        </label>
        <input
          id={`amt-${propertyId}`}
          type="number"
          min="1"
          max={sharesOwned}
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="h-10 rounded-md border border-tropico-border bg-tropico-ink px-3 text-sm focus:border-tropico-sea focus:outline-none"
        />
      </div>

      {needsPassword && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`pwd-${propertyId}`} className="text-[11px] uppercase tracking-wider text-tropico-mute">
            Contraseña de tu wallet local
          </label>
          <input
            id={`pwd-${propertyId}`}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-10 rounded-md border border-tropico-border bg-tropico-ink px-3 text-sm focus:border-tropico-sea focus:outline-none"
          />
        </div>
      )}

      {error && (
        <p className="rounded-md border border-tropico-coral/30 bg-tropico-coral/5 p-2 text-xs text-tropico-coral">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-lg border border-tropico-border bg-tropico-ink/40 py-2 text-sm font-semibold transition hover:border-tropico-mute"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={requestSend}
          disabled={sending}
          className="btn-primary inline-flex flex-1 items-center justify-center gap-2 py-2 text-sm disabled:opacity-50"
        >
          {sending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Enviando…
            </>
          ) : (
            <>
              <Send className="size-4" /> Transferir
            </>
          )}
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="panel flex w-full max-w-sm flex-col gap-4 border-tropico-sea/30 p-5">
            <header className="flex items-center gap-2">
              <Send className="size-5 text-tropico-sea" />
              <strong className="text-tropico-text">Confirmar transferencia</strong>
            </header>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-tropico-mute">Inmueble</span>
                <span className="text-right font-semibold text-tropico-text">{propertyName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-tropico-mute">Acciones</span>
                <span className="font-semibold text-tropico-text">{num}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-tropico-mute">Destino</span>
                <span className="break-all font-mono text-[11px] text-tropico-text">{recipient.trim()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-tropico-mute">Red</span>
                <span className="font-mono text-xs uppercase text-tropico-text">{cluster}</span>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-md border border-tropico-sun/30 bg-tropico-sun/5 p-2 text-[11px] text-tropico-sun">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              <span>Transferencia on-chain irreversible. Verifica la dirección de destino.</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-lg border border-tropico-border bg-tropico-ink/40 py-2 text-sm font-semibold transition hover:border-tropico-mute"
              >
                Cancelar
              </button>
              <button type="button" onClick={execute} className="btn-primary flex-1 py-2 text-sm">
                Confirmar y enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
