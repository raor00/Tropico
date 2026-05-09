import { Suspense } from "react";
import Link from "next/link";
import { FaucetCard } from "@/components/FaucetCard";
import { CambiarTabs } from "./CambiarTabs";

export const metadata = {
  title: "Cambiar — Tropico",
};

export default function CambiarPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-5 py-10">
      <header className="flex flex-col gap-2 pt-4">
        <Link
          href="/home"
          className="w-fit text-sm text-tropico-mute transition hover:text-tropico-sun"
        >
          &larr; Volver
        </Link>
        <h1 className="font-display text-3xl font-bold">Cambiar</h1>
        <p className="text-sm text-tropico-mute">
          Tokens vía Jupiter v6 (mejor precio del mercado) o Bolívares ↔ USDC vía
          Tropico Liquidity Pool (settlement &lt;1s, sin esperar contraparte).
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
