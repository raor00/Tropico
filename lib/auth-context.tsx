"use client";

/**
 * Estado global de autenticación de wallet — fuente única de verdad usada por
 * Header (nav landing vs nav app) y BottomNav (mostrar pill solo si authed).
 *
 * Detecta 3 fuentes:
 *   1. Wallet local cifrada con password — authed solo si está unlocked en sessionStorage
 *   2. Dev wallet (devnet, sin password) — authed si existe en localStorage
 *   3. Privy embedded — authed si Privy.ready && authenticated && wallets.length > 0
 *
 * Privy se detecta via sub-componente que solo se monta cuando NEXT_PUBLIC_PRIVY_APP_ID
 * está seteado, evitando llamar hooks de Privy fuera del provider.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";

const PRIVY_ENABLED = !!process.env.NEXT_PUBLIC_PRIVY_APP_ID;

export type AuthSource = "local" | "dev" | "privy" | null;

type AuthState = {
  authed: boolean;
  source: AuthSource;
  /** Pubkey del wallet activo (si está disponible) */
  pubkey: string | null;
};

const AuthCtx = createContext<AuthState>({
  authed: false,
  source: null,
  pubkey: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [local, setLocal] = useState<{ authed: boolean; pubkey: string | null }>({
    authed: false,
    pubkey: null,
  });
  const [dev, setDev] = useState<{ authed: boolean; pubkey: string | null }>({
    authed: false,
    pubkey: null,
  });
  const [privy, setPrivy] = useState<{ authed: boolean; pubkey: string | null }>({
    authed: false,
    pubkey: null,
  });

  const checkLocalAndDev = useCallback(() => {
    if (typeof window === "undefined") return;
    const hasLocal = localStorage.getItem("tropico:wallet:v1") !== null;
    const unlocked = sessionStorage.getItem("tropico:wallet:unlocked") === "1";
    if (hasLocal && unlocked) {
      try {
        const raw = JSON.parse(localStorage.getItem("tropico:wallet:v1") ?? "null");
        setLocal({ authed: true, pubkey: raw?.publicKey ?? null });
      } catch {
        setLocal({ authed: true, pubkey: null });
      }
    } else {
      setLocal({ authed: false, pubkey: null });
    }

    try {
      const devRaw = JSON.parse(localStorage.getItem("tropico:dev-wallet") ?? "null");
      if (devRaw?.publicKey) {
        setDev({ authed: true, pubkey: devRaw.publicKey });
      } else {
        setDev({ authed: false, pubkey: null });
      }
    } catch {
      setDev({ authed: false, pubkey: null });
    }
  }, []);

  useEffect(() => {
    checkLocalAndDev();
    const onChange = () => checkLocalAndDev();
    window.addEventListener("storage", onChange);
    window.addEventListener("tropico:auth-changed", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("tropico:auth-changed", onChange);
    };
  }, [checkLocalAndDev]);

  // Derived: priority local > dev > privy (todos válidos, prioridad para indicar source)
  const authed = local.authed || dev.authed || privy.authed;
  const source: AuthSource = local.authed
    ? "local"
    : dev.authed
      ? "dev"
      : privy.authed
        ? "privy"
        : null;
  const pubkey = local.pubkey ?? dev.pubkey ?? privy.pubkey;

  return (
    <AuthCtx.Provider value={{ authed, source, pubkey }}>
      {PRIVY_ENABLED && <PrivyAuthBridge onChange={setPrivy} />}
      {children}
    </AuthCtx.Provider>
  );
}

/**
 * Sub-componente que vive dentro del AuthProvider y usa hooks Privy para
 * notificar cambios al state padre. Solo se monta cuando PRIVY_ENABLED.
 */
function PrivyAuthBridge({
  onChange,
}: {
  onChange: (s: { authed: boolean; pubkey: string | null }) => void;
}) {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useSolanaWallets();

  useEffect(() => {
    if (!ready) return;
    if (authenticated && wallets.length > 0) {
      const embedded = wallets.find((w) => w.walletClientType === "privy");
      const wallet = embedded ?? wallets[0];
      onChange({ authed: true, pubkey: wallet?.address ?? null });
    } else {
      onChange({ authed: false, pubkey: null });
    }
  }, [ready, authenticated, wallets, onChange]);

  return null;
}

export function useWalletAuth(): AuthState {
  return useContext(AuthCtx);
}

/** Helper para componentes que quieran disparar re-check tras login/logout */
export function notifyAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("tropico:auth-changed"));
}
