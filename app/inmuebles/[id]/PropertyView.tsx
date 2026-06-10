"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bed,
  Building2,
  ExternalLink,
  FileText,
  MapPin,
  SquareActivity,
  TrendingUp,
} from "lucide-react";
import { getPropertyById, getProgressPercent } from "@/lib/properties";
import type { PropertyInfo } from "@/lib/properties";
import { TourEmbed } from "@/components/TourEmbed";
import { PropertyBuyFormEntry } from "@/components/PropertyBuyFormPrivy";
import { usePrivySigner } from "@/components/PropertyBuyFormPrivy";
import { RewardClaimCard } from "@/components/RewardClaimCard";
import {
  getRealEstateProgramId,
  shareMintPda,
  usdcVaultPda,
  propertyPda,
  fetchPropertyConfig,
} from "@/lib/realestate-program";
import { getActiveCluster } from "@/lib/cluster";

type Props = { id: string };

type LiveData = Pick<PropertyInfo, "sharesSold" | "totalShares" | "pricePerShare">;

export function PropertyView({ id }: Props) {
  const staticProperty = getPropertyById(id);
  if (!staticProperty) notFound();

  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [fetchError, setFetchError] = useState(false);

  const fetchLive = useCallback(async () => {
    try {
      const config = await fetchPropertyConfig(id);
      if (!config) {
        setFetchError(true);
        return;
      }
      setLiveData({
        sharesSold: Number(config.sharesSold),
        totalShares: Number(config.totalShares),
        pricePerShare: Number(config.pricePerShare),
      });
      setFetchError(false);
    } catch {
      setFetchError(true);
    }
  }, [id]);

  useEffect(() => {
    fetchLive();
  }, [fetchLive]);

  // Merge live data over static fallback
  const property: PropertyInfo = useMemo(
    () =>
      liveData
        ? { ...staticProperty, ...liveData }
        : staticProperty,
    [staticProperty, liveData]
  );

  const progress = getProgressPercent(property);

  // PDA derivations — memoized on id
  const { programId, shareMint, vault, propKey } = useMemo(() => {
    return {
      programId: getRealEstateProgramId().toBase58(),
      shareMint: shareMintPda(id).toBase58(),
      vault: usdcVaultPda(id).toBase58(),
      propKey: propertyPda(id).toBase58(),
    };
  }, [id]);

  // Solscan cluster query param
  const clusterParam = useMemo(() => {
    const cluster = getActiveCluster();
    return cluster === "devnet" ? "?cluster=devnet" : "";
  }, []);

  // Privy signer for RewardClaimCard
  const signer = usePrivySigner();

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-8 px-5 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-tropico-mute">
        <Link href="/" className="hover:text-tropico-text">Inicio</Link>
        <span>/</span>
        <Link href="/inmuebles" className="hover:text-tropico-text">Inmuebles</Link>
        <span>/</span>
        <span className="text-tropico-text">{property.name}</span>
      </nav>

      {fetchError && (
        <p className="text-xs text-tropico-mute">
          No se pudo leer el estado on-chain — mostrando datos estáticos.
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Header */}
          <header className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-tropico-sea/30 bg-tropico-sea/10 px-3 py-0.5 text-xs font-bold text-tropico-sea">
                ~{property.apyEstimate}% APY estimado
              </span>
              <span className="rounded-full border border-tropico-border bg-tropico-panel px-3 py-0.5 text-xs text-tropico-mute">
                Devnet · POC
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold">{property.name}</h1>
            <p className="flex items-center gap-1.5 text-sm text-tropico-mute">
              <MapPin className="size-4" />
              {property.address}
            </p>
          </header>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="panel p-3 text-center">
              <div className="text-[10px] uppercase text-tropico-mute">Avalúo</div>
              <div className="font-display text-lg font-bold">
                ${(property.valuationUsdc / 1000).toFixed(0)}k
              </div>
            </div>
            <div className="panel p-3 text-center">
              <div className="text-[10px] uppercase text-tropico-mute">Precio/acción</div>
              <div className="font-display text-lg font-bold">${property.pricePerShare}</div>
            </div>
            <div className="panel p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] uppercase text-tropico-mute">
                <Bed className="size-3" /> Dormitorios
              </div>
              <div className="font-display text-lg font-bold">{property.bedrooms}</div>
            </div>
            <div className="panel p-3 text-center">
              <div className="text-[10px] uppercase text-tropico-mute">m²</div>
              <div className="font-display text-lg font-bold">{property.m2}</div>
            </div>
          </div>

          {/* Progress */}
          <div className="panel flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-tropico-mute">
                {property.sharesSold.toLocaleString()} / {property.totalShares.toLocaleString()} acciones vendidas
              </span>
              <span className="font-bold text-tropico-sea">{progress.toFixed(1)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-tropico-border">
              <div
                className="h-full rounded-full bg-tropico-sea transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Tour 3D */}
          <TourEmbed
            tourUrl={property.tourUrl}
            tourModelUrl={property.tourModelUrl}
            name={property.name}
          />

          {/* Pitch */}
          <div className="panel p-4">
            <p className="text-sm text-tropico-mute">{property.pitchVE}</p>
          </div>

          {/* Ruta on-chain */}
          <section className="panel flex flex-col gap-3 p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <SquareActivity className="size-4 text-tropico-sea" />
              Ruta on-chain — todo verificable en Solscan
            </h2>
            <div className="grid gap-2 text-[11px]">
              {[
                {
                  label: "Program ID",
                  value: programId,
                  href: `https://solscan.io/account/${programId}${clusterParam}`,
                },
                {
                  label: "Share Mint",
                  value: shareMint,
                  href: `https://solscan.io/token/${shareMint}${clusterParam}`,
                },
                {
                  label: "USDC Vault",
                  value: vault,
                  href: `https://solscan.io/account/${vault}${clusterParam}`,
                },
                {
                  label: "Property Config",
                  value: propKey,
                  href: `https://solscan.io/account/${propKey}${clusterParam}`,
                },
              ].map(({ label, value, href }) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <span className="shrink-0 text-tropico-mute">{label}</span>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 truncate font-mono text-tropico-sea hover:underline"
                  >
                    {value.slice(0, 8)}…{value.slice(-6)}
                    <ExternalLink className="size-3 shrink-0" />
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Doc legal hash */}
          <div className="panel flex items-center gap-3 p-3 text-[11px]">
            <FileText className="size-4 shrink-0 text-tropico-mute" />
            <div>
              <span className="text-tropico-mute">Hash doc legal on-chain: </span>
              <code className="text-tropico-text">{property.legalDocHash.slice(0, 16)}…</code>
            </div>
            <Link
              href="/legal/token-holders"
              className="ml-auto shrink-0 text-tropico-sea hover:underline"
            >
              Ver T&C
            </Link>
          </div>
        </div>

        {/* Right column — buy form + rewards */}
        <div className="flex flex-col gap-4">
          <PropertyBuyFormEntry property={property} onBought={fetchLive} />

          {/* Demo reward card — Fase 0: renta simulada */}
          <RewardClaimCard
            propertyId={property.id}
            propertyName={property.name}
            claimableUsdc={12.48}
            epoch={0}
            signer={signer}
          />

          {/* Link a gobernanza */}
          <Link
            href={`/inmuebles/${property.id}/gobernanza`}
            className="panel flex items-center justify-between gap-3 p-4 transition hover:border-tropico-purple"
          >
            <div>
              <p className="text-sm font-semibold">Gobernanza</p>
              <p className="text-xs text-tropico-mute">
                Votá propuestas · peso = tus acciones
              </p>
            </div>
            <TrendingUp className="size-5 shrink-0 text-tropico-mute" />
          </Link>

          {/* Link portafolio */}
          <Link
            href="/mis-inmuebles"
            className="panel flex items-center justify-between gap-3 p-4 transition hover:border-tropico-sea"
          >
            <div>
              <p className="text-sm font-semibold">Mi portafolio</p>
              <p className="text-xs text-tropico-mute">Ver todas tus acciones y renta</p>
            </div>
            <Building2 className="size-5 shrink-0 text-tropico-mute" />
          </Link>
        </div>
      </div>
    </main>
  );
}
