"use client";

import Image from "next/image";
import Link from "next/link";
import type { TokenInfo } from "@/lib/tokens";

const RIESGO_LABEL = {
  1: { label: "Estable", color: "text-tropico-sea" },
  2: { label: "Bajo riesgo", color: "text-tropico-sea" },
  3: { label: "Medio", color: "text-tropico-sun" },
  4: { label: "Alto", color: "text-tropico-coral" },
  5: { label: "Memecoin", color: "text-tropico-coral" },
} as const;

export function TokenCard({ token }: { token: TokenInfo }) {
  const riesgo = RIESGO_LABEL[token.riesgo];

  return (
    <article
      className="panel group relative flex flex-col gap-3 overflow-hidden p-5 transition hover:border-tropico-mute"
      style={{
        backgroundImage: `radial-gradient(120% 80% at 100% 0%, ${token.brand}22, transparent 60%)`,
      }}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-10 overflow-hidden rounded-full border border-tropico-border bg-tropico-ink">
            <Image
              src={token.logoURI}
              alt={token.name}
              width={40}
              height={40}
              className="size-full object-cover"
              unoptimized
            />
          </div>
          <div>
            <div className="font-display text-lg font-bold leading-tight">{token.symbol}</div>
            <div className="text-xs text-tropico-mute">{token.name}</div>
          </div>
        </div>
        <span className={`rounded-md bg-tropico-ink/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${riesgo.color}`}>
          {riesgo.label}
        </span>
      </header>

      <p className="text-sm font-medium text-tropico-text/90">{token.vibe}</p>
      <p
        className="text-sm leading-relaxed text-tropico-mute"
        // dangerouslySetInnerHTML porque el copy contiene HTML entities (&aacute;, &eacute;, etc.)
        dangerouslySetInnerHTML={{ __html: token.pitchVE }}
      />

      <Link
        href={`/cambiar?to=${token.symbol}`}
        className="mt-auto inline-flex items-center justify-center gap-1 rounded-lg border border-tropico-border bg-tropico-ink/40 py-2 text-sm font-semibold transition group-hover:border-tropico-purple group-hover:text-tropico-purple"
      >
        Cambiar a {token.symbol} &rarr;
      </Link>
    </article>
  );
}
