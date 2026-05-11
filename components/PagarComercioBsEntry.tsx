"use client";

import { PagarComercioBs } from "@/components/PagarComercioBs";
import type { PrivySignerInjected } from "@/components/BsSwapForm";
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import type { Transaction } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";

const PRIVY_ENABLED = !!process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const FALLBACK_RATE = 36.42;

type RateState = {
  usdToBs: number;
  fuente: "ve.dolarapi.com" | "fallback";
};

function useParaleloRate(): RateState {
  const [rate, setRate] = useState<RateState>({
    usdToBs: FALLBACK_RATE,
    fuente: "fallback",
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
          setRate({ usdToBs: data.usdToBs, fuente: data.fuente });
        }
      } catch {
        /* fallback */
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

export function PagarComercioBsEntry() {
  const rate = useParaleloRate();
  if (PRIVY_ENABLED) {
    return <PagarComercioBsPrivyWrapper paraleloRate={rate.usdToBs} />;
  }
  return <PagarComercioBs paraleloRate={rate.usdToBs} />;
}

function PagarComercioBsPrivyWrapper({ paraleloRate }: { paraleloRate: number }) {
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

  return <PagarComercioBs paraleloRate={paraleloRate} privySigner={privySigner} />;
}
