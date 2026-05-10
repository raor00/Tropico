"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Send,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Users,
  X,
} from "lucide-react";
import { unlockLocalWallet, hasLocalWallet, getLocalWalletPubkey } from "@/lib/wallet-local";
import {
  sendWithSigner,
  makeKeypairSigner,
  isValidPubkey,
  type SendResult,
  type Signer,
} from "@/lib/send-tx";
import { getActiveCluster } from "@/lib/cluster";
import {
  listContacts,
  recordSend,
  deleteContact,
  type Contact,
} from "@/lib/contacts";
import { Keypair, type Transaction } from "@solana/web3.js";

/**
 * Privy signer inyectado: address + closure que firma una Transaction.
 * Si el wrapper Privy resuelve uno, lo pasamos abajo y SendToAddress lo usa
 * sin necesidad de password (la auth ya pasó al login con Privy).
 */
export type PrivySignerInjected = {
  address: string;
  signTransaction: (tx: Transaction) => Promise<Transaction>;
};

/**
 * SendToAddress — envío directo a wallet address (no claim link).
 * Pide password para desbloquear keypair, firma tx SPL Token, broadcast.
 */
export function SendToAddress({
  privySigner,
}: { privySigner?: PrivySignerInjected | null } = {}) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<"USDC" | "SOL">("USDC");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [walletReady, setWalletReady] = useState(false);
  const [cluster, setCluster] = useState("mainnet-beta");
  const [ownerPubkey, setOwnerPubkey] = useState<string>("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactName, setContactName] = useState("");
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [pendingSavePubkey, setPendingSavePubkey] = useState<string>("");

  useEffect(() => {
    const hasLocal = hasLocalWallet();
    const hasDev = !!localStorage.getItem("tropico:dev-wallet");
    const hasPrivy = !!privySigner?.address;
    setWalletReady(hasLocal || hasDev || hasPrivy);
    setCluster(getActiveCluster());
    const me =
      privySigner?.address ??
      getLocalWalletPubkey() ??
      (() => {
        try {
          const dev = JSON.parse(localStorage.getItem("tropico:dev-wallet") ?? "null");
          return dev?.publicKey ?? "";
        } catch {
          return "";
        }
      })();
    setOwnerPubkey(me);
    if (me) setContacts(listContacts(me));
  }, [privySigner?.address]);

  function refreshContacts() {
    if (ownerPubkey) setContacts(listContacts(ownerPubkey));
  }

  // Match para autocomplete: contactos cuyo pubkey o nombre matchean lo escrito
  const suggestions = useMemo(() => {
    const q = destination.trim().toLowerCase();
    if (q.length < 2) return contacts.slice(0, 5);
    return contacts
      .filter(
        (c) =>
          c.pubkey.toLowerCase().includes(q) ||
          c.name?.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [destination, contacts]);

  async function getActiveSigner(): Promise<Signer | null> {
    // Privy embedded — no necesita password
    if (privySigner?.address && privySigner?.signTransaction) {
      return {
        type: "privy",
        address: privySigner.address,
        signTransaction: privySigner.signTransaction,
      };
    }
    // Local wallet (necesita password para descifrar)
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
      return makeKeypairSigner(kp);
    }
    // Dev wallet
    try {
      const dev = JSON.parse(localStorage.getItem("tropico:dev-wallet") ?? "null");
      if (!dev?.secretKey || !Array.isArray(dev.secretKey)) {
        setResult({ ok: false, error: "Dev wallet inválida" });
        return null;
      }
      return makeKeypairSigner(Keypair.fromSecretKey(new Uint8Array(dev.secretKey)));
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
    const signer = await getActiveSigner();
    if (!signer) {
      setBusy(false);
      return;
    }
    const dest = destination.trim();
    const r = await sendWithSigner(signer, dest, token, amt);
    setResult(r);
    setBusy(false);
    if (r.ok) {
      setAmount("");
      setPassword("");
      // Triggera prompt para guardar contacto (si aún no tiene nombre)
      if (ownerPubkey) {
        const existing = contacts.find((c) => c.pubkey === dest);
        if (!existing?.name) {
          setPendingSavePubkey(dest);
          setShowSavePrompt(true);
        } else {
          // Solo incrementa contador, mantiene nombre
          recordSend(ownerPubkey, dest);
          refreshContacts();
        }
      }
    }
  }

  function confirmSaveContact() {
    if (!ownerPubkey || !pendingSavePubkey) return;
    recordSend(ownerPubkey, pendingSavePubkey, contactName.trim() || undefined);
    setContactName("");
    setPendingSavePubkey("");
    setShowSavePrompt(false);
    refreshContacts();
  }

  function dismissSavePrompt() {
    if (ownerPubkey && pendingSavePubkey) {
      // Aún registramos el contacto sin nombre (para historial)
      recordSend(ownerPubkey, pendingSavePubkey);
      refreshContacts();
    }
    setContactName("");
    setPendingSavePubkey("");
    setShowSavePrompt(false);
  }

  function pickContact(c: Contact) {
    setDestination(c.pubkey);
  }

  function removeContact(pubkey: string) {
    if (!ownerPubkey) return;
    deleteContact(ownerPubkey, pubkey);
    refreshContacts();
  }

  if (!walletReady) {
    return (
      <div className="panel p-4 text-center text-sm text-tropico-mute">
        Crea una wallet primero en /wallet/crear para poder enviar USDC.
      </div>
    );
  }

  const fromPubkey =
    privySigner?.address ?? getLocalWalletPubkey() ?? "Dev wallet";
  // Solo wallet local (cifrada) requiere password. Privy + dev no.
  const needsPassword = !privySigner?.address && hasLocalWallet();

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

      {/* Destino + autocomplete contactos */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-tropico-mute">
          Wallet destino (pubkey)
        </label>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Ej. 7xKXt... o escribí el nombre que le pusiste"
          className="rounded-lg border border-tropico-border bg-tropico-ink/60 px-4 py-3 font-mono text-sm focus:border-tropico-sea focus:outline-none"
          autoComplete="off"
        />
        {suggestions.length > 0 && destination !== "" && !suggestions.some((c) => c.pubkey === destination) && (
          <ul className="flex flex-col gap-1 rounded-lg border border-tropico-border bg-tropico-ink/40 p-1">
            {suggestions.map((c) => (
              <li key={c.pubkey}>
                <button
                  type="button"
                  onClick={() => pickContact(c)}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-xs hover:bg-tropico-sea/10"
                >
                  <span className="flex flex-col">
                    <span className="font-semibold text-tropico-text">
                      {c.name ?? `${c.pubkey.slice(0, 6)}…${c.pubkey.slice(-4)}`}
                    </span>
                    <span className="font-mono text-[10px] text-tropico-mute">
                      {c.pubkey.slice(0, 8)}…{c.pubkey.slice(-6)} · {c.sentCount} envío{c.sentCount === 1 ? "" : "s"}
                    </span>
                  </span>
                  <Users className="size-3 text-tropico-mute" />
                </button>
              </li>
            ))}
          </ul>
        )}
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

      {/* Lista de contactos guardados (solo si hay) */}
      {contacts.length > 0 && (
        <section className="panel mt-2 flex flex-col gap-2 p-3">
          <header className="flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tropico-mute">
              <Users className="size-3.5" /> Tus contactos ({contacts.length})
            </h4>
            <span className="text-[10px] text-tropico-mute">
              Solo en este device · privado
            </span>
          </header>
          <ul className="flex flex-col gap-1">
            {contacts.slice(0, 6).map((c) => (
              <li
                key={c.pubkey}
                className="group flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-tropico-ink/40"
              >
                <button
                  type="button"
                  onClick={() => pickContact(c)}
                  className="flex flex-1 flex-col text-left"
                >
                  <span className="text-sm font-semibold text-tropico-text">
                    {c.name ?? "(sin nombre)"}
                  </span>
                  <span className="font-mono text-[10px] text-tropico-mute">
                    {c.pubkey.slice(0, 8)}…{c.pubkey.slice(-6)}
                  </span>
                </button>
                <span className="text-[10px] text-tropico-mute">
                  {c.sentCount}×
                </span>
                <button
                  type="button"
                  onClick={() => removeContact(c.pubkey)}
                  className="opacity-0 transition group-hover:opacity-100"
                  aria-label="Borrar contacto"
                >
                  <X className="size-3.5 text-tropico-coral" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Modal: guardar destinatario después de envío exitoso */}
      {showSavePrompt && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4"
          onClick={dismissSavePrompt}
        >
          <div
            className="panel flex max-w-sm flex-col gap-3 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center gap-2">
              <Users className="size-5 text-tropico-sea" />
              <h3 className="text-base font-bold text-tropico-text">
                ¿Guardar destinatario?
              </h3>
            </header>
            <p className="text-xs text-tropico-mute">
              Ponele un nombre privado para reconocerlo después. El nombre se
              queda solo en TU device, nadie más lo ve.
            </p>
            <code className="block break-all rounded-md bg-tropico-ink/50 p-2 font-mono text-[10px] text-tropico-mute">
              {pendingSavePubkey}
            </code>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Ej. Mamá, Bodegón Caracas, Pedro freelance"
              maxLength={40}
              className="rounded-lg border border-tropico-border bg-tropico-ink/60 px-3 py-2 text-sm focus:border-tropico-sea focus:outline-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={dismissSavePrompt}
                className="flex-1 rounded-lg border border-tropico-border px-3 py-2 text-sm text-tropico-mute hover:text-tropico-text"
              >
                Sin nombre
              </button>
              <button
                onClick={confirmSaveContact}
                className="btn-primary flex-1"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
