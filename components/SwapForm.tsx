"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { AlertTriangle } from "lucide-react";
import { TOKENS, TOKEN_LIST, type TokenSymbol, getTokenBySymbol } from "@/lib/tokens";
import { DualPrice } from "./DualPrice";
import { PixelLoader } from "./PixelLoader";
import { formatUSD, formatTokenAmount } from "@/lib/formato";
import { checkPerTx, AML_LIMITS } from "@/lib/aml";

type Quote = {
  outAmount: string;
  inAmount: string;
  priceImpactPct: string;
  platformFee?: { amount: string; feeBps: number };
};

const PLATFORM_FEE_BPS = 50;
const SLIPPAGE_BPS = 50;

export function SwapForm() {
  const searchParams = useSearchParams();

  const fromInit = (searchParams.get("from") as TokenSymbol) || "USDC";
  const toInit = (searchParams.get("to") as TokenSymbol) || "SOL";
  const amountInit = searchParams.get("amount") || "10";

  const [fromSymbol, setFromSymbol] = useState<TokenSymbol>(fromInit);
  const [toSymbol, setToSymbol] = useState<TokenSymbol>(toInit);
  const [amount, setAmount] = useState(amountInit);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fromToken = TOKENS[fromSymbol];
  const toToken = TOKENS[toSymbol];

  const amountNumber = useMemo(() => {
    const n = parseFloat(amount);
    return isNaN(n) || n <= 0 ? 0 : n;
  }, [amount]);

  // Fetch quote from Jupiter when inputs change
  useEffect(() => {
    if (amountNumber === 0) {
      setQuote(null);
      return;
    }
    const timer = setTimeout(() => {
      void fetchQuote();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromSymbol, toSymbol, amountNumber]);

  async function fetchQuote() {
    setLoading(true);
    setError(null);
    try {
      const rawAmount = BigInt(Math.round(amountNumber * 10 ** fromToken.decimals)).toString();
      const params = new URLSearchParams({
        inputMint: fromToken.mint,
        outputMint: toToken.mint,
        amount: rawAmount,
        slippageBps: String(SLIPPAGE_BPS),
        platformFeeBps: String(PLATFORM_FEE_BPS),
        swapMode: "ExactIn",
      });
      const res = await fetch(`https://lite-api.jup.ag/swap/v1/quote?${params.toString()}`);
      if (!res.ok) throw new Error(`Jupiter HTTP ${res.status}`);
      const data: Quote = await res.json();
      setQuote(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      setError(`No pudimos obtener cotización: ${msg}`);
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }

  function flip() {
    setFromSymbol(toSymbol);
    setToSymbol(fromSymbol);
  }

  const outAmountHuman = quote
    ? Number(quote.outAmount) / 10 ** toToken.decimals
    : 0;
  const platformFeeHuman = quote?.platformFee
    ? Number(quote.platformFee.amount) / 10 ** toToken.decimals
    : 0;
  const platformFeeUSD = platformFeeHuman * estimatedUsdPrice(toSymbol);
  const fromUSD = amountNumber * estimatedUsdPrice(fromSymbol);
  const toUSD = outAmountHuman * estimatedUsdPrice(toSymbol);

  return (
    <div className="flex flex-col gap-4">
      {/* From block */}
      <SideBlock
        label="Desde"
        symbol={fromSymbol}
        onSymbolChange={setFromSymbol}
        amount={amount}
        onAmountChange={setAmount}
        usd={fromUSD}
        editable
      />

      {/* Flip button */}
      <div className="-my-2 flex justify-center">
        <button
          onClick={flip}
          aria-label="Invertir"
          className="grid size-10 place-items-center rounded-full border border-tropico-border bg-tropico-panel text-tropico-mute transition hover:rotate-180 hover:border-tropico-purple hover:text-tropico-purple"
        >
          ↕
        </button>
      </div>

      {/* To block — outAmount ya viene descontado el fee de Jupiter (post-fee) */}
      <SideBlock
        label="Recibes exacto"
        symbol={toSymbol}
        onSymbolChange={setToSymbol}
        amount={
          loading
            ? "..."
            : outAmountHuman > 0
              ? formatTokenAmount(outAmountHuman, toToken.decimals, { maxDigits: 6 })
              : ""
        }
        usd={toUSD}
      />

      {/* Detalles */}
      {(quote || loading || error) && (
        <div className="panel flex flex-col gap-2 p-4 text-sm">
          {loading && (
            <PixelLoader variant="sun" size="sm" label="Buscando el mejor precio…" />
          )}
          {error && <div className="text-tropico-coral">{error}</div>}
          {quote && !loading && (
            <>
              <Row label="Tasa">
                <span>
                  1 {fromSymbol} ={" "}
                  {formatTokenAmount(outAmountHuman / amountNumber, 6, { maxDigits: 4 })}{" "}
                  {toSymbol}
                </span>
              </Row>
              <Row label="Slippage tolerado">
                <span>{(SLIPPAGE_BPS / 100).toFixed(2)}%</span>
              </Row>
              <Row label="Price impact">
                <span>{Number(quote.priceImpactPct).toFixed(2)}%</span>
              </Row>
              <Row
                label={
                  <span className="flex items-center gap-1 font-semibold text-tropico-green">
                    Comisi&oacute;n Tropico (0.5%)
                    <span
                      title="Tropico cobra 0.5% del swap — ya incluido en el monto que recibes, no se descuenta después."
                      className="cursor-help rounded-full border border-tropico-border px-1 text-[10px] text-tropico-mute"
                    >
                      ?
                    </span>
                  </span>
                }
              >
                <span className="font-semibold text-tropico-green">
                  {formatUSD(platformFeeUSD)}
                </span>
              </Row>
              <Row label="Ruta">
                <span className="text-tropico-mute">via Jupiter Aggregator</span>
              </Row>
            </>
          )}
        </div>
      )}

      {/* AML check — bloquea el botón si excede $5k por tx */}
      {(() => {
        const aml = checkPerTx(fromUSD);
        if (!aml.ok) {
          return (
            <div className="panel flex items-start gap-3 border-tropico-coral/30 bg-tropico-coral/5 p-4">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-tropico-coral" />
              <div className="flex flex-col gap-1 text-sm">
                <strong className="text-tropico-coral">{aml.message}</strong>
                <p className="text-xs text-tropico-mute">{aml.suggested}</p>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* CTA */}
      <button
        disabled={!quote || loading || !checkPerTx(fromUSD).ok}
        className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {!quote
          ? "Esperando cotizaci&oacute;n…"
          : !checkPerTx(fromUSD).ok
          ? `Excede l&iacute;mite AML ($${AML_LIMITS.PER_TX_USD.toLocaleString()})`
          : `Cambiar ${fromSymbol} → ${toSymbol} (DEMO)`}
      </button>

      <p className="text-center text-xs text-tropico-mute">
        Demo del hackathon &mdash; cuando configur&eacute;s tu wallet con Privy, este
        bot&oacute;n firmar&aacute; la transacci&oacute;n real con la fee aterrizando
        en la cuenta de Tropico (verificable en Solscan).
      </p>
    </div>
  );
}

function SideBlock({
  label,
  symbol,
  onSymbolChange,
  amount,
  onAmountChange,
  usd,
  editable = false,
}: {
  label: string;
  symbol: TokenSymbol;
  onSymbolChange: (s: TokenSymbol) => void;
  amount: string;
  onAmountChange?: (v: string) => void;
  usd: number;
  editable?: boolean;
}) {
  const token = TOKENS[symbol];
  return (
    <div className="panel flex items-center gap-4 p-4">
      <select
        value={symbol}
        onChange={(e) => onSymbolChange(e.target.value as TokenSymbol)}
        className="flex items-center gap-2 rounded-lg border border-tropico-border bg-tropico-ink px-3 py-2 text-sm font-semibold outline-none transition focus:border-tropico-purple"
      >
        {TOKEN_LIST.map((t) => (
          <option key={t.symbol} value={t.symbol}>
            {t.symbol}
          </option>
        ))}
      </select>
      <div className="flex-1 text-right">
        <div className="text-xs text-tropico-mute">{label}</div>
        {editable ? (
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => onAmountChange?.(e.target.value)}
            placeholder="0"
            className="w-full bg-transparent text-right font-display text-2xl font-bold tabular-nums outline-none"
          />
        ) : (
          <div className="font-display text-2xl font-bold tabular-nums">
            {amount || "0"}
          </div>
        )}
        {usd > 0 && (
          <DualPrice usd={usd} size="sm" align="right" />
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-tropico-mute">{label}</span>
      {children}
    </div>
  );
}

/**
 * Precios USD estimados HARDCODED para demo.
 * En producción se obtienen de Jupiter `/price` API o Pyth.
 */
function estimatedUsdPrice(symbol: TokenSymbol): number {
  const prices: Record<TokenSymbol, number> = {
    SOL: 150,
    USDC: 1,
    USDT: 1,
    JUP: 0.85,
    JTO: 2.3,
    mSOL: 168,
    KMNO: 0.12,
    RAY: 2.4,
    BONK: 0.000023,
    TROPI: 0, // devnet test token, sin valor mainnet
  };
  return prices[symbol] ?? 0;
}
