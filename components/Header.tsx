"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { AuthCTA } from "./AuthCTA";

/**
 * Header sticky con efecto flotante al hacer scroll:
 * - Top (scrollY === 0): anclado, parte del flow, sin sombra
 * - Scrolleado: flotante con backdrop blur intenso + sombra + padding reducido
 *
 * Reusable en todas las pantallas. La nav cambia según contexto:
 *  - Landing (`/`): nav completo de marketing
 *  - App pages (/home, /cambiar, etc.): nav de producto
 */

export type NavLink = { href: string; label: string };

const DEFAULT_NAV: NavLink[] = [
  { href: "/home", label: "Wallet" },
  { href: "/cambiar", label: "Cambiar" },
  { href: "/cobrar", label: "Cobrar" },
  { href: "/guardar", label: "Guardar" },
  { href: "/comercios", label: "Comercios" },
  { href: "/carlos", label: "Carlos AI" },
];

export function Header({
  nav = DEFAULT_NAV,
  badge,
}: {
  nav?: NavLink[];
  /** Badge contextual al lado del logo (ej: "Comercios", "Demo") */
  badge?: { label: string; tone?: "coral" | "sea" | "sun" };
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toneClass = badge?.tone === "sea"
    ? "bg-tropico-sea/15 text-tropico-sea border-tropico-sea/30"
    : badge?.tone === "sun"
    ? "bg-tropico-sun/15 text-tropico-sun border-tropico-sun/30"
    : "bg-tropico-coral/15 text-tropico-coral border-tropico-coral/30";

  return (
    <header
      className={`sticky top-0 z-40 -mx-5 transition-all duration-300 ${
        scrolled
          ? "border-b border-tropico-border/60 bg-tropico-ink/85 px-5 py-2 backdrop-blur-2xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)]"
          : "border-b border-transparent bg-tropico-ink/30 px-5 py-3 backdrop-blur-md"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Logo size={scrolled ? 32 : 36} wordmarkSize={scrolled ? "sm" : "md"} />
          {badge && (
            <span
              className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${toneClass}`}
            >
              {badge.label}
            </span>
          )}
        </div>

        {/* Nav desktop */}
        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Navegación principal"
        >
          {nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm text-tropico-mute transition hover:bg-tropico-sun/10 hover:text-tropico-sun"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA wallet — siempre visible */}
        <AuthCTA variant="compact" />
      </div>
    </header>
  );
}
