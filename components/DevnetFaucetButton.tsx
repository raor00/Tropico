"use client";

import { useState } from "react";
import {
  Sparkles,
  Check,
  Copy,
  ExternalLink,
  X,
  Droplets,
} from "lucide-react";
import { useWalletAuth } from "@/lib/auth-context";
import { setActiveCluster, getActiveCluster } from "@/lib/cluster";

/**
 * Botón "Modo demo · devnet" para jurados.
 *
 * NO usa fondos del deployer. Solo:
 *  1. Switchea cluster del usuario a devnet (persiste localStorage)
 *  2. Abre modal con su pubkey + links a faucets públicos:
 *     - faucet.solana.com → 1 SOL devnet (gas)
 *     - Circle USDC devnet faucet → 10 USDC devnet
 *  3. El juez fondea SU PROPIA wallet en 30 segundos sin pagar nada
 */
export function DevnetFaucetButton() {
  const { pubkey } = useWalletAuth();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function activate() {
    setActiveCluster("devnet");
    window.dispatchEvent(new Event("tropico:cluster-changed"));
    setOpen(true);
  }
  function copyPubkey() {
    if (!pubkey) return;
    navigator.clipboard.writeText(pubkey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const isDevnet = typeof window !== "undefined" && getActiveCluster() === "devnet";

  return (
    <>
      <button
        onClick={activate}
        disabled={!pubkey}
        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-tropico-purple/40 bg-gradient-to-r from-tropico-purple/15 to-tropico-sea/10 px-3 py-1.5 text-xs font-semibold text-tropico-purple transition hover:border-tropico-purple disabled:opacity-50"
        title="Switchea a devnet + cómo fondear tu wallet de pruebas"
      >
        <Sparkles className="size-3.5" />
        Modo demo · devnet
      </button>

      {open && pubkey && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm md:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="panel relative flex w-full max-w-md flex-col gap-4 rounded-2xl p-5"
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 text-tropico-mute hover:text-tropico-coral"
              aria-label="Cerrar"
            >
              <X className="size-4" />
            </button>

            <header className="flex items-center gap-2">
              <Droplets className="size-5 text-tropico-purple" />
              <h3 className="font-display text-lg font-bold">Modo demo activado</h3>
            </header>

            <div className="flex items-center gap-2 rounded-lg border border-tropico-green/30 bg-tropico-green/5 p-2 text-xs">
              <Check className="size-4 text-tropico-green" />
              <span className="text-tropico-green">
                Tu wallet ya está en <strong>devnet</strong>{!isDevnet ? " (refrescá la página si no ves el cambio)" : ""}
              </span>
            </div>

            <p className="text-sm text-tropico-mute">
              Para probar la app necesitás fondear tu wallet con tokens de prueba
              (sin valor real). Son 2 pasos rápidos:
            </p>

            {/* Pubkey */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-tropico-mute">
                Tu pubkey (copiala)
              </span>
              <div className="flex items-center gap-2 rounded-lg border border-tropico-border bg-tropico-ink/60 p-2">
                <code className="flex-1 break-all font-mono text-[11px] text-tropico-text">
                  {pubkey}
                </code>
                <button
                  onClick={copyPubkey}
                  className="shrink-0 rounded-md p-1.5 text-tropico-mute hover:bg-tropico-sun/10 hover:text-tropico-sun"
                  aria-label="Copiar"
                >
                  {copied ? (
                    <Check className="size-3.5 text-tropico-green" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Step 1: SOL faucet */}
            <FaucetStep
              num="1"
              title="Conseguí SOL devnet (para gas)"
              hint="Pegá tu pubkey en el faucet, recibís 1 SOL en ~5 segundos."
              cta="Abrir faucet.solana.com"
              href="https://faucet.solana.com"
              tone="sun"
            />

            {/* Step 2: USDC faucet */}
            <FaucetStep
              num="2"
              title="Conseguí USDC devnet (para enviar/cobrar)"
              hint="Circle te manda 10 USDC devnet a la pubkey que pegues."
              cta="Abrir Circle USDC faucet"
              href="https://faucet.circle.com"
              tone="green"
            />

            <p className="text-center text-[11px] text-tropico-mute">
              Listo. Volvé a la app, dale al refresh del saldo y vas a ver tu balance real on-chain.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function FaucetStep({
  num,
  title,
  hint,
  cta,
  href,
  tone,
}: {
  num: string;
  title: string;
  hint: string;
  cta: string;
  href: string;
  tone: "sun" | "green";
}) {
  const toneCls =
    tone === "sun"
      ? "border-tropico-sun/40 bg-tropico-sun/5 text-tropico-sun"
      : "border-tropico-green/40 bg-tropico-green/5 text-tropico-green";
  return (
    <div className="flex gap-3 rounded-xl border border-tropico-border bg-tropico-ink/40 p-3">
      <span className={`flex size-7 shrink-0 items-center justify-center rounded-full font-display text-sm font-black ${toneCls}`}>
        {num}
      </span>
      <div className="flex flex-1 flex-col gap-1.5">
        <h4 className="text-sm font-bold text-tropico-text">{title}</h4>
        <p className="text-[11px] leading-snug text-tropico-mute">{hint}</p>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className={`inline-flex w-fit items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition hover:opacity-90 ${toneCls}`}
        >
          {cta} <ExternalLink className="size-2.5" />
        </a>
      </div>
    </div>
  );
}
