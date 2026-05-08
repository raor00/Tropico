"use client";

import Link from "next/link";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { AuthCTA } from "./AuthCTA";
import { VenezuelaBadge } from "./VenezuelaBadge";

/**
 * Header optimizado.
 *
 * Mejoras vs versión anterior:
 *  - rAF + early-return: solo set state cuando cruza el threshold (no en cada scroll tick)
 *  - memo() del componente para evitar re-render con el mismo nav array
 *  - active-link highlight via usePathname
 *  - mobile drawer (hamburger) — la nav antes solo se veía en desktop
 *  - link aria-current en activos
 *  - CSS containment + will-change para que la animación no haga reflow del layout
 *  - Esc/click-fuera cierra el drawer móvil
 */

export type NavLink = { href: string; label: string };

const DEFAULT_NAV: NavLink[] = [
  { href: "/home", label: "Wallet" },
  { href: "/cambiar", label: "Cambiar" },
  { href: "/cobrar", label: "Cobrar" },
  { href: "/comercios", label: "Comercios" },
  { href: "/integraciones", label: "Integraciones" },
];

const TONE_MAP = {
  sea: "bg-tropico-sea/15 text-tropico-sea border-tropico-sea/30",
  sun: "bg-tropico-sun/15 text-tropico-sun border-tropico-sun/30",
  coral: "bg-tropico-coral/15 text-tropico-coral border-tropico-coral/30",
} as const;

function HeaderImpl({
  nav = DEFAULT_NAV,
  badge,
  showNav = true,
}: {
  nav?: NavLink[];
  badge?: { label: string; tone?: keyof typeof TONE_MAP };
  showNav?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const tickingRef = useRef(false);
  const lastStateRef = useRef(false);
  const pathname = usePathname();

  // Scroll detection — solo emite setState al cruzar threshold (8px)
  useEffect(() => {
    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        const next = window.scrollY > 8;
        if (next !== lastStateRef.current) {
          lastStateRef.current = next;
          setScrolled(next);
        }
        tickingRef.current = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cierra drawer en navegación
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Esc cierra drawer
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const toggleDrawer = useCallback(() => setDrawerOpen((v) => !v), []);

  const toneClass = badge ? TONE_MAP[badge.tone ?? "coral"] : "";

  const isActive = useCallback(
    (href: string) => {
      if (href === "/home") return pathname === "/home";
      return pathname === href || pathname?.startsWith(`${href}/`);
    },
    [pathname]
  );

  return (
    <>
      <header
        className={`sticky top-0 z-40 -mx-5 [contain:layout_paint_style] transition-[padding,background-color,border-color,box-shadow] duration-300 ease-out ${
          scrolled
            ? "border-b border-tropico-border/60 bg-tropico-ink/85 px-4 py-1 backdrop-blur-xl shadow-[0_4px_20px_-8px_rgba(255,209,102,0.18)]"
            : "border-b border-transparent bg-transparent px-5 py-3"
        }`}
      >
        <div
          className={`flex items-center justify-between gap-2 will-change-transform transition-transform duration-300 ease-out ${
            scrolled ? "scale-[0.95]" : "scale-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <Logo size={scrolled ? 24 : 40} wordmarkSize={scrolled ? "sm" : "md"} />
            {/* VE badge tricolor animado — siempre xs en header para mantener pill compacta */}
            <VenezuelaBadge
              size="xs"
              className={`hidden transition-opacity duration-300 sm:inline-flex ${
                scrolled ? "opacity-90" : "opacity-100"
              }`}
            />
            {badge && (
              <span
                className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${toneClass}`}
              >
                {badge.label}
              </span>
            )}
          </div>

          {/* Nav desktop */}
          {showNav && (
            <nav
              className="hidden items-center gap-0.5 md:flex"
              aria-label="Navegación principal"
            >
              {nav.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-md transition-colors ${
                      scrolled ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
                    } ${
                      active
                        ? "bg-tropico-sun/15 font-semibold text-tropico-sun"
                        : "text-tropico-mute hover:bg-tropico-sun/10 hover:text-tropico-sun"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="flex items-center gap-2">
            <AuthCTA variant="compact" />
            {showNav && (
              <button
                onClick={toggleDrawer}
                aria-label={drawerOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={drawerOpen}
                aria-controls="mobile-drawer"
                className="flex size-9 items-center justify-center rounded-md border border-tropico-border bg-tropico-ink/40 text-tropico-text transition hover:border-tropico-sun hover:text-tropico-sun md:hidden"
              >
                {drawerOpen ? <X className="size-4" /> : <Menu className="size-4" />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Drawer móvil — sólo si la nav está habilitada */}
      {showNav && (
        <>
          <div
            onClick={() => setDrawerOpen(false)}
            className={`fixed inset-0 z-30 bg-tropico-ink/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
              drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden
          />
          <aside
            id="mobile-drawer"
            className={`fixed right-0 top-0 z-40 flex h-dvh w-72 flex-col gap-2 border-l border-tropico-border bg-tropico-ink/95 px-5 pb-6 pt-20 backdrop-blur-xl transition-transform duration-300 ease-out md:hidden ${
              drawerOpen ? "translate-x-0" : "translate-x-full"
            }`}
            aria-label="Menú móvil"
          >
            {nav.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-tropico-sun/15 font-semibold text-tropico-sun"
                      : "text-tropico-text hover:bg-tropico-sun/10 hover:text-tropico-sun"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </aside>
        </>
      )}
    </>
  );
}

export const Header = memo(HeaderImpl);
