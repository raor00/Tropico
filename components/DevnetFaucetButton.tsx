"use client";

import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import { useWalletAuth } from "@/lib/auth-context";
import { setActiveCluster } from "@/lib/cluster";

/**
 * Botón "Modo demo · red devnet" para que el jurado pueda probar end-to-end:
 *  1. Switchea cluster a devnet
 *  2. POST /api/devnet-faucet → server mintea 100 TROPI + manda 0.05 SOL gas
 *  3. Refresca balances + abre SOL faucet en nueva tab para más SOL si quieren
 */
export function DevnetFaucetButton() {
  const { pubkey } = useWalletAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<
    | { ok: true; tropiSig: string; solSig?: string }
    | { ok: false; error: string }
    | null
  >(null);

  async function trigger() {
    if (!pubkey) {
      setResult({ ok: false, error: "Necesitás wallet activa primero." });
      return;
    }
    setLoading(true);
    setResult(null);
    setActiveCluster("devnet");
    window.dispatchEvent(new Event("tropico:cluster-changed"));
    try {
      const res = await fetch("/api/devnet-faucet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pubkey }),
      });
      const data = await res.json();
      if (!data.ok) {
        setResult({ ok: false, error: data.error ?? "Error" });
      } else {
        setResult({
          ok: true,
          tropiSig: data.tropi.signature,
          solSig: data.sol?.signature,
        });
        // Trigger re-fetch balances en HomeBalances
        window.dispatchEvent(new Event("tropico:cluster-changed"));
      }
    } catch (e) {
      setResult({ ok: false, error: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={trigger}
        disabled={loading || !pubkey}
        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-tropico-purple/40 bg-gradient-to-r from-tropico-purple/15 to-tropico-sea/10 px-3 py-1.5 text-xs font-semibold text-tropico-purple transition hover:border-tropico-purple disabled:opacity-50"
        title="Switchea a devnet + recibe 100 TROPI + 0.05 SOL para probar la app"
      >
        {loading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Sparkles className="size-3.5" />
        )}
        {loading ? "Configurando demo…" : "Modo demo · devnet"}
      </button>

      {result && !result.ok && (
        <p className="flex items-start gap-1.5 text-[11px] text-tropico-coral">
          <AlertTriangle className="mt-0.5 size-3 shrink-0" /> {result.error}
        </p>
      )}
      {result && result.ok && (
        <div className="flex flex-col gap-1 rounded-md border border-tropico-green/30 bg-tropico-green/5 p-2 text-[11px]">
          <span className="flex items-center gap-1.5 font-semibold text-tropico-green">
            <CheckCircle2 className="size-3" /> Demo lista — 100 TROPI + SOL gas en tu wallet devnet
          </span>
          <a
            href={`https://solscan.io/tx/${result.tropiSig}?cluster=devnet`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-tropico-sea underline"
          >
            Ver mint en Solscan <ExternalLink className="size-2.5" />
          </a>
        </div>
      )}
    </div>
  );
}
