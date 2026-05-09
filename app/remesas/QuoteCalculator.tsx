"use client";

import { useState, useMemo } from "react";
import { Calculator, ArrowRight } from "lucide-react";

type Metodo = "tarjeta" | "ach" | "paypal" | "crypto";

const METODOS: { value: Metodo; label: string; onrampFee: number; tropicoFee: number; tiempo: string }[] = [
  { value: "tarjeta",  label: "Tarjeta débito/crédito", onrampFee: 0.035, tropicoFee: 0.005, tiempo: "Instantáneo" },
  { value: "ach",      label: "Bank transfer ACH/SEPA",  onrampFee: 0.015, tropicoFee: 0.005, tiempo: "5-10 minutos" },
  { value: "paypal",   label: "PayPal / Venmo / Cash App",onrampFee: 0.025, tropicoFee: 0.005, tiempo: "1-3 minutos" },
  { value: "crypto",   label: "Crypto wallet (USDC/SOL)", onrampFee: 0,     tropicoFee: 0,     tiempo: "<1 segundo" },
];

export function QuoteCalculator() {
  const [monto, setMonto] = useState<string>("100");
  const [metodo, setMetodo] = useState<Metodo>("tarjeta");

  const selected = METODOS.find((m) => m.value === metodo)!;
  const montoNum = parseFloat(monto) || 0;

  const calc = useMemo(() => {
    const feeOnramp   = montoNum * selected.onrampFee;
    const feeTropico  = montoNum * selected.tropicoFee;
    const feeTotal    = feeOnramp + feeTropico;
    const recibe      = Math.max(0, montoNum - feeTotal);
    const pctTotal    = montoNum > 0 ? ((feeTotal / montoNum) * 100).toFixed(1) : "0.0";
    return { feeOnramp, feeTropico, feeTotal, recibe, pctTotal };
  }, [montoNum, selected]);

  function handleContinuar() {
    alert(
      `Demo: en producción esto te llevaría al checkout de ${selected.label}.\n\n` +
      `Monto: $${montoNum.toFixed(2)} USD\n` +
      `Tu familia recibe: $${calc.recibe.toFixed(2)} USDC\n` +
      `Fee total: $${calc.feeTotal.toFixed(2)} (${calc.pctTotal}%)\n` +
      `Tiempo estimado: ${selected.tiempo}`
    );
  }

  return (
    <div className="panel flex flex-col gap-6 p-6">
      <div className="flex items-center gap-2">
        <Calculator className="size-5 text-tropico-sun" strokeWidth={1.75} />
        <h3 className="font-display text-xl font-bold">Calculadora de remesas</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Input monto */}
        <div className="flex flex-col gap-2">
          <label htmlFor="monto" className="text-sm font-medium text-tropico-mute">
            Monto a enviar (USD)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-display text-lg font-bold text-tropico-mute">
              $
            </span>
            <input
              id="monto"
              type="number"
              min="1"
              max="10000"
              step="1"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full rounded-xl border border-tropico-border bg-tropico-ink/60 py-3 pl-8 pr-4 font-display text-2xl font-bold text-tropico-text focus:border-tropico-sun/50 focus:outline-none focus:ring-1 focus:ring-tropico-sun/30 tabular-nums"
              aria-label="Monto en dólares"
            />
          </div>
        </div>

        {/* Selector método */}
        <div className="flex flex-col gap-2">
          <label htmlFor="metodo" className="text-sm font-medium text-tropico-mute">
            Método de pago
          </label>
          <select
            id="metodo"
            value={metodo}
            onChange={(e) => setMetodo(e.target.value as Metodo)}
            className="w-full rounded-xl border border-tropico-border bg-tropico-ink/60 px-4 py-3 text-sm text-tropico-text focus:border-tropico-sun/50 focus:outline-none focus:ring-1 focus:ring-tropico-sun/30"
          >
            {METODOS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resumen */}
      {montoNum > 0 && (
        <div className="rounded-xl border border-tropico-sea/30 bg-tropico-sea/5 p-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-tropico-mute">Fee on-ramp ({(selected.onrampFee * 100).toFixed(1)}%)</span>
              <span className="text-tropico-text tabular-nums">-${calc.feeOnramp.toFixed(2)}</span>
            </div>
            {selected.tropicoFee > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-tropico-mute">Fee Tropico ({(selected.tropicoFee * 100).toFixed(1)}%)</span>
                <span className="text-tropico-text tabular-nums">-${calc.feeTropico.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-tropico-border pt-2 text-sm">
              <span className="text-tropico-mute">Fee total</span>
              <span className="text-tropico-text tabular-nums">
                ${calc.feeTotal.toFixed(2)}{" "}
                <span className="text-tropico-mute">({calc.pctTotal}%)</span>
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="font-semibold text-tropico-text">Tu familia recibe</span>
              <span className="font-display text-2xl font-bold tabular-nums text-tropico-sea">
                ${calc.recibe.toFixed(2)} USDC
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-tropico-mute">
              <span>Tiempo estimado</span>
              <span className="font-semibold text-tropico-sun">{selected.tiempo}</span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleContinuar}
        disabled={montoNum <= 0}
        className="btn-primary flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continuar
        <ArrowRight className="size-4" strokeWidth={2} />
      </button>

      <p className="text-center text-xs text-tropico-mute">
        Cotizaci&oacute;n indicativa. El precio final se confirma en el checkout del partner seleccionado.
      </p>
    </div>
  );
}
