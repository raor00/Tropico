import Link from "next/link";
import { Header } from "@/components/Header";
import { TokenCard } from "@/components/TokenCard";
import { DESCUBRIR_TOKENS } from "@/lib/tokens";

export const metadata = {
  title: "Descubrir tokens — Tropico",
};
export default function DescubrirPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-8 px-5 py-10">
      <header className="flex flex-col gap-3 animate-fade-up">
        <Link
          href="/"
          className="w-fit text-sm text-tropico-mute transition hover:text-tropico-text"
        >
          &larr; Volver
        </Link>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-tropico-border bg-tropico-panel px-3 py-1 text-xs text-tropico-purple">
          M&aacute;s all&aacute; del USDT
        </span>
        <h1 className="h-display">Descubre el ecosistema</h1>
        <p className="max-w-2xl text-tropico-mute">
          Solana tiene mucho m&aacute;s que USDT. Conoce ocho tokens curados, qu&eacute; hacen,
          y por qu&eacute; podr&iacute;an importarte. Tap a cualquiera para cambiar a ese token.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {DESCUBRIR_TOKENS.map((token) => (
          <TokenCard key={token.symbol} token={token} />
        ))}
      </section>
      <footer className="mt-auto border-t border-tropico-border pt-6 text-xs text-tropico-mute">
        Tropico no es asesor financiero. Esta informaci&oacute;n es educativa, panita.
      </footer>
    </main>
  );
}
