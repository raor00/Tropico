"use client";

import type { ComponentType } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth";

/**
 * Wrapper que resuelve el pubkey de la wallet embedded de Privy y lo inyecta
 * en el componente Inner. Si Privy aún no está ready, le pasa null y deja
 * que Inner caiga al detection legacy (local / dev wallet).
 *
 * Solo se monta cuando NEXT_PUBLIC_PRIVY_APP_ID está seteado, garantizando
 * que los hooks de Privy estén disponibles.
 */
export function HomeBalancesPrivyWrapper({
  Inner,
}: {
  Inner: ComponentType<{ externalPubkey?: string | null }>;
}) {
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useSolanaWallets();

  let pubkey: string | null = null;
  if (ready && authenticated) {
    // 1) wallet embedded de Solana (createOnLogin)
    const embedded = wallets.find((w) => w.walletClientType === "privy");
    pubkey = embedded?.address ?? wallets[0]?.address ?? null;
    // 2) fallback al user.wallet (cuenta linked)
    if (!pubkey && user?.wallet?.address) {
      pubkey = user.wallet.address;
    }
  }

  return <Inner externalPubkey={pubkey} />;
}
