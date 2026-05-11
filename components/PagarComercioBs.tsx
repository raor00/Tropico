"use client";

import type { PrivySignerInjected } from "@/components/BsSwapForm";
import { AML_LIMITS, checkPerTx } from "@/lib/aml";
import { type Signer, makeKeypairSigner, sendWithSigner } from "@/lib/send-tx";
import { DEMO_MERCHANT_WALLET as POOL_WALLET } from "@/lib/solana-pay";
import {
  type Suiche7BPayload,
  buildDemoQRPayload,
  parseSuiche7BQR,
} from "@/lib/suiche7b-parser";
import {
  getLocalWalletPubkey,
  hasLocalWallet,
  unlockLocalWallet,
} from "@/lib/wallet-local";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  QrCode,
  Smartphone,
  Sparkles,
  Store,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

type Step = "scan" | "review" | "confirmed";

const SPREAD_BPS = 150; // 1.5%

export function PagarComercioBs({
  paraleloRate = 36.42,
  privySigner = null,
}: {
  paraleloRate?: number;
  privySigner?: PrivySignerInjected | null;
}) {
  const [step, setStep] = useState<Step>("scan");
  const [rawQR, setRawQR] = useState("");
  const [payload, setPayload] = useState<Suiche7BPayload | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [password, setPassword] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{
    bs: number;
    usdc: number;
    txSig: string;
    explorer?: string;
    ts: string;
    payload: Suiche7BPayload;
  } | null>(null);

  const localPubkey =
    typeof window !== "undefined" && hasLocalWallet()
      ? getLocalWalletPubkey()
      : null;

  const calc = useMemo(() => {
    if (!payload) return null;
    const usdcRaw = payload.montoBs / paraleloRate;
    const usdcWithFee = usdcRaw * (1 + SPREAD_BPS / 10000);
    return {
      bs: payload.montoBs,
      usdcRaw,
      usdc: usdcWithFee,
      spread: usdcWithFee - usdcRaw,
    };
  }, [payload, paraleloRate]);

  const amlResult = calc ? checkPerTx(calc.usdc) : null;
  const canDoRealTx = !!privySigner || !!localPubkey;

  async function getActiveSigner(): Promise<Signer | null> {
    if (privySigner) {
      return {
        type: "privy",
        address: privySigner.address,
        signTransaction: privySigner.signTransaction,
      };
    }
    if (localPubkey) {
      if (!password) {
        setNeedsPassword(true);
        return null;
      }
      const kp = await unlockLocalWallet(password);
      if (!kp) {
        setTxError("Contraseña incorrecta");
        return null;
      }
      return makeKeypairSigner(kp);
    }
    return null;
  }

  function tryParse(text: string) {
    setParseError(null);
    const parsed = parseSuiche7BQR(text);
    if (!parsed) {
      setParseError(
        "QR no reconocido. Esperamos formato Suiche7B (JSON / S7B|... / key=value).",
      );
      return;
    }
    setPayload(parsed);
    setStep("review");
  }

  function loadDemoQR() {
    const demo = buildDemoQRPayload({
      montoBs: 850.5,
      comercio: "Bodegón Tropico Caracas",
      concepto: "Empanadas + jugo",
    });
    setRawQR(demo);
    tryParse(demo);
  }

  async function executePayment() {
    if (!calc || !payload || !amlResult?.ok) return;
    setTxError(null);
    setExecuting(true);

    if (!canDoRealTx) {
      // Demo path — mock tx
      await new Promise((r) => setTimeout(r, 900));
      const txSig = `DEMO_${Math.random().toString(36).slice(2, 14)}`;
      setConfirmed({
        bs: calc.bs,
        usdc: calc.usdc,
        txSig,
        ts: new Date().toISOString(),
        payload,
      });
      setStep("confirmed");
      setExecuting(false);
      return;
    }

    const signer = await getActiveSigner();
    if (!signer) {
      setExecuting(false);
      return;
    }
    const res = await sendWithSigner(signer, POOL_WALLET, "USDC", calc.usdc);
    if (!res.ok) {
      setTxError(res.error);
      setExecuting(false);
      return;
    }
    setConfirmed({
      bs: calc.bs,
      usdc: calc.usdc,
      txSig: res.signature,
      explorer: res.explorer,
      ts: new Date().toISOString(),
      payload,
    });
    setStep("confirmed");
    setExecuting(false);
    setPassword("");
    setNeedsPassword(false);
  }

  function reset() {
    setStep("scan");
    setRawQR("");
    setPayload(null);
    setParseError(null);
    setConfirmed(null);
    setTxError(null);
  }

  // ──────────────────────────────────────────────────────────────
  if (step === "confirmed" && confirmed) {
    return (
      <div className="panel flex flex-col gap-4 border-tropico-green/30 bg-tropico-green/5 p-5">
        <header className="flex items-center gap-2">
          <CheckCircle2 className="size-6 text-tropico-green" />
          <strong className="font-display text-xl text-tropico-green">
            ¡Pago enviado!
          </strong>
          {confirmed.explorer && (
            <span className="ml-auto rounded-full border border-tropico-green/40 bg-tropico-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-tropico-green">
              devnet · real
            </span>
          )}
        </header>

        <div className="rounded-lg border border-tropico-border bg-tropico-ink/40 p-4 text-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-tropico-mute">Pagaste a</span>
            <strong className="text-tropico-text">
              {confirmed.payload.comercio ?? confirmed.payload.bancoNombre}
            </strong>
          </div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-tropico-mute">Monto</span>
            <strong className="text-tropico-sun">
              {confirmed.bs.toLocaleString("es-VE", {
                minimumFractionDigits: 2,
              })}{" "}
              Bs
            </strong>
          </div>
          <div className="flex items-center justify-between border-t border-tropico-border pt-2 text-xs">
            <span className="text-tropico-mute">Salió de tu wallet</span>
            <span className="text-tropico-text">
              {confirmed.usdc.toFixed(4)} USDC
            </span>
          </div>
        </div>

        <div className="rounded-md border border-tropico-sun/30 bg-tropico-sun/5 p-3 text-[11px]">
          <div className="flex items-start gap-2">
            <Zap className="mt-0.5 size-4 shrink-0 text-tropico-sun" />
            <div className="text-tropico-text/85">
              Tropico convirtió tus USDC → Bs y envió Pago Móvil al comercio vía
              Suiche 7B.{" "}
              <strong className="text-tropico-sun">
                Acreditado en &lt;5s.
              </strong>{" "}
              Tú sigues con USDC — sin cuenta bancaria, sin colas.
            </div>
          </div>
        </div>

        {confirmed.explorer ? (
          <a
            href={confirmed.explorer}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-tropico-green hover:underline"
          >
            Ver tx on-chain en Solscan <ExternalLink className="size-3.5" />
          </a>
        ) : (
          <code className="break-all text-[10px] text-tropico-mute">
            {confirmed.txSig}
          </code>
        )}

        <button type="button" onClick={reset} className="btn-ghost mt-2">
          Pagar otro
        </button>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  if (step === "review" && payload && calc) {
    return (
      <div className="flex flex-col gap-4">
        <div className="panel flex flex-col gap-3 p-5">
          <header className="flex items-center gap-2">
            <Store className="size-5 text-tropico-sun" />
            <strong className="font-display text-lg">
              {payload.comercio ?? "Pago Móvil"}
            </strong>
          </header>

          <div className="grid gap-2 text-sm">
            <Row label="Banco">{payload.bancoNombre}</Row>
            <Row label="Teléfono">{payload.telefono}</Row>
            <Row label="Cédula">{payload.cedula}</Row>
            {payload.concepto && <Row label="Concepto">{payload.concepto}</Row>}
            {payload.referencia && (
              <Row label="Referencia">
                <code className="text-[11px]">{payload.referencia}</code>
              </Row>
            )}
          </div>
        </div>

        <div className="panel flex flex-col gap-3 border-tropico-sun/30 bg-tropico-sun/5 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-tropico-mute">Monto a pagar</span>
            <strong className="font-display text-2xl text-tropico-sun">
              {calc.bs.toLocaleString("es-VE", { minimumFractionDigits: 2 })} Bs
            </strong>
          </div>
          <div className="flex items-center justify-between text-xs text-tropico-mute">
            <span>Equivalente USDC (auto-FX)</span>
            <strong className="text-tropico-text">
              {calc.usdc.toFixed(4)} USDC
            </strong>
          </div>
          <div className="flex items-center justify-between text-[11px] text-tropico-mute">
            <span>Tasa · spread Tropico 1.5%</span>
            <span>{paraleloRate.toFixed(2)} Bs/USDC</span>
          </div>
        </div>

        {amlResult && !amlResult.ok && (
          <div className="panel flex items-start gap-3 border-tropico-coral/30 bg-tropico-coral/5 p-4">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-tropico-coral" />
            <div className="text-sm">
              <strong className="text-tropico-coral">
                {amlResult.message}
              </strong>
              <p className="mt-1 text-xs text-tropico-mute">
                {amlResult.suggested}
              </p>
            </div>
          </div>
        )}

        <div
          className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] ${
            canDoRealTx
              ? "border-tropico-green/30 bg-tropico-green/5 text-tropico-green"
              : "border-tropico-border bg-tropico-ink/40 text-tropico-mute"
          }`}
        >
          {canDoRealTx ? (
            <>
              <Zap className="size-3" /> Devnet · firma la tx real con tu wallet
            </>
          ) : (
            <>
              <Sparkles className="size-3" /> Demo · simulado (conecta Privy o
              wallet local para tx real)
            </>
          )}
        </div>

        {needsPassword && (
          <div className="panel flex flex-col gap-2 p-4">
            <label htmlFor="pwd-pagar-bs" className="text-xs text-tropico-mute">
              Contraseña wallet local
            </label>
            <input
              id="pwd-pagar-bs"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-tropico-border bg-tropico-ink/60 px-3 py-2 text-sm"
              placeholder="••••••••"
            />
          </div>
        )}

        {txError && (
          <div className="rounded-md border border-tropico-coral/40 bg-tropico-coral/10 p-3 text-xs text-tropico-coral">
            {txError}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={executing || (amlResult ? !amlResult.ok : false)}
            onClick={executePayment}
            className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {executing ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-tropico-ink/30 border-t-tropico-ink" />
                Procesando pago…
              </>
            ) : (
              <>
                <Zap className="size-4" /> Pagar{" "}
                {calc.bs.toLocaleString("es-VE", { maximumFractionDigits: 0 })}{" "}
                Bs · settlement &lt;5s
              </>
            )}
          </button>
          <button
            type="button"
            onClick={reset}
            className="text-xs text-tropico-mute hover:text-tropico-text"
          >
            ← Escanear otro QR
          </button>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // step === "scan"
  return (
    <div className="flex flex-col gap-4">
      <div className="panel flex flex-col gap-3 p-5">
        <header className="flex items-center gap-2">
          <QrCode className="size-5 text-tropico-sun" />
          <strong className="font-display text-lg">
            Pagar a comercio en Bs
          </strong>
        </header>
        <p className="text-sm text-tropico-mute">
          Escanea el QR Suiche 7B del comercio. Tropico convierte tus USDC y
          ejecuta Pago Móvil al destinatario en segundos. Tú nunca dejas de
          tener USDC.
        </p>
      </div>

      <div className="panel flex flex-col gap-3 p-5">
        <label
          htmlFor="qr-suiche"
          className="text-xs font-semibold uppercase tracking-wider text-tropico-mute"
        >
          Pega el contenido del QR Suiche 7B
        </label>
        <textarea
          id="qr-suiche"
          rows={3}
          value={rawQR}
          onChange={(e) => setRawQR(e.target.value)}
          placeholder='{"banco":"0134","telefono":"04141234567",...}  ó  SUICHE7B|0134|...'
          className="w-full rounded-md border border-tropico-border bg-tropico-ink/60 px-3 py-2 font-mono text-xs"
        />
        {parseError && (
          <div className="flex items-start gap-2 rounded-md border border-tropico-coral/40 bg-tropico-coral/10 p-2.5 text-xs text-tropico-coral">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>{parseError}</span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => tryParse(rawQR)}
            disabled={!rawQR.trim()}
            className="btn-primary disabled:opacity-50"
          >
            <Smartphone className="size-4" /> Procesar QR
          </button>
          <button
            type="button"
            onClick={loadDemoQR}
            className="rounded-xl border border-tropico-sun/40 bg-tropico-sun/10 px-4 py-3 text-sm font-semibold text-tropico-sun transition hover:bg-tropico-sun/20"
          >
            Usar QR demo
          </button>
        </div>
        <p className="text-[11px] text-tropico-mute">
          Por ahora pegas el contenido manualmente. Cámara nativa: roadmap Q3
          2026.
        </p>
      </div>

      <div className="rounded-md border border-tropico-purple/20 bg-tropico-purple/5 p-3 text-xs">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-tropico-purple" />
          <div className="text-tropico-mute">
            <strong className="text-tropico-purple">Carlos AI</strong> valida el
            QR, calcula la mejor tasa de FX en tiempo real y audita el pago. Si
            excede límite AML (${AML_LIMITS.PER_TX_USD.toLocaleString()}/tx), te
            avisa antes.
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-tropico-mute">{label}</span>
      <span className="font-medium text-tropico-text">{children}</span>
    </div>
  );
}
