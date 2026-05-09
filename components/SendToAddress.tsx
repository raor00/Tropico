"use client";

import { useEffect, useState } from "react";
import { Send, AlertTriangle, CheckCircle2, ExternalLink, Eye, EyeOff, Loader2 } from "lucide-react";
import { unlockLocalWallet, hasLocalWallet, getLocalWalletPubkey } from "@/lib/wallet-local";
import { sendSplToken, isValidPubkey, type SendResult } from "@/lib/send-tx";
import { getActiveCluster } from "@/lib/cluster";
import { Keypair } from "@solana/web3.js";

/**
 * SendToAddress — envío directo a wallet address (no claim link).
 * Pide password para desbloquear keypair, firma tx SPL Token, broadcast.
 */
export function SendToAddress() {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<"USDC" | "SOL">("USDC");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [walletReady, setWalletReady] = useState(false);
  const [cluster, setCluster] = useState("mainnet-beta");

  useEffect(() => {
    setWalletReady(hasLocalWallet() || !!localStorage.getItem("tropico:dev-wallet"));
    setCluster(getActiveCluster());
  }, []);

  async function getActiveKeypair(): Promise<Keypair | null> {
    // Try local wallet first (necesita password)
    if (hasLocalWallet()) {
      if (!password) {
        setResult({ ok: false, error: "Password requerido para desbloquear wallet local" });
        return null;
      }
      const kp = await unlockLocalWallet(password);
      if (!kp) {
        setResult({ ok: false, error: "Password incorrecto" });
        return null;
      }
      return kp;
    }
    // Dev wallet (sin password — almacenada plain en localStorage)
    try {
      const dev = JSON.parse(localStorage.getItem("tropico:dev-wallet") ?? "null");
      if (!dev?.secretKey || !Array.isArray(dev.secretKey)) {
        setResult({ ok: false, error: "Dev wallet inválida" });
        return null;
      }
      return Keypair.fromSecretKey(new Uint8Array(dev.secretKey));
    } catch {
      setResult({ ok: false, error: "Error leyendo dev wallet" });
      return null;
    }
  }

  async function handleSend() {
    setResult(null);
    if (!isValidPubkey(destination.trim())) {
      setResult({ ok: false, error: "Pubkey destino inválida — debe ser base58 32-44 chars" });
      return;
    }
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setResult({ ok: false, error: "Monto debe ser positivo" });
      return;
    }
    setBusy(true);
    const kp = await getActiveKeypair();
    if (!kp) {
      setBusy(false);
      return;
    }
    const r = await sendSplToken(kp, destination.trim(), token, amt);
    setResult(r);
    setBusy(false);
    if (r.ok) {
      setAmount("");
      setPassword("");
    }
  }

  if (!walletReady) {
    return (
      <div className="panel p-4 text-center text-sm text-tropico-mute">
        Crea una wallet primero en /wallet/crear para poder enviar USDC.
      </div>
    );
  }

  const fromPubkey = getLocalWalletPubkey() ?? "Dev wallet";
  const needsPassword = hasLocalWallet();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 rounded-lg border border-tropico-sea/30 bg-tropico-sea/5 p-2 text-xs">
        <Send className="size-3.5 text-tropico-sea" />
        <span className="text-tropico-mute">
          Enviando desde{" "}
          <code className="text-tropico-sun">
            {fromPubkey.slice(0, 6)}…{fromPubkey.slice(-4)}
          </code>{" "}
          en {cluster === "devnet" ? "DEVNET" : "MAINNET"}
        </span>
      </div>

      {/* Token selector */}
      <div className="grid grid-cols-2 gap-2 rounded-lg border border-tropico-border bg-tropico-ink/40 p-1">
        <button
          onClick={() => setToken("USDC")}
          className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
            token === "USDC"
              ? "bg-tropico-sea/15 text-tropico-sea"
              : "text-tropico-mute hover:text-tropico-text"
          }`}
        >
          USDC
        </button>
        <button
          onClick={() => setToken("SOL")}
          className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
            token === "SOL"
              ? "bg-tropico-purple/15 text-tropico-purple"
              : "text-tropico-mute hover:text-tropico-text"
          }`}
        >
          SOL
        </button>
      </div>

      {/* Destino */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-tropico-mute">
          Wallet destino (pubkey)
        </label>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Ej. 7xKXt..."
          className="rounded-lg border border-tropico-border bg-tropico-ink/60 px-4 py-3 font-mono text-sm focus:border-tropico-sea focus:outline-none"
          autoComplete="off"
        />
      </div>

      {/* Monto */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-tropico-mute">
          Monto en {token}
        </label>
        <div className="flex items-center gap-2 rounded-lg border border-tropico-border bg-tropico-ink/60 px-4 py-3">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="flex-1 bg-transparent text-2xl font-bold focus:outline-none"
          />
          <span className="text-sm font-semibold text-tropico-mute">{token}</span>
        </div>
      </div>

      {/* Password — solo si wallet local */}
      {needsPassword && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-tropico-mute">
            Password para firmar
          </label>
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-tropico-border bg-tropico-ink/60 px-4 py-3 pr-12 text-sm focus:border-tropico-sea focus:outline-none"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-tropico-mute hover:text-tropico-sea"
            >
              {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Resultado */}
      {result && !result.ok && (
        <div className="panel flex items-start gap-3 border-tropico-coral/30 bg-tropico-coral/5 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-tropico-coral" />
          <div className="text-sm text-tropico-mute">
            <strong className="text-tropico-coral">Error</strong>: {result.error}
          </div>
        </div>
      )}
      {result && result.ok && (
        <div className="panel flex flex-col gap-2 border-tropico-green/30 bg-tropico-green/5 p-4">
          <header className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-tropico-green" />
            <strong className="text-tropico-green">Tx confirmada on-chain</strong>
          </header>
          <code className="break-all text-[11px] text-tropico-mute">{result.signature}</code>
          <a
            href={result.explorer}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-tropico-sea underline hover:text-tropico-sun"
          >
            Ver en Solscan <ExternalLink className="size-3" />
          </a>
        </div>
      )}

      {/* Botón */}
      <button
        onClick={handleSend}
        disabled={busy || !destination || !amount || (needsPassword && !password)}
        className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {busy ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Firmando + broadcast…
          </>
        ) : (
          <>
            <Send className="size-4" /> Enviar {amount || "0"} {token}
          </>
        )}
      </button>

      <p className="text-center text-xs text-tropico-mute">
        Tu password descifra la llave privada SOLO en este browser para firmar.
        La tx se broadcast directo a Solana, Tropico no toca llaves.
      </p>
    </div>
  );
}
