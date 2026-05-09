import Link from "next/link";
import { ComparativaTabla } from "@/components/ComparativaTabla";
import { AfiliarForm } from "@/components/AfiliarForm";
import { Logo } from "@/components/Logo";
import { InAppPreviewBanner } from "@/components/InAppPreviewBanner";

export const metadata = {
  title: "Tropico Comercios — Cobra en d&oacute;lares sin banco tradicional",
  description:
    "Aceptá pagos en USDC con un código QR. La plata te llega al instante. Pagas 1% en lugar del 4.5% del POS tradicional. Sin contrato, sin POS, sin esperas.",
};

const FEATURES = [
  {
    titulo: "1% de fee",
    detalle: "vs 4.5% del POS tradicional. Por cada $100 cobrados, te ahorras $3.50.",
    color: "from-tropico-green/30 to-transparent",
  },
  {
    titulo: "Settlement <1 segundo",
    detalle: "vs 24-72 horas del POS tradicional. La plata es tuya al instante, no en 3 d&iacute;as.",
    color: "from-tropico-purple/30 to-transparent",
  },
  {
    titulo: "Sin chargebacks",
    detalle: "Pagos on-chain son finales. Nadie te puede revertir un cobro despu&eacute;s.",
    color: "from-tropico-coral/30 to-transparent",
  },
  {
    titulo: "Sin POS hardware",
    detalle: "Solo tu Android. Sin equipo caro de $50-150. Sin contrato bancario.",
    color: "from-tropico-sun/30 to-transparent",
  },
  {
    titulo: "Cobras en d&oacute;lares (USDC)",
    detalle: "No m&aacute;s bol&iacute;vares devalu&aacute;ndose entre la venta y el cierre del d&iacute;a.",
    color: "from-tropico-sea/30 to-transparent",
  },
  {
    titulo: "Reportes para SENIAT",
    detalle: "Exporta tus cobros en CSV cuando lo necesites. Contabilidad simple.",
    color: "from-tropico-mute/30 to-transparent",
  },
];

const STEPS = [
  {
    paso: "1",
    titulo: "Conect&aacute; tu wallet",
    detalle:
      "Login con email. Sin instalar nada, sin conocimientos de cripto. 30 segundos.",
  },
  {
    paso: "2",
    titulo: "Genera tu QR",
    detalle:
      "Ingresa el monto a cobrar. Un c&oacute;digo aparece en tu pantalla.",
  },
  {
    paso: "3",
    titulo: "Recibe USDC",
    detalle:
      "Tu cliente escanea, paga, y la plata cae en tu wallet en menos de un segundo.",
  },
];

const PARTNERS_BAR = [
  "Solana Foundation",
  "Privy",
  "Jupiter",
  "Helius",
  "Solana Pay",
];

