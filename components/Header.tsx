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
  { href: "/remesas", label: "Remesas" },
  { href: "/carlos", label: "Carlos" },
  { href: "/comercios", label: "Comercios" },
  // /pagar-servicios e /integraciones viven en footer + drawer mobile completo —
  // nav desktop limitada a 6 links para no saturar.
];

/** Nav extendida para el drawer móvil — compactada por feedback de usuario.
 * Cambiar incluye Bs↔USDC ahora (no es ruta separada). Modo Agente vive
 * dentro de /carlos. Integraciones es B2B, no consumer.
 */
const FULL_NAV: NavLink[] = [
  { href: "/home", label: "Wallet" },
  { href: "/cambiar", label: "Cambiar" },
  { href: "/cobrar", label: "Cobrar" },
  { href: "/enviar", label: "Enviar" },
  { href: "/guardar", label: "Guardar" },
  { href: "/remesas", label: "Remesas" },
  { href: "/pagar-servicios", label: "Servicios" },
  { href: "/carlos", label: "Carlos AI" },
  { href: "/comercios", label: "Comercios" },
  { href: "/wallet/abrir", label: "Configuración" },
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
        className={`sticky top-0 z-40 -mx-5 [contain:layout_paint_style] transition-[padding,background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-out ${
          scrolled
            ? "border-b border-tropico-sun/20 bg-tropico-ink/95 px-5 py-2 backdrop-blur-2xl shadow-[0_8px_32px_-12px_rgba(255,209,102,0.35)]"
            : "border-b border-transparent bg-transparent px-5 py-5"
        }`}
      >
        <div
          className={`flex items-center justify-between will-change-transform transition-all duration-300 ease-out ${
            scrolled ? "scale-[0.96] gap-3" : "scale-100 gap-4"
          }`}
        >
          <div className="flex items-center gap-3">
            <Logo size={scrolled ? 32 : 48} wordmarkSize={scrolled ? "sm" : "md"} />
            {/* VE badge tricolor animado — siempre xs en header para mantener pill compacta */}
            <VenezuelaBadge
              size="xs"
              className={`hidden transition-opacity duration-300 sm:inline-flex ${
                scrolled ? "opacity-90" : "opacity-100"
              }`}
            />
            {badge && (
              <span
                className={`rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${toneClass}`}
              >
                {badge.label}
              </span>
            )}
          </div>

          {/* Nav desktop — pill grupos con padding generoso, compactación visible */}
          {showNav && (
            <nav
              className={`hidden items-center rounded-full border bg-tropico-ink/40 backdrop-blur-sm md:flex transition-all duration-300 ${
                scrolled
                  ? "border-tropico-border/60 gap-0.5 p-1"
                  : "border-tropico-border gap-1 p-1.5"
              }`}
              aria-label="Navegación principal"
            >
              {nav.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-full font-medium transition-all duration-200 ${
                      scrolled
                        ? "px-3 py-1.5 text-xs"
                        : "px-4 py-2 text-sm"
                    } ${
                      active
                        ? "bg-tropico-sun text-tropico-ink shadow-sm shadow-tropico-sun/40"
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
                className={`flex items-center justify-center rounded-full border border-tropico-border bg-tropico-ink/40 text-tropico-text transition hover:border-tropico-sun hover:text-tropico-sun md:hidden ${
                  scrolled ? "size-9" : "size-10"
                }`}
              >
                {drawerOpen ? <X className="size-4" /> : <Menu className="size-5" />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Drawer móvil — z-index >  header (z-40) para que cubra completo, no solape */}
      {showNav && (
        <>
          <div
            onClick={() => setDrawerOpen(false)}
            className={`fixed inset-0 z-50 bg-tropico-ink/80 backdrop-blur-md transition-opacity duration-300 md:hidden ${
              drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden
          />
          <aside
            id="mobile-drawer"
            className={`fixed right-0 top-0 z-[60] flex h-dvh w-72 max-w-[85vw] flex-col gap-1 overflow-y-auto border-l border-tropico-border bg-tropico-ink px-5 pb-8 pt-6 backdrop-blur-xl transition-transform duration-300 ease-out md:hidden ${
              drawerOpen ? "translate-x-0" : "translate-x-full"
            }`}
            aria-label="Menú móvil"
          >
            {/* Botón cerrar interno + branding */}
            <header className="mb-4 flex items-center justify-between border-b border-tropico-border pb-3">
              <span className="font-display text-sm font-bold uppercase tracking-wider text-tropico-mute">
                Menú
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Cerrar menú"
                className="flex size-8 items-center justify-center rounded-md border border-tropico-border bg-tropico-ink/40 text-tropico-text transition hover:border-tropico-coral hover:text-tropico-coral"
              >
                <X className="size-4" />
              </button>
            </header>
            {/* En mobile mostramos TODAS las rutas, no solo las del nav desktop */}
            {FULL_NAV.map((link) => {
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
