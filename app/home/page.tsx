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
import { WalletSessionBar } from "@/components/WalletSessionBar";
import { HomeBalances } from "@/components/HomeBalances";
import { Greeting } from "@/components/Greeting";
import { ModuleCard } from "@/components/ModuleCard";
import { MOCK_CASHBACK_PENDIENTE, MOCK_NEXT_DCA } from "@/lib/mock-data";
import { formatUSD } from "@/lib/formato";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tu Tropico — Inicio",
};

const MODULES = [
  {
    href: "/cambiar",
    Icon: ArrowLeftRight,
    titulo: "Cambiar",
    descripcion: "Intercambia tokens o Bs↔USDC al mejor precio",
    gradient: "from-tropico-purple/20 to-tropico-sea/10",
    badge: "Swap",
  },
  {
    href: "/cobrar",
    Icon: QrCode,
    titulo: "Cobrar",
    descripcion: "QR Solana Pay — recibe USDC al instante",
    gradient: "from-tropico-coral/30 to-tropico-sun/15",
    badge: "QR",
  },
  {
    href: "/enviar",
    Icon: Send,
    titulo: "Enviar",
    descripcion: "Manda USDC a quien quieras, instantáneo",
    gradient: "from-tropico-sun/30 to-tropico-coral/15",
    badge: "Send",
  },
  {
    href: "/guardar",
    Icon: Sprout,
    titulo: "Guardar",
    descripcion: "Tu plata generando ~5% al año automático",
    gradient: "from-tropico-sea/30 to-tropico-green/10",
    badge: "Yield",
  },
  {
    href: "/remesas",
    Icon: Globe,
    titulo: "Remesas",
    descripcion: "Recibe del exterior en 1 segundo, sin colas",
    gradient: "from-tropico-sea/30 to-tropico-sun/10",
    badge: "Remesas",
  },
  {
    href: "/pagar-servicios",
    Icon: Zap,
    titulo: "Servicios",
    descripcion: "Paga luz, agua, internet y streaming con USDC",
    gradient: "from-tropico-sun/25 to-tropico-sea/10",
    badge: "Pay",
  },
  {
    href: "/carlos",
    Icon: Sparkles,
    titulo: "Carlos AI",
    descripcion: "Tu copiloto venezolano powered by Lumen",
    gradient: "from-tropico-coral/20 to-tropico-purple/15",
    badge: "AI",
  },
  {
    href: "/descubrir",
    Icon: Compass,
    titulo: "Descubrir",
    descripcion: "Conoce el ecosistema Solana sin jerga",
    gradient: "from-tropico-mute/20 to-tropico-border/10",
    badge: "Educa",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-6 px-5 py-8">

      {/* Wallet session + Depositar */}
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

      {/* Saludo Caracas — sutil sobre el saldo */}
      <Greeting />

      {/* Saldo real on-chain (HomeBalances trae card + lista) */}
      <HomeBalances />

      {/* Notificaciones Carlos — descriptivas, sin saturar */}
      <section className="grid gap-3 md:grid-cols-2">
        {MOCK_CASHBACK_PENDIENTE.total > 0 && (
          <Link
            href="/carlos/agente"
            className="panel flex items-center gap-3 border-tropico-sun/30 bg-tropico-sun/5 p-4 transition hover:border-tropico-sun/60"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-tropico-sun/20 text-tropico-sun">
              <Gift className="size-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-tropico-text">
                Tienes {formatUSD(MOCK_CASHBACK_PENDIENTE.total)} de cashback acumulado
              </div>
              <div className="text-xs text-tropico-mute">
                De {MOCK_CASHBACK_PENDIENTE.comerciosCount} comercios afiliados — tap para reclamar
              </div>
            </div>
          </Link>
        )}

        <Link
          href="/carlos/agente"
          className="panel flex items-center gap-3 border-tropico-coral/30 bg-tropico-coral/5 p-4 transition hover:border-tropico-coral/60"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-tropico-coral/20 text-tropico-coral">
            <CalendarClock className="size-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-tropico-text">
              Próximo DCA: {formatUSD(MOCK_NEXT_DCA.monto)} → {MOCK_NEXT_DCA.tokenDestino}
            </div>
            <div className="text-xs text-tropico-mute">
              Lunes 10:00 — Carlos lo ejecuta automático
            </div>
          </div>
        </Link>
      </section>

      {/* Grid de módulos — 2-col mobile, 3-col tablet, 4-col desktop */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold">Acciones</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {MODULES.map((m) => (
            <ModuleCard key={m.href} {...m} />
          ))}
        </div>
      </section>
    </main>
  );
}
