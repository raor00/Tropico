"use client";

import { BsSwapForm, type PrivySignerInjected } from "@/components/BsSwapForm";
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import type { Transaction } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";

const PRIVY_ENABLED = !!process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const FALLBACK_RATE = 36.42;

type RateState = {
  usdToBs: number;
  fuente: "ve.dolarapi.com" | "fallback";
  fetchedAt: number;
};

function useParaleloRate(): RateState {
  const [rate, setRate] = useState<RateState>({
    usdToBs: FALLBACK_RATE,
    fuente: "fallback",
    fetchedAt: 0,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/precio-bs", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as RateState;
        if (cancelled) return;
        if (typeof data.usdToBs === "number" && data.usdToBs > 0) {
          setRate({
            usdToBs: data.usdToBs,
            fuente: data.fuente,
            fetchedAt: data.fetchedAt,
          });
        }
      } catch {
        /* fallback ya seteado */
      }
    }
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return rate;
}

function RateBadge({ rate }: { rate: RateState }) {
  const live = rate.fuente === "ve.dolarapi.com";
  const ts = rate.fetchedAt
    ? new Date(rate.fetchedAt).toLocaleTimeString("es-VE", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
  return (
    <div
      className={`flex items-center justify-between rounded-md border px-3 py-1.5 text-[11px] ${
        live
          ? "border-tropico-green/30 bg-tropico-green/5 text-tropico-green"
          : "border-tropico-sun/30 bg-tropico-sun/5 text-tropico-sun"
      }`}
    >
      <span>
        <strong>{rate.usdToBs.toFixed(2)} Bs/USDC</strong> ·{" "}
        {live ? "paralelo live (DolarAPI)" : "fallback estático"}
      </span>
      <span className="text-tropico-mute">act. {ts}</span>
    </div>
  );
}

export function BsSwapFormEntry() {
  const rate = useParaleloRate();
  return (
    <div className="flex flex-col gap-3">
      <RateBadge rate={rate} />
      {PRIVY_ENABLED ? (
        <BsSwapFormPrivyWrapper paraleloRate={rate.usdToBs} />
      ) : (
        <BsSwapForm paraleloRate={rate.usdToBs} />
      )}
    </div>
  );
}

function BsSwapFormPrivyWrapper({ paraleloRate }: { paraleloRate?: number }) {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useSolanaWallets();

  const privySigner = useMemo<PrivySignerInjected | null>(() => {
    if (!ready || !authenticated || wallets.length === 0) return null;
    const embedded = wallets.find((w) => w.walletClientType === "privy");
    const wallet = embedded ?? wallets[0];
    if (!wallet?.address) return null;
    return {
      address: wallet.address,
      signTransaction: async (tx: Transaction) => {
        const w = wallet as unknown as {
          signTransaction: (tx: Transaction) => Promise<Transaction>;
        };
        return await w.signTransaction(tx);
      },
    };
  }, [ready, authenticated, wallets]);

  return <BsSwapForm paraleloRate={paraleloRate} privySigner={privySigner} />;
}
