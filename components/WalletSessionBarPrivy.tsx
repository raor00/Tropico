"use client";

import type { ComponentType } from "react";
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";

/**
 * Resuelve el pubkey real de la wallet embedded de Privy via hooks y lo pasa
 * al Inner. Solo se monta cuando NEXT_PUBLIC_PRIVY_APP_ID está seteado, así
 * los hooks de Privy siempre tienen el provider arriba.
 */
export function WalletSessionBarPrivyWrapper({
  Inner,
}: {
  Inner: ComponentType<{ injectedPrivyPubkey?: string | null }>;
}) {
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useSolanaWallets();

  let pubkey: string | null = null;
  if (ready && authenticated) {
    const embedded = wallets.find((w) => w.walletClientType === "privy");
    pubkey = embedded?.address ?? wallets[0]?.address ?? null;
    if (!pubkey && user?.wallet?.address) {
      pubkey = user.wallet.address;
    }
  }

  return <Inner injectedPrivyPubkey={pubkey} />;
}
