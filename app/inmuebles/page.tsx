import Link from "next/link";
import { Briefcase, ChevronRight } from "lucide-react";
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
          fraccionadas desde $2 USDC, recibí renta mensual y gobernás las
          decisiones del inmueble on-chain.
        </p>
      </header>

      <Link
        href="/mis-inmuebles"
        className="group flex items-center justify-between gap-4 rounded-2xl border border-tropico-border bg-tropico-panel px-5 py-4 transition hover:border-tropico-sea animate-fade-up"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-tropico-sea/10 text-tropico-sea">
            <Briefcase className="h-5 w-5" />
          </span>
          <span className="flex flex-col">
            <span className="font-medium text-tropico-text">Mis Inmuebles</span>
            <span className="text-sm text-tropico-mute">
              Tus acciones, renta reclamable y propuestas de gobernanza
            </span>
          </span>
        </span>
        <ChevronRight className="h-5 w-5 text-tropico-mute transition group-hover:translate-x-1 group-hover:text-tropico-sea" />
      </Link>

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
