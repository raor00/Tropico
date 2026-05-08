import Link from "next/link";
import { Header } from "@/components/Header";

const QUICK_PROMPTS = [
  "¿Qué es JTO?",
  "¿Cuál token me conviene si quiero ahorrar?",
  "¿Por qué Solana y no Ethereum?",
  "¿Qué es staking?",
  "Diferencia entre USDC y USDT",
];

export const metadata = {
  title: "Carlos AI — Tu copiloto en Solana",
};

export default function CarlosPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-5 py-10">
      <Header
        nav={[
          { href: "/home", label: "Wallet" },
          { href: "/carlos", label: "Carlos" },
          { href: "/carlos/agente", label: "Modo Agente" },
        ]}
      />
      <header className="flex flex-col gap-3 pt-4">
        <Link
          href="/"
          className="w-fit text-sm text-tropico-mute transition hover:text-tropico-sun"
        >
          &larr; Volver
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-tropico-purple to-tropico-sea">
            <span className="text-2xl">🌴</span>
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">Carlos</h1>
            <p className="text-sm text-tropico-green">En l&iacute;nea</p>
          </div>
        </div>
      </header>

      {/* Greeting + chat placeholder */}
      <section className="panel flex flex-col gap-4 p-6">
        <p className="text-tropico-text/90">
          ¡Epa, panita! Soy Carlos, tu copiloto en Solana. Preguntame qu&eacute;
          es cualquier token, c&oacute;mo funciona el staking, o por qu&eacute; Solana
          le pega a Ethereum. ¿En qu&eacute; te ayudo?
        </p>
        <div className="rounded-lg border border-tropico-border bg-tropico-ink/40 p-4 text-sm text-tropico-mute">
          ⏳ El chat con Gemini se activa cuando configures tu API key en{" "}
          <code className="font-mono text-xs">.env.local</code>. Por ahora,
          mira el <strong className="text-tropico-text">Modo Agente</strong>{" "}
          que ya est&aacute; funcional como showcase.
        </div>
      </section>

      {/* Quick prompts */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm uppercase tracking-wider text-tropico-mute">
          Preguntame sobre…
        </h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              className="rounded-full border border-tropico-border bg-tropico-panel px-3 py-1.5 text-sm transition hover:border-tropico-mute hover:text-tropico-text"
            >
              {p}
            </button>
          ))}
        </div>
      </section>

      {/* CTA al Modo Agente */}
      <Link
        href="/carlos/agente"
        className="panel group flex items-center justify-between gap-4 overflow-hidden p-6 transition hover:border-tropico-purple"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-tropico-purple/10 to-tropico-sea/10 opacity-0 transition group-hover:opacity-100" />
        <div className="relative flex items-center gap-4">
          <span className="text-3xl" aria-hidden>🤖</span>
          <div>
            <h3 className="font-display text-lg font-bold">Modo Agente</h3>
            <p className="text-sm text-tropico-mute">
              Carlos puede ejecutar acciones aut&oacute;nomas con tus l&iacute;mites
            </p>
          </div>
        </div>
        <span className="relative text-tropico-mute transition group-hover:text-tropico-purple">
          Configurar &rarr;
        </span>
      </Link>
    </main>
  );
}
