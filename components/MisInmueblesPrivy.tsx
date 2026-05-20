"use client";

import { useMemo } from "react";
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { MisInmueblesView } from "@/components/MisInmueblesView";
import { useWalletAuth } from "@/lib/auth-context";
import { hasLocalWallet, getLocalWalletPubkey } from "@/lib/wallet-local";
import type { Signer } from "@/lib/send-tx";
import type { Transaction } from "@solana/web3.js";

const PRIVY_ENABLED = !!process.env.NEXT_PUBLIC_PRIVY_APP_ID;

export function MisInmueblesEntry() {
  if (PRIVY_ENABLED) return <MisInmueblesPrivyWrapper />;
  return <MisInmueblesLocalWrapper />;
}

function MisInmueblesLocalWrapper() {
  const { pubkey } = useWalletAuth();
  const localPubkey =
    typeof window !== "undefined" && hasLocalWallet() ? getLocalWalletPubkey() : null;
  return <MisInmueblesView pubkey={pubkey ?? localPubkey} signer={null} localPubkey={localPubkey} />;
}

function MisInmueblesPrivyWrapper() {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useSolanaWallets();
  const { pubkey: authPubkey } = useWalletAuth();
  const localPubkey =
    typeof window !== "undefined" && hasLocalWallet() ? getLocalWalletPubkey() : null;

  const signer = useMemo<Signer | null>(() => {
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

  const pubkey = signer?.address ?? authPubkey ?? localPubkey;

  return <MisInmueblesView pubkey={pubkey} signer={signer} localPubkey={localPubkey} />;
}
