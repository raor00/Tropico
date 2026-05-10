"use client";

import { useMemo } from "react";
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { SendToAddress, type PrivySignerInjected } from "@/components/SendToAddress";
import type { Transaction } from "@solana/web3.js";

const PRIVY_ENABLED = !!process.env.NEXT_PUBLIC_PRIVY_APP_ID;

/**
 * Entry: si Privy está habilitado, monta el wrapper. Si no, SendToAddress directo.
 */
export function SendToAddressEntry() {
  if (PRIVY_ENABLED) return <SendToAddressPrivyWrapper />;
  return <SendToAddress />;
}

function SendToAddressPrivyWrapper() {
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
        // Privy Solana wallet objects expone signTransaction(tx) directo
        const w = wallet as unknown as {
          signTransaction: (tx: Transaction) => Promise<Transaction>;
        };
        return await w.signTransaction(tx);
      },
    };
  }, [ready, authenticated, wallets]);

  return <SendToAddress privySigner={privySigner} />;
}
