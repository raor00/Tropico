"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { LANGS, type Lang } from "@/lib/i18n/dictionary";

/**
 * Toggle compacto de idioma. En el header global.
 * Mobile: icon-only globo. Desktop: globo + bandera + código.
 */
export function LanguageSwitcher({ compact = true }: { compact?: boolean } = {}) {
  const { lang, setLang } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-full border border-tropico-border bg-tropico-ink/40 transition hover:border-tropico-sun ${
          compact ? "size-9 justify-center lg:size-auto lg:px-2.5 lg:py-1.5" : "px-3 py-1.5"
        }`}
        aria-label="Cambiar idioma"
        title={current.label}
      >
        <Globe className="size-4 text-tropico-mute" />
        <span className="hidden lg:inline text-xs font-semibold text-tropico-text">
          {current.flag} {current.code.toUpperCase()}
        </span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-[60] mt-2 flex w-44 flex-col rounded-xl border border-tropico-border bg-tropico-ink/95 p-1 shadow-xl backdrop-blur-xl"
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
        </div>
      )}
    </div>
  );
}
