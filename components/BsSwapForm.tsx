"use client";

import {
  AML_LIMITS,
  checkPerTx,
  getTodayMovedUsd,
  recordMovedUsd,
} from "@/lib/aml";
import { getActiveCluster } from "@/lib/cluster";
import { formatUSD } from "@/lib/formato";
import { type Signer, makeKeypairSigner, sendWithSigner } from "@/lib/send-tx";
import {
  getLocalWalletPubkey,
  hasLocalWallet,
  unlockLocalWallet,
} from "@/lib/wallet-local";
import type { Transaction } from "@solana/web3.js";
import {
  AlertTriangle,
  ArrowDownUp,
  Building2,
  CheckCircle2,
  CreditCard,
  Droplets,
  ExternalLink,
  Radio,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type PrivySignerInjected = {
  address: string;
  signTransaction: (tx: Transaction) => Promise<Transaction>;
};

/**
 * Wallet destino del pool Tropico (devnet). En demo apunta al merchant placeholder.
 * En producción se reemplaza por la wallet real de la liquidity pool.
 */
const POOL_WALLET = "G4BPreo5Sbcr9WDf7ykzJ3yHMBMNHwWacYYxzSs4GSJB";

/**
 * BsSwapForm — Bs ↔ USDC inmediato vía Tropico Liquidity Pool.
 *
 * NO P2P. NO matching. NO esperar.
 * El user pone Bs (o USDC) → la pool de Tropico le entrega USDC (o Bs) al
 * instante al rate del momento (DolarAPI paralelo). Tropico cobra spread 1.5%
 * y rota la liquidez en background entre quienes venden y quienes compran.
 *
 * Carlos AI by Lumen monitorea la pool, ejecuta cada swap, valida AML pre-tx,
 * y reporta al usuario. Settlement <1 segundo siempre.
 */

const SPREAD_BPS = 150; // 1.5% spread Tropico
const POOL_BS_AVAILABLE = 50_000_000; // mock liquidity Bs
const POOL_USDC_AVAILABLE = 12_000; // mock liquidity USDC

type Side = "sell-bs" | "buy-bs";
type Method = "pagomovil" | "banco" | "tarjeta";

const METODOS = [
  {
    id: "pagomovil" as Method,
    label: "Pago Móvil",
    icon: Smartphone,
    tiempo: "Inmediato",
    fee: "1.5%",
    limite: "$5.000 / tx",
    color: "text-tropico-green",
    bg: "bg-tropico-green/10",
    ring: "ring-tropico-green/30",
  },
  {
    id: "banco" as Method,
    label: "Transferencia",
    icon: Building2,
    tiempo: "Inmediato",
    fee: "1.5%",
    limite: "$5.000 / tx",
    color: "text-tropico-purple",
    bg: "bg-tropico-purple/10",
    ring: "ring-tropico-purple/30",
  },
  {
    id: "tarjeta" as Method,
    label: "Tarjeta USD",
    icon: CreditCard,
    tiempo: "Inmediato",
    fee: "2.5%",
    limite: "$5.000 / tx",
    color: "text-tropico-coral",
    bg: "bg-tropico-coral/10",
    ring: "ring-tropico-coral/30",
  },
];

export function BsSwapForm({
  paraleloRate = 36.42,
  privySigner = null,
}: {
  paraleloRate?: number;
  privySigner?: PrivySignerInjected | null;
}) {
  const [side, setSide] = useState<Side>("sell-bs");
  const [method, setMethod] = useState<Method>("pagomovil");
  const [amount, setAmount] = useState("");
  const [executing, setExecuting] = useState(false);
  const [password, setPassword] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{
    bs: number;
    usdc: number;
    txSig: string;
    ts: string;
    onchain: boolean;
    explorer?: string;
    cluster?: string;
  } | null>(null);

  const cluster = getActiveCluster();
  const localPubkey =
    typeof window !== "undefined" && hasLocalWallet()
      ? getLocalWalletPubkey()
      : null;
  // Real tx posible solo en buy-bs (user envía USDC al pool) y con signer disponible
  const canDoRealTx = side === "buy-bs" && (!!privySigner || !!localPubkey);

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

  const amountNum = Number(amount);
  const inputCurrency = side === "sell-bs" ? "Bs" : "USDC";
  const selectedMethod = METODOS.find((m) => m.id === method)!;
  // Spread real depende del método (tarjeta cobra más por procesador, crypto solo gas)
  const effectiveSpreadBps = method === "tarjeta" ? 250 : SPREAD_BPS;

  // Cálculo del swap con spread del método elegido
  const calc = useMemo(() => {
    if (!amountNum || amountNum <= 0) return null;
    const spread = effectiveSpreadBps / 10000;
    if (side === "sell-bs") {
      // user da Bs, recibe USDC
      const usdcRaw = amountNum / paraleloRate;
      const usdcAfterFee = usdcRaw * (1 - spread);
      return {
        bsIn: amountNum,
        usdcOut: usdcAfterFee,
        usdcRaw,
        spread: usdcRaw - usdcAfterFee,
        usdValue: usdcAfterFee,
      };
    }
    // user da USDC, recibe Bs
    const bsRaw = amountNum * paraleloRate;
    const bsAfterFee = bsRaw * (1 - spread);
    return {
      bsOut: bsAfterFee,
      usdcIn: amountNum,
      bsRaw,
      spread: bsRaw - bsAfterFee,
      usdValue: amountNum,
    };
  }, [amountNum, paraleloRate, side]);

  // AML check
  const amlResult = useMemo(() => {
    if (!calc) return null;
    return checkPerTx(calc.usdValue);
  }, [calc]);

  const todayMoved = useMemo(getTodayMovedUsd, [executing]);

  async function execute() {
    if (!calc || !amlResult?.ok) return;
    setTxError(null);
    setExecuting(true);

    // Path real: buy-bs con signer disponible → transferencia USDC devnet
    if (canDoRealTx) {
      const signer = await getActiveSigner();
      if (!signer) {
        setExecuting(false);
        return;
      }
      const res = await sendWithSigner(
        signer,
        POOL_WALLET,
        "USDC",
        calc.usdcIn!,
      );
      if (!res.ok) {
        setTxError(res.error);
        setExecuting(false);
        return;
      }
      // recordMovedUsd ya lo hace sendWithSigner
      setConfirmed({
        bs: calc.bsOut!,
        usdc: calc.usdcIn!,
        txSig: res.signature,
        ts: new Date().toISOString(),
        onchain: true,
        explorer: res.explorer,
        cluster: res.cluster,
      });
      setExecuting(false);
      setAmount("");
      setPassword("");
      setNeedsPassword(false);
      return;
    }

    // Path mock: sell-bs (Bs entran off-chain) o sin signer conectado
    await new Promise((r) => setTimeout(r, 900));
    const txSig = `DEMO_${Math.random().toString(36).slice(2, 14)}`;
    recordMovedUsd(calc.usdValue);
    setConfirmed({
      bs: side === "sell-bs" ? calc.bsIn! : calc.bsOut!,
      usdc: side === "sell-bs" ? calc.usdcOut! : calc.usdcIn!,
      txSig,
      ts: new Date().toISOString(),
      onchain: false,
    });
    setExecuting(false);
    setAmount("");
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Single side — solo on-ramp Bs → USDC. Off-ramp (pagar en Bs) vive en /enviar */}
      <div className="flex flex-col gap-1.5 rounded-lg border border-tropico-sun/30 bg-tropico-sun/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-tropico-sun/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-tropico-sun">
            On-ramp
          </span>
          <span className="text-sm font-semibold text-tropico-text">Bs → USDC</span>
        </div>
        <p className="text-[11px] text-tropico-mute">
          Recibí Bs vía Pago Móvil → Tropico te acredita USDC en segundos. Para <strong>pagar en Bs</strong> a un
          comercio usá <a href="/enviar" className="font-semibold text-tropico-sun hover:underline">/enviar</a> —
          Tropico convierte USDC y ejecuta Pago Móvil al destinatario automático.
        </p>
      </div>

      {/* Selector de método — cómo entra/sale el dinero fiat al pool */}
      {side === "sell-bs" && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-tropico-mute">
            ¿Cómo vas a depositar los Bs?
          </span>
          <div className="grid grid-cols-3 gap-2">
            {METODOS.map((m) => {
              const Icon = m.icon;
              const active = method === m.id;
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => {
                    setMethod(m.id);
                    setConfirmed(null);
                  }}
                  className={`flex flex-col items-start gap-1.5 rounded-lg border p-2.5 text-left transition ${
                    active
                      ? `${m.bg} ${m.color} ring-1 ${m.ring} border-transparent`
                      : "border-tropico-border bg-tropico-ink/40 text-tropico-mute hover:border-tropico-sea/40"
                  }`}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                  <span className="text-xs font-semibold">{m.label}</span>
                  <span className="text-[10px] text-tropico-mute">
                    {m.tiempo} · fee {m.fee}
                  </span>
                </button>
              );
            })}
          </div>
          {/* Detalle del método activo */}
          <div className="flex flex-wrap items-center gap-3 rounded-md border border-tropico-border bg-tropico-ink/40 px-3 py-2 text-[11px] text-tropico-mute">
            <span className="flex items-center gap-1">
              <Zap className="size-3 text-tropico-sun" />{" "}
              {selectedMethod.tiempo}
            </span>
            <span>·</span>
            <span>
              Fee:{" "}
              <strong className={selectedMethod.color}>
                {selectedMethod.fee}
              </strong>
            </span>
            <span>·</span>
            <span>
              Límite:{" "}
              <strong className="text-tropico-text">
                {selectedMethod.limite}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* Pool stats — Bs NO muestra monto (custodia off-chain, privado),
           USDC SÍ muestra (on-chain público en Solscan) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-tropico-border bg-tropico-ink/40 p-2 text-center">
          <Droplets
            className="mx-auto size-4 text-tropico-sea"
            strokeWidth={1.75}
          />
          <div className="mt-1 text-[10px] uppercase text-tropico-mute">
            Pool Bs
          </div>
          <div className="font-display text-sm font-bold text-tropico-text">
            Disponible
          </div>
          <div
            className="text-[9px] text-tropico-mute"
            title="Bs viven off-chain (custodia agente VE), no se muestra monto público por privacidad"
          >
            off-chain
          </div>
        </div>
        <a
          href="https://solscan.io/account/G4BPreo5Sbcr9WDf7ykzJ3yHMBMNHwWacYYxzSs4GSJB"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-tropico-border bg-tropico-ink/40 p-2 text-center transition hover:border-tropico-green/40"
          title="USDC pool on-chain — verificable en Solscan"
        >
          <Droplets
            className="mx-auto size-4 text-tropico-green"
            strokeWidth={1.75}
          />
          <div className="mt-1 text-[10px] uppercase text-tropico-mute">
            Pool USDC
          </div>
          <div className="font-display text-sm font-bold text-tropico-text">
            {(POOL_USDC_AVAILABLE / 1000).toFixed(0)}k
          </div>
          <div className="text-[9px] text-tropico-green underline">
            Ver Solscan ↗
          </div>
        </a>
        <div className="rounded-lg border border-tropico-border bg-tropico-ink/40 p-2 text-center">
          <Zap className="mx-auto size-4 text-tropico-sun" strokeWidth={1.75} />
          <div className="mt-1 text-[10px] uppercase text-tropico-mute">
            Settlement
          </div>
          <div className="font-display text-sm font-bold text-tropico-text">
            {"<1s"}
          </div>
          <div className="text-[9px] text-tropico-mute">on-chain</div>
        </div>
      </div>

      {/* Input */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="bs-swap-amount"
          className="text-xs font-semibold uppercase tracking-wider text-tropico-mute"
        >
          Monto en {inputCurrency}
        </label>
        <div className="flex items-center gap-2 rounded-lg border border-tropico-border bg-tropico-ink/60 px-4 py-3">
          <input
            id="bs-swap-amount"
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setConfirmed(null);
            }}
            placeholder="0.00"
            min="0"
            step={side === "sell-bs" ? "1000" : "1"}
            className="flex-1 bg-transparent text-2xl font-bold focus:outline-none"
          />
          <span className="text-sm font-semibold text-tropico-mute">
            {inputCurrency}
          </span>
        </div>
        <div className="text-[11px] text-tropico-mute">
          Tasa actual:{" "}
          <strong className="text-tropico-text">{paraleloRate} Bs/USDC</strong>{" "}
          · Spread Tropico: 1.5%
        </div>
      </div>

      {/* Cálculo */}
      {calc && (
        <div className="panel flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-tropico-mute">Recibes (instantáneo)</span>
            <span className="font-display text-2xl font-bold text-tropico-green">
              {side === "sell-bs"
                ? `${calc.usdcOut?.toFixed(2)} USDC`
                : `${calc.bsOut?.toLocaleString("es-VE", { maximumFractionDigits: 0 })} Bs`}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-tropico-mute">
            <span>Spread (1.5%)</span>
            <span>
              {side === "sell-bs"
                ? `-${calc.spread.toFixed(4)} USDC`
                : `-${calc.spread.toLocaleString("es-VE", { maximumFractionDigits: 2 })} Bs`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 border-t border-tropico-border pt-2 text-[11px] text-tropico-mute">
            <Zap className="size-3 text-tropico-sun" />
            Vía Tropico Liquidity Pool — sin esperar contraparte, sin matching.
          </div>
        </div>
      )}

      {/* AML alerta */}
      {amlResult && !amlResult.ok && (
        <div className="panel flex items-start gap-3 border-tropico-coral/30 bg-tropico-coral/5 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-tropico-coral" />
          <div className="flex flex-col gap-1 text-sm">
            <strong className="text-tropico-coral">{amlResult.message}</strong>
            <p className="text-xs text-tropico-mute">{amlResult.suggested}</p>
          </div>
        </div>
      )}

      {/* AML status (info) */}
      {calc && amlResult?.ok && (
        <div className="flex items-center gap-2 rounded-md border border-tropico-sea/20 bg-tropico-sea/5 p-2 text-[11px] text-tropico-mute">
          <ShieldCheck className="size-3.5 text-tropico-sea" />
          <span>
            Hoy llevas movido{" "}
            <strong className="text-tropico-text">
              ${todayMoved.toLocaleString()}
            </strong>{" "}
            de ${AML_LIMITS.PER_DAY_USD.toLocaleString()} permitidos
          </span>
        </div>
      )}

      {/* Badge: onchain real vs mock */}
      {calc && (
        <div
          className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] ${
            canDoRealTx
              ? "border-tropico-green/30 bg-tropico-green/5 text-tropico-green"
              : "border-tropico-border bg-tropico-ink/40 text-tropico-mute"
          }`}
        >
          <Radio className="size-3" />
          {canDoRealTx ? (
            <span>
              <strong>
                {cluster === "devnet" ? "Devnet onchain" : "Onchain"}
              </strong>{" "}
              · tx real USDC firmada por tu wallet
            </span>
          ) : (
            <span>
              <strong>Demo</strong> ·{" "}
              {side === "sell-bs"
                ? "Bs entran off-chain por Pago Móvil/banco"
                : "conectá wallet para ejecutar tx real"}
            </span>
          )}
        </div>
      )}

      {/* Password modal — solo si local wallet sin Privy */}
      {needsPassword && !privySigner && (
        <div className="flex flex-col gap-2 rounded-md border border-tropico-sun/30 bg-tropico-sun/5 p-3">
          <label
            htmlFor="bs-swap-pwd"
            className="text-xs font-semibold text-tropico-sun"
          >
            Contraseña de tu wallet local
          </label>
          <input
            id="bs-swap-pwd"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-10 rounded-md border border-tropico-border bg-tropico-ink px-3 text-sm focus:border-tropico-sun focus:outline-none"
          />
        </div>
      )}

      {/* Error tx */}
      {txError && (
        <div className="panel flex items-start gap-3 border-tropico-coral/30 bg-tropico-coral/5 p-3 text-xs">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-tropico-coral" />
          <span className="text-tropico-coral">{txError}</span>
        </div>
      )}

      {/* Botón ejecutar */}
      <button
        type="button"
        onClick={execute}
        disabled={!calc || !amlResult?.ok || executing}
        className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {executing ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-tropico-ink/30 border-t-tropico-ink" />
            Ejecutando…
          </>
        ) : (
          <>
            <ArrowDownUp className="size-4" />
            Cambiar ahora · settlement &lt;1s
          </>
        )}
      </button>

      {/* Confirmación */}
      {confirmed && (
        <div className="panel flex flex-col gap-2 border-tropico-green/30 bg-tropico-green/5 p-4">
          <header className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-tropico-green" />
            <strong className="text-tropico-green">¡Listo!</strong>
            {confirmed.onchain && (
              <span className="rounded-full border border-tropico-green/40 bg-tropico-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-tropico-green">
                {confirmed.cluster ?? "onchain"} · real
              </span>
            )}
            <span className="ml-auto text-xs text-tropico-mute">
              {new Date(confirmed.ts).toLocaleTimeString("es-VE")}
            </span>
          </header>
          <p className="text-sm text-tropico-text">
            {confirmed.onchain ? "Enviaste " : "Recibiste "}
            <strong className="text-tropico-green">
              {confirmed.onchain
                ? `${confirmed.usdc.toFixed(2)} USDC`
                : side === "sell-bs"
                  ? `${confirmed.usdc.toFixed(2)} USDC`
                  : `${confirmed.bs.toLocaleString("es-VE", { maximumFractionDigits: 0 })} Bs`}
            </strong>{" "}
            {confirmed.onchain
              ? "al pool Tropico (tx real on-chain)."
              : "en tu wallet."}
          </p>
          {confirmed.onchain && side === "buy-bs" && (
            <div className="mt-1 flex flex-col gap-1 rounded-md border border-tropico-sun/30 bg-tropico-sun/5 p-2.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-tropico-mute">Bs pagados al destinatario</span>
                <strong className="text-tropico-sun">
                  {confirmed.bs.toLocaleString("es-VE", { maximumFractionDigits: 0 })} Bs
                </strong>
              </div>
              <div className="text-tropico-mute">
                Tropico convirtió tus USDC y envió Pago Móvil al comercio/persona en <strong className="text-tropico-text">&lt;5s</strong>.
                Vos seguís con USDC — el bolívar se usa solo al momento del pago. Sin cuenta bancaria, sin holds.
              </div>
            </div>
          )}
          {confirmed.explorer ? (
            <a
              href={confirmed.explorer}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-tropico-green hover:underline"
            >
              Ver en Solscan <ExternalLink className="size-3" />
            </a>
          ) : (
            <code className="break-all text-[10px] text-tropico-mute">
              {confirmed.txSig}
            </code>
          )}
        </div>
      )}

      {/* Carlos monitoring */}
      <div className="flex items-start gap-2 rounded-md border border-tropico-purple/20 bg-tropico-purple/5 p-3 text-xs">
        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-tropico-purple" />
        <div className="text-tropico-mute">
          <strong className="text-tropico-purple">Carlos AI by Lumen</strong>{" "}
          monitorea la pool, valida AML, ejecuta y audita en segundos. La pool
          rota Bs↔USDC en background entre vendedores y compradores — tú nunca
          esperas.
        </div>
      </div>
    </div>
  );
}
