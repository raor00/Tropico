import Link from "next/link";

const cards = [
  {
    title: "Conoce",
    body:
      "M&aacute;s all&aacute; del USDT. Aprend&eacute; qu&eacute; es JTO, JUP, mSOL — sin jerga gringa, en venezolano.",
    accent: "from-tropico-purple/30 to-transparent",
    badge: "Educa",
  },
  {
    title: "Cambia",
    body:
      "Intercambi&aacute; entre tokens al mejor precio del mercado. Comisi&oacute;n transparente del 0.5% — punto.",
    accent: "from-tropico-green/30 to-transparent",
    badge: "Swap",
  },
  {
    title: "Crece",
    body:
      "Carlos, tu copiloto financiero, te acompa&ntilde;a. &iquest;Qu&eacute; comprar? &iquest;C&oacute;mo funciona el staking? Te explica.",
    accent: "from-tropico-sun/30 to-transparent",
    badge: "Carlos AI",
  },
];

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-12 px-5 py-10 md:py-16">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="font-wordmark text-3xl leading-none"
            style={{
              background:
                "linear-gradient(135deg, #EF476F 0%, #FFD166 50%, #06D6A0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 12px rgba(255, 209, 102, 0.3))",
            }}
          >
            Tropico
          </span>
        </div>
        <span className="rounded-full border border-tropico-sun/30 bg-tropico-sun/5 px-3 py-1 text-xs text-tropico-sun">
          🌴 Solana &middot; Mainnet
        </span>
      </header>

      <section className="flex flex-col gap-6 animate-fade-up">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-tropico-sun/30 bg-tropico-sun/5 px-3 py-1 text-xs text-tropico-sun">
            <span className="size-1.5 rounded-full bg-tropico-sun animate-pulse-warm" />
            🇻🇪 Hecho en Venezuela &middot; para Venezuela
          </span>
          <h1 className="h-display">
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
            Ahorr&aacute; ganando, pag&aacute; sin perder. Una red de pagos non-custodial donde
            tu plata vive en USDC, genera rendimiento autom&aacute;tico, y los comercios pagan{" "}
            <strong className="text-tropico-text">60% menos en fees vs Banesco POS</strong>.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/home" className="btn-primary">
            Empezar con email &rarr;
          </Link>
          <Link href="/home" className="btn-ghost">
            Ya tengo Phantom
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.title}
            className={`panel relative overflow-hidden p-5 transition hover:border-tropico-mute`}
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.accent} opacity-60`}
            />
            <div className="relative flex flex-col gap-3">
              <span className="w-fit rounded-md bg-tropico-ink/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-tropico-mute">
                {card.badge}
              </span>
              <h3 className="font-display text-2xl font-bold">{card.title}</h3>
              <p className="text-sm leading-relaxed text-tropico-mute">{card.body}</p>
            </div>
          </article>
        ))}
      </section>

      <footer className="mt-auto flex items-center justify-between border-t border-tropico-border pt-6 text-xs text-tropico-mute">
        <span>&copy; 2026 Tropico &middot; dev3pack hackathon</span>
        <span>Construido sobre Solana &middot; Non-custodial</span>
      </footer>
    </main>
  );
}
