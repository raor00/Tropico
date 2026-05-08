"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * ScrollReveal — wrapper que anima el contenido al entrar en viewport.
 *
 * Usa IntersectionObserver para detectar cuando el elemento es visible
 * y aplica una animación de reveal (opacity + transform).
 *
 * Direcciones disponibles:
 *  - "up" (default): viene de abajo
 *  - "down": viene de arriba
 *  - "left": viene de la derecha
 *  - "right": viene de la izquierda
 *  - "fade": solo opacity sin movimiento
 *  - "pixel": efecto pixel-art que aparece con scale + rotate sutil
 *
 * Performance: una vez revelado, NO se re-anima al scroll (oneTime).
 *
 * Uso:
 *   <ScrollReveal direction="up" delay={200}>
 *     <Card />
 *   </ScrollReveal>
 */

type Direction = "up" | "down" | "left" | "right" | "fade" | "pixel";

const DIRECTION_HIDDEN: Record<Direction, string> = {
  up: "opacity-0 translate-y-6",
  down: "opacity-0 -translate-y-6",
  left: "opacity-0 translate-x-6",
  right: "opacity-0 -translate-x-6",
  fade: "opacity-0",
  pixel: "opacity-0 scale-95 rotate-1",
};

const DIRECTION_VISIBLE = "opacity-100 translate-y-0 translate-x-0 scale-100 rotate-0";

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 600,
  threshold = 0.1,
  rootMargin = "-80px",
  className = "",
  as: Component = "div",
}: {
  children: ReactNode;
  direction?: Direction;
  /** Delay antes de empezar la animación (ms) */
  delay?: number;
  /** Duración de la animación (ms) */
  duration?: number;
  /** % del elemento visible para disparar (0-1) */
  threshold?: number;
  /** Margen del rootMargin del IntersectionObserver */
  rootMargin?: string;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || revealed) return;

    // Si el browser no soporta IntersectionObserver, mostrar inmediatamente
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setRevealed(true), delay);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, [delay, threshold, rootMargin, revealed]);

  const hiddenCls = DIRECTION_HIDDEN[direction];
  const visibleCls = DIRECTION_VISIBLE;

  return (
    <Component
      ref={ref as never}
      className={`transition-all ease-out ${revealed ? visibleCls : hiddenCls} ${className}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </Component>
  );
}
