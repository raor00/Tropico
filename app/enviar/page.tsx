import Link from "next/link";
import { SendForm } from "@/components/SendForm";

export const metadata = {
  title: "Enviar — Tropico",
};

// Forzar render dinámico — la página usa client-side state (localStorage, claim links)
export const dynamic = "force-dynamic";

export default function EnviarPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-6 px-5 py-10">
      <header className="flex flex-col gap-2">
        <Link
          href="/home"
          className="w-fit text-sm text-tropico-mute transition hover:text-tropico-text"
        >
          &larr; Volver
        </Link>
        <h1 className="font-display text-3xl font-bold">Enviar</h1>
        <p className="text-sm text-tropico-mute">
          Mandá USDC a quien quieras. Si no tiene wallet, le creamos una cuando
          abra el link. Sin Western Union, sin comisiones escondidas.
        </p>
      </header>

      <SendForm />

      <footer className="mt-auto text-xs text-tropico-mute">
        Powered by Solana Pay claim links + Privy embedded wallets.
      </footer>
    </main>
  );
}
