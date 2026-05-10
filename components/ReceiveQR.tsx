"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  buildSolanaPayUrl,
  generateReference,
  whatsappShareUrl,
  DEMO_MERCHANT_WALLET,
} from "@/lib/solana-pay";
import { DualPrice } from "./DualPrice";
import { PixelLoader } from "./PixelLoader";
import { formatUSD } from "@/lib/formato";

type Status = "esperando" | "pagado";

export function ReceiveQR() {
  const [amount, setAmount] = useState("5");
  const [showQR, setShowQR] = useState(false);
  const [qrSvg, setQrSvg] = useState<string>("");
  const [status, setStatus] = useState<Status>("esperando");

  const amountNumber = parseFloat(amount) || 0;

  // Fee hacia arriba: el cliente paga amount × 1.01, el merchant recibe amount exacto
  const customerPays = +(amountNumber * 1.01).toFixed(6);

  const reference = useMemo(() => generateReference(), [showQR]);

  const payUrl = useMemo(
    () =>
      buildSolanaPayUrl({
        recipient: DEMO_MERCHANT_WALLET,
        // El QR codifica lo que el cliente paga (amount + 1% fee), no el monto del merchant
        amount: customerPays,
        tokenSymbol: "USDC",
        reference,
        label: "Tropico Comercios",
        message: `Pago de $${customerPays.toFixed(2)} USDC vía Tropico`,
      }),
    [customerPays, reference]
  );

  // Generate QR code SVG when payUrl changes
  useEffect(() => {
    if (!showQR || amountNumber === 0) return;
    void QRCode.toString(payUrl, {
      type: "svg",
      width: 320,
      margin: 1,
      color: {
        dark: "#e9e9f1",
        light: "#13131f",
      },
      errorCorrectionLevel: "M",
    }).then(setQrSvg);
  }, [showQR, payUrl, amountNumber]);

  function onGenerate() {
    if (amountNumber > 0) {
      setShowQR(true);
      setStatus("esperando");
    }
  }

  function onSimulatePayment() {
    setStatus("pagado");
  }

  function onReset() {
    setShowQR(false);
    setStatus("esperando");
  }

  function onShareWhatsApp() {
    const message = `🌴 Recibe $${amountNumber.toFixed(2)} USDC vía Tropico\n\nGracias por tu compra. Recibo on-chain disponible en Solscan.`;
    window.open(whatsappShareUrl(message), "_blank");
  }

  if (!showQR) {
    return (
      <div className="flex flex-col gap-6">
        <div className="panel flex flex-col gap-4 p-6">
          <h2 className="font-display text-xl font-bold">Cuánto cobras?</h2>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="bg-transparent text-center font-display text-6xl font-bold tabular-nums outline-none"
            autoFocus
          />
          <DualPrice usd={amountNumber} size="md" align="center" />
          <button
            onClick={onGenerate}
            disabled={amountNumber <= 0}
            className="btn-primary mt-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Generar QR de cobro
          </button>
        </div>
        <p className="text-center text-xs text-tropico-mute">
          El cliente escanea con cualquier wallet de Solana (Phantom, Solflare, Tropico).
          La plata aterriza en tu wallet en menos de 1 segundo.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Status banner */}
      {status === "pagado" ? (
        <div className="panel flex items-center gap-3 border-tropico-green/40 bg-tropico-green/10 p-4 animate-fade-up">
          <span className="text-3xl" aria-hidden>✅</span>
          <div className="flex-1">
            <div className="font-bold text-tropico-green">¡Pago recibido!</div>
            <div className="text-xs text-tropico-mute">
              Tienes <span className="font-semibold text-tropico-sea">{formatUSD(amountNumber)} exactos</span> en tu wallet.
            </div>
          </div>
        </div>
      ) : (
        <div className="panel flex items-center gap-3 border-tropico-sun/40 bg-tropico-sun/5 p-4">
          <PixelLoader variant="dots" size="sm" />
          <div className="flex-1 text-sm">
            <div className="font-semibold">Esperando pago…</div>
            <div className="text-xs text-tropico-mute">
              Pasame el código a tu cliente para que escanee
            </div>
          </div>
        </div>
      )}

      {/* QR */}
      <div className="panel flex flex-col items-center gap-4 p-6">
        <div className="rounded-xl bg-tropico-panel p-4">
          {qrSvg ? (
            <div
              className="size-72"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
              aria-label="Código QR de cobro"
            />
          ) : (
            <div className="size-72 animate-pulse bg-tropico-ink" />
          )}
        </div>
        <div className="text-center">
          {/* Lo que el cliente paga (con fee encima) */}
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-tropico-coral">
              Cliente paga
            </p>
            <p className="font-display text-3xl font-bold tabular-nums text-tropico-coral">
              {formatUSD(customerPays)}
            </p>
          </div>
          {/* Lo que el merchant recibe */}
          <div className="mt-3 flex flex-col items-center gap-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-tropico-sea">
              Tú recibes
            </p>
            <p className="font-display text-2xl font-bold tabular-nums text-tropico-sea">
              {formatUSD(amountNumber)} exactos
            </p>
          </div>
          <p className="mt-3 text-xs text-tropico-mute">
            Fee 1% se cobra al cliente — tú recibes lo que pediste. Cobro en USDC · Solana
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {status === "pagado" ? (
          <>
            <button onClick={onShareWhatsApp} className="btn-primary">
              Compartir recibo por WhatsApp 📱
            </button>
            <button onClick={onReset} className="btn-ghost">
              Generar otro cobro
            </button>
          </>
        ) : (
          <>
            <button onClick={onSimulatePayment} className="btn-primary">
              ⚡ Simular pago recibido (DEMO)
            </button>
            <button onClick={onReset} className="btn-ghost">
              Cancelar
            </button>
          </>
        )}
      </div>

      <p className="text-center text-xs text-tropico-mute">
        En producción, Tropico escucha la blockchain con `findReference` y detecta
        el pago automático. Para demo, usa el botón «Simular».
      </p>
    </div>
  );
}
