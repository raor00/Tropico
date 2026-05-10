import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { FaucetCard } from "@/components/FaucetCard";
import { CambiarTabs } from "./CambiarTabs";

export const metadata = {
  title: "Cambiar — Tropico",
};

export default function CambiarPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-5 py-10">
      <header className="flex flex-col gap-3 pt-4">
        <Link
          href="/home"
          className="w-fit text-sm text-tropico-mute transition hover:text-tropico-sun"
        >
          ← Volver
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-tropico-purple/30 to-tropico-purple/5 ring-1 ring-tropico-purple/40">
            <ArrowLeftRight className="size-6 text-tropico-purple" strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-tropico-purple">
              Swap · best price
            </span>
            <h1 className="font-display text-3xl font-bold leading-tight">
              Cambiar tokens
            </h1>
          </div>
        </div>
        <p className="text-sm text-tropico-mute">
          <strong className="text-tropico-text">Tokens</strong> vía Jupiter v6 (mejor precio del mercado) o
          <strong className="text-tropico-text"> Bolívares ↔ USDC</strong> vía Tropico Liquidity Pool (settlement &lt;1s, sin esperar contraparte).
        </p>
      </header>

      {/* Faucet $50 USDC test — visible al inicio para que el user pueda probar el swap */}
      <FaucetCard />

      <Suspense
        fallback={
          <div className="panel animate-pulse p-8 text-center text-tropico-mute">
            Cargando…
          </div>
        }
      >
        <CambiarTabs />
      </Suspense>

      <footer className="mt-auto text-xs text-tropico-mute">
        Tokens via{" "}
        <a
          href="https://jup.ag"
          target="_blank"
          rel="noreferrer"
          className="text-tropico-green underline"
        >
          Jupiter Aggregator
        </a>{" "}
        · Bolívares via Tropico Liquidity Pool (Carlos AI by Lumen monitorea cada swap).
      </footer>
    </main>
  );
}
