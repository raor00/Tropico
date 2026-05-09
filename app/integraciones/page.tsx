import Link from "next/link";
import { INTEGRATION_USE_CASES } from "@/lib/checkout";
import { Code2, Webhook, Link2, Smartphone, ShieldCheck, Zap, Globe, ArrowRight } from "lucide-react";
import { InAppPreviewBanner } from "@/components/InAppPreviewBanner";

export const metadata = {
  title: "Integraciones — Tropico Pay",
  description:
    "Integra Tropico en tu plataforma. Cobra en USDC sobre Solana con QR, REST API o drop-in button. 1 segundo de settlement, sin chargebacks, sin bancos.",
};

const PATTERNS = [
  {
    id: "solana-pay",
    title: "Solana Pay link",
    sub: "Universal · sin SDK",
    icon: Link2,
    tone: "from-tropico-sun/30 to-tropico-coral/10",
    badgeColor: "bg-tropico-sun/15 text-tropico-sun border-tropico-sun/30",
    description:
      "El más simple. Tu plataforma genera un link `solana:...` y lo abre el cliente. Funciona con cualquier wallet de Solana del mundo.",
    bestFor: "Ticketing, pop-ups, links cortos por WhatsApp, QR físico en local.",
    snippet: `// 1. Pides un link al endpoint de Tropico
const r = await fetch("https://tropico.app/api/checkout/create", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    merchantWallet: "Mer7Gh...",
    amount: 12.50,
    partnerId: "tu-app",
    orderId: "ORD-001",
  }),
}).then(r => r.json());

// 2. Le pasas el link al cliente
window.location.href = r.solanaPayUrl;
// → "solana:Mer7Gh...?amount=12.50&spl-token=...&reference=..."`,
  },
  {
    id: "rest-api",
    title: "REST API + Webhook",
    sub: "Server-to-server",
    icon: Webhook,
    tone: "from-tropico-sea/30 to-tropico-purple/10",
    badgeColor: "bg-tropico-sea/15 text-tropico-sea border-tropico-sea/30",
    description:
      "Para apps con backend propio. Creas la sesión server-side, recibes webhook cuando el pago se confirma on-chain, marcas la orden como pagada.",
    bestFor: "E-commerce, marketplaces, suscripciones, apps de delivery con backend.",
    snippet: `// Server-side de tu plataforma
import fetch from "node-fetch";

async function createTropicoCharge(orderId, amount) {
  const res = await fetch("https://tropico.app/api/checkout/create", {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${process.env.TROPICO_API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      merchantWallet: process.env.MERCHANT_WALLET,
      amount,
      partnerId: "tu-empresa",
      orderId,
      channel: "ecommerce",
      redirectUrl: \`https://tu-tienda.com/orden/\${orderId}/ok\`,
      webhookUrl: "https://api.tu-empresa.com/webhooks/tropico",
    }),
  });
  return res.json(); // { sessionId, solanaPayUrl, reference, ... }
}`,
  },
  {
    id: "drop-in",
    title: "Drop-in button",
    sub: "Una línea de HTML",
    icon: Code2,
    tone: "from-tropico-coral/30 to-tropico-sun/10",
    badgeColor: "bg-tropico-coral/15 text-tropico-coral border-tropico-coral/30",
    description:
      "Pegas un script en tu checkout y aparece un botón Tropico Pay listo. Maneja el flow completo (QR, deeplink móvil, redirect). Cero estado en tu lado.",
    bestFor: "E-commerce con plantillas (Shopify, Tienda Nube), landings, apps web sin backend.",
    snippet: `<!-- En tu página de checkout -->
<script src="https://tropico.app/sdk/tropico-pay.js" defer></script>

<button
  data-tropico-pay
  data-merchant="Mer7Gh..."
  data-amount="12.50"
  data-order="ORD-001"
  data-partner="tu-app"
  data-redirect="https://tu-app.com/orden/ORD-001/ok"
>
  Pagar con Tropico
</button>`,
  },
] as const;

