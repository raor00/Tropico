"use client";

/**
 * Badge "Hecho en Venezuela · Para el Caribe" con marco tricolor animado.
 * Colores oficiales: amarillo #FCD116, azul #003893, rojo #CE1126.
 * Animación: rotación continua del conic-gradient via @property --vz-angle.
 */
export function VenezuelaBadge({ size = "md" }: { size?: "sm" | "md" }) {
  const padding = size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-xs";
  return (
    <span className="venezuela-badge inline-flex w-fit rounded-full p-[1.5px]">
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
