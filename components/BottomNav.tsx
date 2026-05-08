"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ArrowLeftRight, QrCode, Sparkles, Store } from "lucide-react";

/**
 * Bottom navigation mobile-only — estilo app nativo iOS/Android.
 * Solo se muestra en pantallas <md (mobile + small tablets).
 *
 * 5 destinos principales del producto:
 *  - Home (dashboard)
 *  - Cambiar (swap — la pantalla de revenue principal)
 *  - Cobrar (QR — el momento red económica)
 *  - Carlos (AI copilot)
 *  - Comercios (lado merchant)
 *
 * Incluye safe-area-inset-bottom para iPhone con notch.
 */

const TABS = [
  { href: "/home", Icon: Home, label: "Inicio" },
  { href: "/cambiar", Icon: ArrowLeftRight, label: "Cambiar" },
  { href: "/cobrar", Icon: QrCode, label: "Cobrar" },
  { href: "/carlos", Icon: Sparkles, label: "Carlos" },
  { href: "/comercios", Icon: Store, label: "Comercios" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación inferior"
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-tropico-border bg-tropico-ink/90 backdrop-blur-2xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="grid grid-cols-5">
        {TABS.map((tab) => {
          const active =
            pathname === tab.href ||
            (tab.href !== "/home" && pathname?.startsWith(tab.href));
          const { Icon } = tab;

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] transition ${
                  active
                    ? "text-tropico-sun"
                    : "text-tropico-mute hover:text-tropico-text"
                }`}
              >
                <span
                  className={`flex size-9 items-center justify-center rounded-xl transition ${
                    active ? "bg-tropico-sun/15 ring-1 ring-tropico-sun/30" : ""
                  }`}
                >
                  <Icon
                    className="size-5"
                    strokeWidth={active ? 2 : 1.75}
                    aria-hidden="true"
                  />
                </span>
                <span
                  className={`font-semibold uppercase tracking-wider ${
                    active ? "text-tropico-sun" : ""
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
