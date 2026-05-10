import Link from "next/link";
import {
  Globe,
  Clock,
  ShieldCheck,
  CreditCard,
  Building2,
  Wallet,
  Smartphone,
  Zap,
  Sprout,
  Store,
  Banknote,
  Send,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { InAppPreviewBanner } from "@/components/InAppPreviewBanner";
import { VenezuelaBadge } from "@/components/VenezuelaBadge";
import { QuoteCalculator } from "./QuoteCalculator";

export const metadata = {
  title: "Remesas a Venezuela — Tropico",
  description:
    "Manda USDC a Venezuela desde cualquier país. Llega en 1 segundo, fee 1-2%, sin colas ni esperas.",
};

const COMPARATIVA = [
  {
    metodo: "Western Union / Moneygram",
    tiempo: "1-3 días hábiles",
    fee: "6-15%",
    disponibilidad: "Horario comercial, depende de oficina",
    custodia: "Custodia total",
    highlight: false,
  },
  {
    metodo: "Bancos (wire transfer)",
    tiempo: "2-5 días",
    fee: "$25-50 flat + 3-5% spread",
    disponibilidad: "Horario bancario, posibles bloqueos VE",
    custodia: "Custodia total",
    highlight: false,
  },
  {
    metodo: "Zelle (USA → VE)",
    tiempo: "Bloqueado en Venezuela desde 2024",
    fee: "N/A",
    disponibilidad: "N/A",
    custodia: "N/A",
    highlight: false,
  },
  {
    metodo: "Tropico Remesas",
    tiempo: "<1 segundo on-chain",
    fee: "1-2% total",
    disponibilidad: "24/7 desde cualquier país",
    custodia: "Non-custodial — tu familia tiene las llaves",
    highlight: true,
  },
];

const CAMINOS = [
  {
    num: "01",
    titulo: "Tarjeta o transferencia bancaria",
    subtitulo: "150+ países",
    subtituloColor: "text-tropico-sun",
    badge: "tarjeta",
    descripcion:
      "Si tienes tarjeta de débito/crédito o cuenta bancaria en USA, EU o LATAM. Fee ~3.5% on-ramp + 0.5% Tropico.",
    fee: "~4% total",
    tiempo: "Instantáneo con tarjeta · 5-10 min con ACH/SEPA",
    stack: "MoonPay / Transak / Ramp → USDC Solana → wallet de tu familia",
    Icon: CreditCard,
    gradient: "from-tropico-sun/20 to-tropico-coral/10",
    iconColor: "text-tropico-sun",
    ringColor: "ring-tropico-sun/20",
  },
  {
    num: "02",
    titulo: "PayPal, Cash App, Venmo o Apple Pay",
    subtitulo: "Más rápido para USA",
    subtituloColor: "text-tropico-sea",
    badge: "digital",
    descripcion:
      "Si ya tienes plata en una wallet digital fiat. PayPal: PYUSD → swap a USDC vía Jupiter. Stripe Crypto: tarjeta US → USDC directo.",
    fee: "~2-3% total",
    tiempo: "1-3 minutos",
    stack: "PayPal PYUSD → Jupiter swap → USDC · Stripe Crypto → USDC directo",
    Icon: Smartphone,
    gradient: "from-tropico-sea/20 to-tropico-green/10",
    iconColor: "text-tropico-sea",
    ringColor: "ring-tropico-sea/20",
  },
  {
    num: "03",
    titulo: "Crypto-to-crypto",
    subtitulo: "Ideal para holders cripto",
    subtituloColor: "text-tropico-green",
    badge: "crypto",
    descripcion:
      "Si ya tienes USDC u otra cripto en cualquier wallet. Sin on-ramp, sin intermediarios. Solo gas de Solana.",
    fee: "0% — solo gas ~$0.001",
    tiempo: "<1 segundo",
    stack: "Tu wallet → wallet de tu familia (directo on-chain)",
    Icon: Wallet,
    gradient: "from-tropico-green/20 to-tropico-sea/10",
    iconColor: "text-tropico-green",
    ringColor: "ring-tropico-green/20",
  },
];

const RECEPTOR_OPCIONES = [
  {
    Icon: Sprout,
    titulo: "Guardar",
    descripcion: "Yield ~5% APY activado por defecto. Tu plata crece sola.",
    color: "text-tropico-sea",
    bg: "bg-tropico-sea/10",
    ring: "ring-tropico-sea/20",
    href: "/guardar",
  },
  {
    Icon: Store,
    titulo: "Pagar comercios",
    descripcion: "Comercios afiliados aceptan USDC con QR Solana Pay.",
    color: "text-tropico-coral",
    bg: "bg-tropico-coral/10",
    ring: "ring-tropico-coral/20",
    href: "/cobrar",
  },
  {
    Icon: Banknote,
    titulo: "Cambiar a Bs",
    descripcion: "Via Pago Móvil o transferencia bancaria con red P2P.",
    color: "text-tropico-sun",
    bg: "bg-tropico-sun/10",
    ring: "ring-tropico-sun/20",
    href: "/depositar",
  },
  {
    Icon: Zap,
    titulo: "Pagar servicios",
    descripcion: "Luz, agua, internet, teléfono, gas, recargas — con USDC.",
    color: "text-tropico-green",
    bg: "bg-tropico-green/10",
    ring: "ring-tropico-green/20",
    href: "/pagar-servicios",
  },
  {
    Icon: Send,
    titulo: "Mandar a otro pana",
    descripcion: "Claim links por WhatsApp. Quien recibe no necesita wallet.",
    color: "text-tropico-purple",
    bg: "bg-tropico-purple/10",
    ring: "ring-tropico-purple/20",
    href: "/enviar",
  },
];

const PAISES = [
  { flag: "🇺🇸", nombre: "USA" },
  { flag: "🇪🇸", nombre: "España" },
  { flag: "🇮🇹", nombre: "Italia" },
  { flag: "🇦🇷", nombre: "Argentina" },
  { flag: "🇨🇱", nombre: "Chile" },
  { flag: "🇲🇽", nombre: "México" },
  { flag: "🇨🇴", nombre: "Colombia" },
  { flag: "🇵🇪", nombre: "Perú" },
  { flag: "🇪🇨", nombre: "Ecuador" },
  { flag: "🇧🇷", nombre: "Brasil" },
  { flag: "🇨🇦", nombre: "Canadá" },
  { flag: "🇬🇧", nombre: "UK" },
  { flag: "🇵🇹", nombre: "Portugal" },
  { flag: "🇫🇷", nombre: "Francia" },
  { flag: "🇩🇪", nombre: "Alemania" },
];

export default function RemesasPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-10 px-5 py-10 md:gap-20 md:py-16">
      {/* Banner solo si user tiene wallet — preview app + nota demo */}
      <InAppPreviewBanner
        modulo="remesas internacionales"
        appHref="/enviar"
        appLabel="Enviar USDC ahora"
      />

      {/* ═══ HERO ═══════════════════════════════════════════════════════ */}
      <section className="animate-fade-up flex flex-col gap-6 pt-4">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <VenezuelaBadge />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-tropico-sea/30 bg-tropico-sea/10 px-3 py-1 text-xs font-semibold text-tropico-sea">
              <Globe className="size-3" strokeWidth={2.5} />
              Para venezolanos en el exterior
            </span>
          </div>

          <h1 className="h-display max-w-4xl">
            Tu familia en Venezuela,{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #06D6A0 0%, #FFD166 100%)",
              }}
            >
              sin esperar 3 días.
            </span>
          </h1>

          <p className="max-w-2xl text-lg text-tropico-mute">
            Manda USDC desde tu banco en cualquier país del mundo. Llega en{" "}
            <strong className="text-tropico-text">1 segundo</strong>. Tu familia decide qué
            hacer: ahorrar, pagar comercios, retirar a Bs.
          </p>
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { icon: <Clock className="size-3.5" strokeWidth={2} />, label: "1 segundo on-chain", color: "border-tropico-sea/30 bg-tropico-sea/10 text-tropico-sea" },
            { icon: <ShieldCheck className="size-3.5" strokeWidth={2} />, label: "0% chargebacks", color: "border-tropico-green/30 bg-tropico-green/10 text-tropico-green" },
            { icon: <Building2 className="size-3.5" strokeWidth={2} />, label: "1-2% fee total", color: "border-tropico-sun/30 bg-tropico-sun/10 text-tropico-sun" },
          ].map((s) => (
            <span
              key={s.label}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${s.color}`}
            >
              {s.icon}
              {s.label}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="#calculadora" className="btn-primary">
            Empezar a mandar <ArrowRight className="ml-1 inline size-4" strokeWidth={2} />
          </Link>
          <Link href="#flow" className="btn-ghost">
            Cómo funciona
          </Link>
        </div>
      </section>

      {/* ═══ COMPARATIVA ════════════════════════════════════════════════ */}
      <ScrollReveal direction="up" as="section" className="flex flex-col gap-6">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-tropico-coral">
            Por qué Tropico vs lo tradicional
          </span>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            El método importa.{" "}
            <span className="text-tropico-mute">Mucho.</span>
          </h2>
        </div>

        {/* Tabla responsive — horizontal scroll en mobile */}
        <div className="overflow-x-auto rounded-2xl border border-tropico-border">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-tropico-border bg-tropico-panel">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-tropico-mute">
                  Método
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-tropico-mute">
                  Tiempo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-tropico-mute">
                  Fee total
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-tropico-mute">
                  Disponibilidad
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-tropico-mute">
                  Custodia
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARATIVA.map((row, i) => (
                <tr
                  key={row.metodo}
                  className={`border-b border-tropico-border/50 transition ${
                    row.highlight
                      ? "bg-tropico-sea/8 font-semibold"
                      : i % 2 === 0
                      ? "bg-tropico-panel"
                      : "bg-tropico-ink"
                  }`}
                >
                  <td className="px-4 py-3">
                    {row.highlight ? (
                      <span className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-tropico-sea animate-pulse-slow" />
                        <span className="text-tropico-sea">{row.metodo}</span>
                      </span>
                    ) : (
                      <span className="text-tropico-mute">{row.metodo}</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 ${row.highlight ? "text-tropico-sea" : "text-tropico-mute"}`}>
                    {row.tiempo}
                  </td>
                  <td className={`px-4 py-3 ${row.highlight ? "text-tropico-green" : "text-tropico-mute"}`}>
                    {row.fee}
                  </td>
                  <td className={`px-4 py-3 ${row.highlight ? "text-tropico-text" : "text-tropico-mute"}`}>
                    {row.disponibilidad}
                  </td>
                  <td className={`px-4 py-3 ${row.highlight ? "text-tropico-text" : "text-tropico-mute"}`}>
                    {row.custodia}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollReveal>

      {/* ═══ 3 CAMINOS ══════════════════════════════════════════════════ */}
      <ScrollReveal direction="up" as="section" className="flex flex-col gap-6" id="flow">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-tropico-sun">
            3 caminos para mandar
          </span>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Elige cómo pagas tú.{" "}
            <span className="text-tropico-mute">Tu familia siempre recibe USDC.</span>
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {CAMINOS.map((c) => {
            const { Icon } = c;
            return (
              <article
                key={c.num}
                className="panel relative flex flex-col gap-4 overflow-hidden p-6 transition hover:border-tropico-sun/30"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-60`}
                />
                <div className="relative flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex size-12 items-center justify-center rounded-xl bg-tropico-ink/60 ${c.iconColor} ring-1 ${c.ringColor}`}
                    >
                      <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        c.subtituloColor === "text-tropico-sun"
                          ? "border-tropico-sun/30 bg-tropico-sun/10 text-tropico-sun"
                          : c.subtituloColor === "text-tropico-sea"
                          ? "border-tropico-sea/30 bg-tropico-sea/10 text-tropico-sea"
                          : "border-tropico-green/30 bg-tropico-green/10 text-tropico-green"
                      }`}
                    >
                      {c.subtitulo}
                    </span>
                  </div>

                  <div>
                    <span className="font-display text-4xl font-bold text-tropico-border">
                      {c.num}
                    </span>
                    <h3 className="mt-1 font-display text-xl font-bold leading-tight">
                      {c.titulo}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-tropico-mute">
                      {c.descripcion}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-tropico-mute">Fee</span>
                      <span className="font-semibold text-tropico-text">{c.fee}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-tropico-mute">Tiempo</span>
                      <span className="font-semibold text-tropico-text">{c.tiempo}</span>
                    </div>
                  </div>

                  {/* Stack técnico */}
                  <div className="rounded-lg border border-tropico-border bg-tropico-ink/60 px-3 py-2">
                    <p className="text-[10px] font-mono leading-relaxed text-tropico-mute">
                      {c.stack}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </ScrollReveal>

      {/* ═══ QUÉ HACE TU FAMILIA ════════════════════════════════════════ */}
      <ScrollReveal direction="up" as="section" className="flex flex-col gap-6">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-tropico-green">
            Para el receptor en Venezuela
          </span>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Tu familia decide qué hacer{" "}
            <span className="text-tropico-green">cuando llega la plata.</span>
          </h2>
          <p className="max-w-3xl text-tropico-mute">
            No es solo "recibir dólares". Con Tropico, la plata trabaja desde el segundo uno.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {RECEPTOR_OPCIONES.map((op) => {
            const { Icon } = op;
            return (
              <Link
                key={op.titulo}
                href={op.href}
                className="panel group flex flex-col gap-3 p-5 transition hover:border-tropico-sun/30"
              >
                <div
                  className={`flex size-11 items-center justify-center rounded-xl ${op.bg} ${op.color} ring-1 ${op.ring}`}
                >
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold leading-tight">{op.titulo}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-tropico-mute">
                    {op.descripcion}
                  </p>
                </div>
                <span className={`text-xs font-semibold ${op.color} group-hover:underline`}>
                  Ver módulo &rarr;
                </span>
              </Link>
            );
          })}
        </div>
      </ScrollReveal>

      {/* ═══ FLOW END-TO-END ════════════════════════════════════════════ */}
      <ScrollReveal direction="left" as="section" className="flex flex-col gap-6">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-tropico-sea">
            Cómo funciona end-to-end
          </span>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            7 pasos, todo automatizado.
          </h2>
        </div>

        <div className="panel overflow-x-auto p-6">
          <pre className="min-w-max font-mono text-xs leading-loose text-tropico-mute sm:text-sm">
            <code>{`1. Tú abres /remesas → elegís monto + país
2. Tropico genera quote: $100 USD → ~$98 USDC para tu familia
3. Pagás con tarjeta / transferencia / PayPal / crypto
4. On-ramp partner (MoonPay / Transak / Stripe) recibe tu fiat
5. Convierte a USDC en Solana → manda al wallet de tu familia
6. Tu familia recibe notificación en su Tropico (1 segundo)
7. Decide qué hacer con la plata`}</code>
          </pre>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {[
            { step: "Tú mandas", desc: "Desde cualquier país, tarjeta, banco o wallet cripto.", color: "text-tropico-sun" },
            { step: "Tropico enruta", desc: "Partner on-ramp convierte fiat → USDC en Solana.", color: "text-tropico-sea" },
            { step: "Llega al instante", desc: "Wallet non-custodial — solo tu familia controla la plata.", color: "text-tropico-green" },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <CheckCircle2 className={`mt-0.5 size-5 shrink-0 ${item.color}`} strokeWidth={1.75} />
              <div>
                <div className={`font-semibold ${item.color}`}>{item.step}</div>
                <div className="text-sm text-tropico-mute">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* ═══ CALCULADORA ════════════════════════════════════════════════ */}
      <ScrollReveal direction="up" as="section" className="flex flex-col gap-6" id="calculadora">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-tropico-sun">
            Calcula tu remesa
          </span>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            ¿Cuánto recibe tu familia?
          </h2>
          <p className="max-w-2xl text-tropico-mute">
            Elige el monto y el método de pago. Sin sorpresas.
          </p>
        </div>
        <QuoteCalculator />
      </ScrollReveal>

      {/* ═══ PAÍSES ═════════════════════════════════════════════════════ */}
      <ScrollReveal direction="up" as="section" className="flex flex-col gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="size-5 text-tropico-sea" strokeWidth={1.75} />
            <span className="text-xs uppercase tracking-widest text-tropico-sea">
              Países soportados
            </span>
          </div>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Desde 150+ países.{" "}
            <span className="text-tropico-mute">Hacia Venezuela.</span>
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8">
          {PAISES.map((p) => (
            <div
              key={p.nombre}
              className="panel flex flex-col items-center gap-1.5 p-3 text-center transition hover:border-tropico-sea/40"
            >
              <span className="text-2xl" aria-hidden="true">{p.flag}</span>
              <span className="text-xs text-tropico-mute">{p.nombre}</span>
            </div>
          ))}
          <div className="panel flex flex-col items-center justify-center gap-1.5 p-3 text-center">
            <Globe className="size-6 text-tropico-sea" strokeWidth={1.5} />
            <span className="text-xs font-semibold text-tropico-sea">+135 más</span>
          </div>
        </div>
      </ScrollReveal>

      {/* ═══ BANNER DEMO ════════════════════════════════════════════════ */}
      <ScrollReveal direction="up" as="aside">
        <div className="panel flex flex-col gap-3 border-tropico-coral/40 bg-tropico-coral/5 p-5 md:flex-row md:items-start md:gap-5">
          <AlertTriangle
            className="mt-0.5 size-5 shrink-0 text-tropico-coral"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <div className="flex flex-col gap-1.5">
            <p className="font-semibold text-tropico-coral">Demo del hackathon</p>
            <p className="text-sm leading-relaxed text-tropico-mute">
              Las integraciones on-ramp con MoonPay / Transak / Ramp / Stripe se conectan en
              producción Q3 2026. Hoy ves el flujo completo simulado. Tu familia ya puede
              recibir USDC directo si alguien le manda desde otra wallet — eso es{" "}
              <strong className="text-tropico-text">100% real on-chain</strong>.
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* ═══ FOOTER SECCIÓN ═════════════════════════════════════════════ */}
      <footer className="flex flex-col gap-4 border-t border-tropico-border pt-8 text-sm text-tropico-mute">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <a
            href="/docs/REMESAS_INTEGRATION.md"
            className="inline-flex items-center gap-1.5 text-xs hover:text-tropico-sun"
          >
            <ExternalLink className="size-3" strokeWidth={2} />
            Documentación de integración (REMESAS_INTEGRATION.md)
          </a>
          <Link
            href="/integraciones"
            className="inline-flex items-center gap-1.5 text-xs hover:text-tropico-sun"
          >
            <ExternalLink className="size-3" strokeWidth={2} />
            Ver Tropico Pay para integraciones B2B
          </Link>
        </div>
        <p className="text-xs">
          Tropico nunca toca tus llaves · Non-custodial on Solana · Verifica
          cada transacción en{" "}
          <a
            href="https://solscan.io"
            target="_blank"
            rel="noreferrer"
            className="text-tropico-sea underline"
          >
            Solscan
          </a>
        </p>
      </footer>
    </main>
  );
}
