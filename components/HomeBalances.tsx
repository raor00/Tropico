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

/**
 * HomeBalances — sección client-side que lee balance REAL on-chain del wallet
 * activo (local o dev). Reemplaza el MOCK_PORTFOLIO en /home.
 *
 * Detecta wallet de localStorage:
 *   - tropico:wallet:v1 (wallet local encriptada)
 *   - tropico:dev-wallet (modo dev devnet)
 *
 * Lee SOL + 8 SPL tokens via Helius RPC (NEXT_PUBLIC_HELIUS_RPC).
 * Refresh cada 30s + botón manual.
 */
export function HomeBalances() {
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [balances, setBalances] = useState<WalletBalances>(EMPTY_BALANCES);
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

  // Detectar wallet activa
  useEffect(() => {
    let pk: string | null = null;
    if (hasLocalWallet()) {
      pk = getLocalWalletPubkey();
    } else {
      try {
        const dev = JSON.parse(localStorage.getItem("tropico:dev-wallet") ?? "null");
        pk = dev?.publicKey ?? null;
      } catch {}
    }
    setPubkey(pk);
    if (!pk) setLoading(false);
  }, []);

  // Fetch balances cuando hay pubkey + auto-refresh cada 30s
  useEffect(() => {
    if (!pubkey) return;
    let cancelled = false;
    let intervalId: NodeJS.Timeout | undefined;

    async function load() {
      try {
        setError(null);
        const b = await fetchAllBalances(pubkey!);
        if (!cancelled) {
          setBalances(b);
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
    fetchAllBalances(pubkey)
      .then((b) => {
        setBalances(b);
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

  // Mapear a BalanceList format
  const balancesList = [
    { symbol: "SOL", amount: balances.sol, usdValue: balances.sol * 180 },
    { symbol: "USDC", amount: balances.usdc, usdValue: balances.usdc },
    { symbol: "USDT", amount: balances.usdt, usdValue: balances.usdt },
    { symbol: "JUP", amount: balances.jup, usdValue: balances.jup * 0.85 },
    { symbol: "JTO", amount: balances.jto, usdValue: balances.jto * 3.2 },
    { symbol: "mSOL", amount: balances.msol, usdValue: balances.msol * 200 },
    { symbol: "KMNO", amount: balances.kmno, usdValue: balances.kmno * 0.08 },
    { symbol: "RAY", amount: balances.ray, usdValue: balances.ray * 4.5 },
    { symbol: "BONK", amount: balances.bonk, usdValue: balances.bonk * 0.000020 },
  ].filter((b) => b.amount > 0); // solo mostrar tokens con saldo

  return (
    <>
      {/* Saldo total real on-chain */}
      <section className="panel flex flex-col gap-3 p-4 md:p-5">
        <header className="flex items-center justify-between gap-2">
          <span className="text-xs text-tropico-mute">Saldo total · on-chain</span>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleCluster}
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider transition ${
                cluster === "mainnet-beta"
                  ? "bg-tropico-green/15 text-tropico-green hover:bg-tropico-green/25"
                  : "bg-tropico-coral/15 text-tropico-coral hover:bg-tropico-coral/25"
              }`}
              title="Click para cambiar entre mainnet y devnet"
            >
              {cluster === "mainnet-beta" ? "MAINNET" : "DEVNET"} ⇄
            </button>
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
        <DualPrice usd={balances.totalUsd} size="xl" />
        {error && (
          <p className="text-xs text-tropico-coral">
            ⚠ Error leyendo balance: {error}
          </p>
        )}
        <div className="grid grid-cols-3 gap-2 border-t border-tropico-border pt-3">
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
          <BalanceList balances={balancesList as never} />
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
