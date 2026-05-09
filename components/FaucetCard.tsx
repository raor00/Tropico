"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Droplet, Copy, Check } from "lucide-react";
import { hasLocalWallet, getLocalWalletPubkey } from "@/lib/wallet-local";

/**
 * FaucetCard — link directo al Circle USDC devnet faucet.
 * No es mock — abre el faucet REAL de Circle con tu pubkey copiada al clipboard.
 */
export function FaucetCard() {
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (hasLocalWallet()) {
      setPubkey(getLocalWalletPubkey());
      return;
    }
    try {
      const dev = JSON.parse(localStorage.getItem("tropico:dev-wallet") ?? "null");
      if (dev?.publicKey) setPubkey(dev.publicKey);
    } catch {}
  }, []);

  function copyAndOpen() {
    if (!pubkey) return;
    navigator.clipboard.writeText(pubkey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    window.open("https://faucet.circle.com/", "_blank", "noopener,noreferrer");
  }

  function copyOnly() {
    if (!pubkey) return;
    navigator.clipboard.writeText(pubkey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!mounted) return null;

  return (
    <section className="panel flex flex-col gap-2 border-tropico-green/30 bg-tropico-green/5 p-4">
      <header className="flex items-center gap-2">
        <Droplet className="size-4 text-tropico-green" strokeWidth={1.75} />
        <h3 className="text-sm font-semibold">Faucet de prueba (devnet)</h3>
        <span className="ml-auto rounded-full bg-tropico-coral/15 px-2 py-0.5 text-[9px] font-bold uppercase text-tropico-coral">
          Devnet
        </span>
      </header>
      <p className="text-xs text-tropico-mute">
        Recibe USDC test gratis para probar Tropico sin gastar dinero real. Funciona
        sólo en devnet.
      </p>

      {pubkey ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 rounded-lg border border-tropico-border bg-tropico-ink/60 p-2">
            <code className="truncate text-[11px] text-tropico-sun">{pubkey}</code>
            <button
              onClick={copyOnly}
              className="inline-flex items-center gap-1 text-[10px] text-tropico-mute hover:text-tropico-sun"
            >
              {copied ? (
                <>
                  <Check className="size-3" /> Copiado
                </>
              ) : (
                <>
                  <Copy className="size-3" /> Copiar
                </>
              )}
            </button>
          </div>
          <button
            onClick={copyAndOpen}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-tropico-green px-3 py-2 text-xs font-bold text-tropico-ink transition hover:opacity-90"
          >
            <ExternalLink className="size-3.5" />
            Abrir Circle Faucet (USDC devnet)
          </button>
          <ol className="text-[11px] text-tropico-mute">
            <li>1. Copia tu pubkey ↑</li>
            <li>2. Click "Abrir Circle Faucet" → elige Solana Devnet</li>
            <li>3. Pega tu pubkey + Submit → te llegan 10 USDC test</li>
            <li>4. Vuelve a Tropico, cambia cluster a DEVNET (badge en /home), refresh</li>
          </ol>
        </div>
      ) : (
        <p className="text-xs text-tropico-mute">
          Crea tu wallet primero en /wallet/crear, después puedes reclamar el faucet.
        </p>
      )}
    </section>
  );
}
