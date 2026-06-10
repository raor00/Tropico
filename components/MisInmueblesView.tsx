"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Building2, Loader2, TrendingUp, Wallet } from "lucide-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { PROPERTY_LIST } from "@/lib/properties";
import {
  fetchInvestorPosition,
  fetchPropertyConfig,
  shareMintPda,
} from "@/lib/realestate-program";
import { getActiveCluster, getActiveRpcUrl } from "@/lib/cluster";
import type { Signer } from "@/lib/send-tx";
import { RewardClaimCard } from "@/components/RewardClaimCard";
import { ShareTransferCard } from "@/components/ShareTransferCard";

type Position = {
  propertyId: string;
  sharesOwned: number;
  /** On-chain: last epoch claimed by this investor (0 = none). */
  lastClaimedEpoch: number;
  /** On-chain: total epochs deposited for this property (PropertyConfig.epoch_count). */
  epochCount: number;
};

type Props = {
  /** Pubkey del inversor activo (privy o local). */
  pubkey: string | null;
  /** Signer real si está disponible (privy). Wallet local resuelve con password en cada acción. */
  signer: Signer | null;
  localPubkey: string | null;
};

export function MisInmueblesView({ pubkey, signer, localPubkey }: Props) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const cluster = getActiveCluster();

  const load = useCallback(async () => {
    if (!pubkey) {
      setPositions([]);
      return;
    }
    setLoading(true);
    try {
      const investor = new PublicKey(pubkey);
      const conn = new Connection(getActiveRpcUrl(), "confirmed");

      // Derive ATAs for every property (pure computation — no RPC)
      const ataEntries = await Promise.all(
        PROPERTY_LIST.map(async (p) => {
          const mint = shareMintPda(p.id);
          const ata = await getAssociatedTokenAddress(mint, investor);
          return { propertyId: p.id, ata };
        })
      );

      // O1: single batched RPC call replaces N serial getAccountInfo calls
      const accounts = await conn.getMultipleAccountsInfo(
        ataEntries.map((e) => e.ata)
      );

      // SPL token account: amount is u64 LE at byte offset 64
      const held = accounts
        .map((info, i) => ({
          propertyId: ataEntries[i].propertyId,
          sharesOwned: info ? Number(info.data.readBigUInt64LE(64)) : 0,
        }))
        .filter((r) => r.sharesOwned > 0);

      // C3: for each held position, read on-chain InvestorPosition (lastClaimedEpoch)
      // and PropertyConfig (epochCount) to derive real reward eligibility.
      // NOTE: Computing exact claimableUsdc requires reading the YieldEpoch PDA for each
      // unclaimed epoch (total_yield_usdc, snapshot_total_shares). No fetchYieldEpoch
      // helper exists yet — claimableUsdc is passed as 0 and the card gates on epoch only.
      const enrichedPositions = await Promise.all(
        held.map(async (pos) => {
          const [posData, propData] = await Promise.all([
            fetchInvestorPosition(pos.propertyId, investor),
            fetchPropertyConfig(pos.propertyId),
          ]);
          return {
            ...pos,
            lastClaimedEpoch: Number(posData?.lastClaimedEpoch ?? 0n),
            epochCount: Number(propData?.epochCount ?? 0n),
          };
        })
      );

      setPositions(enrichedPositions);
    } finally {
      setLoading(false);
    }
  }, [pubkey]);

  useEffect(() => {
    load();
  }, [load]);

  const enriched = positions
    .map((pos) => ({
      ...pos,
      property: PROPERTY_LIST.find((p) => p.id === pos.propertyId),
    }))
    .filter((p) => p.property);

  const totalValueUsdc = enriched.reduce(
    (acc, pos) => acc + pos.sharesOwned * (pos.property?.pricePerShare ?? 0),
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
          Acciones y renta de inmuebles tokenizados · leído on-chain ({cluster}).
        </p>
      </header>

      {!pubkey && (
        <div className="panel flex flex-col items-center gap-3 p-8 text-center">
          <Wallet className="size-6 text-tropico-mute" />
          <p className="text-tropico-mute">Conecta tu wallet para ver tus acciones.</p>
          <Link
            href="/inmuebles"
            className="text-sm font-semibold text-tropico-sea hover:underline"
          >
            Explorar inmuebles &rarr;
          </Link>
        </div>
      )}

      {pubkey && (
        <>
          <div className="panel p-4 text-center">
            <div className="text-xs uppercase text-tropico-mute">Valor total</div>
            <div className="font-display text-2xl font-bold">
              ${totalValueUsdc.toLocaleString()}
            </div>
            <div className="text-[11px] text-tropico-mute">USDC (a precio de compra)</div>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-tropico-mute">
              <Loader2 className="size-4 animate-spin" /> Leyendo posiciones on-chain…
            </div>
          )}

          {!loading && enriched.length === 0 && (
            <div className="panel p-8 text-center">
              <p className="text-tropico-mute">No tienes acciones todavía.</p>
              <Link
                href="/inmuebles"
                className="mt-3 inline-block text-sm font-semibold text-tropico-sea hover:underline"
              >
                Explorar inmuebles &rarr;
              </Link>
            </div>
          )}

          {!loading && (
            <section className="flex flex-col gap-6">
              {enriched.map(({ property: p, sharesOwned, propertyId, lastClaimedEpoch, epochCount }) => {
                if (!p) return null;
                const pct = ((sharesOwned / p.totalShares) * 100).toFixed(4);

                // Next unclaimed epoch: epochs are 1-indexed in the program.
                // If lastClaimedEpoch < epochCount, epoch (lastClaimedEpoch + 1) is unclaimed.
                const claimEpoch =
                  lastClaimedEpoch < epochCount ? lastClaimedEpoch + 1 : 0;

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
                          <div className="font-bold text-tropico-text">
                            {sharesOwned.toLocaleString()}
                          </div>
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

                      <div className="mt-2">
                        <ShareTransferCard
                          propertyId={propertyId}
                          propertyName={p.name}
                          sharesOwned={sharesOwned}
                          signer={signer}
                          localPubkey={localPubkey}
                          onTransferred={load}
                        />
                      </div>
                    </div>

                    {/* claimableUsdc=0: exact USDC requires YieldEpoch fetch (not yet implemented).
                        The card renders when claimEpoch > 0 (real unclaimed epoch detected). */}
                    <RewardClaimCard
                      propertyId={propertyId}
                      propertyName={p.name}
                      claimableUsdc={0}
                      epoch={claimEpoch}
                      signer={signer}
                    />
                  </div>
                );
              })}
            </section>
          )}
        </>
      )}
    </main>
  );
}
