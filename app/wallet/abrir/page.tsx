"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import {
  hasLocalWallet,
  getLocalWalletPubkey,
  unlockLocalWallet,
  importLocalWallet,
  deleteLocalWallet,
} from "@/lib/wallet-local";
import {
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  Trash2,
  Upload,
} from "lucide-react";

type Mode = "unlock" | "import";

export default function AbrirWalletPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("unlock");
  const [exists, setExists] = useState(false);
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [seedHex, setSeedHex] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const has = hasLocalWallet();
    setExists(has);
    setPubkey(getLocalWalletPubkey());
    if (!has) setMode("import");
  }, []);

  async function handleUnlock() {
    setError("");
    setBusy(true);
    try {
      const kp = await unlockLocalWallet(password);
      if (!kp) {
        setError("Password incorrecto.");
        return;
      }
      // Wallet desbloqueada — guardar marca de sesión + ir a /home
      sessionStorage.setItem("tropico:wallet:unlocked", "1");
      router.push("/home");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleImport() {
    setError("");
    if (password.length < 8) {
      setError("Password debe tener al menos 8 caracteres.");
      return;
    }
    setBusy(true);
    try {
      const w = await importLocalWallet(seedHex.trim(), password);
      setPubkey(w.publicKey);
      sessionStorage.setItem("tropico:wallet:unlocked", "1");
      router.push("/home");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function handleDelete() {
    if (
      !confirm(
        "¿Seguro? Esto borra la wallet de este navegador. Si no tienes el secret key guardado, NO podrás recuperarla."
      )
    )
      return;
    deleteLocalWallet();
    setExists(false);
    setPubkey(null);
    setMode("import");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-6 px-5 py-10">
      <Header badge={{ label: "Abrir wallet", tone: "sun" }} />

      <section className="panel flex flex-col gap-5 p-6">
        <header className="flex flex-col gap-2">
          <KeyRound className="size-8 text-tropico-sun" strokeWidth={1.5} />
          <h1 className="font-display text-2xl font-bold">
            {mode === "unlock" ? "Desbloquea tu wallet" : "Importa una wallet existente"}
          </h1>
          <p className="text-sm text-tropico-mute">
            {mode === "unlock"
              ? "Tu wallet vive cifrada en este navegador. Mete tu password para abrirla."
              : "Pega tu secret key (64 bytes hex) + define una password nueva."}
          </p>
        </header>

        {/* Tab switcher si hay wallet */}
        {exists && (
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-tropico-border bg-tropico-ink/40 p-1">
            <button
              onClick={() => setMode("unlock")}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                mode === "unlock"
                  ? "bg-tropico-sun/15 text-tropico-sun"
                  : "text-tropico-mute hover:text-tropico-text"
              }`}
            >
              Esta wallet
            </button>
            <button
              onClick={() => setMode("import")}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                mode === "import"
                  ? "bg-tropico-sun/15 text-tropico-sun"
                  : "text-tropico-mute hover:text-tropico-text"
              }`}
            >
              Importar otra
            </button>
          </div>
        )}

        {/* UNLOCK */}
        {mode === "unlock" && exists && (
          <>
            {pubkey && (
              <div className="rounded-lg border border-tropico-border bg-tropico-ink/60 p-3">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-tropico-mute">
                  Wallet en este navegador
                </div>
                <code className="break-all font-mono text-xs text-tropico-sun">
                  {pubkey}
                </code>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-tropico-border bg-tropico-ink/60 px-4 py-3 pr-12 text-sm focus:border-tropico-sun focus:outline-none"
                  placeholder="Password"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-tropico-mute hover:text-tropico-sun"
                >
                  {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {error && <p className="text-xs text-tropico-coral">{error}</p>}
            </div>
            <button
              onClick={handleUnlock}
              disabled={busy || !password}
              className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {busy ? "Abriendo..." : "Desbloquear"}{" "}
              {!busy && <ArrowRight className="size-4" />}
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center justify-center gap-2 text-xs text-tropico-mute hover:text-tropico-coral"
            >
              <Trash2 className="size-3" /> Borrar wallet de este navegador
            </button>
          </>
        )}

        {/* IMPORT */}
        {mode === "import" && (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-tropico-mute">
                Secret key (128 caracteres hex)
              </label>
              <textarea
                value={seedHex}
                onChange={(e) => setSeedHex(e.target.value)}
                className="resize-none rounded-lg border border-tropico-border bg-tropico-ink/60 px-4 py-3 font-mono text-[11px] focus:border-tropico-sun focus:outline-none"
                placeholder="Pega tu secret key hex aquí..."
                rows={4}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-tropico-mute">
                Password nueva (mín. 8 caracteres)
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-tropico-border bg-tropico-ink/60 px-4 py-3 pr-12 text-sm focus:border-tropico-sun focus:outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-tropico-mute hover:text-tropico-sun"
                >
                  {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {error && <p className="text-xs text-tropico-coral">{error}</p>}
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-tropico-coral/30 bg-tropico-coral/5 p-3 text-xs text-tropico-mute">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-tropico-coral" />
              <span>
                Importar va a sobrescribir cualquier wallet existente en este
                navegador. Si tenés otra abierta, asegurate de tener su backup antes.
              </span>
            </div>
            <button
              onClick={handleImport}
              disabled={busy || !seedHex || !password}
              className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {busy ? "Importando..." : "Importar y abrir"}{" "}
              {!busy && <Upload className="size-4" />}
            </button>
          </>
        )}

        <p className="text-center text-xs text-tropico-mute">
          ¿No tienes wallet?{" "}
          <Link href="/wallet/crear" className="text-tropico-sun underline">
            Crea una nueva
          </Link>
        </p>
      </section>

      <footer className="mt-auto text-center text-xs text-tropico-mute">
        Encriptado AES-GCM 256 + PBKDF2-SHA256 100k iterations · todo en este browser
      </footer>
    </main>
  );
}
