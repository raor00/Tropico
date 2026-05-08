import { Suspense } from "react";
import Link from "next/link";
import { SwapForm } from "@/components/SwapForm";

export const metadata = {
  title: "Cambiar — Tropico",
};

export default function CambiarPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-5 py-10">
      <header className="flex flex-col gap-2">
        <Link
          href="/home"
          className="w-fit text-sm text-tropico-mute transition hover:text-tropico-text"
        >
          &larr; Volver
        </Link>
        <h1 className="font-display text-3xl font-bold">Cambiar</h1>
        <p className="text-sm text-tropico-mute">
          Intercambi&aacute; entre tokens al mejor precio. Cotizaciones en vivo via Jupiter v6.
        </p>
      </header>

      <Suspense
        fallback={
          <div className="panel animate-pulse p-8 text-center text-tropico-mute">
            Cargando swap…
          </div>
        }
      >
        <SwapForm />
      </Suspense>

      <footer className="mt-auto text-xs text-tropico-mute">
        Powered by{" "}
        <a
          href="https://jup.ag"
          target="_blank"
          rel="noreferrer"
          className="text-tropico-green underline"
        >
          Jupiter Aggregator
        </a>{" "}
        — el agregador #1 de Solana.
      </footer>
    </main>
  );
}
