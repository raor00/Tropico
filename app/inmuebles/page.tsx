import Link from "next/link";
import { Header } from "@/components/Header";
import { PropertyCard } from "@/components/PropertyCard";
import { PROPERTY_LIST } from "@/lib/properties";

export const metadata = {
  title: "Inmuebles — Tropico",
};

export default function InmueblesPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-8 px-5 py-10">
      <header className="flex flex-col gap-3 animate-fade-up">
        <Link
          href="/"
          className="w-fit text-sm text-tropico-mute transition hover:text-tropico-text"
        >
          &larr; Volver
        </Link>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-tropico-border bg-tropico-panel px-3 py-1 text-xs text-tropico-sea">
          Trópico × Crixto
        </span>
        <h1 className="h-display">Inmuebles venezolanos en Solana</h1>
        <p className="max-w-2xl text-tropico-mute">
          Explorá como Airbnb, invertí como Wall Street. Comprá acciones
          fraccionadas desde $25 USDC, recibí renta mensual y gobernás las
          decisiones del inmueble on-chain.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROPERTY_LIST.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </section>

      <footer className="mt-auto border-t border-tropico-border pt-6 text-xs text-tropico-mute">
        Tropico y Crixto no son asesores financieros. Invertir en inmuebles
        tokenizados conlleva riesgos. Leé los{" "}
        <Link href="/legal/token-holders" className="underline hover:text-tropico-text">
          términos de los token-holders
        </Link>{" "}
        antes de invertir.
      </footer>
    </main>
  );
}
