import Link from "next/link";
import { DualPrice } from "@/components/DualPrice";
import { MOCK_PORTFOLIO } from "@/lib/mock-data";
import { formatUSD } from "@/lib/formato";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Guardar — Tropico",
};

const ESTRATEGIAS = [
  {
    nombre: "mSOL Liquid Staking",
    descripcion:
      "Tu USDC se convierte automático en mSOL (Marinade). Ganas ~7% al año estimado. Sin lock — puedes salir cuando quieras.",
    apy: 7.0,
    riesgo: "Bajo",
    riesgoColor: "text-tropico-sea",
    gradient: "from-tropico-sea/30 to-tropico-green/10",
    icon: "🌊",
  },
  {
    nombre: "Kamino USDC Vault",
    descripcion:
      "Prestas tu USDC en el vault de Kamino. Yield ~5% al año, más estable que mSOL. Cero exposición a SOL.",
    apy: 5.2,
    riesgo: "Bajo",
    riesgoColor: "text-tropico-sea",
    gradient: "from-tropico-purple/30 to-tropico-sea/10",
    icon: "🏦",
  },
  {
    nombre: "Kamino mSOL/USDC LP",
    descripcion:
      "LP avanzado: pones mSOL + USDC y ganas fees de quien hace swaps. Mayor APY pero hay impermanent loss.",
    apy: 12.4,
    riesgo: "Medio",
    riesgoColor: "text-tropico-sun",
    gradient: "from-tropico-coral/30 to-tropico-sun/10",
    icon: "⚡",
  },
];

export default function GuardarPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-5 py-10">
      <header className="flex flex-col gap-2 pt-4">
        <Link
          href="/home"
          className="w-fit text-sm text-tropico-mute transition hover:text-tropico-sun"
        >
          &larr; Volver
        </Link>
        <h1 className="font-display text-3xl font-bold">Guardar</h1>
        <p className="text-sm text-tropico-mute">
          Tu plata trabajando mientras duermes. Yield automático,
          non-custodial, sin penalizaciones.
        </p>
      </header>

      {/* Saldo + yield acumulado */}
      <section className="panel flex flex-col gap-4 p-6">
        <header className="flex items-baseline justify-between">
          <span className="text-sm text-tropico-mute">Tu plata trabajando</span>
          <span className="rounded-md bg-tropico-green/10 px-2 py-0.5 text-xs font-semibold text-tropico-green">
            ✨ Yield ON por default
          </span>
        </header>
        <DualPrice usd={MOCK_PORTFOLIO.total * 0.7} size="xl" />
        <p className="text-xs text-tropico-mute">
          70% de tu saldo USDC está generando rendimiento
        </p>
        <div className="mt-2 grid grid-cols-3 gap-1 border-t border-tropico-border pt-4 sm:gap-2 md:gap-3">
          <div>
            <div className="text-xs text-tropico-mute">Esta semana</div>
            <div className="font-display text-lg font-bold text-tropico-green">
              +{formatUSD(MOCK_PORTFOLIO.yieldGanadoSemana)}
            </div>
          </div>
          <div>
            <div className="text-xs text-tropico-mute">Este mes</div>
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

      {/* Banner mock */}
      <div className="panel flex items-center gap-3 border-tropico-coral/30 bg-tropico-coral/5 p-4 text-sm">
        <span className="text-xl" aria-hidden>⚠️</span>
        <span className="text-tropico-mute">
          Demo del hackathon &mdash; números simulados. En producción
          tu USDC se convierte automático vía Jupiter route a la estrategia que
          elijas. Q3 2026.
        </span>
      </div>

      {/* Estrategias */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-bold">Estrategias disponibles</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {ESTRATEGIAS.map((e) => (
            <article
              key={e.nombre}
              className="panel relative flex flex-col gap-3 overflow-hidden p-5"
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${e.gradient} opacity-50`}
              />
              <div className="relative flex flex-col gap-3">
                <header className="flex items-start justify-between">
                  <span className="text-3xl" aria-hidden>{e.icon}</span>
                  <span
                    className={`rounded-md bg-tropico-ink/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${e.riesgoColor}`}
                  >
                    Riesgo {e.riesgo}
                  </span>
                </header>
                <h3 className="font-display text-lg font-bold">{e.nombre}</h3>
                <div>
                  <div className="text-xs text-tropico-mute">APY estimado</div>
                  <div className="font-display text-3xl font-bold text-tropico-green">
                    {e.apy.toFixed(1)}%
                  </div>
                </div>
                <p
                  className="text-xs leading-relaxed text-tropico-mute"
                  dangerouslySetInnerHTML={{ __html: e.descripcion }}
                />
                <button className="mt-auto rounded-lg border border-tropico-border bg-tropico-ink/40 py-2 text-sm font-semibold transition hover:border-tropico-purple hover:text-tropico-purple">
                  Activar (DEMO)
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="panel flex flex-col gap-2 p-5 text-xs text-tropico-mute">
        <p>
          <strong>Importante:</strong> los APY son estimados y no están garantizados.
          El precio de los tokens subyacentes puede subir o bajar. Tropico no es asesor
          financiero.
        </p>
        <p>
          <strong>Non-custodial:</strong> tu plata sigue siendo tuya. Las estrategias
          interactúan con protocolos abiertos (Marinade, Kamino) directo desde tu wallet.
        </p>
      </section>
    </main>
  );
}
