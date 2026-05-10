"use client";

import Link from "next/link";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Wallet,
  ArrowLeftRight,
  QrCode,
  Send,
  Sprout,
  Globe,
  Receipt,
  Bot,
  Store,
  KeyRound,
  Sparkles,
  HandHeart,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "./Logo";
import { AuthCTA } from "./AuthCTA";
import { VenezuelaBadge } from "./VenezuelaBadge";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useWalletAuth } from "@/lib/auth-context";

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

export type NavLink = {
  href: string;
  label: string;
  icon?: LucideIcon;
  /** Color tema del item — drawer mobile pinta el icon tile con este tono */
  tone?: "sun" | "sea" | "coral" | "purple" | "green" | "mute";
};

const DEFAULT_NAV: NavLink[] = [
  { href: "/home", label: "Wallet", icon: Wallet, tone: "sun" },
  { href: "/cambiar", label: "Cambiar", icon: ArrowLeftRight, tone: "purple" },
  { href: "/cobrar", label: "Cobrar", icon: QrCode, tone: "coral" },
  { href: "/remesas", label: "Remesas", icon: Globe, tone: "sea" },
  { href: "/carlos", label: "Carlos", icon: Bot, tone: "green" },
  { href: "/comercios", label: "Comercios", icon: Store, tone: "sun" },
];

/**
 * Landing nav — anchors a secciones de la misma landing (no rutas app).
 * Solo se usa cuando NO hay wallet activa: el visitante explora landing
 * sin entrar a /home, /cambiar, etc.
 */
const LANDING_NAV: NavLink[] = [
  { href: "#producto", label: "Producto", icon: Sparkles, tone: "sun" },
  { href: "#cambiar", label: "Cambiar", icon: ArrowLeftRight, tone: "purple" },
  { href: "#remesas", label: "Remesas", icon: Globe, tone: "sea" },
  { href: "#carlos", label: "Carlos", icon: Bot, tone: "green" },
  { href: "#comercios", label: "Comercios", icon: Store, tone: "coral" },
];

/** Nav extendida para el drawer móvil — cada item con su icono + color */
const FULL_NAV: NavLink[] = [
  { href: "/home", label: "Wallet", icon: Wallet, tone: "sun" },
  { href: "/cambiar", label: "Cambiar", icon: ArrowLeftRight, tone: "purple" },
  { href: "/cobrar", label: "Cobrar", icon: QrCode, tone: "coral" },
  { href: "/enviar", label: "Enviar", icon: Send, tone: "sea" },
  { href: "/guardar", label: "Guardar", icon: Sprout, tone: "green" },
  { href: "/remesas", label: "Remesas", icon: Globe, tone: "sea" },
  { href: "/pagar-servicios", label: "Servicios", icon: Receipt, tone: "coral" },
  { href: "/carlos", label: "Carlos AI", icon: Bot, tone: "green" },
  { href: "/comercios", label: "Comercios", icon: Store, tone: "sun" },
  { href: "/perfil", label: "Mi perfil", icon: KeyRound, tone: "purple" },
];

const TONE_TILES: Record<NonNullable<NavLink["tone"]>, string> = {
  sun: "bg-tropico-sun/15 text-tropico-sun border-tropico-sun/30",
  sea: "bg-tropico-sea/15 text-tropico-sea border-tropico-sea/30",
  coral: "bg-tropico-coral/15 text-tropico-coral border-tropico-coral/30",
  purple: "bg-tropico-purple/15 text-tropico-purple border-tropico-purple/30",
  green: "bg-tropico-green/15 text-tropico-green border-tropico-green/30",
  mute: "bg-tropico-mute/15 text-tropico-mute border-tropico-mute/30",
};

const TONE_MAP = {
  sea: "bg-tropico-sea/15 text-tropico-sea border-tropico-sea/30",
  sun: "bg-tropico-sun/15 text-tropico-sun border-tropico-sun/30",
  coral: "bg-tropico-coral/15 text-tropico-coral border-tropico-coral/30",
} as const;

