"use client";

import Link from "next/link";
import { useState } from "react";
import { DualPrice } from "@/components/DualPrice";
import { ScrollReveal } from "@/components/ScrollReveal";
import { formatUSD, formatBs } from "@/lib/formato";
import {
  Smartphone,
  Building2,
  ArrowUpRight,
  CreditCard,
  Clock,
  DollarSign,
  TrendingUp,
  Copy,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

/* ── Datos mock del nodo Tropico ─────────────────────────────────────── */
const NODO = {
  nombre: "Tropico Caracas",
  cedula: "V-18.423.771",
  telefono: "0412-555-0190",
  banco: "Banesco",
  bancoCode: "0134",
};

const DATOS_BANCARIOS = [
  { banco: "Banesco", numero: "0134-0178-28-1780041290", tipo: "Corriente", titular: "Tropico Tech C.A." },
  { banco: "Mercantil", numero: "0105-0621-31-1621062100", tipo: "Corriente", titular: "Tropico Tech C.A." },
  { banco: "Provincial", numero: "0108-0123-10-0100012345", tipo: "Corriente", titular: "Tropico Tech C.A." },
  { banco: "BNC", numero: "0191-0099-44-9900991234", tipo: "Corriente", titular: "Tropico Tech C.A." },
];

/* ── Métodos comparativa ─────────────────────────────────────────────── */
const METODOS = [
  {
    id: "pagomovil",
    label: "Pago Móvil",
    icon: Smartphone,
    tiempo: "< 15 min",
    fee: "1.5%",
    limite: "Bs. 50.000/día",
    color: "tropico-green",
  },
  {
    id: "transferencia",
    label: "Transferencia bancaria",
    icon: Building2,
    tiempo: "< 30 min",
    fee: "1.5%",
    limite: "Sin límite",
    color: "tropico-purple",
  },
  {
    id: "crypto",
    label: "Crypto P2P",
    icon: TrendingUp,
    tiempo: "Varía",
    fee: "Variable",
    limite: "Sin límite",
    color: "tropico-sun",
  },
  {
    id: "tarjeta",
    label: "Tarjeta USD",
    icon: CreditCard,
    tiempo: "Instantáneo",
    fee: "2.5%",
    limite: "$500/día",
    color: "tropico-coral",
  },
];

const TASA_FALLBACK = 650.51;

type Metodo = "pagomovil" | "transferencia" | "crypto" | "tarjeta";
type Step = "select" | "pagomovil" | "transferencia" | "done";

export const dynamic = "force-dynamic";

export default function DepositarPage() {
  const [metodo, setMetodo] = useState<Metodo>("pagomovil");
  const [step, setStep] = useState<Step>("select");
  const [usdc, setUsdc] = useState("10");
  const [bancoDst, setBancoDst] = useState("Banesco");
  const [copied, setCopied] = useState<string | null>(null);
  const [faucetDone, setFaucetDone] = useState(false);

  const usdcNum = parseFloat(usdc) || 0;
  const bsEquiv = usdcNum * TASA_FALLBACK;
  const feeAmt = usdcNum * 0.015;
  const usdcNeto = usdcNum - feeAmt;

  function copiar(text: string, key: string) {
    if (typeof navigator !== "undefined") {
      void navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    }
  }

  function onFaucet() {
    setFaucetDone(true);
    if (typeof window !== "undefined") {
      const arr = JSON.parse(localStorage.getItem("tropico:faucet:claimed") ?? "[]") as unknown[];
      arr.push({ amount: 50, claimedAt: new Date().toISOString() });
      localStorage.setItem("tropico:faucet:claimed", JSON.stringify(arr));
    }
  }

  /* ── Select step ──────────────────────────────────────────────────── */
  if (step === "select") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-8 px-5 py-10">
        <header className="flex flex-col gap-2">
          <Link href="/home" className="w-fit text-sm text-tropico-mute transition hover:text-tropico-text">
            &larr; Volver
          </Link>
          <h1 className="font-display text-3xl font-bold">Depositar USDC</h1>
          <p className="text-sm text-tropico-mute">
            Convertí bolívares a USDC en tu wallet Tropico. Sin cuenta bancaria extranjera.
          </p>
        </header>

        {/* Banner demo */}
        <ScrollReveal direction="down">
          <div className="flex items-start gap-3 rounded-xl border border-tropico-coral/30 bg-tropico-coral/5 p-4">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-tropico-coral" />
            <p className="text-xs text-tropico-mute">
              <strong className="text-tropico-text">Demo — </strong>
              Los datos bancarios y el nodo Tropico son simulados. En Q3 2026 conectamos
              con agentes P2P licenciados y partners verificados. Los USDC reales se acreditan
              on-chain; aquí mostramos el flujo completo.
            </p>
          </div>
        </ScrollReveal>

        {/* Comparativa métodos */}
        <ScrollReveal direction="up" delay={100}>
          <section className="flex flex-col gap-3">
            <h2 className="font-display text-lg font-bold">¿Cómo quieres depositar?</h2>
            <div className="overflow-x-auto rounded-xl border border-tropico-border">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="border-b border-tropico-border bg-tropico-ink/40 text-left text-xs text-tropico-mute">
                    <th className="px-4 py-3">Método</th>
                    <th className="px-4 py-3 text-center">
                      <Clock className="inline size-3 mr-1" />Tiempo
                    </th>
                    <th className="px-4 py-3 text-center">
                      <DollarSign className="inline size-3 mr-1" />Fee
                    </th>
                    <th className="px-4 py-3 text-center">Límite</th>
                  </tr>
                </thead>
                <tbody>
                  {METODOS.map((m) => {
                    const Icon = m.icon;
                    const isSelected = metodo === m.id;
                    return (
                      <tr
                        key={m.id}
                        onClick={() => setMetodo(m.id as Metodo)}
                        className={`cursor-pointer border-b border-tropico-border last:border-0 transition ${
                          isSelected ? "bg-tropico-purple/10" : "hover:bg-tropico-panel"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <CheckCircle2 className="size-4 text-tropico-purple" />
                            )}
                            <Icon className={`size-4 text-${m.color}`} />
                            <span className="font-medium">{m.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-tropico-mute">{m.tiempo}</td>
                        <td className="px-4 py-3 text-center text-tropico-mute">{m.fee}</td>
                        <td className="px-4 py-3 text-center text-tropico-mute">{m.limite}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </ScrollReveal>

        {/* Monto */}
        {(metodo === "pagomovil" || metodo === "transferencia") && (
          <ScrollReveal direction="up" delay={150}>
            <section className="panel flex flex-col gap-4 p-6">
              <h2 className="font-display text-xl font-bold">¿Cuánto USDC quieres recibir?</h2>
              <input
                type="number"
                inputMode="decimal"
                value={usdc}
                onChange={(e) => setUsdc(e.target.value)}
                placeholder="0"
                className="bg-transparent text-center font-display text-5xl font-bold tabular-nums outline-none"
              />
              <DualPrice usd={usdcNum} size="md" align="center" />
              {usdcNum > 0 && (
                <div className="rounded-lg border border-tropico-border bg-tropico-ink/40 px-4 py-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-tropico-mute">Pagarás en bolívares</span>
                    <span className="font-semibold">{formatBs(bsEquiv)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-tropico-mute">Fee Tropico (1.5%)</span>
                    <span className="text-tropico-mute">{formatUSD(feeAmt)}</span>
                  </div>
                  <div className="flex justify-between border-t border-tropico-border pt-2 font-semibold">
                    <span>USDC en tu wallet</span>
                    <span className="text-tropico-green">{formatUSD(usdcNeto)}</span>
                  </div>
                  <p className="text-xs text-tropico-mute pt-1">
                    Tasa paralelo: 1 USD = Bs. {TASA_FALLBACK.toFixed(2)} · Actualización en vivo en Q3
                  </p>
                </div>
              )}
            </section>
          </ScrollReveal>
        )}

        {/* CTA por método */}
        <ScrollReveal direction="up" delay={200}>
          {metodo === "pagomovil" && (
            <button
              disabled={usdcNum <= 0}
              onClick={() => setStep("pagomovil")}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ver datos de Pago Móvil
            </button>
          )}
          {metodo === "transferencia" && (
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-tropico-mute">Tu banco</span>
                <select
                  value={bancoDst}
                  onChange={(e) => setBancoDst(e.target.value)}
                  className="rounded-lg border border-tropico-border bg-tropico-ink px-3 py-2 outline-none transition focus:border-tropico-purple"
                >
                  {DATOS_BANCARIOS.map((d) => (
                    <option key={d.banco} value={d.banco}>{d.banco}</option>
                  ))}
                </select>
              </label>
              <button
                disabled={usdcNum <= 0}
                onClick={() => setStep("transferencia")}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Ver cuenta destino
              </button>
            </div>
          )}
          {metodo === "crypto" && (
            <div className="panel flex flex-col gap-4 p-6">
              <h2 className="font-display text-lg font-bold">Compra USDC con P2P externo</h2>
              <p className="text-sm text-tropico-mute">
                Te redirigimos a plataformas de terceros donde puedes comprar USDC con bolívares.
                No gestionamos esas transacciones — son entre usuarios.
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Binance P2P", url: "https://p2p.binance.com", desc: "Mayor liquidez" },
                  { label: "Reserve", url: "https://www.reserve.org", desc: "Más popular en VE" },
                  { label: "Buenbit", url: "https://buenbit.com", desc: "LATAM" },
                ].map((p) => (
                  <a
                    key={p.label}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border border-tropico-border bg-tropico-ink/40 px-4 py-3 transition hover:border-tropico-sun/40 hover:bg-tropico-sun/5"
                  >
                    <div>
                      <span className="font-medium">{p.label}</span>
                      <span className="ml-2 text-xs text-tropico-mute">{p.desc}</span>
                    </div>
                    <ArrowUpRight className="size-4 text-tropico-mute" />
                  </a>
                ))}
              </div>
              <p className="text-xs text-tropico-mute">
                Una vez que tengas USDC en tu wallet, aparecerá automáticamente en tu balance Tropico.
              </p>
            </div>
          )}
          {metodo === "tarjeta" && (
            <div className="panel flex flex-col gap-4 p-6">
              <div className="flex items-center gap-3">
                <CreditCard className="size-6 text-tropico-coral" />
                <h2 className="font-display text-lg font-bold">Tarjeta USD — Coming Q3 2026</h2>
              </div>
              <p className="text-sm text-tropico-mute">
                Integración con <strong className="text-tropico-text">MoonPay</strong> y{" "}
                <strong className="text-tropico-text">Transak</strong> para comprar USDC con
                Visa/Mastercard emitidas en USD. Fee estimado: 2.5%. Disponible Q3 2026.
              </p>
              <button disabled className="btn-primary cursor-not-allowed opacity-50">
                Próximamente (Q3 2026)
              </button>
            </div>
          )}
        </ScrollReveal>

        {/* Faucet */}
        <ScrollReveal direction="up" delay={250}>
          <section className="panel flex flex-col gap-3 border-tropico-green/30 bg-tropico-green/5 p-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden>🚰</span>
              <div>
                <h3 className="font-display text-lg font-bold">Faucet de prueba</h3>
                <p className="text-xs text-tropico-mute">Recibí 50 USDC de devnet para probar Tropico ahora</p>
              </div>
            </div>
            {faucetDone ? (
              <div className="rounded-lg border border-tropico-green/40 bg-tropico-green/10 px-4 py-3 text-sm text-tropico-green">
                ✅ {formatUSD(50)} USDC agregados a tu wallet de prueba.{" "}
                <Link href="/home" className="underline">Ir a Home</Link>
              </div>
            ) : (
              <button onClick={onFaucet} className="btn-primary">
                Recibir {formatUSD(50)} USDC de prueba
              </button>
            )}
          </section>
        </ScrollReveal>
      </main>
    );
  }

  /* ── Pago Móvil step ──────────────────────────────────────────────── */
  if (step === "pagomovil") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-8 px-5 py-10">
        <header className="flex flex-col gap-2">
          <button
            onClick={() => setStep("select")}
            className="w-fit text-sm text-tropico-mute transition hover:text-tropico-text"
          >
            &larr; Volver
          </button>
          <h1 className="font-display text-3xl font-bold">Pago Móvil a Tropico</h1>
        </header>

        <ScrollReveal direction="down">
          <div className="flex items-start gap-3 rounded-xl border border-tropico-coral/30 bg-tropico-coral/5 p-4">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-tropico-coral" />
            <p className="text-xs text-tropico-mute">
              <strong className="text-tropico-text">Demo — </strong>
              Datos ficticios del nodo Tropico Caracas. En producción (Q3 2026) conectamos con
              agentes P2P licenciados que verifican tu pago y acreditan USDC on-chain en &lt;15 min.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={100}>
          <section className="panel flex flex-col gap-5 p-6">
            <h2 className="font-display text-xl font-bold">
              Monto a pagar: <span className="text-tropico-green">{formatBs(bsEquiv)}</span>
            </h2>
            <p className="text-sm text-tropico-mute">
              Recibirás <strong className="text-tropico-text">{formatUSD(usdcNeto)} USDC</strong> en tu wallet
              luego de confirmar el pago.
            </p>

            {/* Datos Pago Móvil */}
            <div className="flex flex-col gap-3">
              {[
                { label: "Banco", value: NODO.banco },
                { label: "Cédula", value: NODO.cedula },
                { label: "Teléfono", value: NODO.telefono },
                { label: "Concepto", value: `USDC-${usdcNum}` },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-lg border border-tropico-border bg-tropico-ink/40 px-4 py-3"
                >
                  <div>
                    <p className="text-xs text-tropico-mute">{label}</p>
                    <p className="font-mono font-semibold">{value}</p>
                  </div>
                  <button
                    onClick={() => copiar(value, label)}
                    className="rounded-lg p-2 transition hover:bg-tropico-border"
                    aria-label={`Copiar ${label}`}
                  >
                    {copied === label ? (
                      <CheckCircle2 className="size-4 text-tropico-green" />
                    ) : (
                      <Copy className="size-4 text-tropico-mute" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={200}>
          <section className="flex flex-col gap-3">
            <h3 className="font-display text-base font-semibold">Pasos a seguir</h3>
            <ol className="flex flex-col gap-2 text-sm text-tropico-mute">
              <li className="flex items-start gap-3">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-tropico-purple/20 text-xs font-bold text-tropico-purple">1</span>
                Abrí tu app bancaria y realizá el Pago Móvil con los datos de arriba.
              </li>
              <li className="flex items-start gap-3">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-tropico-purple/20 text-xs font-bold text-tropico-purple">2</span>
                Copiá el número de referencia de tu banco.
              </li>
              <li className="flex items-start gap-3">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-tropico-purple/20 text-xs font-bold text-tropico-purple">3</span>
                El nodo Tropico verifica el pago y acredita tus USDC (en Q3 esto es automático).
              </li>
            </ol>
          </section>
        </ScrollReveal>

        <button onClick={() => setStep("done")} className="btn-primary">
          Ya hice el Pago Móvil
        </button>
      </main>
    );
  }

  /* ── Transferencia step ───────────────────────────────────────────── */
  if (step === "transferencia") {
    const datosBanco = DATOS_BANCARIOS.find((d) => d.banco === bancoDst) ?? DATOS_BANCARIOS[0];
    return (
      <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-8 px-5 py-10">
        <header className="flex flex-col gap-2">
          <button
            onClick={() => setStep("select")}
            className="w-fit text-sm text-tropico-mute transition hover:text-tropico-text"
          >
            &larr; Volver
          </button>
          <h1 className="font-display text-3xl font-bold">Transferencia a {bancoDst}</h1>
        </header>

        <ScrollReveal direction="down">
          <div className="flex items-start gap-3 rounded-xl border border-tropico-coral/30 bg-tropico-coral/5 p-4">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-tropico-coral" />
            <p className="text-xs text-tropico-mute">
              <strong className="text-tropico-text">Demo — </strong>
              Datos bancarios ficticios. En Q3 2026 usamos cuentas de entidades licenciadas.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={100}>
          <section className="panel flex flex-col gap-5 p-6">
            <h2 className="font-display text-xl font-bold">
              Monto a transferir: <span className="text-tropico-green">{formatBs(bsEquiv)}</span>
            </h2>
            <p className="text-sm text-tropico-mute">
              Recibirás <strong className="text-tropico-text">{formatUSD(usdcNeto)} USDC</strong> en tu wallet.
            </p>
            <div className="flex flex-col gap-3">
              {[
                { label: "Banco", value: datosBanco.banco },
                { label: "Número de cuenta", value: datosBanco.numero },
                { label: "Tipo", value: datosBanco.tipo },
                { label: "Titular", value: datosBanco.titular },
                { label: "Concepto", value: `USDC-${usdcNum}-TROPICO` },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-lg border border-tropico-border bg-tropico-ink/40 px-4 py-3"
                >
                  <div>
                    <p className="text-xs text-tropico-mute">{label}</p>
                    <p className="font-mono font-semibold">{value}</p>
                  </div>
                  <button
                    onClick={() => copiar(value, label)}
                    className="rounded-lg p-2 transition hover:bg-tropico-border"
                  >
                    {copied === label ? (
                      <CheckCircle2 className="size-4 text-tropico-green" />
                    ) : (
                      <Copy className="size-4 text-tropico-mute" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        <button onClick={() => setStep("done")} className="btn-primary">
          Ya hice la transferencia
        </button>
      </main>
    );
  }

  /* ── Done step ────────────────────────────────────────────────────── */
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-8 px-5 py-10 text-center">
      <ScrollReveal direction="up">
        <div className="flex flex-col items-center gap-4">
          <span className="text-6xl" aria-hidden>🏝️</span>
          <h1 className="font-display text-3xl font-bold">¡Pago enviado!</h1>
          <p className="text-tropico-mute max-w-sm">
            En producción (Q3 2026), el nodo Tropico verifica tu pago en &lt;15 min y acredita{" "}
            <strong className="text-tropico-text">{formatUSD(usdcNeto)} USDC</strong> on-chain en tu wallet.
          </p>
          <div className="rounded-xl border border-tropico-green/30 bg-tropico-green/5 px-6 py-4 text-sm text-tropico-mute">
            En esta demo, los fondos se reflejan en tu balance simulado.
            Usá el faucet en /depositar para probar el resto del flujo.
          </div>
          <Link href="/home" className="btn-primary mt-2">
            Ir a mi wallet
          </Link>
        </div>
      </ScrollReveal>
    </main>
  );
}
