"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatUSD } from "@/lib/formato";

const FAUCET_AMOUNT = 50;
const STORAGE_KEY = "tropico:faucet:claimed";

/**
 * FaucetCard — botón para reclamar 50 USDC test (devnet).
 * Solo visible si el user no lo reclamó ya. Persiste en localStorage.
 */
export function FaucetCard() {
  const [claimed, setClaimed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(arr) && arr.length > 0) setClaimed(true);
    } catch {}
  }, []);

  function claim() {
    setClaimed(true);
    if (typeof window === "undefined") return;
    try {
      const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as unknown[];
      arr.push({ amount: FAUCET_AMOUNT, claimedAt: new Date().toISOString() });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch {}
  }

  if (!mounted) return null;

  return (
    <section className="panel flex items-center gap-3 border-tropico-green/30 bg-tropico-green/5 p-4">
      <span className="text-2xl" aria-hidden>🚰</span>
      <div className="flex-1">
        <h3 className="font-display text-sm font-bold">Faucet de prueba</h3>
        <p className="text-xs text-tropico-mute">
          Recibe {formatUSD(FAUCET_AMOUNT)} USDC test para probar el swap
        </p>
      </div>
      {claimed ? (
        <Link
          href="/home"
          className="rounded-lg bg-tropico-green/15 px-3 py-1.5 text-xs font-semibold text-tropico-green"
        >
          ✅ Reclamado · ver
        </Link>
      ) : (
        <button
          onClick={claim}
          className="rounded-lg bg-tropico-green px-3 py-1.5 text-xs font-semibold text-tropico-ink hover:opacity-90"
        >
          Reclamar {formatUSD(FAUCET_AMOUNT)}
        </button>
      )}
    </section>
  );
}
