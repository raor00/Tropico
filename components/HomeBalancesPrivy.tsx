"use client";

import { useEffect, useRef, type ComponentType } from "react";
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";

/**
 * Resuelve el pubkey de la wallet embedded de Solana de Privy.
 *
 * Si el usuario fue creado con config legacy (Ethereum por default), llama
 * createWallet() para crearle una Solana automáticamente — Tropico es Solana-only.
 */
export function HomeBalancesPrivyWrapper({
  Inner,
}: {
  Inner: ComponentType<{ externalPubkey?: string | null }>;
}) {
  const { ready, authenticated } = usePrivy();
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
      createWallet().catch((e) => {
        console.error("[Privy] Failed to create Solana wallet:", e);
        triggeredCreate.current = false;
      });
    }
  }, [ready, authenticated, wallets.length, createWallet]);

  let pubkey: string | null = null;
  if (ready && authenticated && wallets.length > 0) {
    const embedded = wallets.find((w) => w.walletClientType === "privy");
    pubkey = embedded?.address ?? wallets[0]?.address ?? null;
  }

  return <Inner externalPubkey={pubkey} />;
}
