"use client";

import { useState } from "react";
import { Radio, ShieldCheck, AlertTriangle } from "lucide-react";

type Rail = "online" | "fallback";

export function RailStatusBanner() {
  const [rail, setRail] = useState<Rail>("online");

  const online = rail === "online";

  return (
    <div
      className={`rounded-xl border p-4 transition ${
        online
          ? "border-tropico-green/40 bg-tropico-green/8"
          : "border-tropico-sun/40 bg-tropico-sun/8"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          {online ? (
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-tropico-green" aria-hidden />
          ) : (
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-tropico-sun" aria-hidden />
          )}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span
                className={`relative flex size-2 ${
                  online ? "text-tropico-green" : "text-tropico-sun"
                }`}
                aria-hidden
              >
                <span
                  className={`absolute inline-flex size-full animate-ping rounded-full opacity-60 ${
                    online ? "bg-tropico-green" : "bg-tropico-sun"
                  }`}
                />
                <span
                  className={`relative inline-flex size-2 rounded-full ${
                    online ? "bg-tropico-green" : "bg-tropico-sun"
                  }`}
                />
              </span>
              <p
                className={`font-display text-sm font-bold ${
                  online ? "text-tropico-green" : "text-tropico-sun"
                }`}
              >
                {online
                  ? "Pago Móvil online · Rail Resilient activo"
                  : "Pago Móvil offline · Fallback Solana Pay activo"}
              </p>
            </div>
            <p className="text-xs text-tropico-mute">
              {online
                ? "Tropico usa el rail nativo VE. Si Pago Móvil cae, hacemos failover automático a Solana Pay sin que el usuario haga nada."
                : "Banco caído. Tropico cambió automáticamente a Solana Pay (USDC merchant-direct) — los pagos no se detienen."}
            </p>
          </div>
        </div>

        <button
          onClick={() => setRail((r) => (r === "online" ? "fallback" : "online"))}
          className="self-start rounded-lg border border-tropico-border bg-tropico-ink/40 px-3 py-1.5 text-[11px] font-semibold text-tropico-mute transition hover:border-tropico-sun hover:text-tropico-text sm:self-center"
        >
          <span className="inline-flex items-center gap-1.5">
            <Radio className="size-3" />
            Simular {online ? "caída" : "recuperación"}
          </span>
        </button>
      </div>
    </div>
  );
}
