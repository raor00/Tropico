import Link from "next/link";
import { EnviarTabs } from "./EnviarTabs";

export const metadata = {
  title: "Enviar — Tropico",
};

export const dynamic = "force-dynamic";

export default function EnviarPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-6 px-5 py-8">
      <header className="flex flex-col gap-2 pt-4">
        <Link
          href="/home"
          className="w-fit text-sm text-tropico-mute transition hover:text-tropico-sun"
        >
          &larr; Volver
        </Link>
        <h1 className="font-display text-3xl font-bold">Enviar</h1>
        <p className="text-sm text-tropico-mute">
          A wallet directo (firma onchain) o claim link (para receptor sin wallet,
          comparte por WhatsApp).
        </p>
      </header>

      <EnviarTabs />

      <footer className="mt-auto text-xs text-tropico-mute">
        Wallet directo: SPL Token Program · Claim link: Solana Pay reference
      </footer>
    </main>
  );
}
