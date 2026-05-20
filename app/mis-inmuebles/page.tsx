"use client";

import Link from "next/link";
import { Building2, TrendingUp } from "lucide-react";
import { PROPERTY_LIST, getProgressPercent } from "@/lib/properties";
import { RewardClaimCard } from "@/components/RewardClaimCard";

// Fase 0: posición demo (4 acciones en Residencias Ávila)
const DEMO_POSITIONS = [
  {
    propertyId: "residencias-avila-001",
    sharesOwned: 4,
    claimableUsdc: 12.48,
    epoch: 0,
  },
];

export default function MisInmueblesPage() {
  const positions = DEMO_POSITIONS.map((pos) => ({
    ...pos,
    property: PROPERTY_LIST.find((p) => p.id === pos.propertyId),
  })).filter((p) => p.property);

  const totalValueUsdc = positions.reduce((acc, pos) => {
    return acc + pos.sharesOwned * (pos.property?.pricePerShare ?? 0);
  }, 0);

  const totalClaimable = positions.reduce(
    (acc, pos) => acc + pos.claimableUsdc,
    0
  );

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-5 py-10">
      <header className="flex flex-col gap-2">
        <Link
          href="/inmuebles"
          className="w-fit text-sm text-tropico-mute transition hover:text-tropico-text"
        >
          &larr; Inmuebles
        </Link>
        <h1 className="font-display text-2xl font-bold">Mi portafolio</h1>
        <p className="text-sm text-tropico-mute">
          Acciones y renta de inmuebles tokenizados.
        </p>
      </header>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="panel p-4 text-center">
          <div className="text-xs uppercase text-tropico-mute">Valor total</div>
          <div className="font-display text-2xl font-bold">
            ${totalValueUsdc.toLocaleString()}
          </div>
          <div className="text-[11px] text-tropico-mute">USDC (a precio de compra)</div>
        </div>
        <div className="panel p-4 text-center">
          <div className="text-xs uppercase text-tropico-mute">Renta reclamable</div>
          <div className="font-display text-2xl font-bold text-tropico-sun">
            ${totalClaimable.toFixed(2)}
          </div>
          <div className="text-[11px] text-tropico-mute">USDC disponible</div>
        </div>
      </div>

      {/* Positions */}
      <section className="flex flex-col gap-6">
        {positions.map(({ property: p, sharesOwned, claimableUsdc, epoch, propertyId }) => {
          if (!p) return null;
          const pct = ((sharesOwned / p.totalShares) * 100).toFixed(4);
          return (
            <div key={propertyId} className="flex flex-col gap-3">
              <div className="panel p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/inmuebles/${propertyId}`}
                      className="font-semibold hover:text-tropico-sea"
                    >
                      {p.name}
                    </Link>
                    <p className="text-xs text-tropico-mute">{p.city}</p>
                  </div>
                  <span className="rounded-full border border-tropico-sea/30 bg-tropico-sea/10 px-2 py-0.5 text-[10px] font-bold text-tropico-sea">
                    ~{p.apyEstimate}% APY
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div>
                    <div className="text-tropico-mute">Acciones</div>
                    <div className="font-bold text-tropico-text">{sharesOwned.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-tropico-mute">% propiedad</div>
                    <div className="font-bold text-tropico-text">{pct}%</div>
                  </div>
                  <div>
                    <div className="text-tropico-mute">Valor</div>
                    <div className="font-bold text-tropico-text">
                      ${(sharesOwned * p.pricePerShare).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/inmuebles/${propertyId}`}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-tropico-border bg-tropico-ink/40 py-1.5 text-xs font-semibold transition hover:border-tropico-sea"
                  >
                    <Building2 className="size-3.5" /> Ver inmueble
                  </Link>
                  <Link
                    href={`/inmuebles/${propertyId}/gobernanza`}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-tropico-border bg-tropico-ink/40 py-1.5 text-xs font-semibold transition hover:border-tropico-purple"
                  >
                    <TrendingUp className="size-3.5" /> Gobernanza
                  </Link>
                </div>
              </div>

              <RewardClaimCard
                propertyId={propertyId}
                propertyName={p.name}
                claimableUsdc={claimableUsdc}
                epoch={epoch}
                signer={null}
              />
            </div>
          );
        })}
      </section>

      {positions.length === 0 && (
        <div className="panel p-8 text-center">
          <p className="text-tropico-mute">No tenés acciones todavía.</p>
          <Link
            href="/inmuebles"
            className="mt-3 inline-block text-sm font-semibold text-tropico-sea hover:underline"
          >
            Explorar inmuebles &rarr;
          </Link>
        </div>
      )}
    </main>
  );
}
