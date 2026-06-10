"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Loader2, Vote } from "lucide-react";
import { useEffect, useState } from "react";
import { Connection } from "@solana/web3.js";
import { getPropertyById } from "@/lib/properties";
import { ProposalCard, type ProposalData } from "@/components/ProposalCard";
import { buildVoteTx, fetchProposals } from "@/lib/realestate-program";
import { getActiveCluster, getActiveRpcUrl } from "@/lib/cluster";
import { makeKeypairSigner } from "@/lib/send-tx";
import { getLocalWalletPubkey, unlockLocalWallet } from "@/lib/wallet-local";

// Demo proposals for Fase 0 pitch.
// TODO: fetchProposals will replace this once getProgramAccounts + memcmp is live.
//       The useEffect below already calls fetchProposals and falls back here when empty.
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
  const [inflightIds, setInflightIds] = useState<Set<string>>(new Set());
  const [voteErrors, setVoteErrors] = useState<Record<string, string>>({});
  const [voteSigs, setVoteSigs] = useState<Record<string, string>>({});

  // Local wallet — detected on mount (localStorage is browser-only)
  const [localPubkey, setLocalPubkey] = useState<string | null>(null);

  // Password modal state for local-wallet signing
  const [pendingVote, setPendingVote] = useState<{
    proposalId: string;
    approve: boolean;
  } | null>(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const cluster = getActiveCluster();

  // Demo investor share weight (Fase 0 — always 4)
  const voterShares = 4;

  useEffect(() => {
    setLocalPubkey(getLocalWalletPubkey());
  }, []);

  // F4: try to load on-chain proposals; fall back to DEMO_PROPOSALS when empty.
  // fetchProposals returns [] in Fase 0 (getProgramAccounts not yet implemented).
  useEffect(() => {
    fetchProposals(propertyId).then((onchain) => {
      if (onchain.length === 0) return; // keep DEMO_PROPOSALS as fallback
      setProposals(
        onchain.map((p) => ({
          proposalId: p.proposalId.toString(),
          title: `Propuesta #${p.proposalId}`,
          uri: `https://gov.tropico.app/p/${propertyId}-${p.proposalId}`,
          yesWeight: Number(p.yesWeight),
          noWeight: Number(p.noWeight),
          endTs: Number(p.endTs),
          executed: p.executed,
          snapshotTotalShares: Number(p.snapshotTotalShares),
        }))
      );
    });
  }, [propertyId]);

  function handleVote(proposalId: string, approve: boolean) {
    if (votedIds.has(proposalId) || inflightIds.has(proposalId)) return;

    if (!localPubkey) {
      // Demo mode: optimistic-only, no on-chain tx
      applyOptimisticVote(proposalId, approve);
      setVotedIds((s) => new Set([...s, proposalId]));
      return;
    }

    // Local wallet present — open password modal to sign on-chain
    setPendingVote({ proposalId, approve });
    setPassword("");
    setPasswordError(null);
  }

  function applyOptimisticVote(proposalId: string, approve: boolean) {
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

  function revertOptimisticVote(proposalId: string, approve: boolean) {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.proposalId !== proposalId) return p;
        return {
          ...p,
          yesWeight: approve ? p.yesWeight - voterShares : p.yesWeight,
          noWeight: !approve ? p.noWeight - voterShares : p.noWeight,
        };
      })
    );
  }

  async function confirmVote() {
    if (!pendingVote || !localPubkey) return;
    const { proposalId, approve } = pendingVote;

    setPasswordError(null);
    const kp = await unlockLocalWallet(password);
    if (!kp) {
      setPasswordError("Contraseña incorrecta");
      return;
    }

    // Close modal, start inflight
    setPendingVote(null);
    setPassword("");
    setInflightIds((s) => new Set([...s, proposalId]));
    setVoteErrors((prev) => {
      const n = { ...prev };
      delete n[proposalId];
      return n;
    });

    // Optimistic state update
    applyOptimisticVote(proposalId, approve);

    try {
      const signer = makeKeypairSigner(kp);
      const tx = await buildVoteTx(
        propertyId,
        kp.publicKey,
        BigInt(proposalId),
        approve
      );

      const conn = new Connection(getActiveRpcUrl(), "confirmed");
      let sig: string;
      if (signer.type === "keypair") {
        tx.sign(signer.kp);
        sig = await conn.sendRawTransaction(tx.serialize());
      } else {
        const signed = await signer.signTransaction(tx);
        sig = await conn.sendRawTransaction(signed.serialize());
      }
      await conn.confirmTransaction(sig, "confirmed");

      setVotedIds((s) => new Set([...s, proposalId]));
      setVoteSigs((prev) => ({ ...prev, [proposalId]: sig }));
    } catch (e) {
      // Revert optimistic update on failure
      revertOptimisticVote(proposalId, approve);
      setVoteErrors((prev) => ({
        ...prev,
        [proposalId]: (e as Error).message,
      }));
    } finally {
      setInflightIds((s) => {
        const n = new Set(s);
        n.delete(proposalId);
        return n;
      });
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-8 px-5 py-10">
      <nav className="flex items-center gap-2 text-sm text-tropico-mute">
        <Link href="/inmuebles" className="hover:text-tropico-text">
          Inmuebles
        </Link>
        <span>/</span>
        <Link
          href={`/inmuebles/${propertyId}`}
          className="hover:text-tropico-text"
        >
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
        <div className="panel p-6 text-center text-sm text-tropico-mute">
          No hay propuestas activas para este inmueble.
        </div>
      ) : (
        <section className="flex flex-col gap-4">
          {proposals.map((p) => (
            <div key={p.proposalId} className="flex flex-col gap-2">
              {/* Loading overlay while tx is in flight */}
              <div className="relative">
                {inflightIds.has(p.proposalId) && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-tropico-ink/60">
                    <Loader2 className="size-6 animate-spin text-tropico-sea" />
                  </div>
                )}
                <ProposalCard
                  proposal={p}
                  voterShares={voterShares}
                  onVote={
                    votedIds.has(p.proposalId) ||
                    inflightIds.has(p.proposalId)
                      ? undefined
                      : handleVote
                  }
                />
              </div>

              {/* Tx error */}
              {voteErrors[p.proposalId] && (
                <p className="rounded-md border border-tropico-coral/30 bg-tropico-coral/5 p-2 text-xs text-tropico-coral">
                  {voteErrors[p.proposalId]}
                </p>
              )}

              {/* Tx success — Solscan link */}
              {voteSigs[p.proposalId] && (
                <a
                  href={`https://solscan.io/tx/${voteSigs[p.proposalId]}${cluster === "devnet" ? "?cluster=devnet" : ""}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] text-tropico-sea hover:underline"
                >
                  Voto registrado on-chain <ExternalLink className="size-3" />
                </a>
              )}
            </div>
          ))}
        </section>
      )}

      {proposals.some((p) => votedIds.has(p.proposalId)) && (
        <p className="text-center text-xs text-tropico-mute">
          {localPubkey
            ? "Voto registrado on-chain en Solscan permanentemente."
            : "Voto registrado · en producción esto queda on-chain en Solscan permanentemente."}
        </p>
      )}

      <Link
        href={`/inmuebles/${propertyId}`}
        className="text-sm text-tropico-mute hover:text-tropico-text"
      >
        &larr; Volver al inmueble
      </Link>

      {/* Password modal — appears when user has a local wallet and clicks a vote button */}
      {pendingVote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="panel flex w-full max-w-sm flex-col gap-4 border-tropico-sea/30 p-5">
            <header className="flex items-center gap-2">
              <Vote className="size-5 text-tropico-sea" />
              <strong className="text-tropico-text">
                Confirmar voto — {pendingVote.approve ? "SÍ" : "NO"}
              </strong>
            </header>
            <p className="text-sm text-tropico-mute">
              Ingresa tu contraseña para firmar el voto on-chain.
            </p>
            <input
              type="password"
              value={password}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmVote();
              }}
              placeholder="••••••••"
              className="h-10 rounded-md border border-tropico-border bg-tropico-ink px-3 text-sm focus:border-tropico-sea focus:outline-none"
            />
            {passwordError && (
              <p className="text-xs text-tropico-coral">{passwordError}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setPendingVote(null);
                  setPassword("");
                  setPasswordError(null);
                }}
                className="flex-1 rounded-lg border border-tropico-border bg-tropico-ink/40 py-2 text-sm font-semibold transition hover:border-tropico-mute"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmVote}
                className="btn-primary flex-1 py-2 text-sm"
              >
                Firmar y votar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
