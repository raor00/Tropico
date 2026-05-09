import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  /** Tamaño del icono PNG en px (default 40) */
  size?: number;
  /** Tamaño del wordmark — "sm" | "md" | "lg" (default "md") */
  wordmarkSize?: "sm" | "md" | "lg";
  /** Si es true, envuelve en <Link href="/"> */
  asLink?: boolean;
  /** Mostrar solo el icono sin wordmark */
  iconOnly?: boolean;
  /** Clases extra para el wordmark span (ej. responsive hide) */
  wordmarkClass?: string;
  className?: string;
};

const wordmarkSizeMap = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-4xl md:text-5xl",
};

export function Logo({
  size = 40,
  wordmarkSize = "md",
  asLink = true,
  iconOnly = false,
  wordmarkClass = "",
  className = "",
}: LogoProps) {
  const inner = (
    <span className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/icons/tropico-logo.png"
        alt="Tropico"
        width={size}
        height={size}
        priority
        className="rounded-lg"
        style={{
          filter: "drop-shadow(0 0 12px rgba(255, 209, 102, 0.25))",
        }}
      />
      {!iconOnly && (
        <span
          className={`font-display font-bold tracking-tight leading-none ${wordmarkSizeMap[wordmarkSize]} ${wordmarkClass}`}
          style={{
            background:
              "linear-gradient(135deg, #EF476F 0%, #FFD166 50%, #06D6A0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4))",
          }}
        >
          Tropico
        </span>
      )}
    </span>
  );

  if (asLink) {
    return (
      <Link href="/" className="inline-flex items-center hover:opacity-90 transition">
        {inner}
      </Link>
    );
  }
  return inner;
}
