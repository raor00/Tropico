"use client";

/**
 * Badge "Hecho en Venezuela · Para el Caribe" con marco tricolor animado.
 * Colores oficiales: amarillo #FCD116, azul #003893, rojo #CE1126.
 * Animación: rotación continua del conic-gradient via @property --vz-angle.
 *
 * Variantes:
 *  - xs: header-mode. Solo bandera + "VE" en pill compacta. Sin texto largo.
 *  - sm: footer-mode. Texto completo, padding reducido.
 *  - md: hero-mode. Texto completo, padding generoso.
 */
export type VenezuelaBadgeSize = "xs" | "sm" | "md";

export function VenezuelaBadge({
  size = "md",
  className = "",
}: {
  size?: VenezuelaBadgeSize;
  className?: string;
}) {
  if (size === "xs") {
    // Pill ultra-compacta para Header — solo bandera + sigla, sin tagline
    return (
      <span
        className={`venezuela-badge inline-flex w-fit shrink-0 rounded-full p-[1px] ${className}`}
        title="Hecho en Venezuela · Para el Caribe"
      >
        <span className="flex items-center gap-1 rounded-full bg-tropico-ink/95 px-2 py-0.5 text-[10px] font-bold tracking-wide text-tropico-sun backdrop-blur-sm">
          <span className="text-[11px] leading-none" aria-hidden>
            🇻🇪
          </span>
          <span className="leading-none">VE</span>
        </span>
      </span>
    );
  }

  const padding =
    size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-xs";
  return (
    <span
      className={`venezuela-badge inline-flex w-fit rounded-full p-[1.5px] ${className}`}
    >
      <span
        className={`flex items-center gap-2 rounded-full bg-tropico-ink/90 ${padding} font-semibold tracking-wide text-tropico-sun backdrop-blur-sm`}
      >
        <span className="size-1.5 rounded-full bg-tropico-sun animate-pulse-warm" />
        <span aria-hidden>🇻🇪</span>
        Hecho en Venezuela
        <span className="text-tropico-mute">&middot;</span>
        <span className="text-tropico-sea">Para el Caribe</span>
      </span>
    </span>
  );
}
