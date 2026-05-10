"use client";

import { LogOut } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { notifyAuthChanged } from "@/lib/auth-context";

/**
 * Botón de logout específico para Privy. Se monta solo si PRIVY_ENABLED.
 * Llama privy.logout() → invalida sesión + limpia tokens + redirige a /.
 */
export function ProfilePrivyLogout() {
  const { logout } = usePrivy();

  async function handle() {
    if (!confirm("¿Cerrar sesión Privy? Tu wallet sigue existiendo, solo cerrás la sesión actual.")) return;
    try {
      await logout();
    } catch {}
    notifyAuthChanged();
    window.location.href = "/";
  }

  return (
    <button
      onClick={handle}
      className="flex items-center gap-3 rounded-xl border border-tropico-border bg-tropico-ink/40 px-4 py-3 text-left text-sm text-tropico-text transition hover:border-tropico-sun"
    >
      <LogOut className="size-4 text-tropico-sun" />
      <span className="flex flex-col">
        <span className="font-semibold">Cerrar sesión</span>
        <span className="text-[11px] text-tropico-mute">
          Tu wallet sigue existiendo. Podés volver a iniciar con tu email.
        </span>
      </span>
    </button>
  );
}
