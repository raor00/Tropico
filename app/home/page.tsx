import Link from "next/link";
import {
  ArrowLeftRight,
  Send,
  Sprout,
  QrCode,
  Sparkles,
  Compass,
  Zap,
  Gift,
  CalendarClock,
  Plus,
  Globe,
} from "lucide-react";
import { DualPrice } from "@/components/DualPrice";
import { ModuleCard } from "@/components/ModuleCard";
import { BalanceList } from "@/components/BalanceList";
import { Logo } from "@/components/Logo";
import { Header } from "@/components/Header";
import { WalletSessionBar } from "@/components/WalletSessionBar";
import {
  MOCK_BALANCES,
  MOCK_PORTFOLIO,
  MOCK_CASHBACK_PENDIENTE,
  MOCK_NEXT_DCA,
} from "@/lib/mock-data";
import { formatUSD, formatRelativeTime, shortAddress } from "@/lib/formato";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tu Tropico — Inicio",
};

const MODULES = [
  {
    href: "/cambiar",
    Icon: ArrowLeftRight,
    titulo: "Cambiar",
    descripcion: "Intercambia entre tokens al mejor precio del mercado",
    gradient: "from-tropico-purple/20 to-tropico-sea/10",
    badge: "Swap",
  },
  {
    href: "/enviar",
    Icon: Send,
    titulo: "Enviar",
    descripcion: "Manda USDC a quien quieras, instant&aacute;neo",
    gradient: "from-tropico-sun/30 to-tropico-coral/15",
    badge: "Send",
  },
  {
    href: "/guardar",
    Icon: Sprout,
    titulo: "Guardar",
    descripcion: "Tu plata generando ~5% al a&ntilde;o autom&aacute;tico",
    gradient: "from-tropico-sea/30 to-tropico-green/10",
    badge: "Yield",
  },
  {
    href: "/cobrar",
    Icon: QrCode,
    titulo: "Cobrar",
    descripcion: "QR para recibir cobros en USDC al instante",
    gradient: "from-tropico-coral/30 to-tropico-sun/15",
    badge: "Receive",
  },
  {
    href: "/carlos",
    Icon: Sparkles,
    titulo: "Carlos",
    descripcion: "Tu copiloto IA en venezolano",
    gradient: "from-tropico-coral/20 to-tropico-purple/15",
    badge: "AI",
  },
  {
    href: "/descubrir",
    Icon: Compass,
    titulo: "Descubrir",
    descripcion: "Conoce el ecosistema Solana",
    gradient: "from-tropico-mute/20 to-tropico-border/10",
    badge: "Educa",
  },
  {
    href: "/pagar-servicios",
    Icon: Zap,
    titulo: "Servicios",
    descripcion: "Paga luz, agua, internet y streaming con USDC",
    gradient: "from-tropico-sun/25 to-tropico-sea/10",
    badge: "Pagar",
  },
  {
    href: "/remesas",
    Icon: Globe,
    titulo: "Remesas",
    descripcion: "Recib&eacute; plata del exterior en 1 segundo, sin colas",
    gradient: "from-tropico-sea/30 to-tropico-sun/10",
    badge: "Remesas",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-4 px-5 py-6">
      {/* Header flotante con scroll detection */}
      <Header />

      {/* Wallet session bar + Depositar inline compact */}
      <section className="flex flex-wrap items-center justify-between gap-2">
        <WalletSessionBar />
        <Link
          href="/depositar"
          className="inline-flex items-center gap-1 rounded-full border border-tropico-sun/40 bg-tropico-sun/10 px-3 py-1.5 text-xs font-semibold text-tropico-sun transition hover:bg-tropico-sun/20"
        >
          <Plus className="size-3" strokeWidth={2.5} aria-hidden="true" />
          Depositar Bs
        </Link>
      </section>

      {/* Saldo + yield stats compactos en una sola card */}
      <section className="panel flex flex-col gap-3 p-4 md:p-5">
        <header className="flex items-baseline justify-between">
          <span className="text-xs text-tropico-mute">Saldo total</span>
          <span className="text-[10px] text-tropico-mute">
            {formatRelativeTime(MOCK_PORTFOLIO.ultimaActividad)} · demo mock
          </span>
        </header>
        <DualPrice usd={MOCK_PORTFOLIO.total} size="xl" />

        <div className="grid grid-cols-3 gap-2 border-t border-tropico-border pt-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-tropico-mute">Semana</div>
            <div className="font-display text-base font-bold text-tropico-green">
              +{formatUSD(MOCK_PORTFOLIO.yieldGanadoSemana)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-tropico-mute">Mes</div>
            <div className="font-display text-base font-bold text-tropico-green">
              +{formatUSD(MOCK_PORTFOLIO.yieldGanadoMes)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-tropico-mute">APY</div>
            <div className="font-display text-base font-bold">
              {MOCK_PORTFOLIO.apyActual}%
            </div>
          </div>
        </div>
      </section>

      {/* Notificaciones Carlos — compactas en grid 2 col */}
      <section className="grid gap-2 sm:grid-cols-2">
        {MOCK_CASHBACK_PENDIENTE.total > 0 && (
          <Link
            href="/carlos/agente"
            className="panel flex items-center gap-2 border-tropico-sun/30 bg-tropico-sun/5 p-3 transition hover:border-tropico-sun"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-tropico-sun/20 text-tropico-sun">
              <Gift className="size-4" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold">
                {formatUSD(MOCK_CASHBACK_PENDIENTE.total)} cashback · {MOCK_CASHBACK_PENDIENTE.comerciosCount} comercios
              </div>
              <div className="text-[10px] text-tropico-mute">Tap para reclamar</div>
            </div>
          </Link>
        )}

        <Link
          href="/carlos/agente"
          className="panel flex items-center gap-2 border-tropico-coral/30 bg-tropico-coral/5 p-3 transition hover:border-tropico-coral"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-tropico-coral/20 text-tropico-coral">
            <CalendarClock className="size-4" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold">
              DCA Lun 10:00 · {formatUSD(MOCK_NEXT_DCA.monto)} → {MOCK_NEXT_DCA.tokenDestino}
            </div>
            <div className="text-[10px] text-tropico-mute">Carlos lo ejecuta automático</div>
          </div>
        </Link>
      </section>

      {/* Grid de módulos — 4 cols compact en md+, sin section title (ya hay context) */}
      <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {MODULES.map((m) => (
          <ModuleCard key={m.href} {...m} />
        ))}
      </section>

      {/* Lista de balances */}
      <section className="flex flex-col gap-4">
        <header className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-bold">Tus tokens</h2>
          <Link href="/descubrir" className="text-xs text-tropico-mute hover:text-tropico-text">
            Descubrir m&aacute;s &rarr;
          </Link>
        </header>
        <BalanceList balances={MOCK_BALANCES} />
      </section>

      {/* Banner on-ramp */}
      <Link
        href="/depositar"
        className="panel group flex flex-wrap items-center justify-between gap-3 overflow-hidden p-5 transition hover:border-tropico-coral md:p-6"
      >
        <div className="flex items-center gap-4">
          <span className="text-3xl" aria-hidden>🇻🇪</span>
          <div>
            <h3 className="font-display text-lg font-bold">
              Pronto: deposita bs desde tu banco
            </h3>
            <p className="text-sm text-tropico-mute">
              banco tradicional, Mercantil, BDV, Provincial &mdash; integraci&oacute;n directa Q3
            </p>
          </div>
        </div>
        <span className="text-tropico-mute transition group-hover:text-tropico-coral">
          Configurar &rarr;
        </span>
      </Link>

      {/* Footer */}
      <footer className="mt-auto border-t border-tropico-border pt-6 text-xs text-tropico-mute">
        Tropico nunca toca tus llaves. Verifica cada fee en{" "}
        <a
          href="https://solscan.io"
          target="_blank"
          rel="noreferrer"
          className="text-tropico-green underline"
        >
          Solscan
        </a>
        .
      </footer>
    </main>
  );
}
