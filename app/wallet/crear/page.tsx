"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Header } from "@/components/Header";
import { createLocalWallet, hasLocalWallet } from "@/lib/wallet-local";
import {
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  ArrowRight,
  Download,
} from "lucide-react";

type Step = "password" | "backup" | "confirm" | "done";

export default function CrearWalletPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("password");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [pubkey, setPubkey] = useState("");
  const [seedHex, setSeedHex] = useState("");
  const [confirmedBackup, setConfirmedBackup] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    setError("");
    if (password.length < 8) {
      setError("Password debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPwd) {
      setError("Las passwords no coinciden.");
      return;
    }
    if (hasLocalWallet()) {
      setError(
        "Ya tienes una wallet creada en este navegador. Si quieres una nueva, ve a /wallet/abrir o borra la actual."
      );
      return;
    }
    setBusy(true);
    try {
      const { wallet, secretKeyHex } = await createLocalWallet(password);
      setPubkey(wallet.publicKey);
      setSeedHex(secretKeyHex);
      setStep("backup");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function copySeed() {
    navigator.clipboard.writeText(seedHex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadSeed() {
    const blob = new Blob(
      [
        `Tropico Wallet — Backup Recovery\n\nPubkey: ${pubkey}\nCreated: ${new Date().toISOString()}\n\nSecret Key (64 bytes hex):\n${seedHex}\n\n⚠️ NUNCA compartas este archivo. Cualquiera con este secret key controla tu wallet.\n\nPara recuperar: ve a /wallet/abrir → "Importar wallet" → pega el secret key + tu password.\n`,
      ],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tropico-wallet-${pubkey.slice(0, 8)}-backup.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-6 px-5 py-10">
      <Header badge={{ label: "Crear wallet", tone: "sun" }} />

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 pt-4">
        {(["password", "backup", "confirm", "done"] as Step[]).map((s, i) => {
          const active = ["password", "backup", "confirm", "done"].indexOf(step) >= i;
          return (
            <div
              key={s}
              className={`h-1.5 w-12 rounded-full transition ${
                active ? "bg-tropico-sun" : "bg-tropico-border"
              }`}
            />
          );
        })}
      </div>

      {/* STEP 1 — PASSWORD */}
      {step === "password" && (
        <section className="panel flex flex-col gap-5 p-6">
          <header className="flex flex-col gap-2">
            <KeyRound className="size-8 text-tropico-sun" strokeWidth={1.5} />
            <h1 className="font-display text-2xl font-bold">
              Crea tu wallet en este navegador
            </h1>
            <p className="text-sm text-tropico-mute">
              Tu wallet vive en TU dispositivo, encriptada con tu password. Tropico no
              guarda tus llaves en ningún servidor — ni nosotros ni nadie puede acceder
              a tus fondos.
            </p>
          </header>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-tropico-mute">
              Password (mínimo 8 caracteres)
            </label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-tropico-border bg-tropico-ink/60 px-4 py-3 pr-12 text-sm focus:border-tropico-sun focus:outline-none"
                placeholder="••••••••"
                autoComplete="new-password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-tropico-mute hover:text-tropico-sun"
                aria-label={showPwd ? "Ocultar password" : "Mostrar password"}
              >
                {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <input
              type={showPwd ? "text" : "password"}
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              className="rounded-lg border border-tropico-border bg-tropico-ink/60 px-4 py-3 text-sm focus:border-tropico-sun focus:outline-none"
              placeholder="Confirma password"
              autoComplete="new-password"
            />
            {error && (
              <p className="text-xs text-tropico-coral" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-tropico-coral/30 bg-tropico-coral/5 p-3 text-xs text-tropico-mute">
            <strong className="text-tropico-coral">Importante:</strong> NO existe
            recovery por email. Si pierdes la password Y el seed phrase, perdés tu
            plata para siempre. En el siguiente paso te damos un backup para que
            guardes en lugar seguro.
          </div>

          <button
            onClick={handleCreate}
            disabled={busy || !password || !confirmPwd}
            className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {busy ? "Creando..." : "Crear wallet"}{" "}
            {!busy && <ArrowRight className="size-4" />}
          </button>

          <p className="text-center text-xs text-tropico-mute">
            ¿Ya tienes wallet?{" "}
            <Link href="/wallet/abrir" className="text-tropico-sun underline">
              Abre con tu password
            </Link>
          </p>
        </section>
      )}

      {/* STEP 2 — BACKUP SEED */}
      {step === "backup" && (
        <section className="panel flex flex-col gap-5 border-tropico-sun/40 p-6">
          <header className="flex flex-col gap-2">
            <Download className="size-8 text-tropico-sun" strokeWidth={1.5} />
            <h1 className="font-display text-2xl font-bold">
              Guarda tu backup AHORA
            </h1>
            <p className="text-sm text-tropico-mute">
              Esto es la única vez que mostramos tu secret key. Cópialo a un lugar
              seguro (1Password, Bitwarden, papel guardado bajo llave). Sin esto NO
              hay recovery posible.
            </p>
          </header>

          <div className="rounded-lg border border-tropico-border bg-tropico-ink/80 p-4">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-tropico-mute">
              Secret Key (64 bytes hex)
            </div>
            <code className="block break-all font-mono text-[11px] leading-relaxed text-tropico-sun">
              {seedHex}
            </code>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={copySeed}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-tropico-border bg-tropico-ink/40 py-2.5 text-sm font-semibold transition hover:border-tropico-sun"
            >
              {copied ? (
                <>
                  <Check className="size-4 text-tropico-sea" /> Copiado
                </>
              ) : (
                <>
                  <Copy className="size-4" /> Copiar
                </>
              )}
            </button>
            <button
              onClick={downloadSeed}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-tropico-border bg-tropico-ink/40 py-2.5 text-sm font-semibold transition hover:border-tropico-sun"
            >
              <Download className="size-4" /> Descargar .txt
            </button>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-tropico-coral/30 bg-tropico-coral/5 p-3 text-xs">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-tropico-coral" />
            <div className="text-tropico-mute">
              <strong className="text-tropico-coral">JAMÁS</strong> compartas este
              secret key con nadie. Tropico nunca te lo va a pedir. Cualquiera con
              este número controla tu wallet por completo.
            </div>
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmedBackup}
              onChange={(e) => setConfirmedBackup(e.target.checked)}
              className="mt-1 size-4 cursor-pointer accent-tropico-sun"
            />
            <span className="text-sm text-tropico-text">
              Guardé mi secret key en un lugar seguro y entiendo que sin esto NO hay
              recovery.
            </span>
          </label>

          <button
            onClick={() => {
              // Marca wallet como desbloqueada en sessionStorage para que AuthCTA
              // muestre "Mi wallet" en lugar de "Abrir wallet"
              sessionStorage.setItem("tropico:wallet:unlocked", "1");
              setStep("done");
            }}
            disabled={!confirmedBackup}
            className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            Continuar a mi wallet <ArrowRight className="size-4" />
          </button>
        </section>
      )}

      {/* STEP 4 — DONE — accesos directos a todos los módulos */}
      {step === "done" && (
        <section className="flex flex-col gap-4">
          <div className="panel flex flex-col items-center gap-4 border-tropico-sea/40 bg-tropico-sea/5 p-6 text-center">
            <ShieldCheck
              className="size-14 text-tropico-sea"
              strokeWidth={1.5}
            />
            <div>
              <h1 className="font-display text-2xl font-bold">¡Wallet lista! 🌴</h1>
              <p className="mt-1 text-sm text-tropico-mute">
                Tu wallet vive en este navegador, encriptada con tu password. Lista
                para recibir, cambiar, cobrar, mandar y guardar.
              </p>
            </div>
            <div className="w-full rounded-lg border border-tropico-border bg-tropico-ink/60 p-3 text-left">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-tropico-mute">
                  Tu pubkey
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(pubkey);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1800);
                  }}
                  className="inline-flex items-center gap-1 text-[10px] text-tropico-sun hover:underline"
                >
                  {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
              <code className="block break-all font-mono text-[11px] leading-relaxed text-tropico-sun">
                {pubkey}
              </code>
            </div>
            <button
              onClick={() => router.push("/home")}
              className="btn-primary inline-flex items-center justify-center gap-2 w-full"
            >
              Ir a mi wallet <ArrowRight className="size-4" />
            </button>
          </div>

          {/* Accesos directos a los 8 módulos */}
          <div className="panel flex flex-col gap-3 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-tropico-mute">
              Empieza por aquí
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
              {[
                { href: "/depositar", label: "💰 Depositar" },
                { href: "/cobrar", label: "📱 Cobrar QR" },
                { href: "/cambiar", label: "↔️ Cambiar" },
                { href: "/enviar", label: "📤 Enviar" },
                { href: "/guardar", label: "🌱 Guardar" },
                { href: "/remesas", label: "🌐 Remesas" },
                { href: "/pagar-servicios", label: "⚡ Servicios" },
                { href: "/carlos", label: "🤖 Carlos AI" },
              ].map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  className="rounded-lg border border-tropico-border bg-tropico-ink/40 px-3 py-2.5 text-center font-medium text-tropico-text transition hover:border-tropico-sun hover:text-tropico-sun"
                >
                  {m.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 text-center text-xs text-tropico-mute sm:flex-row sm:justify-center sm:gap-4">
            <a
              href={`https://solscan.io/account/${pubkey}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-tropico-sun"
            >
              Verificar en Solscan →
            </a>
            <Link href="/wallet/abrir" className="hover:text-tropico-sun">
              Iniciar sesión / cambiar wallet
            </Link>
          </div>
        </section>
      )}

      <footer className="mt-auto text-center text-xs text-tropico-mute">
        100% non-custodial · cero servidor · encriptado AES-GCM 256 + PBKDF2
      </footer>
    </main>
  );
}
