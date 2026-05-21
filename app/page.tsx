import { AuthCTA } from "@/components/AuthCTA";
import { AuthRedirect } from "@/components/AuthRedirect";
import { Badge } from "@/components/Badge";
import { Logo } from "@/components/Logo";
import { ScrollReveal } from "@/components/ScrollReveal";
import { VenezuelaBadge } from "@/components/VenezuelaBadge";
import {
  AlertTriangle,
  ArrowLeftRight,
  Bot,
  Building2,
  CheckCircle2,
  Compass,
  ExternalLink,
  Globe,
  KeyRound,
  MessageCircle,
  QrCode,
  Scale,
  Send,
  ShieldCheck,
  Sparkles,
  Sprout,
  Store,
  TrendingUp,
  Users,
  Wallet,
  WifiOff,
  Zap,
} from "lucide-react";
import Link from "next/link";

const VALUE_CARDS = [
  {
    title: "Conoce",
    body: "Más allá del USDT. Aprende qué es JTO, JUP, mSOL — sin jerga técnica, en venezolano natural.",
    accent: "from-tropico-sun/30 to-transparent",
    badge: "Educa",
    Icon: Compass,
  },
  {
    title: "Cambia",
    body: "Intercambia entre tokens al mejor precio del mercado. Comisión transparente del 0.5% — punto.",
    accent: "from-tropico-coral/30 to-transparent",
    badge: "Swap",
    Icon: ArrowLeftRight,
  },
  {
    title: "Crece",
    body: "Guacama, tu copiloto financiero, te acompaña. ¿Qué comprar? ¿Cómo funciona el staking? Te explica.",
    accent: "from-tropico-sea/30 to-transparent",
    badge: "Guacama AI",
    Icon: Sparkles,
  },
];

const PROBLEM_STATS = [
  {
    big: "95%",
    label: "del volumen cripto VE",
    detail: "atrapado en USDT/Tron por Binance P2P",
  },
  {
    big: "4.5%",
    label: "fee POS tradicional",
    detail: "+ 24-72h para que el merchant vea la plata",
  },
  {
    big: "0%",
    label: "yield real en bs",
    detail: "tus ahorros pierden poder cada día",
  },
  {
    big: "1",
    label: "token (USDT) conoce el venezolano",
    detail: "de los miles que existen en Solana",
  },
];

const MODULES = [
  {
    Icon: Wallet,
    name: "Inicio",
    href: "/home",
    desc: "Tu saldo + yield + acciones rápidas",
  },
  {
    Icon: ArrowLeftRight,
    name: "Cambiar",
    href: "/cambiar",
    desc: "Swap real vía Jupiter",
  },
  { Icon: QrCode, name: "Cobrar", href: "/cobrar", desc: "QR Solana Pay" },
  {
    Icon: Send,
    name: "Enviar",
    href: "/enviar",
    desc: "Claim links por WhatsApp",
  },
  {
    Icon: Sprout,
    name: "Guardar",
    href: "/guardar",
    desc: "Yield mSOL + Kamino",
  },
  {
    Icon: Building2,
    name: "Inmuebles",
    href: "/inmuebles",
    desc: "Compra acciones de inmuebles tokenizados desde $2 · by Crixto",
  },
  {
    Icon: Zap,
    name: "Pago Móvil VE",
    href: "/pagar-servicios",
    desc: "QR Suiche7B → USDC a Bs al instante",
  },
  {
    Icon: Globe,
    name: "Remesas",
    href: "/remesas",
    desc: "Recibe del exterior en 1 segundo",
  },
  {
    Icon: WifiOff,
    name: "Offline",
    href: "/offline",
    desc: "Firma txs sin conexión con durable nonces",
  },
  {
    Icon: MessageCircle,
    name: "WhatsApp Bot",
    href: "/guacama/whatsapp",
    desc: "Controla tu wallet desde WhatsApp",
  },
  {
    Icon: Sparkles,
    name: "Guacama AI",
    href: "/guacama",
    desc: "Copiloto IA en venezolano",
  },
];

