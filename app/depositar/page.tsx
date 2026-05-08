"use client";

import Link from "next/link";
import { useState } from "react";
import { DualPrice } from "@/components/DualPrice";
import { formatUSD } from "@/lib/formato";

const BANCOS = [
  { value: "banesco", label: "Banesco" },
  { value: "mercantil", label: "Banco Mercantil" },
  { value: "bdv", label: "Banco de Venezuela" },
  { value: "provincial", label: "BBVA Provincial" },
  { value: "bnc", label: "Banco Nacional de Cr&eacute;dito" },
];

export default function DepositarPage() {
  const [bs, setBs] = useState("3000");
  const [banco, setBanco] = useState("banesco");
  const [faucetReclamado, setFaucetReclamado] = useState(false);

  const bsNumber = parseFloat(bs) || 0;
  const TASA_PARALELO = 650.51;
  const usd = bsNumber / TASA_PARALELO;

  function onFaucet() {
    setFaucetReclamado(true);
    if (typeof window !== "undefined") {
      const fauceted = JSON.parse(
        localStorage.getItem("tropico:faucet:claimed") ?? "[]"
      );
      fauceted.push({ amount: 50, claimedAt: new Date().toISOString() });
      localStorage.setItem(
        "tropico:faucet:claimed",
        JSON.stringify(fauceted)
      );
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-8 px-5 py-10">
      <header className="flex flex-col gap-2">
        <Link
          href="/home"
          className="w-fit text-sm text-tropico-mute transition hover:text-tropico-text"
        >
          &larr; Volver
        </Link>
        <h1 className="font-display text-3xl font-bold">Depositar bol&iacute;vares</h1>
        <p className="text-sm text-tropico-mute">
          Convertí bs a USDC directo desde tu cuenta venezolana.
        </p>
      </header>

      {/* Banner explicit honesto */}
      <div className="panel flex flex-col gap-3 border-tropico-coral/30 bg-tropico-coral/5 p-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>🚧</span>
          <div>
            <h3 className="font-display text-lg font-bold">Demo del hackathon</h3>
            <p className="text-xs text-tropico-mute">
              Esta funci&oacute;n es una simulaci&oacute;n para mostrar el flujo final.
            </p>
          </div>
        </div>
        <p className="text-sm text-tropico-mute">
          En producci&oacute;n (Q3 2026) integramos con{" "}
          <strong className="text-tropico-text">Reserve</strong> + partners P2P
          verificados (traders top de Binance) o{" "}
          <strong className="text-tropico-text">Banca-as-a-Service</strong>. Tiempo
          estimado deposit→USDC en wallet:{" "}
          <strong className="text-tropico-green">&lt;5 minutos</strong>.
        </p>
        <p className="text-sm text-tropico-mute">
          Por ahora, us&aacute; el faucet de prueba abajo para cargar tu wallet con USDC
          de devnet y probar el resto de Tropico.
        </p>
      </div>

      {/* Form simulado */}
      <section className="panel flex flex-col gap-4 p-6 opacity-70">
        <h2 className="font-display text-xl font-bold">Depositar (simulado)</h2>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-tropico-mute">Banco origen</span>
          <select
            value={banco}
            onChange={(e) => setBanco(e.target.value)}
            className="rounded-lg border border-tropico-border bg-tropico-ink px-3 py-2 outline-none transition focus:border-tropico-purple"
          >
            {BANCOS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-tropico-mute">Monto en bol&iacute;vares</span>
          <input
            type="number"
            inputMode="decimal"
            value={bs}
            onChange={(e) => setBs(e.target.value)}
            className="rounded-lg border border-tropico-border bg-tropico-ink px-3 py-2 font-display text-xl font-bold tabular-nums outline-none transition focus:border-tropico-purple"
          />
        </label>

        {bsNumber > 0 && (
          <div className="rounded-lg border border-tropico-border bg-tropico-ink/40 px-4 py-3">
            <div className="text-xs text-tropico-mute">Recibir&iacute;as en tu wallet</div>
            <DualPrice usd={usd} size="lg" />
            <div className="mt-2 text-xs text-tropico-mute">
              Tasa paralelo: 1 USD = Bs. {TASA_PARALELO.toFixed(2)}
            </div>
          </div>
        )}

        <button
          disabled
          className="btn-primary cursor-not-allowed opacity-50"
          title="Disponible en producci&oacute;n Q3 2026"
        >
          Continuar (Q3 2026)
        </button>
      </section>

      {/* Faucet */}
      <section className="panel flex flex-col gap-3 border-tropico-green/30 bg-tropico-green/5 p-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>🚰</span>
          <div>
            <h3 className="font-display text-lg font-bold">Faucet de prueba</h3>
            <p className="text-xs text-tropico-mute">
              Recib&iacute; 50 USDC de devnet para probar el resto de Tropico
            </p>
          </div>
        </div>

        {faucetReclamado ? (
          <div className="rounded-lg border border-tropico-green/40 bg-tropico-green/10 px-4 py-3 text-sm text-tropico-green">
            ✅ Faucet reclamado. {formatUSD(50)} agregados a tu balance.{" "}
            <Link href="/home" className="underline">
              Volver a Home
            </Link>
          </div>
        ) : (
          <button onClick={onFaucet} className="btn-primary">
            Recibir {formatUSD(50)} USDC de prueba
          </button>
        )}
      </section>

      {/* Roadmap on-ramp real */}
      <section className="flex flex-col gap-3 text-sm">
        <h3 className="font-display text-lg font-bold">¿Qu&eacute; viene en producci&oacute;n?</h3>
        <ul className="flex flex-col gap-2 text-tropico-mute">
          <li className="flex items-start gap-2">
            <span className="text-tropico-green">Q3 2026 →</span>
            <span>
              Integraci&oacute;n directa con{" "}
              <strong className="text-tropico-text">Reserve</strong> y partners P2P
              verificados de Binance (top sellers VE)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-tropico-green">Q4 2026 →</span>
            <span>
              Off-ramp: convertir USDC a bs y recibir en tu cuenta Banesco/Mercantil
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-tropico-green">Q1 2027 →</span>
            <span>
              Tropico Card: tarjeta debit Visa backed por USDC, 1% cashback en cada compra
            </span>
          </li>
        </ul>
      </section>
    </main>
  );
}
