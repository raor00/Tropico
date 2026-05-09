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
} from "lucide-react";
import { DualPrice } from "@/components/DualPrice";
import { ModuleCard } from "@/components/ModuleCard";
import { BalanceList } from "@/components/BalanceList";
import { Logo } from "@/components/Logo";
import { Header } from "@/components/Header";
import {
  MOCK_BALANCES,
  MOCK_PORTFOLIO,
  MOCK_CASHBACK_PENDIENTE,
  MOCK_NEXT_DCA,
} from "@/lib/mock-data";
import { formatUSD, formatRelativeTime, shortAddress } from "@/lib/formato";

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
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-8 px-5 py-10">
      {/* Header flotante con scroll detection */}
      <Header />

      {/* Sub-header con balance summary + acciones rápidas */}
      <section className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-tropico-sea/30 bg-tropico-sea/5 px-3 py-1 text-xs text-tropico-sea">
          <span className="size-1.5 rounded-full bg-tropico-sea animate-pulse-warm" />
          {shortAddress(MOCK_PORTFOLIO.walletAddress, 6)}
        </span>
        <Link
          href="/depositar"
          className="inline-flex w-fit items-center gap-1 rounded-full border border-tropico-sun/40 bg-tropico-sun/10 px-3 py-1 text-xs font-semibold text-tropico-sun transition hover:bg-tropico-sun/20"
        >
          <Plus className="size-3" strokeWidth={2.5} aria-hidden="true" />
          Depositar bs
        </Link>
      </section>

      {/* Banner mock */}
      <div className="panel flex items-center gap-3 border-tropico-sun/30 bg-tropico-sun/5 p-3 text-xs">
        <span className="text-base" aria-hidden>👋</span>
        <span className="text-tropico-mute">
          Demo del hackathon &mdash; los balances son simulados. En cuanto config&uacute;remos
          tu wallet con Privy, ver&aacute;s tus balances reales en mainnet.
        </span>
      </div>

      {/* Saldo total — la firma del producto */}
      <section className="panel flex flex-col gap-3 p-6">
        <header className="flex items-baseline justify-between">
          <span className="text-sm text-tropico-mute">Saldo total</span>
          <span className="text-xs text-tropico-mute">
            &Uacute;ltima actividad {formatRelativeTime(MOCK_PORTFOLIO.ultimaActividad)}
          </span>
        </header>
        <DualPrice usd={MOCK_PORTFOLIO.total} size="xl" />

        <div className="mt-2 grid grid-cols-3 gap-2 border-t border-tropico-border pt-4 md:gap-3">
          <div>
            <div className="text-xs text-tropico-mute">Yield esta semana</div>
            <div className="font-display text-lg font-bold text-tropico-green">
              +{formatUSD(MOCK_PORTFOLIO.yieldGanadoSemana)}
            </div>
          </div>
          <div>
            <div className="text-xs text-tropico-mute">Yield este mes</div>
            <div className="font-display text-lg font-bold text-tropico-green">
              +{formatUSD(MOCK_PORTFOLIO.yieldGanadoMes)}
            </div>
          </div>
          <div>
            <div className="text-xs text-tropico-mute">APY actual</div>
            <div className="font-display text-lg font-bold">
              {MOCK_PORTFOLIO.apyActual}%
            </div>
          </div>
        </div>
      </section>

      {/* Notificaciones de Carlos (showcase del Modo Agente) */}
      <section className="flex flex-col gap-2">
        {MOCK_CASHBACK_PENDIENTE.total > 0 && (
          <div className="panel flex flex-wrap items-center justify-between gap-3 border-tropico-sun/30 bg-tropico-sun/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-tropico-sun/20 text-tropico-sun">
                <Gift className="size-5" strokeWidth={1.75} aria-hidden="true" />
              </div>
              <div>
                <div className="font-semibold">
                  Tens {formatUSD(MOCK_CASHBACK_PENDIENTE.total)} de cashback acumulado
                </div>
                <div className="text-xs text-tropico-mute">
                  De {MOCK_CASHBACK_PENDIENTE.comerciosCount} comercios afiliados
                </div>
              </div>
            </div>
            <Link
              href="/carlos/agente"
              className="rounded-lg bg-tropico-sun/20 px-3 py-1.5 text-sm font-semibold text-tropico-sun"
            >
              Reclamar
            </Link>
          </div>
        )}

        <div className="panel flex flex-wrap items-center justify-between gap-3 border-tropico-coral/30 bg-tropico-coral/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-tropico-coral/20 text-tropico-coral">
              <CalendarClock className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <div>
              <div className="font-semibold">
                Pr&oacute;ximo DCA: {formatUSD(MOCK_NEXT_DCA.monto)} &rarr; {MOCK_NEXT_DCA.tokenDestino}
              </div>
              <div className="text-xs text-tropico-mute">
                Lunes 10:00 &mdash; Carlos lo ejecuta autom&aacute;tico
              </div>
            </div>
          </div>
          <Link
            href="/carlos/agente"
            className="rounded-lg bg-tropico-coral/20 px-3 py-1.5 text-sm font-semibold text-tropico-coral"
          >
            Ver reglas
          </Link>
        </div>
      </section>

      {/* Grid de m&oacute;dulos */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold">Acciones</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <ModuleCard key={m.href} {...m} />
          ))}
        </div>
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
