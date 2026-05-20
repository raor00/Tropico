"use client";

import { useMemo } from "react";
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { PropertyBuyForm } from "@/components/PropertyBuyForm";
import type { PrivySignerInjected } from "@/components/BsSwapForm";
import type { PropertyInfo } from "@/lib/properties";
import type { Transaction } from "@solana/web3.js";

const PRIVY_ENABLED = !!process.env.NEXT_PUBLIC_PRIVY_APP_ID;

/** Entry: monta el wrapper Privy si está habilitado; si no, el form directo (wallet local). */
export function PropertyBuyFormEntry({ property }: { property: PropertyInfo }) {
  if (PRIVY_ENABLED) return <PropertyBuyFormPrivyWrapper property={property} />;
  return <PropertyBuyForm property={property} />;
}

function PropertyBuyFormPrivyWrapper({ property }: { property: PropertyInfo }) {
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

  return <PropertyBuyForm property={property} privySigner={privySigner} />;
}