const AGENT_ACTIONS = [
  { name: "DCA semanal", desc: "Compra $X de un token cada [día] automático" },
  {
    name: "Auto-yield al recibir remesa",
    desc: "Si llega +$50, mueve excedente a Save",
  },
  {
    name: "Auto-cashback claim",
    desc: "Reclama tu cashback de comercios cada semana",
  },
  {
    name: "Re-balance de portafolio",
    desc: "Si JTO sube +20%, vende 10% a USDC",
  },
];

const REVENUE_STREAMS = [
  { name: "Swap", rate: "0.5%", color: "text-tropico-coral" },
  { name: "Send", rate: "0.3%", color: "text-tropico-sun" },
  { name: "Save (yield)", rate: "2%", color: "text-tropico-sea" },
  { name: "Merchant fee", rate: "1%", color: "text-tropico-coral" },
  { name: "Guacama AI", rate: "—", color: "text-tropico-sun" },
];

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-10 px-5 py-10 md:gap-20 md:py-16">
      {/* Si user ya tiene wallet activa, mandar directo a /home */}
      <AuthRedirect to="/home" />
      {/* HEADER flotante — anclado en top, flota al hacer scroll */}

      {/* HERO */}
      <section className="flex flex-col items-center gap-6 animate-fade-up pt-4 text-center">
        <div className="flex flex-col items-center space-y-4">
          <VenezuelaBadge />

          <h1 className="h-display max-w-4xl">
            La red económica del{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #EF476F 0%, #FFD166 50%, #06D6A0 100%)",
              }}
            >
              venezolano
            </span>
            ,<br /> en Solana.
          </h1>
          <p className="max-w-2xl text-lg text-tropico-mute">
            Ahorra ganando intereses. Paga sin perder valor. Una red de pagos
            non-custodial donde tu plata vive en USDC, genera rendimiento
            automático, y los comercios pagan{" "}
            <strong className="text-tropico-text">
              60% menos en fees vs POS tradicional
            </strong>
            .
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <AuthCTA variant="primary" label="Crear mi wallet con email" />
          <Link href="/comercios" className="btn-ghost">
            Soy comercio, quiero afiliarme
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-xs text-tropico-mute">
          <span className="flex items-center gap-1.5">
            <ShieldCheck
              className="size-4 text-tropico-sea"
              strokeWidth={1.75}
            />
            Non-custodial
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="size-4 text-tropico-sun" strokeWidth={1.75} />
            Settlement &lt;1s
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp
              className="size-4 text-tropico-coral"
              strokeWidth={1.75}
            />
            Yield ~5% APY default
          </span>
        </div>
      </section>

      {/* PARA TODOS — onboarding accesible + dueño real de tu wallet */}
      <ScrollReveal
        id="producto"
        direction="up"
        as="section"
        className="flex flex-col gap-8 scroll-mt-24"
      >
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-tropico-sea">
            <Users className="size-3.5" /> Para cualquier venezolano
          </span>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            No es para experimentados.
            <br />
            <span className="text-tropico-mute">Es para todos.</span>
          </h2>
          <p className="max-w-3xl text-tropico-mute">
            Si tienes un email, ya puedes tener tu wallet. Sin frase semilla de
            12 palabras que no entiendes. Sin «modo desarrollador». Sin tener
            que aprender qué es una blockchain. Tu tía puede usarla. Tu primo
            del taller también. El que recibe remesas en bolívares y nunca ha
            tocado cripto, también.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Card 1 — la wallet es tuya */}
          <article className="panel flex flex-col gap-3 p-6 transition hover:border-tropico-sun/40">
            <KeyRound className="size-6 text-tropico-sun" strokeWidth={1.75} />
            <h3 className="font-display text-xl font-bold">
              Tu wallet, tu plata. Punto.
            </h3>
            <p className="text-sm text-tropico-mute">
              En Tropico tu wallet es{" "}
              <strong className="text-tropico-text">100% tuya</strong>. Tropico
              nunca toca tus fondos, no puede congelar tu cuenta, no puede
              bloquear un retiro. Si Tropico desaparece mañana, tu plata sigue
              ahí — accesible con tu backup, desde cualquier wallet de Solana
              del mundo.
            </p>
            <ul className="mt-1 flex flex-col gap-1.5 text-xs text-tropico-mute">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-tropico-sea" />
                <span>Tu pubkey es pública, verificable en Solscan</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-tropico-sea" />
                <span>Exportála a Phantom o Solflare cuando quieras</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-tropico-sea" />
                <span>
                  Llaves MPC (3 partes) — Tropico jamás tiene la llave completa
                </span>
              </li>
            </ul>
          </article>

          {/* Card 2 — sutilmente: cuidado con los "casi" non-custodial */}
          <article className="panel flex flex-col gap-3 border-tropico-coral/30 bg-tropico-coral/5 p-6">
            <AlertTriangle
              className="size-6 text-tropico-coral"
              strokeWidth={1.75}
            />
            <h3 className="font-display text-xl font-bold">
              Cuidado con los «casi» non-custodial
            </h3>
            <p className="text-sm text-tropico-mute">
              Hay apps que dicen ser non-custodial pero en realidad guardan tus
              llaves en su servidor. Si te dicen «es tu wallet» pero nunca te
              muestran cómo exportarla a otra app — no es tuya. Es la de ellos,
              prestada.
            </p>
            <p className="text-xs italic text-tropico-mute">
              Regla simple: si no puedes mover tu plata a otra wallet sin
              permiso del proveedor, no eres dueño. Eres usuario.
            </p>
          </article>
        </div>
      </ScrollReveal>

      {/* COMPARATIVA — wallets venezolanas/LATAM similares vs Tropico */}
      <ScrollReveal direction="up" as="section" className="flex flex-col gap-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-tropico-coral">
            <Scale className="size-3.5" /> Comparativa honesta
          </span>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Conoces estas wallets.{" "}
            <span className="text-tropico-mute">
              Esto es en lo que nos parecemos —
            </span>
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #06D6A0 0%, #FFD166 50%, #EF476F 100%)",
              }}
            >
              esto es en lo que somos distintos.
            </span>
          </h2>
          <p className="max-w-3xl text-tropico-mute">
            No vinimos a hablar mal de nadie — todas estas opciones existen
            porque el venezolano necesita soluciones. Pero hay una diferencia
            técnica concreta:{" "}
            <strong className="text-tropico-text">
              Tropico es la única non-custodial real con red multi-feature en
              Solana
            </strong>
            . Mira:
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-widest text-tropico-mute">
                <th className="px-3 py-2">Wallet / App</th>
                <th className="px-3 py-2">En qué nos parecemos</th>
                <th className="px-3 py-2 text-tropico-sun">
                  Diferencial Tropico
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  name: "Kontigo",
                  similar: "USDC + cuenta USD + UX en español para LATAM/VE.",
                  diff: "Custodia tus llaves. Tropico es non-custodial real (MPC 3-share, exportable a Phantom). Tropico además tiene swap, yield, comercios, AI, remesas — Kontigo es solo cuenta USD.",
                },
                {
                  name: "Crixto",
                  similar: "Wallet con foco venezolano, soporta criptos.",
                  diff: "Tropico corre sobre Solana mainnet (no chain propio), comercios afiliados con QR, Guacama AI by Lumen, Tropico Pay como gateway B2B. Multi-feature integrado, no app independiente.",
                },
                {
                  name: "p2p.me",
                  similar: "Intercambio P2P de USDC contra fiat local.",
                  diff: "p2p.me es solo trading P2P. Tropico es la wallet completa: yield default, pagos QR, remesas internacionales, servicios públicos, chat AI. P2P es 1 de 7 features.",
                },
                {
                  name: "Reserve App",
                  similar: "Non-custodial, popular en VE, USDC-based.",
                  diff: "Reserve es solo wallet + ahorro. Tropico suma: comercios afiliados (red bilateral), Tropico Pay para apps externas, Modo Agente con DCA/auto-yield, swap directo a 9 tokens curados.",
                },
                {
                  name: "AirTM",
                  similar: "Cuenta USD digital para venezolanos, P2P.",
                  diff: "AirTM custodia tu plata (puede congelar tu cuenta). Tropico nunca toca tus llaves. AirTM es solo USD; Tropico abre el ecosistema Solana completo (yield ~5% APY, swap, NFTs futuro).",
                },
                {
                  name: "Binance VE",
                  similar: "P2P USDT/USDC contra Bs, alta liquidez.",
                  diff: "Binance custodia + KYC obligatorio + sujeto a sanciones. Tropico non-custodial sin KYC del usuario. Binance solo trading; Tropico tiene comercios, remesas, servicios pagables.",
                },
                {
                  name: "Strike",
                  similar: "Remesas cripto rápidas, popular en LATAM.",
                  diff: "Strike usa Bitcoin Lightning + custodia. Tropico usa Solana USDC stable (sin volatilidad de BTC) + non-custodial. Strike es solo remesas; Tropico es la wallet completa para el receptor.",
                },
              ].map((row) => (
                <tr key={row.name} className="bg-tropico-ink/40">
                  <td className="rounded-l-lg border-l border-y border-tropico-border px-3 py-3 align-top">
                    <strong className="font-display text-tropico-text">
                      {row.name}
                    </strong>
                  </td>
                  <td className="border-y border-tropico-border px-3 py-3 align-top text-xs text-tropico-mute">
                    {row.similar}
                  </td>
                  <td className="rounded-r-lg border-r border-y border-tropico-border bg-tropico-sun/5 px-3 py-3 align-top text-xs text-tropico-text">
                    {row.diff}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel flex flex-col gap-3 border-tropico-sea/30 bg-tropico-sea/5 p-5 md:flex-row md:items-center md:gap-5">
          <Sparkles
            className="size-6 shrink-0 text-tropico-sea"
            strokeWidth={1.75}
          />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-tropico-text">
              No vinimos a competir con custodios. Vinimos a darte tu wallet de
              verdad.
            </p>
            <p className="text-xs text-tropico-mute">
              Si lo que necesitas es solo USDC custodiado o trading P2P, esas
              opciones funcionan. Si lo que quieres es{" "}
              <strong className="text-tropico-sun">
                red económica completa + dueño real de tus llaves + ecosistema
                Solana abierto + AI en venezolano
              </strong>
              , eso solo está en Tropico.
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* REMESAS — puente familiar */}
      <ScrollReveal
        direction="up"
        as="section"
        className="panel relative flex flex-col gap-6 overflow-hidden p-6 md:p-8"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "linear-gradient(135deg, rgba(6,214,160,0.12) 0%, rgba(255,209,102,0.10) 100%)",
          }}
        />
        <div className="relative flex flex-col gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-tropico-sea">
              <Globe className="size-3.5" /> Puente de remesas
            </span>
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Tu familia en el exterior manda dinero{" "}
              <span className="text-tropico-sea">en 1 segundo.</span>
            </h2>
            <p className="max-w-2xl text-tropico-mute">
              Sin colas, sin esperar 3 días, sin pagar 10% de comisión. Desde
              cualquier país del mundo, al wallet de tu familiar en Venezuela —
              instantáneo y non-custodial.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { v: "1s", l: "settlement on-chain", c: "text-tropico-sea" },
              { v: "1-2%", l: "fee total", c: "text-tropico-green" },
              { v: "150+", l: "países de origen", c: "text-tropico-sun" },
            ].map((stat) => (
              <div
                key={stat.l}
                className="panel flex flex-col items-center justify-center gap-1 p-4 text-center"
              >
                <div className={`font-display text-3xl font-bold ${stat.c}`}>
                  {stat.v}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-tropico-mute">
                  {stat.l}
                </div>
              </div>
            ))}
          </div>

          <Link href="/remesas" className="btn-primary w-fit">
            Ver cómo funciona &rarr;
          </Link>
        </div>
      </ScrollReveal>

      {/* EL PROBLEMA — 4 stats grandes */}
      <ScrollReveal
        id="remesas"
        direction="up"
        as="section"
        className="flex flex-col gap-8 scroll-mt-24"
      >
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-tropico-coral">
            El problema
          </span>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            El venezolano cripto vive atrapado.
          </h2>
          <p className="max-w-3xl text-tropico-mute">
            Las apps en español son custodias y solo guardan dólares. Phantom
            asume usuario experto. Los comercios pagan fees brutales en POS
            tradicional. Y nadie te explica nada.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PROBLEM_STATS.map((stat) => (
            <article
              key={stat.label}
              className="panel flex flex-col gap-2 p-5 transition hover:border-tropico-coral/40"
            >
              <span
                className="font-display text-5xl font-bold tracking-tight"
                style={{
                  background:
                    "linear-gradient(135deg, #EF476F 0%, #FFD166 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {stat.big}
              </span>
              <div className="text-sm font-semibold text-tropico-text">
                {stat.label}
              </div>
              <p className="text-xs leading-relaxed text-tropico-mute">
                {stat.detail}
              </p>
            </article>
          ))}
        </div>
      </ScrollReveal>

      {/* VALUE CARDS — Conoce / Cambia / Crece */}
      <ScrollReveal
        id="cambiar"
        direction="up"
        delay={100}
        as="section"
        className="flex flex-col gap-8 scroll-mt-24"
      >
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-tropico-sun">
            La solución
          </span>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Tropico te lleva más allá del USDT.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {VALUE_CARDS.map((card) => {
            const { Icon } = card;
            return (
              <article
                key={card.title}
                className="panel relative flex flex-col gap-3 overflow-hidden p-6 transition hover:border-tropico-sun/30"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.accent} opacity-60`}
                />
                <div className="relative flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-tropico-ink/60 text-tropico-sun ring-1 ring-tropico-sun/20">
                      <Icon className="size-6" strokeWidth={1.75} />
                    </div>
                    <span className="rounded-md bg-tropico-ink/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-tropico-mute">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-bold">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-tropico-mute">
                    {card.body}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </ScrollReveal>

      {/* 6 MÓDULOS — recorrido del producto */}
      <ScrollReveal
        direction="pixel"
        as="section"
        className="flex flex-col gap-8"
      >
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-tropico-sea">
            La app completa
          </span>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Una sola app, 11 módulos que cambian tu economía.
          </h2>
          <p className="max-w-3xl text-tropico-mute">
            Puedes probar TODAS sin instalar nada. Sin Privy configurado, la app
            corre con datos mock honestos &mdash; ideal para que veas el flow
            completo en segundos.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => {
            const { Icon } = m;
            return (
              <Link
                key={m.href}
                href={m.href}
                className="panel group flex items-center gap-4 p-4 transition hover:border-tropico-sun/40"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-tropico-ink/60 text-tropico-sun ring-1 ring-tropico-sun/20 transition group-hover:ring-tropico-sun/50">
                  <Icon className="size-5" strokeWidth={1.75} />
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="font-semibold text-tropico-text">
                    {m.name}
                  </span>
                  <span className="text-xs text-tropico-mute">{m.desc}</span>
                </div>
                <ExternalLink className="size-4 text-tropico-mute group-hover:text-tropico-sun transition" />
              </Link>
            );
          })}
        </div>
      </ScrollReveal>

      {/* PARA COMERCIOS — preview con comparativa POS tradicional */}
      <ScrollReveal
        id="comercios"
        direction="left"
        as="section"
        className="grid gap-6 panel p-5 md:grid-cols-2 md:items-center md:p-8 scroll-mt-24"
      >
        <div className="flex flex-col gap-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-md bg-tropico-coral/15 px-2 py-0.5 text-xs font-semibold uppercase tracking-widest text-tropico-coral">
            <Store className="size-3" strokeWidth={2.5} />
            Para comercios
          </div>
          <h2 className="font-display text-3xl font-bold leading-tight md:text-4xl">
            Cobra en dólares.
            <br />{" "}
            <span className="text-tropico-coral">Sin banco tradicional.</span>
          </h2>
          <p className="text-tropico-mute">
            Bodegas, freelancers, deliveries — pagas{" "}
            <strong className="text-tropico-text">1%</strong> en lugar del{" "}
            <strong className="text-tropico-coral">4.5%</strong> de POS
            tradicional. Settlement en menos de 1 segundo. Sin chargebacks.
          </p>
          <Link href="/comercios" className="btn-primary w-fit">
            Ver Tropico Comercios &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center sm:gap-3">
          {[
            { v: "1%", l: "fee Tropico", c: "text-tropico-green" },
            { v: "4.5%", l: "fee banco tradicional", c: "text-tropico-coral" },
            {
              v: "$35",
              l: "ahorro/mes por $1k vendidos",
              c: "text-tropico-sun",
            },
          ].map((item) => (
            <div
              key={item.l}
              className="panel flex flex-col items-center justify-center gap-1 p-4"
            >
              <div className={`font-display text-3xl font-bold ${item.c}`}>
                {item.v}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-tropico-mute">
                {item.l}
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* GUACAMA AI BY LUMEN — sección dedicada, el diferencial principal */}
      <ScrollReveal
        id="guacama"
        direction="right"
        as="section"
        className="relative flex flex-col gap-8 overflow-hidden scroll-mt-24"
      >
        {/* Background accent */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-30"
          style={{
            background:
              "radial-gradient(60% 60% at 30% 50%, rgba(153,69,255,0.12) 0%, transparent 70%), radial-gradient(50% 50% at 80% 20%, rgba(6,214,160,0.10) 0%, transparent 70%)",
          }}
        />

        <div className="space-y-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-tropico-purple/40 bg-tropico-purple/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-tropico-purple">
            <Sparkles className="size-3" strokeWidth={2.5} />
            Guacama AI <span className="text-tropico-mute">by</span> Lumen
          </div>
          <h2 className="font-display text-3xl font-black leading-tight md:text-5xl">
            Tu copiloto financiero
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #9945FF 0%, #06D6A0 50%, #FFD166 100%)",
              }}
            >
              vive dentro de tu wallet.
            </span>
          </h2>
          <p className="max-w-3xl text-base text-tropico-mute md:text-lg">
            Guacama no es un chatbot. Es un agente con personalidad, conocimiento
            de dominio y herramientas reales — corriendo sobre{" "}
            <a
              href="https://github.com/lumen-agent/lumen"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-tropico-purple underline"
            >
              Lumen
            </a>
            , el framework open-source de agentes en español. Te entiende en
            venezolano, ejecuta acciones on-chain con tu permiso, y aprende lo
            que necesitas hacer con tu plata.
          </p>
        </div>

        {/* 7 capacidades reales — más prominente */}
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-tropico-mute">
            Las 7 capacidades de Guacama (todas funcionan ya)
          </h3>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {[
              { icon: "💼", name: "Saldos", skill: "tropico-balances" },
              { icon: "📈", name: "Precios", skill: "tropico-prices" },
              { icon: "↔️", name: "Swaps", skill: "tropico-swap" },
              { icon: "📱", name: "QR Pago", skill: "tropico-pay" },
              { icon: "🌱", name: "Yield", skill: "tropico-yield" },
              { icon: "🎁", name: "Cashback", skill: "tropico-cashback" },
              { icon: "🤖", name: "Modo Agente", skill: "agent-actions" },
              { icon: "🌐", name: "Remesas (Q3)", skill: "remesas-flow" },
            ].map((c) => (
              <article
                key={c.name}
                className="panel flex flex-col gap-1 p-3 transition hover:border-tropico-purple/40"
              >
                <span className="text-xl" aria-hidden>
                  {c.icon}
                </span>
                <span className="text-sm font-semibold text-tropico-text">
                  {c.name}
                </span>
                <code className="truncate text-[10px] text-tropico-purple">
                  {c.skill}
                </code>
              </article>
            ))}
          </div>
        </div>

        {/* Modo Agente — autonomía */}
        <div className="panel flex flex-col gap-4 border-tropico-sea/30 bg-gradient-to-br from-tropico-sea/5 to-tropico-purple/5 p-5 md:p-6">
          <div className="flex flex-col gap-2">
            <div className="inline-flex w-fit items-center gap-2 rounded-md bg-tropico-sea/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-tropico-sea">
              <Bot className="size-3" strokeWidth={2.5} />
              Modo Agente · autonomía con tu permiso
            </div>
            <h3 className="font-display text-2xl font-bold">
              Tu plata trabajando sola.{" "}
              <span className="text-tropico-sea">Con tus reglas.</span>
            </h3>
            <p className="max-w-3xl text-sm text-tropico-mute">
              Activa Modo Agente y Guacama ejecuta 4 acciones autónomas dentro de
              los límites que TÚ defines. En MVP confirma con un click; Q3 2026
              corre 100% autónomo via Privy delegated session keys. Tú revocas
              cuando quieras. Llaves nunca expuestas.
            </p>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {AGENT_ACTIONS.map((a) => (
              <article
                key={a.name}
                className="flex items-start gap-3 rounded-lg border border-tropico-border bg-tropico-ink/40 p-3 transition hover:border-tropico-sea/40"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-tropico-sea/15 text-tropico-sea ring-1 ring-tropico-sea/30">
                  <Bot className="size-4" strokeWidth={1.75} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-tropico-text">
                    {a.name}
                  </span>
                  <span className="text-xs text-tropico-mute">{a.desc}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Stack agéntico — Lumen protagonista */}
        <div className="panel flex flex-col gap-3 p-5">
          <h3 className="font-display text-xl font-bold">
            ¿Por qué Lumen y no GPT/Claude pelado?
          </h3>
          <ul className="grid gap-2 text-sm text-tropico-mute md:grid-cols-2">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-tropico-purple">→</span>
              <span>
                <strong className="text-tropico-text">Open source MIT</strong> —
                auditable, sin vendor lock-in, puedes correrlo en tu propio
                server.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-tropico-purple">→</span>
              <span>
                <strong className="text-tropico-text">
                  Diseño nativo para LATAM
                </strong>{" "}
                — el framework entiende contexto regional, no solo traduce
                inglés.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-tropico-purple">→</span>
              <span>
                <strong className="text-tropico-text">Tool calling real</strong>{" "}
                — Guacama invoca scripts Python que tocan Solana RPC, Jupiter,
                DolarAPI. No es un wrapper de chat.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-tropico-purple">→</span>
              <span>
                <strong className="text-tropico-text">Kit replicable</strong> —
                el Tropico Web3 Kit (KIT + 7 SKILLS + 8 capabilities) es
                portable a Hermes/OpenClaw con un adapter de ~30 líneas.
              </span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/guacama"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Sparkles className="size-4" /> Hablar con Guacama
          </Link>
          <Link
            href="/guacama/agente"
            className="btn-ghost inline-flex items-center gap-2"
          >
            <Bot className="size-4" /> Ver Modo Agente
          </Link>
          <a
            href="https://github.com/lumen-agent/lumen"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-tropico-purple/40 bg-tropico-purple/10 px-4 py-2 text-sm font-semibold text-tropico-purple transition hover:bg-tropico-purple/20"
          >
            Lumen en GitHub <ExternalLink className="size-3.5" />
          </a>
        </div>
      </ScrollReveal>

      {/* MODELO DE NEGOCIO — 5 streams */}
      <ScrollReveal direction="up" as="section" className="flex flex-col gap-6">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-tropico-sun">
            Modelo de negocio
          </span>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            5 streams de revenue desde el día uno.
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {REVENUE_STREAMS.map((s) => (
            <div
              key={s.name}
              className="panel flex flex-col items-center gap-1 p-4 text-center"
            >
              <span className={`font-display text-3xl font-bold ${s.color}`}>
                {s.rate}
              </span>
              <span className="text-xs uppercase tracking-wider text-tropico-mute">
                {s.name}
              </span>
            </div>
          ))}
        </div>
        <p className="text-sm text-tropico-mute">
          Proyección mes 12: 50.000 usuarios + 2.000 comercios ={" "}
          <strong className="text-tropico-green">$250K MRR</strong> sobre $44M
          de volumen.
        </p>
      </ScrollReveal>

      {/* CTA FINAL */}
      <ScrollReveal
        direction="pixel"
        as="section"
        className="panel relative flex flex-col items-center gap-6 overflow-hidden p-6 text-center md:p-10"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255, 209, 102, 0.18) 0%, transparent 70%)",
          }}
        />
        <div className="relative flex flex-col items-center gap-4">
          <Logo size={56} iconOnly />
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Tu próxima cuenta financiera{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #EF476F 0%, #FFD166 50%, #06D6A0 100%)",
              }}
            >
              ya existe
            </span>
            .
          </h2>
          <p className="max-w-xl text-tropico-mute">
            Sin esperar a que un banco te apruebe. Sin que nadie te congele la
            cuenta. Sin que la inflación te derrita los ahorros. Empieza con tu
            email.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/home" className="btn-primary">
              Abrir Tropico &rarr;
            </Link>
            <Link href="/comercios" className="btn-ghost">
              Soy comercio
            </Link>
          </div>
        </div>
      </ScrollReveal>

      {/* FOOTER extendido */}
      <footer className="flex flex-col gap-6 border-t border-tropico-border pt-8 text-sm text-tropico-mute">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <Logo size={32} wordmarkSize="sm" />
            <div className="mt-2 flex flex-col gap-2">
              <VenezuelaBadge size="sm" />
              <p className="text-xs text-tropico-mute">
                Construido sobre Solana.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-tropico-text">
              Producto
            </span>
            <Link href="/home" className="text-xs hover:text-tropico-sun">
              Inicio (Wallet)
            </Link>
            <Link href="/cambiar" className="text-xs hover:text-tropico-sun">
              Cambiar
            </Link>
            <Link href="/cobrar" className="text-xs hover:text-tropico-sun">
              Cobrar
            </Link>
            <Link href="/enviar" className="text-xs hover:text-tropico-sun">
              Enviar
            </Link>
            <Link href="/guardar" className="text-xs hover:text-tropico-sun">
              Guardar
            </Link>
            <Link href="/depositar" className="text-xs hover:text-tropico-sun">
              Depositar bs
            </Link>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-tropico-text">
              Comercios
            </span>
            <Link href="/comercios" className="text-xs hover:text-tropico-sun">
              Para comercios
            </Link>
            <Link
              href="/comercios#afiliar"
              className="text-xs hover:text-tropico-sun"
            >
              Afiliarme
            </Link>
            <Link
              href="/comercios#como-funciona"
              className="text-xs hover:text-tropico-sun"
            >
              Cómo funciona
            </Link>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-tropico-text">
              IA + Recursos
            </span>
            <Link href="/guacama" className="text-xs hover:text-tropico-sun">
              Guacama AI
            </Link>
            <Link
              href="/guacama/agente"
              className="text-xs hover:text-tropico-sun"
            >
              Modo Agente
            </Link>
            <Link
              href="/guacama/whatsapp"
              className="text-xs hover:text-tropico-sun"
            >
              WhatsApp Bot
            </Link>
            <Link href="/offline" className="text-xs hover:text-tropico-sun">
              Offline (Nonces)
            </Link>
            <Link href="/descubrir" className="text-xs hover:text-tropico-sun">
              Descubrir tokens
            </Link>
            <a
              href="https://github.com/raor00/Tropico"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs hover:text-tropico-sun"
            >
              GitHub
              <ExternalLink className="size-3" strokeWidth={2} />
            </a>
          </div>
        </div>
        <div className="flex flex-col items-start justify-between gap-2 border-t border-tropico-border pt-4 md:flex-row md:items-center">
          <span className="text-xs">
            &copy; 2026 Tropico · dev3pack hackathon · MIT License
          </span>
          <span className="text-xs">
            Tropico nunca toca tus llaves · Verifica cada fee en{" "}
            <a
              href="https://solscan.io"
              target="_blank"
              rel="noreferrer"
              className="text-tropico-sea underline"
            >
              Solscan
            </a>
          </span>
        </div>
      </footer>
    </main>
  );
}