export default function IntegracionesPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-8 px-5 py-10 md:gap-12">
      {/* Banner solo si user tiene wallet — preview app + nota demo */}
      <InAppPreviewBanner
        modulo="Tropico Pay"
        appHref="/cobrar"
        appLabel="Probar QR cobro"
      />

      {/* HERO */}
      <section className="flex flex-col gap-6 pt-6">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-tropico-sea/30 bg-tropico-sea/5 px-3 py-1 text-xs font-semibold text-tropico-sea">
          <Zap className="size-3" /> Tropico Pay · Integración para plataformas
        </span>
        <h1 className="font-display text-3xl font-bold leading-tight md:text-6xl">
          Cobra en USDC.
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #06D6A0 0%, #FFD166 50%, #EF476F 100%)",
            }}
          >
            Settlement en 1 segundo.
          </span>
        </h1>
        <p className="max-w-3xl text-base text-tropico-mute md:text-lg">
          Si tu plataforma es de delivery, e-commerce, ticketing, mensajería o cualquier cosa
          que cobre — integra Tropico en tu checkout. El cliente paga directo desde su wallet,
          la plata cae en USDC al merchant en 1 segundo, no hay banco en el medio.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="#patrones"
            className="btn-primary inline-flex items-center gap-2"
          >
            Ver patrones de integración <ArrowRight className="size-4" />
          </Link>
          <a
            href="https://github.com/raor00/Tropico/blob/main/docs/INTEGRATION_API.md"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-tropico-border bg-tropico-ink/40 px-5 py-2.5 text-sm font-semibold text-tropico-text transition hover:border-tropico-sea hover:text-tropico-sea"
          >
            Doc completa <ArrowRight className="size-4" />
          </a>
        </div>
      </section>

      {/* WHY */}
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { Icon: Zap, t: "1 seg", s: "Settlement on-chain" },
          { Icon: ShieldCheck, t: "0%", s: "Chargebacks" },
          { Icon: Globe, t: "USDC", s: "Estable, sin devaluación" },
          { Icon: Smartphone, t: "QR + link", s: "Funciona en cualquier wallet" },
        ].map(({ Icon, t, s }) => (
          <div
            key={t}
            className="panel flex flex-col gap-2 p-4"
          >
            <Icon className="size-5 text-tropico-sun" strokeWidth={1.8} />
            <div className="font-display text-2xl font-bold">{t}</div>
            <div className="text-xs text-tropico-mute">{s}</div>
          </div>
        ))}
      </section>

      {/* CASOS DE USO */}
      <section className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h2 className="font-display text-3xl font-bold">Casos de uso</h2>
          <p className="text-sm text-tropico-mute">
            Quién puede integrar Tropico en su plataforma. Si no estás en esta lista, igual
            llámanos — el patrón es el mismo.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {INTEGRATION_USE_CASES.map((u) => (
            <article
              key={u.vertical}
              className="panel relative flex flex-col gap-3 overflow-hidden p-6"
            >
              <header className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden>
                    {u.icon}
                  </span>
                  <h3 className="font-display text-xl font-bold">{u.vertical}</h3>
                </div>
                <span className="rounded-full bg-tropico-ink/60 px-2 py-0.5 text-[10px] font-semibold uppercase text-tropico-mute">
                  {u.integration}
                </span>
              </header>
              <p className="text-sm text-tropico-mute">{u.why}</p>
              <div className="flex flex-wrap gap-1.5">
                {u.examples.map((ex) => (
                  <span
                    key={ex}
                    className="rounded-md border border-tropico-border bg-tropico-ink/40 px-2 py-0.5 text-[11px] text-tropico-text"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* PATRONES */}
      <section id="patrones" className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h2 className="font-display text-3xl font-bold">3 patrones de integración</h2>
          <p className="text-sm text-tropico-mute">
            Elige el que mejor encaje con tu stack. Los tres devuelven el mismo resultado:
            una sesión con `reference` única que tu app trackea hasta confirmar el pago on-chain.
          </p>
        </header>

        <div className="flex flex-col gap-6">
          {PATTERNS.map((p) => {
            const Icon = p.icon;
            return (
              <article
                key={p.id}
                className="panel relative flex flex-col gap-4 overflow-hidden p-6 md:flex-row md:items-start"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${p.tone} opacity-30`}
                />
                <div className="relative flex flex-col gap-3 md:w-1/3">
                  <header className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-tropico-ink/70">
                      <Icon className="size-5 text-tropico-sun" strokeWidth={1.8} />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold">{p.title}</h3>
                      <p className="text-xs text-tropico-mute">{p.sub}</p>
                    </div>
                  </header>
                  <p className="text-sm text-tropico-mute">{p.description}</p>
                  <div className={`rounded-md border px-2 py-1 text-[11px] font-medium ${p.badgeColor}`}>
                    Mejor para: {p.bestFor}
                  </div>
                </div>
                <div className="relative flex-1">
                  <div className="rounded-xl border border-tropico-border bg-tropico-ink/80 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-tropico-mute">
                        {p.id === "drop-in" ? "html" : "javascript"}
                      </span>
                      <span className="text-[10px] text-tropico-mute">copia · pega · funciona</span>
                    </div>
                    <pre className="overflow-x-auto text-[11px] leading-relaxed text-tropico-text/90 whitespace-pre">
                      <code>{p.snippet}</code>
                    </pre>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* WEBHOOK */}
      <section className="panel flex flex-col gap-4 p-6">
        <header className="flex items-center gap-3">
          <Webhook className="size-6 text-tropico-coral" strokeWidth={1.8} />
          <h2 className="font-display text-2xl font-bold">Webhook on-chain confirm</h2>
        </header>
        <p className="text-sm text-tropico-mute">
          Cuando el cliente firma el pago en su wallet, Tropico monitorea la blockchain con el
          `reference` único de la sesión. Cuando se confirma (~1 segundo), tu webhook recibe:
        </p>
        <div className="rounded-xl border border-tropico-border bg-tropico-ink/80 p-4">
          <pre className="overflow-x-auto whitespace-pre text-[11px] leading-relaxed text-tropico-text/90">
            <code>{`POST https://api.tu-empresa.com/webhooks/tropico
Content-Type: application/json
X-Tropico-Signature: sha256=...

{
  "event": "payment.confirmed",
  "sessionId": "tps_a1b2c3d4...",
  "orderId": "ORD-001",
  "reference": "...",
  "amount": 12.50,
  "tokenSymbol": "USDC",
  "merchantReceives": 12.4375,
  "feeBps": 50,
  "txSignature": "5xK...abc",
  "blockTime": 1715200800,
  "explorer": "https://solscan.io/tx/5xK...abc"
}`}</code>
          </pre>
        </div>
        <p className="text-xs text-tropico-mute">
          Tu endpoint debe responder 200 en menos de 5 segundos. Tropico reintenta hasta 24h
          con backoff exponencial si falla.
        </p>
      </section>

      {/* CTA partners */}
      <section className="panel flex flex-col items-start gap-5 bg-gradient-to-br from-tropico-purple/10 via-tropico-sea/10 to-tropico-sun/10 p-5 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-3xl font-bold">¿Quieres integrar tu plataforma?</h2>
          <p className="max-w-2xl text-sm text-tropico-mute">
            Te damos API key, sandbox con devnet, soporte directo del equipo y un slot en el
            directorio de partners de Tropico. Onboarding técnico en una llamada.
          </p>
        </div>
        <a
          href="mailto:partners@tropico.app?subject=Integración%20Tropico%20Pay"
          className="btn-primary inline-flex w-full items-center gap-2 md:w-auto"
        >
          Hablar con el equipo <ArrowRight className="size-4" />
        </a>
      </section>

      {/* Footer */}
      <footer className="flex flex-col gap-2 border-t border-tropico-border pt-6 text-xs text-tropico-mute md:flex-row md:items-center md:justify-between">
        <p>
          Tropico Pay corre sobre la spec oficial de{" "}
          <a
            href="https://docs.solanapay.com"
            target="_blank"
            rel="noreferrer"
            className="text-tropico-green underline"
          >
            Solana Pay
          </a>
          . El SDK es MIT, los webhooks son firmados con HMAC-SHA256.
        </p>
        <Link href="/" className="hover:text-tropico-sun">
          Volver al home
        </Link>
      </footer>
    </main>
  );
}
