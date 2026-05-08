import Link from "next/link";
import { Header } from "@/components/Header";
import { ReceiveQR } from "@/components/ReceiveQR";

export const metadata = {
  title: "Cobrar — Tropico",
};
export default function CobrarPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-6 px-5 py-10">
      <Header />
      <header className="flex flex-col gap-2 pt-4">
        <Link
          href="/home"
          className="w-fit text-sm text-tropico-mute transition hover:text-tropico-text"
        >
          &larr; Volver
        </Link>
        <h1 className="font-display text-3xl font-bold">Cobrar</h1>
        <p className="text-sm text-tropico-mute">
          Genera un código QR y recibe USDC al instante. 1% de fee, settlement en 1 segundo.
        </p>
      </header>
      <ReceiveQR />
      <footer className="mt-auto text-xs text-tropico-mute">
        Powered by{" "}
        <a
          href="https://docs.solanapay.com"
          target="_blank"
          rel="noreferrer"
          className="text-tropico-green underline"
        >
          Solana Pay
        </a>{" "}
        spec.
      </footer>
    </main>
  );
}
