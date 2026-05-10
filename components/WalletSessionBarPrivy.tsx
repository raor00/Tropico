"use client";

import { useEffect, useRef, type ComponentType } from "react";
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";

/**
 * Resuelve el pubkey de la wallet embedded de Solana de Privy via hooks.
 *
 * Importante: Privy v2 separa wallets por chain. Si el usuario fue creado
 * con la config legacy (que defaultea a Ethereum), no tendrá wallet Solana.
 * En ese caso, llamamos createWallet({ chainType: 'solana' }) automáticamente
 * para que la app tenga un address Solana usable.
 */
export function WalletSessionBarPrivyWrapper({
  Inner,
}: {
  Inner: ComponentType<{ injectedPrivyPubkey?: string | null }>;
}) {
  const { ready, authenticated, user } = usePrivy();
  const { wallets, createWallet } = useSolanaWallets();
  const triggeredCreate = useRef(false);

  useEffect(() => {
    if (
      ready &&
      authenticated &&
      wallets.length === 0 &&
      !triggeredCreate.current
    ) {
      triggeredCreate.current = true;
      // Crear wallet Solana embedded para usuarios que solo tienen Ethereum
      createWallet().catch((e) => {
        console.error("[Privy] Failed to create Solana wallet:", e);
        triggeredCreate.current = false; // permitir retry
      });
    }
  }, [ready, authenticated, wallets.length, createWallet]);

  let pubkey: string | null = null;
  if (ready && authenticated && wallets.length > 0) {
    const embedded = wallets.find((w) => w.walletClientType === "privy");
    pubkey = embedded?.address ?? wallets[0]?.address ?? null;
  }

  return <Inner injectedPrivyPubkey={pubkey} />;
}
