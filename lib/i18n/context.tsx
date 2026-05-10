"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LANG,
  translate,
  type Lang,
  type DictKey,
} from "./dictionary";

const STORAGE_KEY = "tropico:lang";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey) => string;
};

const LangContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  // Hidratar desde localStorage post-mount (SSR-safe)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved && ["es", "en", "pt", "fr"].includes(saved)) {
      setLangState(saved);
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
    // Trigger re-render en componentes que escuchan storage
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
  }, []);

  const t = useCallback((key: DictKey) => translate(key, lang), [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useT(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) {
    // Fallback: si alguien llama el hook fuera del provider, devolvemos
    // función dummy en español (no rompemos render).
    return {
      lang: DEFAULT_LANG,
      setLang: () => {},
      t: (k: DictKey) => translate(k, DEFAULT_LANG),
    };
  }
  return ctx;
}
