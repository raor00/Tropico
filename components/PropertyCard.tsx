"use client";

import Link from "next/link";
import { Building2, MapPin, TrendingUp, Users } from "lucide-react";
import type { PropertyInfo } from "@/lib/properties";
import { getProgressPercent } from "@/lib/properties";

export function PropertyCard({ property: p }: { property: PropertyInfo }) {
  const progress = getProgressPercent(p);
  const available = p.totalShares - p.sharesSold;

  return (
    <article className="panel group relative flex flex-col gap-4 overflow-hidden p-5 transition hover:border-tropico-mute">
      {/* Header */}
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full border border-tropico-border bg-tropico-ink">
            <Building2 className="size-5 text-tropico-sea" strokeWidth={1.75} />
          </div>
          <div>
            <div className="font-display text-base font-bold leading-tight">
              {p.name}
            </div>
            <div className="flex items-center gap-1 text-xs text-tropico-mute">
              <MapPin className="size-3" />
              {p.city}
            </div>
          </div>
        </div>
        <span className="rounded-full border border-tropico-sea/30 bg-tropico-sea/10 px-2 py-0.5 text-[10px] font-bold text-tropico-sea">
          ~{p.apyEstimate}% APY
        </span>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md bg-tropico-ink/40 p-2">
          <div className="text-[10px] uppercase text-tropico-mute">Precio</div>
          <div className="text-sm font-bold">${p.pricePerShare}</div>
          <div className="text-[9px] text-tropico-mute">por acción</div>
        </div>
        <div className="rounded-md bg-tropico-ink/40 p-2">
          <div className="text-[10px] uppercase text-tropico-mute">Avalúo</div>
          <div className="text-sm font-bold">
            ${(p.valuationUsdc / 1000).toFixed(0)}k
          </div>
          <div className="text-[9px] text-tropico-mute">USDC</div>
        </div>
        <div className="rounded-md bg-tropico-ink/40 p-2">
          <div className="text-[10px] uppercase text-tropico-mute">
            Disponibles
          </div>
          <div className="text-sm font-bold">{available.toLocaleString()}</div>
          <div className="text-[9px] text-tropico-mute">acciones</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 text-tropico-mute">
            <Users className="size-3" /> {p.sharesSold.toLocaleString()} vendidas
          </span>
          <span className="text-tropico-text font-semibold">
            {progress.toFixed(1)}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-tropico-border">
          <div
            className="h-full rounded-full bg-tropico-sea transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Vibe */}
      <p className="text-xs text-tropico-mute">{p.vibe}</p>

      {/* CTA */}
      <Link
        href={`/inmuebles/${p.id}`}
        className="mt-auto inline-flex items-center justify-center gap-1 rounded-lg border border-tropico-border bg-tropico-ink/40 py-2 text-sm font-semibold transition group-hover:border-tropico-sea group-hover:text-tropico-sea"
      >
        <TrendingUp className="size-4" />
        Ver inmueble &rarr;
      </Link>
    </article>
  );
}
