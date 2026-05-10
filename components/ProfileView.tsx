"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Edit2,
  Save,
  KeyRound,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { useWalletAuth } from "@/lib/auth-context";
import { getProfile, setProfileName, clearProfile } from "@/lib/profile-store";
import { deleteLocalWallet } from "@/lib/wallet-local";
import { getActiveCluster } from "@/lib/cluster";
import { ProfilePrivyEmail } from "@/components/ProfilePrivyEmail";
import { ProfilePrivyLogout } from "@/components/ProfilePrivyLogout";
import { LogOut } from "lucide-react";

const PRIVY_ENABLED = !!process.env.NEXT_PUBLIC_PRIVY_APP_ID;

/**
 * Perfil del usuario logueado. Si no hay wallet → CTA para crear/abrir.
 * Si hay wallet → muestra pubkey, email Privy, nombre editable, eliminar wallet.
 * "Importar otra wallet" queda como link secundario (sigue accesible).
 */
export function ProfileView() {
  const { authed, source, pubkey } = useWalletAuth();
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState("");
  const [copied, setCopied] = useState(false);
  const cluster = typeof window !== "undefined" ? getActiveCluster() : "mainnet-beta";

  useEffect(() => {
    if (!pubkey) return;
    const p = getProfile(pubkey);
    setName(p?.name ?? "");
  }, [pubkey]);

  if (!authed) {
    return (
      <div className="panel flex flex-col items-center gap-4 p-8 text-center">
        <Shield className="size-10 text-tropico-mute" />
        <h2 className="font-display text-xl font-bold">Sin sesión activa</h2>
        <p className="max-w-sm text-sm text-tropico-mute">
          Para ver tu perfil necesitás crear una wallet o iniciar sesión con Privy.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/wallet/crear" className="btn-primary">
            Crear wallet
          </Link>
          <Link href="/wallet/abrir" className="btn-ghost">
            Abrir wallet existente
          </Link>
        </div>
      </div>
    );
  }

  function startEdit() {
    setTempName(name);
    setEditing(true);
  }
  function saveEdit() {
    if (!pubkey) return;
    setProfileName(pubkey, tempName);
    setName(tempName.trim());
    setEditing(false);
  }
  function cancelEdit() {
    setEditing(false);
    setTempName(name);
  }
  function copyPubkey() {
    if (!pubkey) return;
    navigator.clipboard.writeText(pubkey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  function deleteWallet() {
    if (
      !confirm(
        "¿Eliminar wallet de este device? Si no tenés tu secret key guardado NO podrás recuperarla."
      )
    )
      return;
    if (source === "local") deleteLocalWallet();
    if (source === "dev") localStorage.removeItem("tropico:dev-wallet");
    if (pubkey) clearProfile(pubkey);
    sessionStorage.removeItem("tropico:wallet:unlocked");
    window.location.href = "/";
  }

  const sourceLabel: Record<string, { txt: string; tone: string }> = {
    local: { txt: "Wallet local cifrada", tone: "text-tropico-sea bg-tropico-sea/10" },
    dev: { txt: "Wallet dev (devnet)", tone: "text-tropico-purple bg-tropico-purple/10" },
    privy: { txt: "Privy Embedded", tone: "text-tropico-sun bg-tropico-sun/10" },
  };
  const lbl = sourceLabel[source ?? "local"];

  return (
    <div className="flex flex-col gap-5">
      {/* Header perfil */}
      <header className="panel flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-tropico-sun via-tropico-coral to-tropico-purple text-2xl font-black text-tropico-ink">
            {(name || pubkey || "T").slice(0, 1).toUpperCase()}
          </div>
          <div className="flex flex-col">
            {editing ? (
              <div className="flex items-center gap-1.5">
                <input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Tu nombre"
                  maxLength={32}
                  className="rounded-md border border-tropico-border bg-tropico-ink/60 px-2 py-1 text-sm focus:border-tropico-sun focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={saveEdit}
                  className="rounded-md bg-tropico-green/15 p-1.5 text-tropico-green hover:bg-tropico-green/25"
                  aria-label="Guardar"
                >
                  <Save className="size-3.5" />
                </button>
                <button
                  onClick={cancelEdit}
                  className="rounded-md border border-tropico-border p-1.5 text-tropico-mute hover:text-tropico-text"
                  aria-label="Cancelar"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold">
                  {name || "Sin nombre"}
                </h1>
                <button
                  onClick={startEdit}
                  className="text-tropico-mute hover:text-tropico-sun"
                  aria-label="Editar nombre"
                >
                  <Edit2 className="size-3.5" />
                </button>
              </div>
            )}
            <span className={`mt-0.5 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${lbl.tone}`}>
              {lbl.txt}
            </span>
          </div>
        </div>
      </header>

      {/* Datos */}
      <section className="panel flex flex-col divide-y divide-tropico-border">
        <Row label="Pubkey Solana" icon={<User className="size-4 text-tropico-mute" />}>
          <div className="flex items-center gap-2">
            <code className="break-all font-mono text-xs text-tropico-text">
              {pubkey}
            </code>
            <button
              onClick={copyPubkey}
              className="shrink-0 text-tropico-mute hover:text-tropico-sun"
              aria-label="Copiar"
            >
              {copied ? (
                <Check className="size-3.5 text-tropico-green" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
            <a
              href={`https://solscan.io/account/${pubkey}${cluster === "devnet" ? "?cluster=devnet" : ""}`}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 text-tropico-mute hover:text-tropico-sea"
              aria-label="Ver en Solscan"
            >
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </Row>

        {PRIVY_ENABLED && source === "privy" && (
          <ProfilePrivyEmail />
        )}

        <Row
          label="Cluster activo"
          icon={<Shield className="size-4 text-tropico-mute" />}
        >
          <span className="text-sm font-semibold uppercase tracking-wider text-tropico-text">
            {cluster === "devnet" ? "Devnet" : "Mainnet"}
          </span>
        </Row>
      </section>

      {/* Acciones secundarias */}
      <section className="flex flex-col gap-2">
        <h3 className="px-1 text-xs font-bold uppercase tracking-wider text-tropico-mute">
          Acciones
        </h3>

        {/* Logout — varía según source */}
        {source === "privy" && PRIVY_ENABLED && <ProfilePrivyLogout />}
        {source === "local" && (
          <button
            onClick={() => {
              if (!confirm("¿Cerrar sesión? Tu wallet local sigue cifrada en este device.")) return;
              sessionStorage.removeItem("tropico:wallet:unlocked");
              window.dispatchEvent(new Event("tropico:auth-changed"));
              window.location.href = "/wallet/abrir";
            }}
            className="flex items-center gap-3 rounded-xl border border-tropico-border bg-tropico-ink/40 px-4 py-3 text-left text-sm text-tropico-text transition hover:border-tropico-sun"
          >
            <LogOut className="size-4 text-tropico-sun" />
            <span className="flex flex-col">
              <span className="font-semibold">Cerrar sesión</span>
              <span className="text-[11px] text-tropico-mute">
                Mantiene la wallet cifrada. Vas a necesitar tu password para volver a entrar.
              </span>
            </span>
          </button>
        )}

        <Link
          href="/wallet/abrir"
          className="flex items-center gap-3 rounded-xl border border-tropico-border bg-tropico-ink/40 px-4 py-3 text-sm text-tropico-text transition hover:border-tropico-sea"
        >
          <KeyRound className="size-4 text-tropico-sea" />
          <span className="flex flex-col">
            <span className="font-semibold">Importar otra wallet</span>
            <span className="text-[11px] text-tropico-mute">
              Pegá un secret key existente para usarla acá
            </span>
          </span>
        </Link>
      </section>

      {/* Zona peligro */}
      <section className="flex flex-col gap-2">
        <h3 className="px-1 text-xs font-bold uppercase tracking-wider text-tropico-coral">
          Zona peligro
        </h3>
        <button
          onClick={deleteWallet}
          className="flex items-center gap-3 rounded-xl border border-tropico-coral/30 bg-tropico-coral/5 px-4 py-3 text-left text-sm text-tropico-coral transition hover:bg-tropico-coral/10"
        >
          <Trash2 className="size-4" />
          <span className="flex flex-col">
            <span className="font-semibold">Eliminar wallet de este device</span>
            <span className="text-[11px] text-tropico-coral/70">
              Irreversible. Asegurate de tener tu secret key guardado.
            </span>
          </span>
        </button>
      </section>

      <p className="flex items-start gap-2 px-1 text-[11px] text-tropico-mute">
        <AlertTriangle className="mt-0.5 size-3 shrink-0" />
        Tu nombre se guarda solo en este device. Para el resto del mundo tu
        wallet sigue siendo solo una pubkey anónima.
      </p>
    </div>
  );
}

function Row({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3 md:items-center">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider text-tropico-mute">
          {label}
        </span>
      </div>
      <div className="flex max-w-[60%] items-center justify-end gap-2 md:max-w-[70%]">
        {children}
      </div>
    </div>
  );
}
