"use client";

import { BsSwapForm, type PrivySignerInjected } from "@/components/BsSwapForm";
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import type { Transaction } from "@solana/web3.js";
import { useMemo } from "react";

const PRIVY_ENABLED = !!process.env.NEXT_PUBLIC_PRIVY_APP_ID;

export function BsSwapFormEntry({ paraleloRate }: { paraleloRate?: number }) {
  if (PRIVY_ENABLED)
    return <BsSwapFormPrivyWrapper paraleloRate={paraleloRate} />;
  return <BsSwapForm paraleloRate={paraleloRate} />;
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
