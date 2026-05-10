"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWalletAuth } from "@/lib/auth-context";

/**
 * Mount-and-redirect helper. Cuando el usuario está authed, redirige a `to`.
 * Usado en la landing (`/`) para mandar usuarios logueados directo a `/home`.
 *
 * No renderiza nada visible. Es client-only por necesidad (el estado de auth
 * vive en localStorage / Privy SDK).
 */
export function AuthRedirect({ to = "/home" }: { to?: string }) {
  const { authed } = useWalletAuth();
  const router = useRouter();

  useEffect(() => {
    if (authed) router.replace(to);
  }, [authed, to, router]);

  return null;
}