function HeaderImpl({
  nav: navProp,
  badge,
  showNav = true,
}: {
  nav?: NavLink[];
  badge?: { label: string; tone?: keyof typeof TONE_MAP };
  showNav?: boolean;
}) {
  const { authed } = useWalletAuth();
  // Si no se pasa nav explícito, decidimos según auth:
  //   - authed → DEFAULT_NAV (rutas reales del wallet)
  //   - sin wallet → LANDING_NAV (anchors a secciones de la landing)
  const nav = navProp ?? (authed ? DEFAULT_NAV : LANDING_NAV);
  // Header static — sin compact-on-scroll. El cambio de altura on scroll
  // causaba content shift que re-disparaba scroll events en loop infinito
  // ("header saltando"). Mejor: padding fijo siempre, layout estable.
  // Solo detectamos scroll>0 para mostrar bg + shadow (no cambia altura).
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const tickingRef = useRef(false);
  const lastStateRef = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        const next = window.scrollY > 12;
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
      {/* Header como PILL flotante — no full-width bar.
           Padding del wrapper externo (h-Y) reserva el espacio sticky.
           El pill interior es rounded-full con backdrop-blur, max-w-fit. */}
      <header className="sticky top-3 z-40 flex justify-center px-2 [contain:layout_paint_style] md:top-4">
        <div
          className={`flex w-full max-w-5xl items-center justify-between gap-3 rounded-full border px-3 py-2 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-200 ease-out md:gap-4 md:px-4 ${
            scrolled
              ? "border-tropico-sun/30 bg-tropico-ink/90 backdrop-blur-xl shadow-[0_8px_24px_-12px_rgba(255,209,102,0.4)]"
              : "border-tropico-border/60 bg-tropico-ink/70 backdrop-blur-md"
          }`}
        >
          {/* Logo wrapper: shrink-0 para que NO se comprima ni se solape con nav.
               Wordmark "Tropico":
               - Pages SIN nav (badge o nav off): visible siempre, size md
               - Pages CON nav center: visible solo en lg+ (1024px+) para no
                 chupar el espacio del nav en md (~768-1023px). Size sm. */}
          <div className="flex shrink-0 items-center gap-2 md:gap-3">
            <Logo
              size={36}
              wordmarkSize="sm"
              wordmarkClass="inline-block"
            />
            <VenezuelaBadge
              size="xs"
              className={`hidden transition-opacity duration-300 sm:inline-flex ${
                scrolled ? "opacity-90" : "opacity-100"
              }`}
            />
            {badge && (
              <span
                className={`shrink-0 whitespace-nowrap rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${toneClass}`}
              >
                {badge.label}
              </span>
            )}
          </div>

          {/* Nav desktop — items COMPACTOS px-3 py-1.5 text-xs (era px-4 py-2 text-sm)
               para ocupar menos espacio horizontal y no chupar el espacio del Logo.
               Cuando hay badge, esconder nav desktop. */}
          {showNav && !badge && (
            <nav
              className="hidden max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-tropico-border bg-tropico-ink/40 p-1 backdrop-blur-sm [scrollbar-width:none] md:flex [&::-webkit-scrollbar]:hidden"
              aria-label="Navegación principal"
            >
              {nav.map((link) => {
                const active = isActive(link.href);
                const Icon = link.icon;
                const tone = link.tone ?? "sun";
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`group flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "bg-tropico-sun text-tropico-ink shadow-sm shadow-tropico-sun/40"
                        : "text-tropico-mute hover:bg-tropico-sun/10 hover:text-tropico-sun"
                    }`}
                  >
                    {Icon && (
                      <span
                        className={`flex size-5 items-center justify-center rounded-full transition-colors ${
                          active
                            ? "bg-tropico-ink/20"
                            : `${TONE_TILES[tone].split(" ")[0]} ${TONE_TILES[tone].split(" ")[1]}`
                        }`}
                      >
                        <Icon className="size-3" strokeWidth={2.4} />
                      </span>
                    )}
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right side: lang + AuthCTA + hamburger — shrink-0 para no deformarse */}
          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher />
            <AuthCTA variant="compact" />
            {/* Hamburger SOLO si hay wallet activa — sin login el nav landing
                en desktop ya tiene los anchors visibles, y en mobile no queremos
                drawer porque no hay nada útil dentro. */}
            {showNav && authed && (
              <button
                onClick={toggleDrawer}
                aria-label={drawerOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={drawerOpen}
                aria-controls="mobile-drawer"
                className={`flex size-9 items-center justify-center rounded-full border border-tropico-border bg-tropico-ink/40 text-tropico-text transition hover:border-tropico-sun hover:text-tropico-sun ${
                  badge ? "" : "md:hidden"
                }`}
              >
                {drawerOpen ? <X className="size-4" /> : <Menu className="size-5" />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Drawer — solo aparece si hay wallet activa */}
      {showNav && authed && (
        <>
          <div
            onClick={() => setDrawerOpen(false)}
            className={`fixed inset-0 z-50 bg-tropico-ink/80 backdrop-blur-md transition-opacity duration-300 ${
              badge ? "" : "md:hidden"
            } ${drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
            aria-hidden
          />
          <aside
            id="mobile-drawer"
            className={`fixed right-0 top-0 z-[60] flex h-dvh w-80 max-w-[88vw] flex-col gap-1 overflow-y-auto border-l border-tropico-border bg-gradient-to-b from-tropico-ink via-tropico-ink to-[#0d0716] px-4 pb-8 pt-5 backdrop-blur-xl transition-transform duration-300 ease-out ${
              badge ? "" : "md:hidden"
            } ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
            aria-label="Menú de navegación"
          >
            {/* Header drawer con gradient + branding wordmark */}
            <header className="mb-3 flex items-center justify-between border-b border-tropico-border pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏝️</span>
                <span className="font-display text-base font-black tracking-tight bg-gradient-to-r from-tropico-sun via-tropico-coral to-tropico-purple bg-clip-text text-transparent">
                  Tropico
                </span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Cerrar menú"
                className="flex size-8 items-center justify-center rounded-full border border-tropico-border bg-tropico-ink/60 text-tropico-text transition hover:border-tropico-coral hover:text-tropico-coral"
              >
                <X className="size-4" />
              </button>
            </header>
            {/* Mobile drawer: cada item con tile icono + color tema */}
            {FULL_NAV.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              const tone = link.tone ?? "sun";
              const tileCls = TONE_TILES[tone];
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${
                    active
                      ? `${tileCls} font-semibold`
                      : "border-transparent text-tropico-text hover:border-tropico-border hover:bg-tropico-ink/40"
                  }`}
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg border transition-transform group-hover:scale-105 ${
                      active ? tileCls : `${tileCls.replace("/15", "/10")}`
                    }`}
                  >
                    {Icon && <Icon className="size-4" strokeWidth={2.2} />}
                  </span>
                  <span className="flex flex-col text-left">
                    <span className="text-sm leading-tight">{link.label}</span>
                  </span>
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
