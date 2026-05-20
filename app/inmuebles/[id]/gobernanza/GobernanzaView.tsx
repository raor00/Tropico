"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Vote } from "lucide-react";
import { useState } from "react";
import { getPropertyById } from "@/lib/properties";
import { ProposalCard, type ProposalData } from "@/components/ProposalCard";

// Propuesta demo para el pitch — Fase 0
const DEMO_PROPOSALS: ProposalData[] = [
  {
    proposalId: "0",
    title: "¿Aprobar reparación de techo? ($5.000)",
    uri: "https://gov.tropico.app/p/avila-001-0",
    yesWeight: 0,
    noWeight: 0,
    endTs: Math.floor(Date.now() / 1000) + 86400 * 3, // 3 días
    executed: false,
    snapshotTotalShares: 2400,
  },
];

export function GobernanzaView({ propertyId }: { propertyId: string }) {
  const property = getPropertyById(propertyId);
  if (!property) notFound();

  const [proposals, setProposals] = useState<ProposalData[]>(DEMO_PROPOSALS);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  // Shares demo del investor (en demo siempre 4)
  const voterShares = 4;

  function handleVote(proposalId: string, approve: boolean) {
    if (votedIds.has(proposalId)) return;
    setVotedIds((s) => new Set([...s, proposalId]));
    setProposals((prev) =>
      prev.map((p) => {
        if (p.proposalId !== proposalId) return p;
        return {
          ...p,
          yesWeight: approve ? p.yesWeight + voterShares : p.yesWeight,
          noWeight: !approve ? p.noWeight + voterShares : p.noWeight,
        };
      })
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-8 px-5 py-10">
      <nav className="flex items-center gap-2 text-sm text-tropico-mute">
        <Link href="/inmuebles" className="hover:text-tropico-text">Inmuebles</Link>
        <span>/</span>
        <Link href={`/inmuebles/${propertyId}`} className="hover:text-tropico-text">
          {property.name}
        </Link>
        <span>/</span>
        <span className="text-tropico-text">Gobernanza</span>
      </nav>

      <header className="flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-tropico-border bg-tropico-panel px-3 py-1 text-xs text-tropico-purple">
          <Vote className="size-3" /> Gobernanza on-chain
        </span>
        <h1 className="font-display text-2xl font-bold">
          Propuestas — {property.name}
        </h1>
        <p className="text-sm text-tropico-mute">
          Tu voto pesa según tus acciones. Peso actual:{" "}
          <strong className="text-tropico-text">{voterShares}</strong> acciones.
        </p>
      </header>

      {proposals.length === 0 ? (
        <div className="panel p-6 text-center text-tropico-mute text-sm">
          No hay propuestas activas para este inmueble.
        </div>
      ) : (
        <section className="flex flex-col gap-4">
          {proposals.map((p) => (
            <ProposalCard
              key={p.proposalId}
              proposal={p}
              voterShares={voterShares}
              onVote={votedIds.has(p.proposalId) ? undefined : handleVote}
            />
          ))}
        </section>
      )}

      {proposals.some((p) => votedIds.has(p.proposalId)) && (
        <p className="text-center text-xs text-tropico-mute">
          Voto registrado · en producción esto queda on-chain en Solscan permanentemente.
        </p>
      )}

      <Link
        href={`/inmuebles/${propertyId}`}
        className="text-sm text-tropico-mute hover:text-tropico-text"
      >
        &larr; Volver al inmueble
      </Link>
    </main>
  );
}
