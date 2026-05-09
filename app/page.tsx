import Link from "next/link";
import {
  ArrowLeftRight,
  Send,
  Sprout,
  QrCode,
  Sparkles,
  Compass,
  ShieldCheck,
  Zap,
  TrendingUp,
  Wallet,
  Store,
  Bot,
  ExternalLink,
  KeyRound,
  AlertTriangle,
  Users,
  CheckCircle2,
  Globe,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { AuthCTA } from "@/components/AuthCTA";
import { Header } from "@/components/Header";
import { Badge } from "@/components/Badge";
import { ScrollReveal } from "@/components/ScrollReveal";
import { VenezuelaBadge } from "@/components/VenezuelaBadge";

const VALUE_CARDS = [
  {
    title: "Conoce",
    body:
      "M&aacute;s all&aacute; del USDT. Aprende qu&eacute; es JTO, JUP, mSOL — sin jerga gringa, en venezolano.",
    accent: "from-tropico-sun/30 to-transparent",
    badge: "Educa",
    Icon: Compass,
  },
  {
    title: "Cambia",
    body:
      "Intercambia entre tokens al mejor precio del mercado. Comisi&oacute;n transparente del 0.5% — punto.",
    accent: "from-tropico-coral/30 to-transparent",
    badge: "Swap",
    Icon: ArrowLeftRight,
  },
  {
    title: "Crece",
    body:
      "Carlos, tu copiloto financiero, te acompa&ntilde;a. ¿Qu&eacute; comprar? ¿C&oacute;mo funciona el staking? Te explica.",
    accent: "from-tropico-sea/30 to-transparent",
    badge: "Carlos AI",
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
    detail: "tus ahorros pierden poder cada d&iacute;a",
  },
  {
    big: "1",
    label: "token (USDT) conoce el venezolano",
    detail: "de los miles que existen en Solana",
  },
];

const MODULES = [
  { Icon: Wallet, name: "Inicio", href: "/home", desc: "Tu saldo + yield + 6 acciones" },
  { Icon: ArrowLeftRight, name: "Cambiar", href: "/cambiar", desc: "Swap real v&iacute;a Jupiter" },
  { Icon: QrCode, name: "Cobrar", href: "/cobrar", desc: "QR Solana Pay" },
  { Icon: Send, name: "Enviar", href: "/enviar", desc: "Claim links por WhatsApp" },
  { Icon: Sprout, name: "Guardar", href: "/guardar", desc: "Yield mSOL + Kamino" },
  { Icon: Sparkles, name: "Carlos", href: "/carlos", desc: "Copiloto IA en venezolano" },
];

const AGENT_ACTIONS = [
  { name: "DCA semanal", desc: "Compra $X de un token cada [d&iacute;a] autom&aacute;tico" },
  { name: "Auto-yield al recibir remesa", desc: "Si llega +$50, mueve excedente a Save" },
  { name: "Auto-cashback claim", desc: "Reclama tu cashback de comercios cada semana" },
  { name: "Re-balance de portafolio", desc: "Si JTO sube +20%, vende 10% a USDC" },
];

const REVENUE_STREAMS = [
  { name: "Swap", rate: "0.5%", color: "text-tropico-coral" },
  { name: "Send", rate: "0.3%", color: "text-tropico-sun" },
  { name: "Save (yield)", rate: "2%", color: "text-tropico-sea" },
  { name: "Merchant fee", rate: "1%", color: "text-tropico-coral" },
  { name: "Carlos AI", rate: "—", color: "text-tropico-sun" },
];

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-10 px-5 py-10 md:gap-20 md:py-16">
      {/* HEADER flotante — anclado en top, flota al hacer scroll */}
      <Header />

      {/* HERO */}
      <section className="flex flex-col gap-6 animate-fade-up pt-4">
        <div className="space-y-4">
          <VenezuelaBadge />

          <h1 className="h-display max-w-4xl">
            La red econ&oacute;mica del{" "}
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
            Ahorra ganando, paga sin perder. Una red de pagos non-custodial donde
            tu plata vive en USDC, genera rendimiento autom&aacute;tico, y los comercios pagan{" "}
            <strong className="text-tropico-text">60% menos en fees vs POS tradicional</strong>.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <AuthCTA variant="primary" label="Crear mi wallet con email" />
          <Link href="/comercios" className="btn-ghost">
            Soy comercio, quiero afiliarme
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-xs text-tropico-mute">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-tropico-sea" strokeWidth={1.75} />
            Non-custodial
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="size-4 text-tropico-sun" strokeWidth={1.75} />
            Settlement &lt;1s
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="size-4 text-tropico-coral" strokeWidth={1.75} />
            Yield ~5% APY default
          </span>
        </div>
      </section>

      {/* PARA TODOS — onboarding accesible + dueño real de tu wallet */}
      <ScrollReveal direction="up" as="section" className="flex flex-col gap-8">
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
            Si tienes un email, ya puedes tener tu wallet. Sin frase semilla de 12 palabras
            que no entiendes. Sin &laquo;modo desarrollador&raquo;. Sin tener que aprender qu&eacute; es
            una blockchain. Tu t&iacute;a puede usarla. Tu primo del taller tambi&eacute;n. El que
            recibe remesas en bol&iacute;vares y nunca ha tocado cripto, tambi&eacute;n.
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
              <strong className="text-tropico-text">100% tuya</strong>. Tropico nunca toca
              tus fondos, no puede congelar tu cuenta, no puede bloquear un retiro. Si
              Tropico desaparece mañana, tu plata sigue ahí — accesible con tu backup,
              desde cualquier wallet de Solana del mundo.
            </p>
            <ul className="mt-1 flex flex-col gap-1.5 text-xs text-tropico-mute">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-tropico-sea" />
                <span>Tu pubkey es p&uacute;blica, verificable en Solscan</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-tropico-sea" />
                <span>Export&aacute;la a Phantom o Solflare cuando quieras</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-tropico-sea" />
                <span>Llaves MPC (3 partes) — Tropico jam&aacute;s tiene la llave completa</span>
              </li>
            </ul>
          </article>

          {/* Card 2 — sutilmente: cuidado con los "casi" non-custodial */}
          <article className="panel flex flex-col gap-3 border-tropico-coral/30 bg-tropico-coral/5 p-6">
            <AlertTriangle className="size-6 text-tropico-coral" strokeWidth={1.75} />
            <h3 className="font-display text-xl font-bold">
              Cuidado con los &laquo;casi&raquo; non-custodial
            </h3>
            <p className="text-sm text-tropico-mute">
              Hay apps que dicen ser non-custodial pero en realidad guardan tus llaves en
              su servidor. Si te dicen &laquo;es tu wallet&raquo; pero nunca te muestran c&oacute;mo
              exportarla a otra app — no es tuya. Es la de ellos, prestada.
            </p>
            <p className="text-xs italic text-tropico-mute">
              Regla simple: si no puedes mover tu plata a otra wallet sin permiso del
              proveedor, no eres dueño. Eres usuario.
            </p>
          </article>
        </div>
      </ScrollReveal>

      {/* REMESAS — puente familiar */}
      <ScrollReveal direction="up" as="section" className="panel relative flex flex-col gap-6 overflow-hidden p-6 md:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background: "linear-gradient(135deg, rgba(6,214,160,0.12) 0%, rgba(255,209,102,0.10) 100%)",
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
              Sin colas, sin esperar 3 d&iacute;as, sin pagar 10% de comisi&oacute;n. Desde cualquier pa&iacute;s del
              mundo, al wallet de tu familiar en Venezuela — instant&aacute;neo y non-custodial.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { v: "1s", l: "settlement on-chain", c: "text-tropico-sea" },
              { v: "1-2%", l: "fee total", c: "text-tropico-green" },
              { v: "150+", l: "países de origen", c: "text-tropico-sun" },
            ].map((stat) => (
              <div key={stat.l} className="panel flex flex-col items-center justify-center gap-1 p-4 text-center">
                <div className={`font-display text-3xl font-bold ${stat.c}`}>{stat.v}</div>
                <div className="text-[10px] uppercase tracking-wider text-tropico-mute">{stat.l}</div>
              </div>
            ))}
          </div>

          <Link href="/remesas" className="btn-primary w-fit">
            Ver c&oacute;mo funciona &rarr;
          </Link>
        </div>
      </ScrollReveal>

      {/* EL PROBLEMA — 4 stats grandes */}
      <ScrollReveal direction="up" as="section" className="flex flex-col gap-8">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-tropico-coral">
            El problema
          </span>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            El venezolano cripto vive atrapado.
          </h2>
          <p className="max-w-3xl text-tropico-mute">
            Las apps en espa&ntilde;ol son custodias y solo guardan d&oacute;lares. Phantom asume usuario experto.
            Los comercios pagan fees brutales en POS tradicional. Y nadie te explica nada.
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
              <p
                className="text-xs leading-relaxed text-tropico-mute"
                dangerouslySetInnerHTML={{ __html: stat.detail }}
              />
            </article>
          ))}
        </div>
      </ScrollReveal>

      {/* VALUE CARDS — Conoce / Cambia / Crece */}
      <ScrollReveal direction="up" delay={100} as="section" className="flex flex-col gap-8">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-tropico-sun">
            La soluci&oacute;n
          </span>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Tropico te lleva m&aacute;s all&aacute; del USDT.
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
                  <h3 className="font-display text-2xl font-bold">{card.title}</h3>
                  <p
                    className="text-sm leading-relaxed text-tropico-mute"
                    dangerouslySetInnerHTML={{ __html: card.body }}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </ScrollReveal>

      {/* 6 MÓDULOS — recorrido del producto */}
      <ScrollReveal direction="pixel" as="section" className="flex flex-col gap-8">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-tropico-sea">
            La app completa
          </span>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Una sola app, 6 acciones que cambian tu economía.
          </h2>
          <p className="max-w-3xl text-tropico-mute">
            Puedes probar TODAS sin instalar nada. Sin Privy configurado, la app corre con
            datos mock honestos &mdash; ideal para que veas el flow completo en segundos.
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
                  <span className="font-semibold text-tropico-text">{m.name}</span>
                  <span className="text-xs text-tropico-mute">{m.desc}</span>
                </div>
                <ExternalLink className="size-4 text-tropico-mute group-hover:text-tropico-sun transition" />
              </Link>
            );
          })}
        </div>
      </ScrollReveal>

      {/* PARA COMERCIOS — preview con comparativa POS tradicional */}
      <ScrollReveal direction="left" as="section" className="grid gap-6 panel p-5 md:grid-cols-2 md:items-center md:p-8">
        <div className="flex flex-col gap-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-md bg-tropico-coral/15 px-2 py-0.5 text-xs font-semibold uppercase tracking-widest text-tropico-coral">
            <Store className="size-3" strokeWidth={2.5} />
            Para comercios
          </div>
          <h2 className="font-display text-3xl font-bold leading-tight md:text-4xl">
            Cobra en d&oacute;lares.
            <br /> <span className="text-tropico-coral">Sin banco tradicional.</span>
          </h2>
          <p className="text-tropico-mute">
            Bodegas, freelancers, deliveries — pagas <strong className="text-tropico-text">1%</strong>{" "}
            en lugar del <strong className="text-tropico-coral">4.5%</strong> de POS tradicional.
            Settlement en menos de 1 segundo. Sin chargebacks.
          </p>
          <Link href="/comercios" className="btn-primary w-fit">
            Ver Tropico Comercios &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center sm:gap-3">
          {[
            { v: "1%", l: "fee Tropico", c: "text-tropico-green" },
            { v: "4.5%", l: "fee banco tradicional", c: "text-tropico-coral" },
            { v: "$35", l: "ahorro/mes por $1k vendidos", c: "text-tropico-sun" },
          ].map((item) => (
            <div
              key={item.l}
              className="panel flex flex-col items-center justify-center gap-1 p-4"
            >
              <div className={`font-display text-3xl font-bold ${item.c}`}>{item.v}</div>
              <div className="text-[10px] uppercase tracking-wider text-tropico-mute">
                {item.l}
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* CARLOS MODO AGENTE */}
      <ScrollReveal direction="right" as="section" className="flex flex-col gap-8">
        <div className="space-y-2">
          <div className="inline-flex w-fit items-center gap-2 rounded-md bg-tropico-sea/15 px-2 py-0.5 text-xs font-semibold uppercase tracking-widest text-tropico-sea">
            <Bot className="size-3" strokeWidth={2.5} />
            Carlos AI &middot; Modo Agente
          </div>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Tu plata trabajando sola.{" "}
            <span className="text-tropico-sea">Con tus reglas.</span>
          </h2>
          <p className="max-w-3xl text-tropico-mute">
            Carlos puede ejecutar acciones aut&oacute;nomas con permisos limitados v&iacute;a OpenClaw + Privy
            delegated session keys. Tú defines los l&iacute;mites. Las llaves NUNCA se exponen.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {AGENT_ACTIONS.map((a) => (
            <article
              key={a.name}
              className="panel flex items-start gap-3 p-4 transition hover:border-tropico-sea/40"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-tropico-sea/15 text-tropico-sea ring-1 ring-tropico-sea/30">
                <Bot className="size-4" strokeWidth={1.75} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold">{a.name}</span>
                <span
                  className="text-xs text-tropico-mute"
                  dangerouslySetInnerHTML={{ __html: a.desc }}
                />
              </div>
            </article>
          ))}
        </div>
        <Link
          href="/carlos/agente"
          className="btn-ghost w-fit"
        >
          Ver Modo Agente &rarr;
        </Link>
      </ScrollReveal>

      {/* MODELO DE NEGOCIO — 5 streams */}
      <ScrollReveal direction="up" as="section" className="flex flex-col gap-6">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-tropico-sun">
            Modelo de negocio
          </span>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            5 streams de revenue desde el d&iacute;a uno.
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
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
          Proyecci&oacute;n mes 12: 50.000 usuarios + 2.000 comercios ={" "}
          <strong className="text-tropico-green">$250K MRR</strong> sobre $44M de volumen.
        </p>
      </ScrollReveal>

      {/* CTA FINAL */}
      <ScrollReveal direction="pixel" as="section" className="panel relative flex flex-col items-center gap-6 overflow-hidden p-6 text-center md:p-10">
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
            Tu pr&oacute;xima cuenta financiera{" "}
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
            Sin esperar a que un banco te apruebe. Sin que nadie te congele la cuenta.
            Sin que la inflaci&oacute;n te derrita los ahorros. Empieza con tu email.
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
              <p className="text-xs text-tropico-mute">Construido sobre Solana.</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-tropico-text">
              Producto
            </span>
            <Link href="/home" className="text-xs hover:text-tropico-sun">Inicio (Wallet)</Link>
            <Link href="/cambiar" className="text-xs hover:text-tropico-sun">Cambiar</Link>
            <Link href="/cobrar" className="text-xs hover:text-tropico-sun">Cobrar</Link>
            <Link href="/enviar" className="text-xs hover:text-tropico-sun">Enviar</Link>
            <Link href="/guardar" className="text-xs hover:text-tropico-sun">Guardar</Link>
            <Link href="/depositar" className="text-xs hover:text-tropico-sun">Depositar bs</Link>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-tropico-text">
              Comercios
            </span>
            <Link href="/comercios" className="text-xs hover:text-tropico-sun">Para comercios</Link>
            <Link href="/comercios#afiliar" className="text-xs hover:text-tropico-sun">Afiliarme</Link>
            <Link href="/comercios#como-funciona" className="text-xs hover:text-tropico-sun">C&oacute;mo funciona</Link>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-tropico-text">
              IA + Recursos
            </span>
            <Link href="/carlos" className="text-xs hover:text-tropico-sun">Carlos AI</Link>
            <Link href="/carlos/agente" className="text-xs hover:text-tropico-sun">Modo Agente</Link>
            <Link href="/descubrir" className="text-xs hover:text-tropico-sun">Descubrir tokens</Link>
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
            &copy; 2026 Tropico &middot; dev3pack hackathon &middot; MIT License
          </span>
          <span className="text-xs">
            Tropico nunca toca tus llaves &middot; Verifica cada fee en{" "}
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
