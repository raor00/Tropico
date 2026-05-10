"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";
import { DualPrice } from "@/components/DualPrice";
import { BalanceList } from "@/components/BalanceList";
import { formatUSD } from "@/lib/formato";
import { fetchAllBalances, EMPTY_BALANCES, type WalletBalances } from "@/lib/balances";
import { hasLocalWallet, getLocalWalletPubkey } from "@/lib/wallet-local";
import { getActiveCluster, setActiveCluster, type Cluster } from "@/lib/cluster";
import { HomeBalancesPrivyWrapper } from "@/components/HomeBalancesPrivy";
import { fetchPrices, type TokenPrice } from "@/lib/prices";
import type { TokenSymbol } from "@/lib/tokens";
import { DevnetFaucetButton } from "@/components/DevnetFaucetButton";

const PRIVY_ENABLED = !!process.env.NEXT_PUBLIC_PRIVY_APP_ID;

/**
 * Entry: si Privy está habilitado, usa wrapper que también detecta wallets Privy.
 * Si no, usa la detección local-only directamente.
 */
export function HomeBalances() {
  if (PRIVY_ENABLED) {
    return <HomeBalancesPrivyWrapper Inner={HomeBalancesCore} />;
  }
  return <HomeBalancesCore />;
}

/**
 * HomeBalances — sección client-side que lee balance REAL on-chain del wallet
 * activo. Detecta wallet en orden:
 *   1. externalPubkey prop (ej. wallet Privy embedded resuelto por wrapper)
 *   2. tropico:wallet:v1 (wallet local encriptada)
 *   3. tropico:dev-wallet (modo dev devnet)
 *
 * Lee SOL + SPL tokens via Helius RPC (NEXT_PUBLIC_HELIUS_RPC).
 * Refresh cada 30s + botón manual.
 */
