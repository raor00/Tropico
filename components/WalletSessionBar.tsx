"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Wallet as WalletIcon,
  LogOut,
  ArrowLeftRight,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import {
  hasLocalWallet,
  getLocalWalletPubkey,
  deleteLocalWallet,
} from "@/lib/wallet-local";

/**
 * WalletSessionBar — barra de sesión que aparece en /home y rutas autenticadas.
 *
 * Detecta wallet activa (local, dev devnet, o Privy) y muestra:
 *  - Pubkey truncada (copy + Solscan link)
 *  - Indicador de tipo de wallet (Local / Privy / Dev)
 *  - Dropdown con: Cambiar wallet · Cerrar sesión · Borrar wallet
 *
 * En móvil se compacta a un único pill clickeable.
 */
type WalletSource = "local" | "privy" | "dev" | null;

export function WalletSessionBar() {
  const [source, setSource] = useState<WalletSource>(null);
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    refresh();
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function refresh() {
    if (hasLocalWallet()) {
      setSource("local");
      setPubkey(getLocalWalletPubkey());
      return;
    }
    const dev = localStorage.getItem("tropico:dev-wallet");
    if (dev) {
      try {
        const parsed = JSON.parse(dev) as { publicKey: string };
        setSource("dev");
        setPubkey(parsed.publicKey);
        return;
      } catch {}
    }
    setSource(null);
    setPubkey(null);
  }

  function copyPubkey() {
    if (!pubkey) return;
    navigator.clipboard.writeText(pubkey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function lockSession() {
    sessionStorage.removeItem("tropico:wallet:unlocked");
    window.location.href = "/wallet/abrir";
  }

  function deleteWallet() {
    if (
      !confirm(
        "¿Borrar wallet de este navegador? Si no tienes el secret key guardado, NO podrás recuperarla."
      )
    )
      return;
    if (source === "local") deleteLocalWallet();
    else localStorage.removeItem("tropico:dev-wallet");
    sessionStorage.removeItem("tropico:wallet:unlocked");
    window.location.href = "/";
  }

  // Sin wallet → CTA crear/abrir
  if (!source || !pubkey) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-tropico-sun/40 bg-tropico-sun/5 px-3 py-1.5 text-xs">
        <WalletIcon className="size-3.5 text-tropico-sun" />
        <span className="text-tropico-mute">Sin wallet activa</span>
        <Link
          href="/wallet/crear"
          className="rounded-full bg-tropico-sun px-2.5 py-0.5 font-semibold text-tropico-ink hover:opacity-90"
        >
          Crear
        </Link>
        <Link
          href="/wallet/abrir"
          className="text-tropico-sun hover:underline"
        >
          o Abrir
        </Link>
      </div>
    );
  }

  const truncated = `${pubkey.slice(0, 4)}…${pubkey.slice(-4)}`;
  const sourceLabel =
    source === "local"
      ? { txt: "Local", color: "text-tropico-sea", bg: "bg-tropico-sea/15" }
      : source === "dev"
      ? { txt: "Dev devnet", color: "text-tropico-purple", bg: "bg-tropico-purple/15" }
      : { txt: "Privy", color: "text-tropico-sun", bg: "bg-tropico-sun/15" };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-tropico-border bg-tropico-ink/60 px-3 py-1.5 text-xs transition hover:border-tropico-sun"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span
          className={`flex size-6 items-center justify-center rounded-full ${sourceLabel.bg}`}
        >
          <WalletIcon className={`size-3 ${sourceLabel.color}`} />
        </span>
        <code className="font-mono text-tropico-text">{truncated}</code>
        <span
          className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${sourceLabel.bg} ${sourceLabel.color}`}
        >
          {sourceLabel.txt}
        </span>
        <ChevronDown
          className={`size-3 text-tropico-mute transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="menu"
            className="absolute right-0 top-full z-40 mt-2 flex w-72 max-w-[calc(100vw-2rem)] flex-col gap-1 rounded-xl border border-tropico-border bg-tropico-ink/95 p-2 shadow-xl backdrop-blur-xl"
          >
            <div className="rounded-lg border border-tropico-border/60 bg-tropico-ink/60 p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-tropico-mute">
                  Pubkey
                </span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${sourceLabel.bg} ${sourceLabel.color}`}
                >
                  {sourceLabel.txt}
                </span>
              </div>
              <code className="block break-all font-mono text-[11px] leading-relaxed text-tropico-sun">
                {pubkey}
              </code>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={copyPubkey}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-tropico-border bg-tropico-ink/40 py-1.5 text-[11px] font-medium transition hover:border-tropico-sun"
                >
                  {copied ? (
                    <>
                      <Check className="size-3 text-tropico-sea" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" /> Copiar
                    </>
                  )}
                </button>
                <a
                  href={`https://solscan.io/account/${pubkey}${
                    source === "dev" ? "?cluster=devnet" : ""
                  }`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-tropico-border bg-tropico-ink/40 py-1.5 text-[11px] font-medium transition hover:border-tropico-sun"
                >
                  Solscan <ExternalLink className="size-3" />
                </a>
              </div>
            </div>

            <Link
              href="/wallet/abrir"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-tropico-text transition hover:bg-tropico-sun/10 hover:text-tropico-sun"
              role="menuitem"
            >
              <ArrowLeftRight className="size-4" />
              Cambiar / importar wallet
            </Link>

            {source === "local" && (
              <button
                onClick={lockSession}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-tropico-text transition hover:bg-tropico-sun/10 hover:text-tropico-sun"
                role="menuitem"
              >
                <LogOut className="size-4" />
                Cerrar sesión (mantener wallet)
              </button>
            )}

            <button
              onClick={deleteWallet}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-tropico-coral transition hover:bg-tropico-coral/10"
              role="menuitem"
            >
              <LogOut className="size-4" />
              Borrar wallet de este navegador
            </button>

            <p className="px-3 pt-1 text-[10px] text-tropico-mute">
              Borrar es irreversible. Asegúrate de tener tu secret key guardado.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
