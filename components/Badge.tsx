import { type ReactNode } from "react";

/**
 * Badge unificado del design system Tropico.
 *
 * Variants (tone):
 *  - sun     → amarillo (default — venezolano cálido)
 *  - coral   → rojo coral (alertas, destacados merchant)
 *  - sea     → verde mar (success, yield, agente)
 *  - mute    → gris (status neutro)
 *  - solana  → purple+green (cuando explícitamente referís a Solana)
 *
 * Sizes:
 *  - xs (text-[10px], px-2)  — micro, en cards
 *  - sm (text-xs, px-3)       — default
 *
 * Style:
 *  - "soft" (default): bg-tone/10 + border-tone/30 + text-tone
 *  - "solid": bg-tone/30 + text-tone (más contrast)
 *  - "outline": solo border + text
 *
 * Si no especificás dot=true, no muestra el indicador de pulse.
 */

type Tone = "sun" | "coral" | "sea" | "mute" | "solana" | "purple";
type Size = "xs" | "sm";
type Style = "soft" | "solid" | "outline";

const TONE_CLASSES: Record<
  Tone,
  { soft: string; solid: string; outline: string; dotBg: string }
> = {
  sun: {
    soft: "bg-tropico-sun/10 border-tropico-sun/30 text-tropico-sun",
    solid: "bg-tropico-sun/25 border-transparent text-tropico-sun",
    outline: "bg-transparent border-tropico-sun/40 text-tropico-sun",
    dotBg: "bg-tropico-sun",
  },
  coral: {
    soft: "bg-tropico-coral/10 border-tropico-coral/30 text-tropico-coral",
    solid: "bg-tropico-coral/25 border-transparent text-tropico-coral",
    outline: "bg-transparent border-tropico-coral/40 text-tropico-coral",
    dotBg: "bg-tropico-coral",
  },
  sea: {
    soft: "bg-tropico-sea/10 border-tropico-sea/30 text-tropico-sea",
    solid: "bg-tropico-sea/25 border-transparent text-tropico-sea",
    outline: "bg-transparent border-tropico-sea/40 text-tropico-sea",
    dotBg: "bg-tropico-sea",
  },
  mute: {
    soft: "bg-tropico-panel border-tropico-border text-tropico-mute",
    solid: "bg-tropico-panel border-transparent text-tropico-mute",
    outline: "bg-transparent border-tropico-border text-tropico-mute",
    dotBg: "bg-tropico-mute",
  },
  solana: {
    soft: "bg-tropico-purple/10 border-tropico-purple/30 text-tropico-green",
    solid: "bg-tropico-purple/25 border-transparent text-tropico-green",
    outline: "bg-transparent border-tropico-purple/40 text-tropico-green",
    dotBg: "bg-tropico-green",
  },
  purple: {
    soft: "bg-tropico-purple/10 border-tropico-purple/30 text-tropico-purple",
    solid: "bg-tropico-purple/25 border-transparent text-tropico-purple",
    outline: "bg-transparent border-tropico-purple/40 text-tropico-purple",
    dotBg: "bg-tropico-purple",
  },
};

const SIZE_CLASSES: Record<Size, string> = {
  xs: "px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest",
  sm: "px-3 py-1 text-xs font-medium",
};

export function Badge({
  tone = "sun",
  size = "sm",
  style = "soft",
  dot = false,
  pulse = false,
  rounded = "full",
  className = "",
  children,
}: {
  tone?: Tone;
  size?: Size;
  style?: Style;
  /** Mostrar dot indicator a la izquierda */
  dot?: boolean;
  /** Si dot=true, animar pulse */
  pulse?: boolean;
  /** Forma: "full" (pill) o "md" (square) */
  rounded?: "full" | "md";
  className?: string;
  children: ReactNode;
}) {
  const toneCfg = TONE_CLASSES[tone];
  const styleClass = toneCfg[style];
  const sizeClass = SIZE_CLASSES[size];
  const radiusClass = rounded === "full" ? "rounded-full" : "rounded-md";

  return (
    <span
      className={`inline-flex items-center gap-1.5 border ${radiusClass} ${sizeClass} ${styleClass} ${className}`}
    >
      {dot && (
        <span
          className={`size-1.5 rounded-full ${toneCfg.dotBg} ${
            pulse ? "animate-pulse-warm" : ""
          }`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
