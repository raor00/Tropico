"use client";

import { useMemo } from "react";
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { PropertyBuyForm } from "@/components/PropertyBuyForm";
import type { PrivySignerInjected } from "@/components/BsSwapForm";
import type { Signer } from "@/lib/send-tx";
import type { PropertyInfo } from "@/lib/properties";
import type { Transaction } from "@solana/web3.js";

const PRIVY_ENABLED = !!process.env.NEXT_PUBLIC_PRIVY_APP_ID;

/** Reusable hook: derives a Signer from Privy embedded wallet. */
export function usePrivySigner(): Signer | null {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useSolanaWallets();

  return useMemo<Signer | null>(() => {
    if (!ready || !authenticated || wallets.length === 0) return null;
    const embedded = wallets.find((w) => w.walletClientType === "privy");
    const wallet = embedded ?? wallets[0];
    if (!wallet?.address) return null;
    return {
      type: "privy",
      address: wallet.address,
      signTransaction: async (tx: Transaction) => {
        const w = wallet as unknown as {
          signTransaction: (tx: Transaction) => Promise<Transaction>;
        };
        return await w.signTransaction(tx);
      },
    };
  }, [ready, authenticated, wallets]);
}

/** Entry: mounts the Privy wrapper if enabled; otherwise the form directly (local wallet). */
export function PropertyBuyFormEntry({
  property,
  onBought,
}: {
  property: PropertyInfo;
  onBought?: () => void;
}) {
  if (PRIVY_ENABLED)
    return <PropertyBuyFormPrivyWrapper property={property} onBought={onBought} />;
  return <PropertyBuyForm property={property} onBought={onBought} />;
}

function PropertyBuyFormPrivyWrapper({
  property,
  onBought,
}: {
  property: PropertyInfo;
  onBought?: () => void;
}) {
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

  return (
    <PropertyBuyForm
      property={property}
      privySigner={privySigner}
      onBought={onBought}
    />
  );
}
