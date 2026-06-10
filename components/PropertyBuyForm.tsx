"use client";

import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Radio,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { getActiveCluster, getActiveRpcUrl } from "@/lib/cluster"; // O5: merged
import { makeKeypairSigner } from "@/lib/send-tx";
import { hasLocalWallet, getLocalWalletPubkey, unlockLocalWallet } from "@/lib/wallet-local";
import { buildBuySharesTx } from "@/lib/realestate-program";
import { calcPrimaryFee } from "@/lib/realestate-yield";
import type { PropertyInfo } from "@/lib/properties";
import type { PrivySignerInjected } from "./BsSwapForm";
import { Connection, PublicKey, Transaction } from "@solana/web3.js"; // C7: Transaction imported

// CRIXTO_FEE_ATA / TROPICO_FEE_ATA env vars removed — fee wallets are now
// fetched from on-chain RegistryConfig inside buildBuySharesTx.

type Props = {
  property: PropertyInfo;
  privySigner?: PrivySignerInjected | null;
  onBought?: () => void; // F1
};

export function PropertyBuyForm({ property: p, privySigner = null, onBought }: Props) {
  const [numShares, setNumShares] = useState("");
  const [executing, setExecuting] = useState(false);
  const [password, setPassword] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{
    txSig: string;
    onchain: boolean;
    explorer?: string;
    cluster?: string;
    numShares: number;
    totalPaid: number;
  } | null>(null);

  const cluster = getActiveCluster();
  const localPubkey =
    typeof window !== "undefined" && hasLocalWallet()
      ? getLocalWalletPubkey()
      : null;

  // O6: wrapped in useMemo
  const canDoRealTx = useMemo(
    () => !!(privySigner || localPubkey),
    [privySigner, localPubkey],
  );

  const sharesNum = parseInt(numShares) || 0;
  const available = p.totalShares - p.sharesSold;

  const quote = useMemo(() => {
    if (!sharesNum || sharesNum <= 0) return null;
    const subtotal = sharesNum * p.pricePerShare;
    const { fee, crixtoFee, tropicoFee, total } = calcPrimaryFee(subtotal);
    return { subtotal, fee, crixtoFee, tropicoFee, total };
  }, [sharesNum, p.pricePerShare]);

  const kycOk = true; // Fase 0: KYC toggle admin, siempre true en demo

  function requestBuy() {
    if (!quote || !kycOk || sharesNum <= 0 || sharesNum > available) return;
    setTxError(null);
    // Wallet local: pedir contraseña antes de mostrar la confirmación
    if (canDoRealTx && !privySigner && localPubkey && !password) {
      setNeedsPassword(true);
      return;
    }
    setShowConfirm(true);
  }

  async function execute() {
    if (!quote || !kycOk) return;
    setShowConfirm(false);
    setTxError(null);
    setExecuting(true);

    // Demo mode (sin wallet)
    if (!canDoRealTx) {
      await new Promise((r) => setTimeout(r, 900));
      setConfirmed({
        txSig: `DEMO_${Math.random().toString(36).slice(2, 14)}`,
        onchain: false,
        numShares: sharesNum,
        totalPaid: quote.total,
      });
      setExecuting(false);
      setNumShares("");
      return;
    }

    try {
      // C6: unlock ONCE, derive investor, reuse kp for signing
      // C1: use makeKeypairSigner consistent with ShareTransferCard
      // C7: signedTx typed as Transaction
      let signedTx!: Transaction;
      const conn = new Connection(getActiveRpcUrl(), "confirmed");

      if (privySigner) {
        const investor = new PublicKey(privySigner.address);
        const tx = await buildBuySharesTx(p.id, investor, BigInt(sharesNum));
        signedTx = await privySigner.signTransaction(tx as any);
      } else {
        if (!password) {
          setNeedsPassword(true);
          setExecuting(false);
          return;
        }
        // C6: single unlock call
        const kp = await unlockLocalWallet(password);
        if (!kp) {
          setTxError("Contraseña incorrecta");
          setExecuting(false);
          return;
        }
        const investor = kp.publicKey;
        // C1: makeKeypairSigner — consistent with ShareTransferCard
        const localSigner = makeKeypairSigner(kp);
        const tx = await buildBuySharesTx(p.id, investor, BigInt(sharesNum));
        if (localSigner.type === "keypair") tx.sign(localSigner.kp);
        signedTx = tx;
      }

      const sig = await conn.sendRawTransaction(signedTx.serialize());
      await conn.confirmTransaction(sig, "confirmed");

      setConfirmed({
        txSig: sig,
        onchain: true,
        explorer: `https://solscan.io/tx/${sig}${cluster === "devnet" ? "?cluster=devnet" : ""}`,
        cluster,
        numShares: sharesNum,
        totalPaid: quote.total,
      });
      setNumShares("");
      setPassword("");
      setNeedsPassword(false);

      // Fire-and-forget treasury fee recording — failure must never surface to the user.
      fetch("/api/treasury/record-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature: sig, module: "RealEstate" }),
      }).catch(() => {});

      onBought?.(); // F1
    } catch (e) {
      setTxError((e as Error).message);
    } finally {
      setExecuting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2 rounded-lg border border-tropico-sea/30 bg-tropico-sea/5 px-4 py-3">
        <Building2 className="size-4 text-tropico-sea" strokeWidth={1.75} />
        <div>
          <p className="text-sm font-semibold text-tropico-sea">
            Comprar acciones
          </p>
          <p className="text-[11px] text-tropico-mute">
            {p.name} · ${p.pricePerShare} USDC / acción · {available.toLocaleString()} disponibles
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="shares-input"
          className="text-xs font-semibold uppercase tracking-wider text-tropico-mute"
        >
          Número de acciones
        </label>
        <div className="flex items-center gap-2 rounded-lg border border-tropico-border bg-tropico-ink/60 px-4 py-3">
          <input
            id="shares-input"
            type="number"
            value={numShares}
            onChange={(e) => {
              setNumShares(e.target.value);
              setConfirmed(null);
            }}
            placeholder="0"
            min="1"
            max={available}
            step="1"
            className="flex-1 bg-transparent text-2xl font-bold focus:outline-none"
          />
          <span className="text-sm font-semibold text-tropico-mute">acciones</span>
        </div>
        <p className="text-[11px] text-tropico-mute">
          = {sharesNum * p.pricePerShare > 0 ? `$${(sharesNum * p.pricePerShare).toFixed(2)}` : "$0"} USDC
          subtotal antes de fees
        </p>
      </div>

      {/* Quote — fee desglosado */}
      {quote && (
        <div className="panel flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-tropico-mute">Subtotal ({sharesNum} acc. × ${p.pricePerShare})</span>
            <span className="font-semibold">${quote.subtotal.toFixed(2)}</span>
          </div>
          <div className="border-t border-tropico-border pt-2">
            <p className="mb-1.5 text-[10px] uppercase tracking-wider text-tropico-mute">
              Fee venta primaria — 1.5% sobre el precio
            </p>
            <div className="flex items-center justify-between text-xs text-tropico-mute">
              <span>Crixto (90 bps)</span>
              <span className="text-tropico-text">+${quote.crixtoFee.toFixed(4)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-tropico-mute">
              <span>Trópico (60 bps)</span>
              <span className="text-tropico-text">+${quote.tropicoFee.toFixed(4)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-tropico-mute">
              <span>Fee total</span>
              <span className="text-tropico-text">+${quote.fee.toFixed(4)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-tropico-border pt-2 text-sm">
            <span className="font-semibold text-tropico-text">Total a pagar</span>
            <span className="font-display text-xl font-bold text-tropico-sea">
              ${quote.total.toFixed(2)} USDC
            </span>
          </div>
          <p className="text-[10px] text-tropico-mute">
            El SPV recibe ${quote.subtotal.toFixed(2)} limpios (100% del precio).
          </p>
        </div>
      )}

      {/* KYC gate — Fase 0: siempre verde (toggle admin) */}
      <div className="flex items-center gap-2 rounded-md border border-tropico-sea/20 bg-tropico-sea/5 p-2 text-[11px] text-tropico-mute">
        <ShieldCheck className="size-3.5 text-tropico-sea" />
        <span>KYC verificado por Crixto · acceso habilitado</span>
      </div>

      {/* Badge onchain/demo */}
      {quote && (
        <div
          className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] ${
            canDoRealTx
              ? "border-tropico-green/30 bg-tropico-green/5 text-tropico-green"
              : "border-tropico-border bg-tropico-ink/40 text-tropico-mute"
          }`}
        >
          <Radio className="size-3" />
          {canDoRealTx ? (
            <span>
              <strong>{cluster === "devnet" ? "Devnet onchain" : "Onchain"}</strong> · tx real firmada
            </span>
          ) : (
            <span>
              <strong>Demo</strong> · conecta wallet para tx real
            </span>
          )}
        </div>
      )}

      {/* Password modal */}
      {needsPassword && !privySigner && (
        <div className="flex flex-col gap-2 rounded-md border border-tropico-sun/30 bg-tropico-sun/5 p-3">
          <label htmlFor="buy-pwd" className="text-xs font-semibold text-tropico-sun">
            Contraseña de tu wallet local
          </label>
          <input
            id="buy-pwd"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-10 rounded-md border border-tropico-border bg-tropico-ink px-3 text-sm focus:border-tropico-sun focus:outline-none"
          />
        </div>
      )}

      {/* Error */}
      {txError && (
        <div className="panel flex items-start gap-3 border-tropico-coral/30 bg-tropico-coral/5 p-3 text-xs">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-tropico-coral" />
          <span className="text-tropico-coral">{txError}</span>
        </div>
      )}

      {/* Botón */}
      <button
        type="button"
        onClick={requestBuy}
        disabled={!quote || sharesNum > available || executing}
        className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {executing ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Comprando…
          </>
        ) : (
          <>
            <Building2 className="size-4" />
            Comprar {sharesNum > 0 ? `${sharesNum} acción${sharesNum !== 1 ? "es" : ""}` : "acciones"}
          </>
        )}
      </button>

      {/* Modal de confirmación de compra */}
      {showConfirm && quote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="panel flex w-full max-w-sm flex-col gap-4 border-tropico-sea/30 p-5">
            <header className="flex items-center gap-2">
              <Building2 className="size-5 text-tropico-sea" />
              <strong className="text-tropico-text">Confirmar compra</strong>
            </header>

            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-tropico-mute">Inmueble</span>
                <span className="text-right font-semibold text-tropico-text">{p.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-tropico-mute">Acciones</span>
                <span className="font-semibold text-tropico-text">{sharesNum}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-tropico-mute">Subtotal</span>
                <span className="text-tropico-text">${quote.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-tropico-mute">Fee (1.5%)</span>
                <span className="text-tropico-text">+${quote.fee.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-tropico-border pt-2">
                <span className="font-semibold text-tropico-text">Total a pagar</span>
                <span className="font-display text-lg font-bold text-tropico-sea">
                  ${quote.total.toFixed(2)} USDC
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-tropico-mute">Red</span>
                <span className="font-mono text-xs uppercase text-tropico-text">
                  {cluster}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-md border border-tropico-sun/30 bg-tropico-sun/5 p-2 text-[11px] text-tropico-sun">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              <span>
                Vas a firmar una transacción on-chain. Una vez confirmada es irreversible.
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-lg border border-tropico-border bg-tropico-ink/40 py-2 text-sm font-semibold transition hover:border-tropico-mute"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={execute}
                className="btn-primary flex-1 py-2 text-sm"
              >
                Confirmar y comprar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación */}
      {confirmed && (
        <div className="panel flex flex-col gap-2 border-tropico-green/30 bg-tropico-green/5 p-4">
          <header className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-tropico-green" />
            <strong className="text-tropico-green">¡Acciones compradas!</strong>
            {confirmed.onchain && (
              <span className="rounded-full border border-tropico-green/40 bg-tropico-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-tropico-green">
                {confirmed.cluster ?? "onchain"} · real
              </span>
            )}
          </header>
          <p className="text-sm text-tropico-text">
            <strong className="text-tropico-green">{confirmed.numShares} acciones</strong> de {p.name} por{" "}
            <strong>${confirmed.totalPaid.toFixed(2)} USDC</strong>.
          </p>
          {confirmed.explorer ? (
            <a
              href={confirmed.explorer}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-tropico-green hover:underline"
            >
              Ver en Solscan <ExternalLink className="size-3" />
            </a>
          ) : (
            <code className="break-all text-[10px] text-tropico-mute">{confirmed.txSig}</code>
          )}
        </div>
      )}

      {/* GuacamaAI note */}
      <div className="flex items-start gap-2 rounded-md border border-tropico-purple/20 bg-tropico-purple/5 p-3 text-xs">
        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-tropico-purple" />
        <div className="text-tropico-mute">
          <strong className="text-tropico-purple">GuacamaAI</strong> monitorea tu portafolio
          de inmuebles, te avisa cuando hay renta disponible, y podés consultar tu posición
          directamente por WhatsApp.
        </div>
      </div>
    </div>
  );
}