export function HomeBalancesCore({ externalPubkey }: { externalPubkey?: string | null } = {}) {
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [balances, setBalances] = useState<WalletBalances>(EMPTY_BALANCES);
  const [prices, setPrices] = useState<Record<TokenSymbol, TokenPrice> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const [cluster, setCluster] = useState<Cluster>("mainnet-beta");

  // Sincronizar cluster activo + escuchar cambios
  useEffect(() => {
    setCluster(getActiveCluster());
    const onChange = () => setCluster(getActiveCluster());
    window.addEventListener("tropico:cluster-changed", onChange);
    return () => window.removeEventListener("tropico:cluster-changed", onChange);
  }, []);

  function toggleCluster() {
    const next: Cluster = cluster === "mainnet-beta" ? "devnet" : "mainnet-beta";
    setActiveCluster(next);
    setCluster(next);
    if (pubkey) {
      setLoading(true);
      fetchAllBalances(pubkey)
        .then(setBalances)
        .finally(() => {
          setLoading(false);
          setLastFetch(Date.now());
        });
    }
  }

  // Detectar wallet activa (orden: externa Privy → local → dev)
  useEffect(() => {
    let pk: string | null = externalPubkey ?? null;
    if (!pk && hasLocalWallet()) {
      pk = getLocalWalletPubkey();
    }
    if (!pk) {
      try {
        const dev = JSON.parse(localStorage.getItem("tropico:dev-wallet") ?? "null");
        pk = dev?.publicKey ?? null;
      } catch {}
    }
    setPubkey(pk);
    if (!pk) setLoading(false);
  }, [externalPubkey]);

  // Fetch balances + precios cuando hay pubkey + auto-refresh cada 30s
  useEffect(() => {
    if (!pubkey) return;
    let cancelled = false;
    let intervalId: NodeJS.Timeout | undefined;

    async function load() {
      try {
        setError(null);
        const [b, p] = await Promise.all([
          fetchAllBalances(pubkey!),
          fetchPrices(),
        ]);
        if (!cancelled) {
          setBalances(b);
          setPrices(p);
          setLastFetch(Date.now());
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    intervalId = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [pubkey]);

  function refresh() {
    if (!pubkey) return;
    setLoading(true);
    Promise.all([fetchAllBalances(pubkey), fetchPrices()])
      .then(([b, p]) => {
        setBalances(b);
        setPrices(p);
        setLastFetch(Date.now());
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }

  // Sin wallet → CTA crear
  if (!pubkey && !loading) {
    return (
      <section className="panel flex flex-col items-center gap-3 p-6 text-center">
        <p className="text-tropico-mute">No detectamos wallet en este navegador.</p>
        <Link href="/wallet/crear" className="btn-primary">
          Crear mi wallet
        </Link>
      </section>
    );
  }

  // Mapear a BalanceList format usando precios LIVE de Jupiter v3.
  // Mientras carga, usa fallback estático (no rompe UI).
  const px = (sym: TokenSymbol) => prices?.[sym] ?? { usd: 0, change24h: 0 };
  const balancesList = [
    { symbol: "SOL" as const, amount: balances.sol },
    { symbol: "USDC" as const, amount: balances.usdc },
    { symbol: "USDT" as const, amount: balances.usdt },
    { symbol: "JUP" as const, amount: balances.jup },
    { symbol: "JTO" as const, amount: balances.jto },
    { symbol: "mSOL" as const, amount: balances.msol },
    { symbol: "KMNO" as const, amount: balances.kmno },
    { symbol: "RAY" as const, amount: balances.ray },
    { symbol: "BONK" as const, amount: balances.bonk },
    { symbol: "TROPI" as const, amount: balances.tropi },
  ]
    .filter((b) => b.amount > 0)
    .map((b) => ({
      symbol: b.symbol,
      amount: b.amount,
      valueUSD: b.amount * px(b.symbol).usd,
      cambio24h: px(b.symbol).change24h,
    }));

  // Total real recalculado con precios live
  const totalUsdLive = balancesList.reduce((acc, b) => acc + b.valueUSD, 0);

  return (
    <>
      {/* MOBILE: card minimalista — paleta sobria pro (deep navy + teal),
          sin saturaciones tipo casino. Detalles sun/sea muy sutiles. */}
      <section className="md:hidden relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-[#0a1929] via-[#0e2233] to-[#0a1a26] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        {/* Sheen sea muy sutil top-right */}
        <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-gradient-to-br from-tropico-sea/12 to-transparent blur-3xl" />
        {/* Acento sun bottom-left aún más sutil */}
        <div className="pointer-events-none absolute -left-12 -bottom-12 size-32 rounded-full bg-tropico-sun/[0.04] blur-3xl" />

        <div className="relative flex flex-col gap-3">
          {/* Top row: label + cluster badge */}
          <header className="flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.18em] text-tropico-mute">
                Saldo disponible
              </span>
              <DevnetFaucetButton />
            </div>
            <div className="flex items-center gap-1.5">
              {/* Solo mostrar pill si está en devnet (modo demo). En mainnet no aparece. */}
              {cluster === "devnet" && (
                <button
                  onClick={toggleCluster}
                  className="inline-flex items-center gap-1 rounded-full bg-tropico-coral/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-tropico-coral ring-1 ring-tropico-coral/30 transition hover:bg-tropico-coral/25"
                  title="Click para volver a mainnet"
                >
                  <span className="size-1.5 animate-pulse rounded-full bg-tropico-coral" />
                  Modo demo
                </button>
              )}
              <button
                onClick={refresh}
                disabled={loading}
                className="text-tropico-mute hover:text-tropico-sun disabled:opacity-50"
                aria-label="Actualizar"
              >
                <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </header>

          {/* Layout 2 col: monto a la izq, isla a la derecha */}
          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-col">
              <div className="font-display text-[2.5rem] font-black leading-none tracking-tight text-white tabular-nums">
                ${totalUsdLive.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="mt-1 text-xs font-semibold text-tropico-mute">
                {balances.usdc.toFixed(2)} USDC
                {balancesList.length > 1 && (
                  <span className="text-tropico-mute/70"> · +{balancesList.length - 1} más</span>
                )}
              </div>

              {/* Connected pill — Solana on-chain */}
              <div className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-tropico-green/30 bg-tropico-green/10 px-2.5 py-1 text-[10px] font-semibold text-tropico-green">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tropico-green opacity-60" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-tropico-green" />
                </span>
                On-chain · Solana
              </div>
            </div>

            {/* Isla mascot — halo sea sutil, sin tinte cálido casino */}
            <div className="relative flex size-24 shrink-0 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-tropico-sea/10 blur-xl" />
              <span className="relative text-5xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)] opacity-90">
                🏝️
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* DESKTOP: panel completo con DualPrice + 3-col breakdown */}
      <section className="hidden md:flex panel flex-col gap-3 p-5">
        <header className="flex items-center justify-between gap-2">
          <span className="text-xs text-tropico-mute">Saldo total · on-chain</span>
          <div className="flex items-center gap-2">
            {cluster === "devnet" && (
              <button
                onClick={toggleCluster}
                className="inline-flex items-center gap-1.5 rounded-full bg-tropico-coral/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-tropico-coral hover:bg-tropico-coral/25"
                title="Click para volver a mainnet"
              >
                <span className="size-1.5 animate-pulse rounded-full bg-tropico-coral" />
                Modo demo
              </button>
            )}
            <button
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center gap-1 text-[10px] text-tropico-mute hover:text-tropico-sun disabled:opacity-50"
            >
              <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
              {lastFetch
                ? `Hace ${Math.max(1, Math.round((Date.now() - lastFetch) / 1000))}s`
                : "Cargando…"}
            </button>
          </div>
        </header>
        <DualPrice usd={totalUsdLive} size="xl" />
        {error && (
          <p className="text-[10px] text-tropico-coral md:text-xs">
            ⚠ Error: {error}
          </p>
        )}
        <div className="hidden grid-cols-3 gap-2 border-t border-tropico-border pt-3 md:grid">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-tropico-mute">USDC</div>
            <div className="font-display text-base font-bold text-tropico-green">
              {balances.usdc.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-tropico-mute">SOL</div>
            <div className="font-display text-base font-bold">
              {balances.sol.toFixed(4)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-tropico-mute">Otros</div>
            <div className="font-display text-base font-bold">
              {balancesList.length - 2 < 0 ? 0 : balancesList.filter((b) => b.symbol !== "SOL" && b.symbol !== "USDC").length}
            </div>
          </div>
        </div>
      </section>

      {/* Lista detallada — solo tokens con saldo */}
      {balancesList.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-tropico-mute">
            Tus tokens
          </h2>
          <BalanceList balances={balancesList} />
        </section>
      )}

      {balancesList.length === 0 && !loading && (
        <section className="panel flex flex-col items-center gap-3 border-tropico-sun/30 bg-tropico-sun/5 p-6 text-center">
          <p className="text-sm text-tropico-mute">
            Tu wallet está vacía. Fondea con USDC para empezar.
          </p>
          <div className="flex gap-2">
            <Link href="/depositar" className="btn-primary">
              <Plus className="size-4" /> Depositar
            </Link>
            <Link href="/cambiar" className="btn-ghost">
              Reclamar faucet
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
