import Link from "next/link";
import {
  ArrowLeftRight,
  Send,
  Sprout,
  QrCode,
  Sparkles,
  Compass,
  Zap,
  Globe,
  Plus,
  Gift,
  CalendarClock,
} from "lucide-react";
import { Header } from "@/components/Header";
import { WalletSessionBar } from "@/components/WalletSessionBar";
import { HomeBalances } from "@/components/HomeBalances";
import { MOCK_CASHBACK_PENDIENTE, MOCK_NEXT_DCA } from "@/lib/mock-data";
import { formatUSD } from "@/lib/formato";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tu Tropico — Inicio",
};

const MODULES = [
  { href: "/cambiar", Icon: ArrowLeftRight, titulo: "Cambiar", accent: "text-tropico-sun" },
  { href: "/cobrar", Icon: QrCode, titulo: "Cobrar", accent: "text-tropico-coral" },
  { href: "/enviar", Icon: Send, titulo: "Enviar", accent: "text-tropico-sun" },
  { href: "/guardar", Icon: Sprout, titulo: "Guardar", accent: "text-tropico-sea" },
  { href: "/remesas", Icon: Globe, titulo: "Remesas", accent: "text-tropico-sea" },
  { href: "/pagar-servicios", Icon: Zap, titulo: "Servicios", accent: "text-tropico-sun" },
  { href: "/carlos", Icon: Sparkles, titulo: "Carlos AI", accent: "text-tropico-purple" },
  { href: "/descubrir", Icon: Compass, titulo: "Descubrir", accent: "text-tropico-mute" },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-5 px-5 py-6">
      <Header />

      {/* Wallet session + depositar */}
      <section className="flex flex-wrap items-center justify-between gap-2">
        <WalletSessionBar />
        <Link
          href="/depositar"
          className="inline-flex items-center gap-1 rounded-full border border-tropico-sun/40 bg-tropico-sun/10 px-3 py-1.5 text-xs font-semibold text-tropico-sun transition hover:bg-tropico-sun/20"
        >
          <Plus className="size-3" strokeWidth={2.5} />
          Depositar Bs
        </Link>
      </section>

      {/* Saldo real on-chain — minimal, sin orbes */}
      <HomeBalances />

      {/* Notificaciones — solo si hay datos */}
      {(MOCK_CASHBACK_PENDIENTE.total > 0 || MOCK_NEXT_DCA?.monto) && (
        <section className="grid gap-2 sm:grid-cols-2">
          {MOCK_CASHBACK_PENDIENTE.total > 0 && (
            <Link
              href="/carlos/agente"
              className="flex items-center gap-2.5 rounded-xl border border-tropico-border bg-tropico-panel/40 p-3 transition hover:border-tropico-sun/40"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-tropico-sun/15 text-tropico-sun">
                <Gift className="size-4" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-tropico-text">
                  {formatUSD(MOCK_CASHBACK_PENDIENTE.total)} de cashback
                </div>
                <div className="text-[10px] text-tropico-mute">Tap para reclamar</div>
              </div>
            </Link>
          )}

          <Link
            href="/carlos/agente"
            className="flex items-center gap-2.5 rounded-xl border border-tropico-border bg-tropico-panel/40 p-3 transition hover:border-tropico-coral/40"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-tropico-coral/15 text-tropico-coral">
              <CalendarClock className="size-4" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium text-tropico-text">
                DCA Lun · {formatUSD(MOCK_NEXT_DCA.monto)} → {MOCK_NEXT_DCA.tokenDestino}
              </div>
              <div className="text-[10px] text-tropico-mute">Carlos lo ejecuta</div>
            </div>
          </Link>
        </section>
      )}

      {/* Módulos — grid uniforme, minimal */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-tropico-mute">
          Acciones
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {MODULES.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group flex flex-col items-center gap-2 rounded-xl border border-tropico-border bg-tropico-panel/40 p-3 transition hover:border-tropico-sun/40 hover:bg-tropico-panel/60"
            >
              <m.Icon className={`size-5 ${m.accent} transition group-hover:scale-110`} strokeWidth={1.75} />
              <span className="text-[11px] font-medium text-tropico-text">{m.titulo}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
