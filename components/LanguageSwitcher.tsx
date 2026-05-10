"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Globe, Check } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { LANGS, type Lang } from "@/lib/i18n/dictionary";

/**
 * Toggle de idioma. Dropdown se renderiza via Portal a body para escapar
 * el `contain:layout_paint_style` del Header (que clippea absolute children).
 *
 * Posición se calcula desde el rect del botón y se actualiza on scroll/resize.
 */
export function LanguageSwitcher({ compact = true }: { compact?: boolean } = {}) {
  const { lang, setLang } = useT();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Recalcular posición cuando se abre + en scroll/resize
  useLayoutEffect(() => {
    if (!open) return;
    function update() {
      const r = btnRef.current?.getBoundingClientRect();
      if (!r) return;
      setPos({
        top: r.bottom + 8,
        right: window.innerWidth - r.right,
      });
    }
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  // Click/tap fuera cierra
  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (
        btnRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      )
        return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
    };
  }, [open]);

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className={`flex shrink-0 items-center gap-1.5 rounded-full border border-tropico-border bg-tropico-ink/40 transition hover:border-tropico-sun ${
          compact ? "size-9 justify-center lg:size-auto lg:px-2.5 lg:py-1.5" : "px-3 py-1.5"
        }`}
        aria-label="Cambiar idioma"
        aria-expanded={open}
        title={current.label}
      >
        <Globe className="size-4 text-tropico-mute" />
        <span className="hidden lg:inline text-xs font-semibold text-tropico-text">
          {current.flag} {current.code.toUpperCase()}
        </span>
      </button>

      {/* Portal: escapa contain:paint del Header */}
      {mounted && open && pos &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-[9999] flex w-44 flex-col rounded-xl border border-tropico-border bg-tropico-ink/95 p-1 shadow-2xl backdrop-blur-xl"
            style={{ top: pos.top, right: pos.right }}
          >
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLang(l.code as Lang);
                  setOpen(false);
                }}
                className={`flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition ${
                  lang === l.code
                    ? "bg-tropico-sun/10 text-tropico-sun"
                    : "text-tropico-text hover:bg-tropico-ink/60"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{l.flag}</span>
                  {l.label}
                </span>
                {lang === l.code && <Check className="size-3.5" />}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
