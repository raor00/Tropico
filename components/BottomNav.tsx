"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ArrowLeftRight, QrCode, Sparkles, Building2 } from "lucide-react";
import { useWalletAuth } from "@/lib/auth-context";

/**
 * Bottom nav mobile — pill flotante con liquid glass, SOLO si hay wallet activa.
 * En landing/sin wallet no se renderiza nada (deja ver la página completa).
 *
 * 5 destinos del wallet area:
 *  - Home (dashboard)
 *  - Cambiar (swap — revenue principal)
 *  - Cobrar (QR Solana Pay)
 *  - Guacama (GuacamaAI copilot)
 *  - Inmuebles (real estate tokenizado)
 *
 * Estilo: pill rounded-full floating, backdrop-blur fuerte, borde sutil,
 * gradient interno para el liquid glass feel. Safe-area-inset-bottom para notch.
 */

const TABS = [
  { href: "/home", Icon: Home, label: "Inicio" },
  { href: "/cambiar", Icon: ArrowLeftRight, label: "Cambiar" },
  { href: "/cobrar", Icon: QrCode, label: "Cobrar" },
  { href: "/guacama", Icon: Sparkles, label: "Guacama" },
  { href: "/inmuebles", Icon: Building2, label: "Inmuebles" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { authed } = useWalletAuth();

  // Sin wallet activa = sin barra (deja ver la landing limpia)
  if (!authed) return null;

  return (
    <div
      aria-label="Navegación inferior"
      className="fixed bottom-0 left-0 right-0 z-30 flex justify-center px-3 pb-3 pointer-events-none md:hidden"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0.75rem)" }}
    >
      <nav
        className="pointer-events-auto relative flex w-full max-w-md items-center justify-around gap-1 rounded-full border border-white/10 bg-tropico-ink/60 px-2 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-2xl backdrop-saturate-150"
      >
        {/* Liquid glass top sheen */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/8 to-transparent" />

        {TABS.map((tab) => {
          const active =
            pathname === tab.href ||
            (tab.href !== "/home" && pathname?.startsWith(tab.href));
          const { Icon } = tab;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-1 text-[9px]"
            >
              <span
                className={`flex size-9 items-center justify-center rounded-full transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-br from-tropico-sun/30 to-tropico-coral/20 ring-1 ring-tropico-sun/40 text-tropico-sun shadow-[inset_0_0_8px_rgba(255,200,80,0.25)]"
                    : "text-tropico-mute hover:text-tropico-text hover:bg-white/5"
                }`}
              >
                <Icon
                  className="size-[18px]"
                  strokeWidth={active ? 2.4 : 1.9}
                  aria-hidden="true"
                />
              </span>
              <span
                className={`font-semibold uppercase tracking-wider transition ${
                  active ? "text-tropico-sun" : "text-tropico-mute"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
