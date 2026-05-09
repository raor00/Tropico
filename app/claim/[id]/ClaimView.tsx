"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Gift, Wallet, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { AuthCTA } from "@/components/AuthCTA";
import { DualPrice } from "@/components/DualPrice";
import { formatUSD } from "@/lib/formato";

/**
 * ClaimView — UI del link de cobro generado por /enviar.
 *
 * Query params:
 *  s=<secret>  — desbloquea la firma del escrow (Q3: real on-chain via PDA SPL Token)
 *  monto=<n>   — USDC a reclamar
 *  para=<name> — nombre del destinatario
 */

type ClaimStatus = "idle" | "claiming" | "done";

export function ClaimView({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const secret = searchParams.get("s") ?? "";
  const monto = parseFloat(searchParams.get("monto") ?? "0") || 0;
  const para = searchParams.get("para") ?? "tú";

  const [hasWallet, setHasWallet] = useState<boolean | null>(null);
  const [status, setStatus] = useState<ClaimStatus>("idle");

  /* Detectar si hay wallet (dev-wallet en localStorage o Privy configurado) */
  useEffect(() => {
    const devWallet = localStorage.getItem("tropico:dev-wallet");
    const hasPrivy = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID);
    setHasWallet(Boolean(devWallet) || hasPrivy);
  }, []);

  function handleClaim() {
    setStatus("claiming");
    setTimeout(() => {
      // Registrar claim recibido
      const claims = JSON.parse(localStorage.getItem("tropico:claims:received") ?? "[]") as unknown[];
      claims.push({ claimId: id, secret, monto, reclamadoEn: new Date().toISOString() });
      localStorage.setItem("tropico:claims:received", JSON.stringify(claims));

      // Sumar al balance simulado (faucet bucket que lee /home)
      const faucet = JSON.parse(localStorage.getItem("tropico:faucet:claimed") ?? "[]") as unknown[];
      faucet.push({ amount: monto, claimedAt: new Date().toISOString(), source: "claim" });
      localStorage.setItem("tropico:faucet:claimed", JSON.stringify(faucet));

      setStatus("done");
    }, 1800);
  }

  /* ── Detectando wallet ─────────────────────────────────────────────── */
  if (hasWallet === null) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <span className="text-tropico-mute text-sm animate-pulse">Cargando…</span>
      </main>
    );
  }

  /* ── Done ──────────────────────────────────────────────────────────── */
  if (status === "done") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-5 py-10 text-center">
        <ScrollReveal direction="up">
          <div className="flex flex-col items-center gap-5">
            <div className="flex size-20 items-center justify-center rounded-full bg-tropico-green/20">
              <CheckCircle2 className="size-10 text-tropico-green" />
            </div>
            <h1 className="font-display text-3xl font-bold">¡Reclamado!</h1>
            <DualPrice usd={monto} size="lg" align="center" />

            <div className="rounded-xl border border-tropico-border bg-tropico-panel px-5 py-4 text-xs text-tropico-mute text-left w-full">
              <p className="font-semibold text-tropico-text mb-1">Demo — Q3 2026</p>
              <p>
                En producción, se ejecuta la transferencia on-chain del escrow al wallet del receptor.
                El <code className="font-mono text-tropico-purple">secret</code> desbloquea la firma
                del PDA del programa SPL Token estándar.
              </p>
            </div>

            <Link href="/home" className="btn-primary mt-2 w-full">
              Ver mi wallet
            </Link>
          </div>
        </ScrollReveal>
      </main>
    );
  }

  /* ── Sin wallet: onboarding ─────────────────────────────────────────── */
  if (!hasWallet) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-8 px-5 py-10">
        <ScrollReveal direction="up">
          <div className="flex flex-col items-center gap-5 rounded-2xl bg-gradient-to-br from-tropico-purple/20 via-tropico-sea/10 to-tropico-green/10 border border-tropico-border p-8 text-center">
            <Gift className="size-14 text-tropico-sun" strokeWidth={1.5} />
            <div>
              <h1 className="font-display text-3xl font-bold">
                ¡Hola, <span className="text-tropico-sun">{para}</span>!
              </h1>
              <p className="mt-2 text-tropico-mute text-sm">
                Te enviaron un regalo en USDC
              </p>
            </div>
            <div className="w-full rounded-xl border border-tropico-green/30 bg-tropico-green/10 px-4 py-3">
              <p className="text-xs text-tropico-mute mb-1">Monto a recibir</p>
              <DualPrice usd={monto} size="lg" align="center" />
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={150}>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-xl border border-tropico-purple/30 bg-tropico-purple/5 p-4">
              <Wallet className="mt-0.5 size-4 shrink-0 text-tropico-purple" />
              <p className="text-sm text-tropico-mute">
                Para recibir tus USDC, creá tu wallet con solo tu email.
                Es gratis, sin KYC, y en menos de 1 minuto.
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-3">
              <AuthCTA variant="primary" label="Crear wallet y reclamar" />
              <p className="text-center text-xs text-tropico-mute">
                Sin cuenta bancaria. Sin comisiones escondidas. Solo tu email.
              </p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={200}>
          <p className="text-center text-xs text-tropico-mute">
            ¿Ya tenés wallet?{" "}
            <button
              onClick={() => setHasWallet(true)}
              className="text-tropico-purple underline"
            >
              Reclamar con mi cuenta
            </button>
          </p>
        </ScrollReveal>

        <ScrollReveal direction="fade" delay={300}>
          <div className="flex items-start gap-3 rounded-xl border border-tropico-coral/20 bg-tropico-coral/5 p-4">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-tropico-coral" />
            <p className="text-xs text-tropico-mute">
              <strong className="text-tropico-text">Demo — </strong>
              El escrow real se implementa en Q3 con un PDA del programa SPL Token.
              El <code className="font-mono">secret</code> desbloquea la firma on-chain.
            </p>
          </div>
        </ScrollReveal>
      </main>
    );
  }

  /* ── Con wallet: reclamar ──────────────────────────────────────────── */
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-8 px-5 py-10">
      <ScrollReveal direction="up">
        <div className="flex flex-col items-center gap-5 rounded-2xl bg-gradient-to-br from-tropico-purple/20 via-tropico-sea/10 to-tropico-green/10 border border-tropico-border p-8 text-center">
          <Gift className="size-14 text-tropico-sun" strokeWidth={1.5} />
          <h1 className="font-display text-3xl font-bold">
            {para !== "tú" ? (
              <>¡Hola, <span className="text-tropico-sun">{para}</span>!</>
            ) : (
              "¡Te enviaron USDC!"
            )}
          </h1>
          <div className="w-full rounded-xl border border-tropico-green/30 bg-tropico-green/10 px-4 py-3">
            <p className="text-xs text-tropico-mute mb-1">Recibirás en tu wallet</p>
            <DualPrice usd={monto} size="lg" align="center" />
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal direction="up" delay={150}>
        <div className="panel flex flex-col gap-4 p-6">
          <div className="flex items-center gap-3">
            <Wallet className="size-5 text-tropico-purple" />
            <p className="text-sm text-tropico-mute">
              Tu wallet Tropico está lista para recibir los fondos.
            </p>
          </div>

          <button
            onClick={handleClaim}
            disabled={status === "claiming"}
            className="btn-primary inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "claiming" ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Procesando…
              </>
            ) : (
              <>
                Reclamar {formatUSD(monto)} USDC
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </ScrollReveal>

      <ScrollReveal direction="fade" delay={250}>
        <div className="flex items-start gap-3 rounded-xl border border-tropico-coral/20 bg-tropico-coral/5 p-4">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-tropico-coral" />
          <p className="text-xs text-tropico-mute">
            <strong className="text-tropico-text">Demo — </strong>
            En producción Q3, se ejecuta la transferencia on-chain del escrow al wallet del receptor.
            El <code className="font-mono text-tropico-purple">secret</code> desbloquea la firma
            del PDA del programa SPL Token estándar.
          </p>
        </div>
      </ScrollReveal>
    </main>
  );
}
