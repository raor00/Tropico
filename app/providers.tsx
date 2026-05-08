"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { useMemo, useState, type ReactNode } from "react";

const SOLANA_CLUSTER: "mainnet-beta" | "devnet" =
  process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet-beta"
    ? "mainnet-beta"
    : "devnet";

const RPC_URL =
  process.env.NEXT_PUBLIC_HELIUS_RPC ??
  (SOLANA_CLUSTER === "mainnet-beta"
    ? "https://api.mainnet-beta.solana.com"
    : "https://api.devnet.solana.com");

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  const privyConfig = useMemo(
    () => ({
      appearance: {
        theme: "dark" as const,
        accentColor: "#9945FF" as `#${string}`,
        logo: "/icons/tropico.svg",
        showWalletLoginFirst: false,
      },
      loginMethods: ["email", "google", "wallet"] as (
        | "email"
        | "google"
        | "wallet"
      )[],
      embeddedWallets: {
        createOnLogin: "users-without-wallets" as const,
        requireUserPasswordOnCreate: false,
      },
      solanaClusters: [
        {
          name: SOLANA_CLUSTER,
          rpcUrl: RPC_URL,
        },
      ],
    }),
    []
  );

  // Modo demo: sin Privy App ID, la app corre sin auth wrapper.
  // Todos los flujos funcionan con mocks honestos. Cuando hay App ID, se activa Privy.
  if (!privyAppId) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider appId={privyAppId} config={privyConfig}>
        {children}
      </PrivyProvider>
    </QueryClientProvider>
  );
}
