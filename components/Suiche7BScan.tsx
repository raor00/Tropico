"use client";

import { useEffect, useRef, useState } from "react";
import {
  QrCode,
  ScanLine,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Download,
  Share2,
  X,
  Sparkles,
} from "lucide-react";
import { useT } from "@/lib/i18n/context";
import {
  parseSuiche7BQR,
  buildDemoQRPayload,
  type Suiche7BPayload,
} from "@/lib/suiche7b-parser";
import {
  executeBsBridge,
  fetchTropicoRate,
  quoteBsToUsdc,
  buildReceiptText,
  type BsBridgeReceipt,
  type TropicoRate,
} from "@/lib/tropico-bs-bridge";

type Stage = "idle" | "scanning" | "review" | "processing" | "done";

/**
 * Suiche7BScan — flow QR Pago Móvil VE end-to-end:
 *  1. Click "Escanear" → abre cámara via html5-qrcode
 *  2. Detecta QR Suiche7B → parsea → muestra confirmación con quote en USDC
 *  3. User confirma → pool Tropico ejecuta → comprobante con bank ref
 */
export function Suiche7BScan({
  userUsdcBalance = 100,
}: { userUsdcBalance?: number } = {}) {
  const { t } = useT();
  const [stage, setStage] = useState<Stage>("idle");
  const [payee, setPayee] = useState<Suiche7BPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rate, setRate] = useState<TropicoRate | null>(null);
  const [receipt, setReceipt] = useState<BsBridgeReceipt | null>(null);
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup cámara si el componente desmonta a media scan
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  async function startScan() {
    setError(null);
    setStage("scanning");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const elementId = "suiche7b-scan-region";
      // Aseguramos el div existe antes de iniciar
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const scanner = new Html5Qrcode(elementId);
      scannerRef.current = {
        stop: async () => {
          try {
            await scanner.stop();
            await scanner.clear();
          } catch {}
        },
      };
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decoded) => {
          await scanner.stop();
          await scanner.clear();
          handleDecoded(decoded);
        },
        () => {} // ignore frame errors
      );
    } catch (e) {
      setError(t("qr.error.camera"));
      setStage("idle");
      console.error("[Suiche7BScan] camera error:", e);
    }
  }

  async function stopScan() {
    await scannerRef.current?.stop();
    scannerRef.current = null;
    setStage("idle");
  }

  async function handleDecoded(text: string) {
    const parsed = parseSuiche7BQR(text);
    if (!parsed) {
      setError(t("qr.error.invalid"));
      setStage("idle");
      return;
    }
    setPayee(parsed);
    const r = await fetchTropicoRate();
    setRate(r);
    setStage("review");
  }

  /** Demo: salta el scan y carga payload sintético (jurado/local sin cámara) */
  async function demoFill() {
    const parsed = parseSuiche7BQR(buildDemoQRPayload());
    if (!parsed) return;
    setPayee(parsed);
    const r = await fetchTropicoRate();
    setRate(r);
    setStage("review");
  }

  async function confirmPay() {
    if (!payee) return;
    setStage("processing");
    setError(null);
    const r = await executeBsBridge(payee, userUsdcBalance);
    setReceipt(r);
    if (r.ok) {
      setStage("done");
    } else {
      setError(r.error);
      setStage("review");
    }
  }

  function reset() {
    setPayee(null);
    setReceipt(null);
    setRate(null);
    setError(null);
    setStage("idle");
  }

  function downloadReceipt() {
    if (!receipt || !receipt.ok) return;
    const text = buildReceiptText(receipt);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tropico-${receipt.tropicoTxId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function shareWhatsApp() {
    if (!receipt || !receipt.ok) return;
    const text = encodeURIComponent(buildReceiptText(receipt));
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  const quote = payee && rate ? quoteBsToUsdc(payee.montoBs, rate) : null;

  return (
    <section className="panel flex flex-col gap-4 p-4 md:p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-tropico-green/15 text-tropico-green">
            <QrCode className="size-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-tropico-text">
              {t("pagomovil.title")}
            </h3>
            <p className="text-xs text-tropico-mute">
              {t("pagomovil.subtitle")}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-tropico-sun/15 px-2 py-0.5 text-[10px] font-bold uppercase text-tropico-sun">
          Tropico Bs Bridge
        </span>
      </header>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-tropico-coral/30 bg-tropico-coral/5 p-3 text-xs text-tropico-coral">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stage idle: CTA scanear */}
      {stage === "idle" && (
        <div className="flex flex-col gap-3">
          <button
            onClick={startScan}
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <ScanLine className="size-4" />
            {t("pagomovil.scan.cta")}
          </button>
          <button
            onClick={demoFill}
            className="inline-flex items-center justify-center gap-1.5 text-xs text-tropico-mute hover:text-tropico-purple"
            title="Cargar QR sintético — útil para demo sin cámara"
          >
            <Sparkles className="size-3" /> Probar con QR demo
          </button>
          <p className="text-center text-[11px] text-tropico-mute">
            {t("pagomovil.scan.hint")}
          </p>
        </div>
      )}

      {/* Stage scanning: cámara abierta */}
      {stage === "scanning" && (
        <div className="flex flex-col gap-2">
          <div
            id="suiche7b-scan-region"
            className="aspect-square w-full overflow-hidden rounded-xl border border-tropico-border bg-tropico-ink/40"
          />
          <button
            onClick={stopScan}
            className="inline-flex items-center justify-center gap-1.5 text-xs text-tropico-coral hover:underline"
          >
            <X className="size-3" /> {t("common.cancel")}
          </button>
        </div>
      )}

      {/* Stage review: confirmar pago */}
      {stage === "review" && payee && rate && quote && (
        <div className="flex flex-col gap-3">
          <h4 className="font-display text-base font-bold">
            {t("pagomovil.confirm.title")}
          </h4>
          <dl className="flex flex-col gap-2 rounded-lg border border-tropico-border bg-tropico-ink/40 p-3 text-xs">
            <Row label={t("pagomovil.field.bank")} value={payee.bancoNombre ?? payee.banco} />
            <Row label={t("pagomovil.field.phone")} value={payee.telefono} />
            <Row label={t("pagomovil.field.cedula")} value={payee.cedula} />
            {payee.comercio && <Row label="Comercio" value={payee.comercio} />}
            <hr className="border-tropico-border" />
            <Row
              label={t("pagomovil.field.amountBs")}
              value={`${payee.montoBs.toLocaleString("es-VE", { minimumFractionDigits: 2 })} Bs`}
              strong
            />
            <Row
              label={t("pagomovil.field.rate")}
              value={`${rate.effective} Bs/USD (BCV+${(rate.spread * 100).toFixed(1)}%)`}
            />
            <Row label={t("pagomovil.field.fee")} value={`${quote.feeUsdc.toFixed(4)} USDC`} />
            <hr className="border-tropico-border" />
            <Row
              label={t("pagomovil.field.amountUsd")}
              value={`${quote.totalUsdc.toFixed(4)} USDC`}
              strong
              accent="green"
            />
          </dl>
          <div className="flex gap-2">
            <button
              onClick={reset}
              className="flex-1 rounded-lg border border-tropico-border px-3 py-2 text-sm text-tropico-mute hover:text-tropico-text"
            >
              {t("common.cancel")}
            </button>
            <button onClick={confirmPay} className="btn-primary flex-1">
              {t("pagomovil.button.pay")}
            </button>
          </div>
        </div>
      )}

      {/* Stage processing: pool Tropico ejecutando */}
      {stage === "processing" && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <Loader2 className="size-10 animate-spin text-tropico-sea" />
          <p className="font-semibold text-tropico-text">
            {t("pagomovil.processing")}
          </p>
          <p className="text-xs text-tropico-mute">
            Pool Bs Tropico → Suiche7B Gateway → Banco destino
          </p>
        </div>
      )}

      {/* Stage done: comprobante */}
      {stage === "done" && receipt && receipt.ok && (
        <div className="flex flex-col gap-3">
          <header className="flex items-center gap-2 rounded-lg border border-tropico-green/30 bg-tropico-green/5 p-3">
            <CheckCircle2 className="size-5 text-tropico-green" />
            <strong className="text-tropico-green">
              {t("pagomovil.receipt.title")}
            </strong>
          </header>
          <dl className="flex flex-col gap-2 rounded-lg border border-tropico-border bg-tropico-ink/40 p-3 text-xs">
            <Row label={t("pagomovil.field.bank")} value={receipt.payee.bancoNombre ?? receipt.payee.banco} />
            <Row label={t("pagomovil.field.amountBs")} value={`${receipt.paidBs.toFixed(2)} Bs`} strong />
            <Row label="USDC descontado" value={`${receipt.chargedUsdc.toFixed(6)} USDC`} />
            <Row label={t("pagomovil.receipt.ref")} value={receipt.bankReference} />
            <Row label={t("pagomovil.receipt.txid")} value={receipt.tropicoTxId} />
            <Row label="Vault" value={`${receipt.vaultPubkey.slice(0, 8)}…${receipt.vaultPubkey.slice(-4)}`} />
          </dl>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={downloadReceipt}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-tropico-border px-3 py-2 text-xs hover:border-tropico-sea"
            >
              <Download className="size-3" /> {t("pagomovil.receipt.download")}
            </button>
            <button
              onClick={shareWhatsApp}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-tropico-border px-3 py-2 text-xs hover:border-tropico-green"
            >
              <Share2 className="size-3" /> {t("pagomovil.receipt.share")}
            </button>
          </div>
          <button
            onClick={reset}
            className="text-center text-xs text-tropico-mute hover:text-tropico-sun"
          >
            Nuevo pago
          </button>
        </div>
      )}
    </section>
  );
}

function Row({
  label,
  value,
  strong,
  accent,
}: {
  label: string;
  value: string;
  strong?: boolean;
  accent?: "green";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-tropico-mute">{label}</dt>
      <dd
        className={`font-mono ${strong ? "font-bold" : ""} ${
          accent === "green" ? "text-tropico-green" : "text-tropico-text"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
