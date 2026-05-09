"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { DualPrice } from "@/components/DualPrice";
import {
  ArrowDownUp,
  Shuffle,
  Bot,
  Clock,
  CheckCircle2,
  Sparkles,
  Droplets,
  Users,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  closeEpoch,
  generateIntentId,
  getPoolState,
  P2P_CONFIG,
  type SwapIntent,
  type Epoch,
} from "@/lib/p2p-swap";

type Side = "sell-bs" | "buy-bs";

export default function IntercambioP2PPage() {
  const [side, setSide] = useState<Side>("sell-bs");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<SwapIntent[]>([]);
  const [pool, setPool] = useState(getPoolState());
  const [countdown, setCountdown] = useState(P2P_CONFIG.EPOCH_DURATION_MS / 1000);

  // Epoch countdown
  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((c) => (c <= 1 ? P2P_CONFIG.EPOCH_DURATION_MS / 1000 : c - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Mock match cuando epoch cierra
  useEffect(() => {
    if (countdown !== P2P_CONFIG.EPOCH_DURATION_MS / 1000) return;
    setHistory((h) =>
      h.map((i) => {
        if (i.status !== "pending") return i;
        // mock match: 70% peer, 30% pool
        const isPool = Math.random() < 0.3;
        return {
          ...i,
          status: "matched",
          match: {
            counterparty: isPool ? "liquidity-pool" : "user",
            counterpartyId: isPool ? "POOL" : `user_${Math.random().toString(36).slice(2, 10)}`,
            epochId: `epoch_${Date.now()}`,
            rate: 36.42,
            bsAmount: i.side === "sell-bs" ? i.amount : i.amount * 36.42,
            usdcAmount: i.side === "sell-bs" ? i.amount / 36.42 : i.amount,
            settledAt: new Date().toISOString(),
            txSignature: `DEMO_${Math.random().toString(36).slice(2, 14)}`,
          },
        };
      })
    );
  }, [countdown]);

  function submit() {
    if (!amount || Number(amount) <= 0) return;
    setSubmitting(true);
    const intent: SwapIntent = {
      id: generateIntentId(),
      wallet: "Mer7Gh...DEMO",
      side,
      amount: Number(amount),
      rateLimit: 0,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    setHistory((h) => [intent, ...h]);
    setAmount("");
    setSubmitting(false);
  }

  const sideLabel = side === "sell-bs" ? "Bs → USDC" : "USDC → Bs";
  const inputCurrency = side === "sell-bs" ? "Bs" : "USDC";

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-8 px-5 py-10">
      <Header badge={{ label: "P2P Swap", tone: "sea" }} />

      {/* Hero */}
      <header className="flex flex-col gap-3 pt-4">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-tropico-sea/30 bg-tropico-sea/5 px-3 py-1 text-xs font-semibold text-tropico-sea">
          <Shuffle className="size-3" /> Matching aleatorio · todos iguales
        </span>
        <h1 className="font-display text-3xl font-bold md:text-5xl">
          Intercambia Bs ↔ USDC
          <br />
          <span className="text-tropico-sea">on-chain, en segundos.</span>
        </h1>
        <p className="max-w-3xl text-tropico-mute">
          Postea tu intent. Cada 10 segundos cerramos un epoch, randomizamos el orden
          y matcheamos parejas peer-to-peer. Si no hay contraparte directa, la
          liquidity pool de Tropico cubre el flujo. <strong className="text-tropico-text">
          Capital grande no compra prioridad — todos tienen la misma chance.</strong>
        </p>
      </header>

      {/* Stats grid */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          {
            Icon: Clock,
            big: `${countdown}s`,
            label: "Próximo epoch",
            color: "text-tropico-sun",
          },
          {
            Icon: Droplets,
            big: `${(pool.bsAvailable / 1_000_000).toFixed(1)}M Bs`,
            label: "Pool disponible",
            color: "text-tropico-sea",
          },
          {
            Icon: Users,
            big: history.filter((i) => i.status === "pending").length.toString(),
            label: "Intents en epoch",
            color: "text-tropico-coral",
          },
          {
            Icon: CheckCircle2,
            big: history.filter((i) => i.status === "matched").length.toString(),
            label: "Matches del día",
            color: "text-tropico-green",
          },
        ].map((s) => (
          <div key={s.label} className="panel flex flex-col gap-1 p-4">
            <s.Icon className={`size-5 ${s.color}`} strokeWidth={1.75} />
            <div className="font-display text-2xl font-bold">{s.big}</div>
            <div className="text-xs text-tropico-mute">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Form */}
      <section className="panel flex flex-col gap-4 p-6">
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-tropico-border bg-tropico-ink/40 p-1">
          <button
            onClick={() => setSide("sell-bs")}
            className={`rounded-md px-3 py-2.5 text-sm font-semibold transition ${
              side === "sell-bs"
                ? "bg-tropico-sea/15 text-tropico-sea"
                : "text-tropico-mute hover:text-tropico-text"
            }`}
          >
            Tengo Bs · quiero USDC
          </button>
          <button
            onClick={() => setSide("buy-bs")}
            className={`rounded-md px-3 py-2.5 text-sm font-semibold transition ${
              side === "buy-bs"
                ? "bg-tropico-sea/15 text-tropico-sea"
                : "text-tropico-mute hover:text-tropico-text"
            }`}
          >
            Tengo USDC · quiero Bs
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-tropico-mute">
            Monto en {inputCurrency}
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-tropico-border bg-tropico-ink/60 px-4 py-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent text-2xl font-bold focus:outline-none"
              placeholder="0.00"
              min="0"
              step={side === "sell-bs" ? "1000" : "1"}
            />
            <span className="text-sm font-semibold text-tropico-mute">{inputCurrency}</span>
          </div>
          {amount && Number(amount) > 0 && (
            <DualPrice
              usd={
                side === "sell-bs"
                  ? Number(amount) / 36.42
                  : Number(amount)
              }
              size="sm"
            />
          )}
        </div>

        <button
          onClick={submit}
          disabled={!amount || Number(amount) <= 0 || submitting}
          className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ArrowDownUp className="size-4" />
          Postear intent · próximo epoch en {countdown}s
        </button>

        <p className="text-center text-xs text-tropico-mute">
          Tu intent entra al epoch actual. Cada 10s se randomizan + matchean.
        </p>
      </section>

      {/* Carlos AI monitoring */}
      <section className="panel flex flex-col gap-4 border-tropico-purple/30 bg-gradient-to-br from-tropico-purple/5 to-tropico-sea/5 p-6">
        <header className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-tropico-purple/15 ring-1 ring-tropico-purple/30">
            <Bot className="size-5 text-tropico-purple" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">
              Carlos AI <span className="text-tropico-purple">by Lumen</span> monitorea cada epoch
            </h2>
            <p className="text-xs text-tropico-mute">
              Detecta · valida · ejecuta · audita · reporta — todo en segundos
            </p>
          </div>
        </header>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            {
              num: "1",
              titulo: "Detecta",
              desc: "Carlos escucha intents nuevos via webhook on-chain Helius. Cada 250ms verifica el orderbook.",
            },
            {
              num: "2",
              titulo: "Valida",
              desc: "Antes de cerrar epoch confirma que cada wallet tiene el balance que dice tener (Bs en custodia P2P, USDC on-chain).",
            },
            {
              num: "3",
              titulo: "Ejecuta",
              desc: "Al cerrar epoch arma las txs de match. Q3: firma con Privy delegated session keys. Hoy: usuario confirma con un click.",
            },
            {
              num: "4",
              titulo: "Audita",
              desc: "Post-tx verifica que ambos lados recibieron el monto exacto. Si algo falla, refunda automático del pool.",
            },
          ].map((s) => (
            <div
              key={s.num}
              className="flex items-start gap-3 rounded-lg border border-tropico-border bg-tropico-ink/40 p-3"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-tropico-purple/20 text-xs font-bold text-tropico-purple">
                {s.num}
              </span>
              <div>
                <div className="text-sm font-semibold text-tropico-text">{s.titulo}</div>
                <p className="text-xs text-tropico-mute">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <Link
          href="/carlos/agente"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-tropico-purple/40 bg-tropico-purple/10 px-3 py-1.5 text-xs font-semibold text-tropico-purple transition hover:bg-tropico-purple/20"
        >
          Ver Modo Agente <Sparkles className="size-3" />
        </Link>
      </section>

      {/* Historial */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-bold">Tus intents</h2>
        {history.length === 0 ? (
          <div className="panel p-6 text-center text-sm text-tropico-mute">
            Aún no posteaste ningún intent. Empieza arriba ↑
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((intent) => (
              <article
                key={intent.id}
                className={`panel flex flex-col gap-2 p-4 transition ${
                  intent.status === "matched"
                    ? "border-tropico-green/30 bg-tropico-green/5"
                    : "border-tropico-sun/20 bg-tropico-sun/5"
                }`}
              >
                <header className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-tropico-mute">
                    {intent.side === "sell-bs"
                      ? "Bs → USDC"
                      : "USDC → Bs"}{" "}
                    · {intent.amount.toLocaleString()} {intent.side === "sell-bs" ? "Bs" : "USDC"}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      intent.status === "matched"
                        ? "bg-tropico-green/15 text-tropico-green"
                        : "bg-tropico-sun/15 text-tropico-sun"
                    }`}
                  >
                    {intent.status === "matched" ? "✓ Matched" : "⏳ Pending"}
                  </span>
                </header>
                {intent.match && (
                  <div className="flex flex-col gap-1 rounded-md bg-tropico-ink/40 p-2 text-xs text-tropico-mute">
                    <div>
                      Contraparte:{" "}
                      <strong className="text-tropico-text">
                        {intent.match.counterparty === "liquidity-pool"
                          ? "🏦 Liquidity pool"
                          : "👥 Otro usuario"}
                      </strong>
                    </div>
                    <div>
                      Tasa: <strong className="text-tropico-text">{intent.match.rate} Bs/USDC</strong>
                    </div>
                    <div>
                      Tx:{" "}
                      <code className="text-tropico-purple">{intent.match.txSignature}</code>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Por qué aleatorio */}
      <section className="panel flex flex-col gap-3 p-6">
        <header className="flex items-center gap-3">
          <ShieldCheck className="size-6 text-tropico-sea" strokeWidth={1.75} />
          <h2 className="font-display text-xl font-bold">¿Por qué matching aleatorio?</h2>
        </header>
        <p className="text-sm text-tropico-mute">
          Si fuera FIFO o por monto, el que pone $10k siempre matchearía primero
          que el que pone $50. Eso es lo que hacen los exchanges tradicionales —
          el que tiene más, recibe mejor servicio.
        </p>
        <p className="text-sm text-tropico-mute">
          Tropico randomiza con una semilla pública (block hash del cierre de epoch),
          lo que hace el orden auditable on-chain pero impredecible. Cualquiera puede
          verificar que no hubo trampa.{" "}
          <strong className="text-tropico-text">
            Equidad por diseño, no por promesa.
          </strong>
        </p>
      </section>

      <footer className="flex items-center justify-between gap-2 border-t border-tropico-border pt-4 text-xs text-tropico-mute">
        <span>Demo · matching real Q3 2026 con orderbook on-chain</span>
        <span className="inline-flex items-center gap-1">
          <Zap className="size-3 text-tropico-sun" /> Settlement &lt;1s post-epoch
        </span>
      </footer>
    </main>
  );
}
