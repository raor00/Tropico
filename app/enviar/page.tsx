import Link from "next/link";
import { Send } from "lucide-react";
import { EnviarTabs } from "./EnviarTabs";

export const metadata = {
  title: "Enviar — Tropico",
};

export const dynamic = "force-dynamic";

export default function EnviarPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-6 px-5 py-8">
      <header className="flex flex-col gap-3 pt-4">
        <Link
          href="/home"
          className="w-fit text-sm text-tropico-mute transition hover:text-tropico-sun"
        >
          ← Volver
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-tropico-sea/30 to-tropico-sea/5 ring-1 ring-tropico-sea/40">
            <Send className="size-6 text-tropico-sea" strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-tropico-sea">
              Transfer · onchain
            </span>
            <h1 className="font-display text-3xl font-bold leading-tight">
              Enviar tokens
            </h1>
          </div>
        </div>
        <p className="text-sm text-tropico-mute">
          Mandá USDC, SOL o cualquier SPL token <strong className="text-tropico-text">a otra wallet</strong>.
          O generá un <strong className="text-tropico-text">claim link</strong> para receptor sin wallet (comparte por WhatsApp).
        </p>
      </header>

      <EnviarTabs />

      <footer className="mt-auto text-xs text-tropico-mute">
        Wallet directo: SPL Token Program · Claim link: Solana Pay reference
      </footer>
    </main>
  );
}
