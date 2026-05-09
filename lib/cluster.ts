/**
 * Cluster manager — permite cambiar mainnet ↔ devnet en runtime sin tocar .env.
 *
 * Storage: localStorage 'tropico:cluster' = "mainnet-beta" | "devnet"
 * Default: lee NEXT_PUBLIC_SOLANA_CLUSTER del env, o mainnet-beta.
 *
 * RPC URL:
 *   - mainnet → NEXT_PUBLIC_HELIUS_RPC (con tu API key) o RPC público
 *   - devnet  → NEXT_PUBLIC_HELIUS_RPC con dominio devnet, o api.devnet.solana.com
 */

export type Cluster = "mainnet-beta" | "devnet";

const STORAGE_KEY = "tropico:cluster";

export function getActiveCluster(): Cluster {
  if (typeof window === "undefined") {
    return (process.env.NEXT_PUBLIC_SOLANA_CLUSTER as Cluster) ?? "mainnet-beta";
  }
  const stored = localStorage.getItem(STORAGE_KEY) as Cluster | null;
  if (stored === "mainnet-beta" || stored === "devnet") return stored;
  return (process.env.NEXT_PUBLIC_SOLANA_CLUSTER as Cluster) ?? "mainnet-beta";
}

export function setActiveCluster(cluster: Cluster) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, cluster);
  // Trigger re-render via storage event en otros components
  window.dispatchEvent(new Event("tropico:cluster-changed"));
}

export function getActiveRpcUrl(): string {
  const cluster = getActiveCluster();
  const heliusRpc = process.env.NEXT_PUBLIC_HELIUS_RPC ?? "";

  if (cluster === "devnet") {
    // Si el user tiene Helius key, intenta usar devnet endpoint con la misma key
    if (heliusRpc.includes("?api-key=")) {
      const key = heliusRpc.split("?api-key=")[1];
      return `https://devnet.helius-rpc.com/?api-key=${key}`;
    }
    return "https://api.devnet.solana.com";
  }

  // mainnet
  return heliusRpc || "https://api.mainnet-beta.solana.com";
}

export function getExplorerUrl(pubkey: string): string {
  const cluster = getActiveCluster();
  if (cluster === "devnet") {
    return `https://solscan.io/account/${pubkey}?cluster=devnet`;
  }
  return `https://solscan.io/account/${pubkey}`;
}
