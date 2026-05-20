import { Greeting } from "@/components/Greeting";
import { HomeBalances } from "@/components/HomeBalances";
import { ModuleCard } from "@/components/ModuleCard";
import { WalletSessionBar } from "@/components/WalletSessionBar";
import { formatUSD } from "@/lib/formato";
import { MOCK_CASHBACK_PENDIENTE, MOCK_NEXT_DCA } from "@/lib/mock-data";
import {
  ArrowLeftRight,
  Briefcase,
  Building2,
  CalendarClock,
  Compass,
  Gift,
  Globe,
  MessageCircle,
  Plus,
  QrCode,
  Send,
  Sparkles,
  Sprout,
  WifiOff,
  Zap,
} from "lucide-react";
import Link from "next/link";

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
    href: "/offline",
    Icon: WifiOff,
    titulo: "Offline",
    descripcion: "Firma txs sin conexión con durable nonces de Solana",
    gradient: "from-tropico-sea/25 to-tropico-purple/10",
    badge: "Nonces",
  },
  {
    href: "/carlos/whatsapp",
    Icon: MessageCircle,
    titulo: "WhatsApp Bot",
    descripcion: "Controla tu wallet desde WhatsApp con comandos de texto",
    gradient: "from-tropico-green/20 to-tropico-sea/10",
    badge: "Bot",
  },
  {
    href: "/inmuebles",
    Icon: Building2,
    titulo: "Inmuebles",
    descripcion: "Compra acciones de inmuebles tokenizados desde $2",
    gradient: "from-tropico-sea/25 to-tropico-green/10",
    badge: "Crixto",
  },
  {
    href: "/mis-inmuebles",
    Icon: Briefcase,
    titulo: "Mis Inmuebles",
    descripcion: "Tus acciones, renta reclamable y gobernanza on-chain",
    gradient: "from-tropico-purple/20 to-tropico-sea/10",
    badge: "Portfolio",
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
          href="/cambiar?tab=bs"
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

      {/* Carlos AI — featured: agente autónomo dentro del wallet (diferencial único) */}
      <section className="flex flex-col gap-2">
        <Link
          href="/carlos/agente"
          className="panel group relative flex items-stretch gap-4 overflow-hidden border-tropico-purple/40 p-4 transition hover:border-tropico-purple/70 md:p-5"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-tropico-purple/25 via-tropico-coral/15 to-tropico-sun/10 opacity-70 transition group-hover:opacity-100" />
          <div className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-tropico-ink/70 text-tropico-sun ring-1 ring-tropico-sun/30 md:size-14">
            <Sparkles className="size-6 md:size-7" strokeWidth={2} />
          </div>
          <div className="relative flex min-w-0 flex-1 flex-col justify-center gap-1">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg font-bold leading-tight md:text-xl">
                Carlos AI — Agente autónomo
              </h3>
              <span className="rounded-md bg-tropico-sun/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-tropico-sun">
                Único
              </span>
            </div>
            <p className="text-xs leading-snug text-tropico-text/85 md:text-sm">
              IA dentro de tu wallet — ejecuta swaps, DCA y cashback automático.
              Tú diriges, Carlos actúa.
            </p>
          </div>
          <div className="relative hidden items-center self-center text-tropico-sun/80 transition group-hover:translate-x-1 group-hover:text-tropico-sun md:flex">
            <span className="text-sm font-semibold">Abrir →</span>
          </div>
        </Link>
      </section>

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
                Tienes {formatUSD(MOCK_CASHBACK_PENDIENTE.total)} de cashback
                acumulado
              </div>
              <div className="text-xs text-tropico-mute">
                De {MOCK_CASHBACK_PENDIENTE.comerciosCount} comercios afiliados
                — tap para reclamar
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
              Próximo DCA: {formatUSD(MOCK_NEXT_DCA.monto)} →{" "}
              {MOCK_NEXT_DCA.tokenDestino}
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