export default function ComerciosPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-10 px-5 py-10 md:gap-16">
      {/* Banner solo si user tiene wallet — preview app + nota demo */}
      <InAppPreviewBanner
        modulo="comercios afiliados"
        appHref="/cobrar"
        appLabel="Probar QR de cobro"
      />

      {/* Hero */}
      <section className="flex flex-col gap-6 animate-fade-up">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-tropico-border bg-tropico-panel px-3 py-1 text-xs text-tropico-coral">
          <span className="size-1.5 rounded-full bg-tropico-coral animate-pulse-slow" />
          Para bodegas, freelancers y comercios venezolanos
        </span>
        <h1 className="h-display break-words">
          Cobra en d&oacute;lares.<br />
          <span className="bg-gradient-to-r from-tropico-coral to-tropico-sun bg-clip-text text-transparent">
            Sin banco tradicional. Sin POS. Sin esperas.
          </span>
        </h1>
        <p className="max-w-3xl text-lg text-tropico-mute">
          Aceptá pagos en USDC con un código QR. La plata te llega al instante. Pagas
          <strong className="text-tropico-text"> 1% </strong> en lugar del
          <strong className="text-tropico-coral"> 4.5% </strong> del POS tradicional.
          Sin contrato, sin equipo caro, sin esperas.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="#afiliar" className="btn-primary">
            Quiero afiliar mi negocio &rarr;
          </Link>
          <Link href="#como-funciona" className="btn-ghost">
            C&oacute;mo funciona en 60 segundos
          </Link>
        </div>
      </section>

      {/* Comparativa fees */}
      <section className="flex flex-col gap-4">
        <ComparativaTabla />
      </section>

      {/* Features grid */}
      <section className="flex flex-col gap-6">
        <div>
          <h2 className="font-display text-3xl font-bold">
            Por qu&eacute; los comercios eligen Tropico
          </h2>
          <p className="text-tropico-mute">
            6 razones concretas, sin marketing hueco.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article
              key={f.titulo}
              className={`panel relative flex flex-col gap-2 overflow-hidden p-5`}
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${f.color} opacity-50`}
              />
              <div className="relative flex flex-col gap-2">
                <h3 className="font-display text-lg font-bold">{f.titulo}</h3>
                <p
                  className="text-sm leading-relaxed text-tropico-mute"
                  dangerouslySetInnerHTML={{ __html: f.detalle }}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* C&oacute;mo funciona — 3 pasos */}
      <section id="como-funciona" className="flex flex-col gap-6">
        <div>
          <h2 className="font-display text-3xl font-bold">
            C&oacute;mo funciona
          </h2>
          <p className="text-tropico-mute">3 pasos. Cero burocracia.</p>
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <li
              key={s.paso}
              className="panel flex flex-col gap-3 p-6 transition hover:border-tropico-mute"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-tropico-purple to-tropico-green font-display text-xl font-bold text-tropico-ink">
                {s.paso}
              </div>
              <h3 className="font-display text-xl font-bold">{s.titulo}</h3>
              <p
                className="text-sm leading-relaxed text-tropico-mute"
                dangerouslySetInnerHTML={{ __html: s.detalle }}
              />
            </li>
          ))}
        </ol>
      </section>

      {/* Trust signals */}
      <section className="panel flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-tropico-mute">
            Construido sobre infraestructura confiable
          </span>
          <span className="text-sm">
            Tu plata vive en tu wallet, no en la nuestra. Verifica cada fee en{" "}
            <a
              href="https://solscan.io"
              target="_blank"
              rel="noreferrer"
              className="text-tropico-green underline"
            >
              Solscan
            </a>
            .
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {PARTNERS_BAR.map((p) => (
            <span
              key={p}
              className="rounded-md border border-tropico-border bg-tropico-ink px-3 py-1 text-xs text-tropico-mute"
            >
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* Form de afiliaci&oacute;n */}
      <section id="afiliar" className="grid gap-8 md:grid-cols-2 md:items-start">
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-3xl font-bold">
            &iquest;List@ para cobrar mejor?
          </h2>
          <p className="text-tropico-mute">
            Crea tu cuenta de comercio en 5 minutos. Te contactamos por WhatsApp con
            tu QR y el material para tu local.
          </p>
          <ul className="flex flex-col gap-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-tropico-green">✓</span>
              <span>Cero costo de afiliaci&oacute;n</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-tropico-green">✓</span>
              <span>Soporte en WhatsApp en espa&ntilde;ol</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-tropico-green">✓</span>
              <span>Sin RIF, sin abogado, sin papeles</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-tropico-green">✓</span>
              <span>Logo &laquo;Acepta Tropico&raquo; descargable para tu vidriera</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-tropico-green">✓</span>
              <span>
                Listado p&uacute;blico en el directorio para que clientes te encuentren
              </span>
            </li>
          </ul>
        </div>
        <AfiliarForm />
      </section>

      {/* Footer */}
      <footer className="mt-auto flex flex-col gap-2 border-t border-tropico-border pt-6 text-xs text-tropico-mute md:flex-row md:justify-between">
        <span>&copy; 2026 Red Tropico &middot; dev3pack hackathon</span>
        <span>Hecho en Venezuela &middot; Construido sobre Solana</span>
      </footer>
    </main>
  );
}
