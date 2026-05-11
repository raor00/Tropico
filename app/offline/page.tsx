"use client";

import {
  type PendingNonceTx,
  broadcastDemoTx,
  createDemoOfflineTx,
  getPendingQueue,
  removePendingTx,
} from "@/lib/durable-nonce";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info,
  Loader2,
  Plus,
  Trash2,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OfflinePage() {
  const [offline, setOffline] = useState(false);
  const [queue, setQueue] = useState<PendingNonceTx[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [toAddr, setToAddr] = useState("G4BPr...JSB");
  const [amount, setAmount] = useState("5");
  const [description, setDescription] = useState("Pago a Pancho Pérez");
  const [broadcasting, setBroadcasting] = useState<string | null>(null);

  function reload() {
    setQueue(getPendingQueue());
  }

  useEffect(() => {
    reload();
  }, []);

  function handleCreate() {
    createDemoOfflineTx(
      description || "Pago offline",
      toAddr || "G4BPreo5Sbcr9WDf7ykzJ3yHMBMNHwWacYYxzSs4GSJB",
      Number.parseFloat(amount) || 5,
    );
    reload();
    setShowCreate(false);
    setDescription("Pago a Pancho Pérez");
    setToAddr("G4BPr...JSB");
    setAmount("5");
  }

  async function handleBroadcast(id: string) {
    setBroadcasting(id);
    await broadcastDemoTx(id);
    reload();
    setBroadcasting(null);
  }

  function handleRemove(id: string) {
    removePendingTx(id);
    reload();
  }

  const pending = queue.filter(
    (t) => t.status === "pending" || t.status === "broadcasting",
  );
  const done = queue.filter(
    (t) => t.status === "confirmed" || t.status === "failed",
  );

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-5 py-10">
      <Link
        href="/home"
        className="w-fit text-sm text-tropico-mute transition hover:text-tropico-sun"
      >
        &larr; Volver
      </Link>

      {/* Header */}
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-tropico-sea to-tropico-purple">
            <WifiOff className="size-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">Pagos offline</h1>
            <p className="text-sm text-tropico-mute">
              Durable nonces — firma sin conexión, broadcast después
            </p>
          </div>
        </div>
      </header>

      {/* Concept card */}
      <div className="panel border-tropico-sea/30 bg-tropico-sea/5 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Info className="size-4 text-tropico-sea" />
          <span className="text-sm font-bold text-tropico-sea">
            ¿Cómo funciona?
          </span>
        </div>
        <div className="flex flex-col gap-2 text-sm text-tropico-mute">
          <p>
            Las txs normales de Solana usan un{" "}
            <code className="font-mono text-tropico-text">blockhash</code>{" "}
            reciente que{" "}
            <strong className="text-tropico-text">
              expira en ~90 segundos
            </strong>
            . Sin conexión, eso es un problema.
          </p>
          <p>
            Los <strong className="text-tropico-text">Durable Nonces</strong>{" "}
            son cuentas on-chain que almacenan un nonce que{" "}
            <strong className="text-tropico-text">no expira</strong>. La tx usa
            ese nonce como blockhash y puede ser firmada offline y enviada días
            después.
          </p>
          <div className="mt-1 grid gap-1 rounded-lg bg-tropico-ink/60 p-3 font-mono text-[11px]">
            <span className="text-tropico-purple">
              {"// 1. Agregar instrucción de advance"}
            </span>
            <span>
              {
                "tx.add(SystemProgram.nonceAdvance({ noncePubkey, authorizedPubkey }))"
              }
            </span>
            <span className="mt-1 text-tropico-purple">
              {"// 2. Usar nonce del NonceAccount como blockhash"}
            </span>
            <span>{"tx.recentBlockhash = nonceAccount.nonce"}</span>
            <span className="mt-1 text-tropico-purple">
              {"// 3. Firmar offline — no necesita RPC"}
            </span>
            <span>{"tx.sign(keypair)"}</span>
            <span className="mt-1 text-tropico-purple">
              {"// 4. Broadcast cuando vuelve la conexión"}
            </span>
            <span>{"conn.sendRawTransaction(tx.serialize())"}</span>
          </div>
        </div>
      </div>

      {/* Simulador modo apagón */}
      <div className="panel flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          {offline ? (
            <WifiOff className="size-5 text-tropico-coral" />
          ) : (
            <Wifi className="size-5 text-tropico-green" />
          )}
          <div>
            <p className="text-sm font-bold">
              {offline ? "Modo apagón activo" : "Conexión normal"}
            </p>
            <p className="text-[11px] text-tropico-mute">
              {offline
                ? "Simulando sin internet. Puedes crear txs firmadas para enviar después."
                : "Puedes crear txs offline y broadcast cuando quieras."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOffline((v) => !v)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            offline ? "bg-tropico-coral" : "bg-tropico-green/50"
          }`}
        >
          <span
            className={`size-5 rounded-full bg-white shadow transition-transform ${
              offline ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {/* Crear nueva tx */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-tropico-mute">
            Cola de txs firmadas
          </h2>
          <button
            type="button"
            onClick={() => setShowCreate((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-tropico-purple/40 bg-tropico-purple/10 px-3 py-1.5 text-xs font-semibold text-tropico-purple transition hover:bg-tropico-purple/20"
          >
            <Plus className="size-3.5" />
            Crear tx offline
          </button>
        </div>

        {showCreate && (
          <div className="panel flex flex-col gap-4 p-5">
            <p className="text-sm font-semibold text-tropico-text">
              Nueva tx firmada con nonce durable
            </p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-tropico-mute">
                  Descripción
                </label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-tropico-border bg-tropico-ink/60 px-3 py-2 text-sm focus:border-tropico-sun focus:outline-none"
                  placeholder="Ej: Pago a Pancho Pérez"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-tropico-mute">
                  Dirección destino
                </label>
                <input
                  value={toAddr}
                  onChange={(e) => setToAddr(e.target.value)}
                  className="w-full rounded-lg border border-tropico-border bg-tropico-ink/60 px-3 py-2 font-mono text-xs focus:border-tropico-sun focus:outline-none"
                  placeholder="Pubkey Solana"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-tropico-mute">
                  Monto USDC
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-tropico-border bg-tropico-ink/60 px-3 py-2 text-sm focus:border-tropico-sun focus:outline-none"
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCreate}
                className="btn-primary flex-1"
              >
                <Zap className="size-4" /> Firmar offline
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-xl border border-tropico-border px-4 py-2.5 text-sm text-tropico-mute hover:text-tropico-text"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Pendientes */}
        {pending.length === 0 && done.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-tropico-border p-8 text-center">
            <Clock className="size-8 text-tropico-mute/50" />
            <p className="text-sm text-tropico-mute">
              No hay txs en cola. Crea una tx offline para ver el flujo.
            </p>
          </div>
        ) : null}

        {pending.map((tx) => (
          <TxCard
            key={tx.id}
            tx={tx}
            offline={offline}
            onBroadcast={() => handleBroadcast(tx.id)}
            onRemove={() => handleRemove(tx.id)}
            isBroadcasting={broadcasting === tx.id}
          />
        ))}
      </section>

      {/* Historial */}
      {done.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-tropico-mute">
            Historial
          </h2>
          {done.map((tx) => (
            <TxCard
              key={tx.id}
              tx={tx}
              offline={offline}
              onBroadcast={() => {}}
              onRemove={() => handleRemove(tx.id)}
              isBroadcasting={false}
            />
          ))}
        </section>
      )}

      <div className="mt-2 flex items-start gap-2 rounded-xl border border-tropico-coral/20 bg-tropico-coral/5 p-4">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-tropico-coral" />
        <p className="text-xs text-tropico-mute">
          <strong className="text-tropico-text">Demo — </strong>
          El NonceAccount real se crea on-chain con{" "}
          <code className="font-mono text-tropico-purple">
            SystemProgram.createNonceAccount()
          </code>
          . El broadcast real usa{" "}
          <code className="font-mono">conn.sendRawTransaction()</code>.
          Producción Q3: integración completa con wallet local cifrada.
        </p>
      </div>
    </main>
  );
}

function TxCard({
  tx,
  offline,
  onBroadcast,
  onRemove,
  isBroadcasting,
}: {
  tx: PendingNonceTx;
  offline: boolean;
  onBroadcast: () => void;
  onRemove: () => void;
  isBroadcasting: boolean;
}) {
  const statusIcon = {
    pending: <Clock className="size-4 text-tropico-sun" />,
    broadcasting: (
      <Loader2 className="size-4 animate-spin text-tropico-purple" />
    ),
    confirmed: <CheckCircle2 className="size-4 text-tropico-green" />,
    failed: <AlertCircle className="size-4 text-tropico-coral" />,
  }[tx.status];

  const statusText = {
    pending: "Firmada · esperando conexión",
    broadcasting: "Enviando a la red…",
    confirmed: "Confirmada on-chain",
    failed: "Falló el broadcast",
  }[tx.status];

  return (
    <div className="panel flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {statusIcon}
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold text-tropico-text">
              {tx.description}
            </p>
            <p className="text-[11px] text-tropico-mute">{statusText}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm font-bold text-tropico-green">
            {tx.amountUsdc.toFixed(2)} USDC
          </span>
          {(tx.status === "confirmed" || tx.status === "failed") && (
            <button
              type="button"
              onClick={onRemove}
              className="text-tropico-mute hover:text-tropico-coral"
              aria-label="Eliminar"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-tropico-border bg-tropico-ink/60 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="block text-[9px] font-semibold uppercase tracking-wider text-tropico-mute">
              Nonce Account
            </span>
            <code className="text-[10px] text-tropico-purple">
              {tx.nonceAccount}
            </code>
          </div>
          <div className="text-right">
            <span className="block text-[9px] font-semibold uppercase tracking-wider text-tropico-mute">
              Nonce Hash
            </span>
            <code className="text-[10px] text-tropico-sea">
              {tx.nonceHash.slice(0, 16)}…
            </code>
          </div>
        </div>
      </div>

      {tx.status === "confirmed" && tx.signature && (
        <a
          href={`https://solscan.io/tx/${tx.signature}?cluster=devnet`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-tropico-green hover:underline"
        >
          Ver en Solscan <ExternalLink className="size-3" />
        </a>
      )}

      {tx.status === "pending" && (
        <button
          type="button"
          onClick={onBroadcast}
          disabled={offline || isBroadcasting}
          className="btn-primary inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isBroadcasting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Enviando…
            </>
          ) : offline ? (
            <>
              <WifiOff className="size-4" /> Sin conexión — esperando
            </>
          ) : (
            <>
              <Wifi className="size-4" /> Broadcast ahora
            </>
          )}
        </button>
      )}

      <p className="text-[10px] text-tropico-mute">
        Firmada el {new Date(tx.createdAt).toLocaleString("es-VE")}
      </p>
    </div>
  );
}
