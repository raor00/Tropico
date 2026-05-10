"use client";

import { useState } from "react";
import { whatsappShareUrl, generateReference } from "@/lib/solana-pay";
import { DualPrice } from "./DualPrice";
import { formatUSD } from "@/lib/formato";

type Step = "form" | "link" | "shared";

export function SendForm() {
  const [step, setStep] = useState<Step>("form");
  const [amount, setAmount] = useState("10");
  const [destinatario, setDestinatario] = useState("");
  const [claimUrl, setClaimUrl] = useState("");

  const amountNumber = parseFloat(amount) || 0;
  const fee = amountNumber * 0.003; // 0.3%

  function onGenerar(e: React.FormEvent) {
    e.preventDefault();
    if (amountNumber <= 0 || !destinatario) return;
    const claimId = generateReference();
    const secret = generateReference().slice(0, 16);
    const baseUrl =
      typeof window !== "undefined" ? window.location.origin : "https://tropico.app";
    const url = `${baseUrl}/claim/${claimId}?s=${secret}&monto=${amountNumber}&para=${encodeURIComponent(destinatario)}`;

    // Persistir el claim en localStorage del remitente
    if (typeof window !== "undefined") {
      const claims = JSON.parse(
        localStorage.getItem("tropico:claims:sent") ?? "[]"
      );
      claims.push({
        claimId,
        secret,
        monto: amountNumber,
        destinatario,
        creadoEn: new Date().toISOString(),
        status: "pending",
      });
      localStorage.setItem("tropico:claims:sent", JSON.stringify(claims));
    }

    setClaimUrl(url);
    setStep("link");
  }

  function onShareWhatsApp() {
    const message = `🌴 Te mandé ${formatUSD(amountNumber)} vía Tropico\n\nAbrí este link para reclamar tu plata. No necesitas tener wallet — la creamos cuando entres con tu email.`;
    window.open(whatsappShareUrl(message, claimUrl), "_blank");
    setStep("shared");
  }

  function onCopiar() {
    if (typeof navigator !== "undefined") {
      void navigator.clipboard.writeText(claimUrl);
      alert("Link copiado al portapapeles");
    }
  }

  function onReset() {
    setAmount("10");
    setDestinatario("");
    setClaimUrl("");
    setStep("form");
  }

  if (step === "form") {
    return (
      <form onSubmit={onGenerar} className="flex flex-col gap-4">
        <div className="panel flex flex-col gap-4 p-6">
          <h2 className="font-display text-xl font-bold">A quién le mandas?</h2>
          <input
            value={destinatario}
            onChange={(e) => setDestinatario(e.target.value)}
            placeholder="Nombre o WhatsApp (ej. Mi tía Carmen)"
            required
            className="rounded-lg border border-tropico-border bg-tropico-ink px-4 py-3 outline-none transition focus:border-tropico-purple"
          />
        </div>

        <div className="panel flex flex-col gap-4 p-6">
          <h2 className="font-display text-xl font-bold">Cuánto?</h2>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="bg-transparent text-center font-display text-5xl font-bold tabular-nums outline-none"
          />
          <DualPrice usd={amountNumber} size="md" align="center" />

          {amountNumber > 0 && (
            <div className="rounded-lg border border-tropico-border bg-tropico-ink/40 px-4 py-3 text-sm">
              <div className="flex justify-between">
                <span className="text-tropico-mute">Montá a enviar</span>
                <span>{formatUSD(amountNumber)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-tropico-mute">Fee Tropico (0.3%)</span>
                <span>{formatUSD(fee)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-tropico-border pt-2 font-semibold">
                <span>Recibirá</span>
                <span className="text-tropico-green">
                  {formatUSD(amountNumber - fee)}
                </span>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={amountNumber <= 0 || !destinatario}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Crear link de cobro
        </button>

        <p className="text-center text-xs text-tropico-mute">
          Si tu destinatario no tiene wallet, la creamos cuando abra el link.
          Ningún Western Union, ninguna comisión escondida.
        </p>
      </form>
    );
  }

  if (step === "link") {
    return (
      <div className="flex flex-col gap-4 animate-fade-up">
        <div className="panel flex flex-col gap-3 border-tropico-green/40 bg-tropico-green/5 p-6">
          <header className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>✅</span>
            <h2 className="font-display text-xl font-bold">¡Link generado!</h2>
          </header>
          <p className="text-sm text-tropico-mute">
            Compartiéndoselo a <strong className="text-tropico-text">{destinatario}</strong>{" "}
            por WhatsApp para que reclame {formatUSD(amountNumber - fee)}.
          </p>

          <div className="rounded-lg border border-tropico-border bg-tropico-ink p-3 font-mono text-xs break-all">
            {claimUrl}
          </div>
        </div>

        <button onClick={onShareWhatsApp} className="btn-primary">
          Compartir por WhatsApp 📱
        </button>
        <button onClick={onCopiar} className="btn-ghost">
          Copiar link
        </button>
        <button
          onClick={onReset}
          className="text-center text-sm text-tropico-mute transition hover:text-tropico-text"
        >
          Crear otro envío
        </button>
      </div>
    );
  }

  // shared
  return (
    <div className="flex flex-col gap-4 animate-fade-up">
      <div className="panel flex flex-col items-center gap-3 p-8 text-center">
        <span className="text-5xl" aria-hidden>📤</span>
        <h2 className="font-display text-2xl font-bold">¡Enviado por WhatsApp!</h2>
        <p className="text-sm text-tropico-mute">
          Cuando {destinatario} abra el link, le creamos su wallet y recibirá{" "}
          <strong className="text-tropico-text">{formatUSD(amountNumber - fee)}</strong>.
          Te avisamos cuando lo reclame.
        </p>
      </div>
      <button onClick={onReset} className="btn-primary">
        Mandar a otro
      </button>
    </div>
  );
}
