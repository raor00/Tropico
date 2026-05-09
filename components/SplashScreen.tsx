"use client";

import { useEffect, useRef, useState } from "react";

/**
 * SplashScreen — animación de bienvenida estilo pixel art.
 *
 * Flujo (~3 segundos):
 *  Fase 1 (0–800ms):    Sol amarillo emerge por detrás escalando 0→1 con rotación de rays
 *  Fase 2 (400–2200ms): Logo Tropico se arma pixel por pixel con stagger random sobre el sol
 *  Fase 3 (2200–3000ms): Wordmark "TROPICO" fade-in + tagline + signal de "tap to enter"
 *  Fase 4 (al click o 3500ms): Fade out → revela la landing
 *
 * Se muestra solo en la primera carga de la sesión (sessionStorage flag).
 * Se puede saltar con click/tap en cualquier momento.
 */

const SPLASH_FLAG = "tropico:splash-shown:v1";
const PIXEL_GRID = 16; // 16x16 grid de "pixels" para el logo (256 cuadritos)
const REVEAL_DURATION_MS = 1100; // duración del armado pixel
const TOTAL_DURATION_MS = 2200;

export function SplashScreen() {
  // Hydration-safe: server y primer client render → mounted=false → null.
  // useEffect runs SOLO en client después de mount → decide si mostrar splash.
  // Evita hydration mismatch causado por leer sessionStorage en initial state.
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<"sun" | "pixels" | "wordmark" | "exit">("sun");
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem(SPLASH_FLAG) === "1") return;

    setShow(true);
    sessionStorage.setItem(SPLASH_FLAG, "1");

    timersRef.current.push(
      setTimeout(() => setPhase("pixels"), 250),
      setTimeout(() => setPhase("wordmark"), 1300),
      setTimeout(() => setPhase("exit"), TOTAL_DURATION_MS - 400),
      setTimeout(() => setShow(false), TOTAL_DURATION_MS),
    );

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  function skip() {
    timersRef.current.forEach(clearTimeout);
    setPhase("exit");
    setTimeout(() => setShow(false), 400);
  }

  // Server + primer client render: nada (mounted=false). Después: depende de show.
  if (!mounted || !show) return null;

  // Generar grid de "pixels" del logo con delays aleatorios staggered
  const pixels = Array.from({ length: PIXEL_GRID * PIXEL_GRID }, (_, i) => {
    const row = Math.floor(i / PIXEL_GRID);
    const col = i % PIXEL_GRID;
    // Delay aleatorio dentro de la ventana de reveal — staggered
    const delay = Math.random() * REVEAL_DURATION_MS;
    return { i, row, col, delay };
  });

  return (
    <div
      onClick={skip}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center cursor-pointer transition-opacity duration-500 ${
        phase === "exit" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background:
          "radial-gradient(ellipse at center, #1a0d2e 0%, #0a1224 60%, #050811 100%)",
      }}
    >
      {/* SUN — fase 1, emerge por detrás */}
      <div
        className="absolute"
        style={{
          width: "min(60vw, 480px)",
          height: "min(60vw, 480px)",
          transform:
            phase === "sun" ? "scale(0) rotate(0deg)" : "scale(1) rotate(45deg)",
          transition: "transform 1200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          background:
            "radial-gradient(circle, #FFD166 0%, #FFB938 40%, transparent 70%)",
          filter: "blur(2px)",
        }}
      >
        {/* Sun rays */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 origin-top"
            style={{
              width: "3px",
              height: "60%",
              background:
                "linear-gradient(to bottom, #FFD166, transparent)",
              transform: `translate(-50%, 0) rotate(${i * 30}deg)`,
              opacity: phase !== "sun" ? 0.7 : 0,
              transition: "opacity 800ms ease-out",
              transitionDelay: `${600 + i * 30}ms`,
            }}
          />
        ))}
      </div>

      {/* PIXEL GRID — fase 2, logo se arma */}
      <div
        className="relative"
        style={{
          width: "min(50vw, 360px)",
          height: "min(50vw, 360px)",
          display: "grid",
          gridTemplateColumns: `repeat(${PIXEL_GRID}, 1fr)`,
          gridTemplateRows: `repeat(${PIXEL_GRID}, 1fr)`,
          gap: "1px",
        }}
      >
        {pixels.map(({ i, row, col, delay }) => (
          <PixelDot
            key={i}
            row={row}
            col={col}
            delay={delay}
            visible={phase === "pixels" || phase === "wordmark" || phase === "exit"}
          />
        ))}
      </div>

      {/* WORDMARK — fase 3 */}
      <div
        className={`mt-8 flex flex-col items-center gap-2 transition-all duration-700 ${
          phase === "wordmark" || phase === "exit"
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
        <h1
          className="font-display text-5xl md:text-6xl font-black tracking-tight"
          style={{
            background:
              "linear-gradient(135deg, #EF476F 0%, #FFD166 50%, #06D6A0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 20px rgba(255, 209, 102, 0.4))",
          }}
        >
          TROPICO
        </h1>
        <p className="text-sm text-tropico-sun/80 tracking-widest uppercase">
          La red económica del venezolano
        </p>
      </div>

      {/* Skip hint */}
      <div
        className={`absolute bottom-12 text-xs text-tropico-mute transition-opacity duration-500 ${
          phase === "wordmark" ? "opacity-100" : "opacity-0"
        }`}
      >
        tap to continue
      </div>
    </div>
  );
}

/**
 * Un "pixel" del logo. Color basado en la posición para simular la palmera+guacamaya
 * (no es el logo real — es una abstracción que sugiere la silueta).
 *
 * Cuando visible=true, se anima opacity 0→1 con el delay random.
 */
function PixelDot({
  row,
  col,
  delay,
  visible,
}: {
  row: number;
  col: number;
  delay: number;
  visible: boolean;
}) {
  // Decide qué color mostrar según posición (sugerencia de silueta de palmera + guacamaya)
  const color = pickPixelColor(row, col);
  if (!color) return <div />;

  return (
    <div
      style={{
        background: color,
        boxShadow: `0 0 6px ${color}`,
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0)",
        transition: `opacity 200ms ease-out, transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
        transitionDelay: visible ? `${delay}ms` : "0ms",
        borderRadius: "2px",
      }}
    />
  );
}

