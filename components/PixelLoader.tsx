/**
 * PixelLoader — animación de carga pixel art 8-bit, identidad Tropico.
 *
 * Variants:
 *  - "sun"        → sol amarillo girando con rays (default)
 *  - "palmera"    → frondas pixel se arman con stagger
 *  - "wave"       → onda de pixels recorriendo
 *  - "dots"       → 3 puntos saltarines (compacto, inline)
 *
 * Sizes: sm (24px) | md (48px) | lg (96px)
 *
 * Uso:
 *   <PixelLoader variant="sun" size="md" label="Buscando precio…" />
 */

type Variant = "sun" | "palmera" | "wave" | "dots";
type Size = "sm" | "md" | "lg";

const SIZE_PX: Record<Size, number> = {
  sm: 24,
  md: 48,
  lg: 96,
};

export function PixelLoader({
  variant = "sun",
  size = "md",
  label,
  className = "",
}: {
  variant?: Variant;
  size?: Size;
  label?: string;
  className?: string;
}) {
  const px = SIZE_PX[size];

  return (
    <div
      className={`inline-flex items-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label ?? "Cargando"}
    >
      {variant === "sun" && <SunLoader px={px} />}
      {variant === "palmera" && <PalmeraLoader px={px} />}
      {variant === "wave" && <WaveLoader px={px} />}
      {variant === "dots" && <DotsLoader px={px} />}
      {label && (
        <span className="text-sm text-tropico-mute animate-pulse-warm">
          {label}
        </span>
      )}
    </div>
  );
}

/**
 * Sun loader — círculo amarillo central + 8 rays que rotan
 * Estilo 8-bit: cuadrados pixel, sin curvas suaves
 */
function SunLoader({ px }: { px: number }) {
  return (
    <div
      className="relative animate-spin-slow"
      style={{ width: px, height: px }}
    >
      {/* Núcleo del sol */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: px * 0.5,
          height: px * 0.5,
          background: "#FFD166",
          boxShadow: "0 0 12px #FFD166, 0 0 4px #FFB938",
          imageRendering: "pixelated",
          // Pixel art "step" effect — squares not circles
          clipPath:
            "polygon(25% 0, 75% 0, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0 75%, 0 25%)",
        }}
      />
      {/* 8 rays como cuadritos alejados del centro */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2"
          style={{
            width: px * 0.12,
            height: px * 0.12,
            background: "#FFB938",
            transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-${px * 0.45}px)`,
            boxShadow: "0 0 6px #FFD166",
            imageRendering: "pixelated",
          }}
        />
      ))}
    </div>
  );
}

/**
 * Palmera loader — 4 frondas pixel-art que se asoman con stagger
 */
function PalmeraLoader({ px }: { px: number }) {
  const fronds = ["#06D6A0", "#14F195", "#06D6A0", "#14F195"];
  return (
    <div className="relative" style={{ width: px, height: px }}>
      {/* Tronco */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: 0,
          width: px * 0.15,
          height: px * 0.6,
          background: "#d49b1f",
          imageRendering: "pixelated",
        }}
      />
      {/* Frondas con animación stagger */}
      {fronds.map((color, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: px * 0.05,
            left: i % 2 === 0 ? "10%" : "55%",
            width: px * 0.35,
            height: px * 0.15,
            background: color,
            boxShadow: `0 0 8px ${color}`,
            transform: `rotate(${i % 2 === 0 ? -25 : 25}deg)`,
            imageRendering: "pixelated",
            animation: `pulse-warm ${1.2 + i * 0.15}s ease-in-out infinite`,
            animationDelay: `${i * 150}ms`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Wave loader — barra horizontal de pixels que se ilumina secuencialmente
 */
function WaveLoader({ px }: { px: number }) {
  const cells = 8;
  return (
    <div className="flex gap-1" style={{ width: px, height: px / 4 }}>
      {Array.from({ length: cells }).map((_, i) => (
        <div
          key={i}
          className="flex-1"
          style={{
            background: "#FFD166",
            imageRendering: "pixelated",
            animation: `pulse-warm 1s ease-in-out infinite`,
            animationDelay: `${i * 100}ms`,
            opacity: 0.4,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Dots loader — 3 puntos pixel saltando, compacto inline
 */
function DotsLoader({ px }: { px: number }) {
  const dotSize = px / 4;
  return (
    <div className="flex items-center gap-1" style={{ height: px }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: dotSize,
            height: dotSize,
            background: i === 0 ? "#EF476F" : i === 1 ? "#FFD166" : "#06D6A0",
            imageRendering: "pixelated",
            animation: "pixel-bounce 0.6s ease-in-out infinite",
            animationDelay: `${i * 100}ms`,
          }}
        />
      ))}
      <style>{`
        @keyframes pixel-bounce {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(-${dotSize}px); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
