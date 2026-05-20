"use client";

import { CheckCircle2, Clock, Vote, XCircle } from "lucide-react";

export type ProposalData = {
  proposalId: string;
  title: string;
  uri: string;
  yesWeight: number;
  noWeight: number;
  endTs: number;
  executed: boolean;
  snapshotTotalShares: number;
};

export function ProposalCard({
  proposal,
  voterShares,
  onVote,
}: {
  proposal: ProposalData;
  voterShares: number;
  onVote?: (proposalId: string, approve: boolean) => void;
}) {
  const now = Math.floor(Date.now() / 1000);
  const isOpen = !proposal.executed && now < proposal.endTs;
  const total = proposal.yesWeight + proposal.noWeight;
  const yesPct = total === 0 ? 0 : (proposal.yesWeight / total) * 100;
  const noPct = total === 0 ? 0 : (proposal.noWeight / total) * 100;
  const timeLeft = Math.max(0, proposal.endTs - now);
  const hoursLeft = Math.floor(timeLeft / 3600);

  return (
    <article className="panel flex flex-col gap-4 p-4">
      <header className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-tropico-text">{proposal.title}</p>
          <a
            href={proposal.uri}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-tropico-mute hover:underline"
          >
            Ver detalles &rarr;
          </a>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            proposal.executed
              ? "border border-tropico-sea/30 bg-tropico-sea/10 text-tropico-sea"
              : isOpen
                ? "border border-tropico-sun/30 bg-tropico-sun/10 text-tropico-sun"
                : "border border-tropico-mute/30 bg-tropico-mute/10 text-tropico-mute"
          }`}
        >
          {proposal.executed ? "Ejecutada" : isOpen ? "Abierta" : "Cerrada"}
        </span>
      </header>

      {/* Tally */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-tropico-sea">SÍ — {proposal.yesWeight.toLocaleString()}</span>
          <span className="text-tropico-coral">NO — {proposal.noWeight.toLocaleString()}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-tropico-border">
          <div
            className="h-full rounded-full bg-gradient-to-r from-tropico-sea to-tropico-sea/60 transition-all"
            style={{ width: `${yesPct}%` }}
          />
        </div>
        <p className="text-[11px] text-tropico-mute">
          {total.toLocaleString()} votos · quórum{" "}
          {proposal.snapshotTotalShares > 0
            ? ((total / proposal.snapshotTotalShares) * 100).toFixed(1)
            : 0}
          %
        </p>
      </div>

      {/* Time */}
      {isOpen && (
        <p className="flex items-center gap-1 text-[11px] text-tropico-mute">
          <Clock className="size-3" />
          Cierra en {hoursLeft}h
          {voterShares > 0 && (
            <span className="ml-1">
              · Tu peso: <strong className="text-tropico-text">{voterShares}</strong>
            </span>
          )}
        </p>
      )}

      {/* Vote buttons */}
      {isOpen && onVote && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onVote(proposal.proposalId, true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-tropico-sea/30 bg-tropico-sea/10 py-2 text-sm font-semibold text-tropico-sea transition hover:bg-tropico-sea/20"
          >
            <CheckCircle2 className="size-4" /> Votar SÍ
          </button>
          <button
            type="button"
            onClick={() => onVote(proposal.proposalId, false)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-tropico-coral/30 bg-tropico-coral/10 py-2 text-sm font-semibold text-tropico-coral transition hover:bg-tropico-coral/20"
          >
            <XCircle className="size-4" /> Votar NO
          </button>
        </div>
      )}
    </article>
  );
}