/**
 * Mapa simplificado del logo:
 *  - Frondas de palmera arriba (verde tropical sea-green)
 *  - Tronco palmera centro (marrón amber)
 *  - Cocos cerca del crown (amarillo dorado)
 *  - Guacamaya en lateral del tronco (rojo coral)
 *  - Cerro/playa abajo (sand beige)
 *  - Cielo (deja transparente para mostrar el sol)
 */
function pickPixelColor(row: number, col: number): string | null {
  const center = (PIXEL_GRID - 1) / 2;
  const dist = Math.sqrt((row - center) ** 2 + (col - center) ** 2);

  // Borde circular: solo render dentro del círculo
  if (dist > center + 0.5) return null;

  // Frondas (top 30% del círculo, ancho)
  if (row >= 2 && row <= 5) {
    if (Math.abs(col - center) <= 5) return "#06D6A0"; // sea green frondas
  }

  // Cocos (justo debajo de las frondas, agrupados al centro)
  if (row === 5 || row === 6) {
    if (col >= center - 1 && col <= center + 1) return "#FFD166"; // amarillo dorado
  }

  // Tronco palmera (vertical desde el centro hacia abajo)
  if (row >= 6 && row <= 12) {
    if (col === Math.floor(center) || col === Math.floor(center) + 1) return "#d49b1f"; // amber tronco
  }

  // Guacamaya (al costado izquierdo del tronco, alto medio)
  if (row >= 8 && row <= 11) {
    if (col === Math.floor(center) - 1 || col === Math.floor(center) - 2) return "#EF476F"; // coral rojo
  }
  if (row >= 9 && row <= 10) {
    if (col === Math.floor(center) - 3) return "#FFD166"; // amarillo wing
  }

  // Playa / sand (abajo)
  if (row >= 13) {
    if (Math.abs(col - center) <= 4) return "#d4b896"; // sand beige
  }

  // Resto: ocasionalmente "estrellitas" purple-green Solana (5% de probabilidad)
  if (Math.random() < 0.04) {
    return Math.random() > 0.5 ? "#9945FF80" : "#14F19580";
  }

  return null; // pixel transparente
}
