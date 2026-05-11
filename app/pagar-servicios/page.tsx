import { PagarServiciosClient } from "./PagarServiciosClient";
import { Suiche7BScan } from "@/components/Suiche7BScan";
import { RailStatusBanner } from "@/components/RailStatusBanner";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pagar Servicios — Tropico",
  description:
    "Paga luz, agua, gas, teléfono, internet y streaming con USDC. Sin colas, sin recargo.",
};

export default function PagarServiciosPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-8 px-5 py-10">

      {/* Banner Demo */}
      <div className="rounded-xl border border-tropico-sun/30 bg-tropico-sun/8 px-4 py-3 text-sm text-tropico-sun">
        <span className="font-semibold">Demo del hackathon</span>
        {" — "}partnerships activas Q3 2026. En producción conectamos con un agregador de pagos venezolano licenciado (BCV-compliant).
      </div>

      {/* Rail Resilient — failover Pago Móvil → Solana Pay */}
      <RailStatusBanner />

      {/* Hero */}
      <section className="flex flex-col gap-3">
        <h1 className="font-display text-3xl font-black tracking-tighter leading-tight md:text-5xl">
          Paga todo lo de tu casa con USDC
        </h1>
        <p className="max-w-xl text-lg text-tropico-mute">
          Sin colas, sin recargo, sin Bs en el medio. Tropico convierte tu USDC al rate del momento y emite el pago al proveedor.
        </p>
      </section>

      {/* Tropico Bs Bridge — escanea QR Suiche7B y paga con USDC */}
      <Suiche7BScan />

      {/* Client interactivo: grid de categorías + modal de pago */}
      <PagarServiciosClient />

      {/* Cómo funciona */}
      <section className="flex flex-col gap-6">
        <h2 className="font-display text-2xl font-bold">Cómo funciona</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              step: "1",
              titulo: "Elige tu servicio",
              desc: "Selecciona la categoría, el proveedor y escribe el número de contrato o teléfono.",
              color: "tropico-purple",
            },
            {
              step: "2",
              titulo: "Tropico convierte",
              desc: "Tu USDC se intercambia a Bs al rate paralelo del momento vía Jupiter swap interno. Cero slippage oculto.",
              color: "tropico-sea",
            },
            {
              step: "3",
              titulo: "Pago emitido",
              desc: "Tropico transfiere los Bs al proveedor vía PagoChain o Reserve API. Recibes confirmación por SMS.",
              color: "tropico-green",
            },
          ].map(({ step, titulo, desc, color }) => (
            <div key={step} className="panel flex flex-col gap-3 p-5">
              <div
                className={`flex size-10 items-center justify-center rounded-full bg-${color}/20 font-display text-lg font-bold text-${color}`}
              >
                {step}
              </div>
              <h3 className="font-display text-lg font-bold">{titulo}</h3>
              <p className="text-sm leading-relaxed text-tropico-mute">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-bold">Roadmap de servicios</h2>
        <div className="panel overflow-hidden p-0">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-tropico-border bg-tropico-ink/40 text-left text-xs uppercase tracking-wider text-tropico-mute">
                <th className="px-5 py-3">Fase</th>
                <th className="px-5 py-3">Servicios</th>
                <th className="px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tropico-border">
              {[
                {
                  fase: "Q3 2026",
                  servicios: "Luz (Corpoelec) · Agua · Internet/TV · Telefonía",
                  estado: "En desarrollo",
                  estadoColor: "text-tropico-sun",
                },
                {
                  fase: "Q4 2026",
                  servicios: "Streaming (Netflix, Disney+, Spotify) · Impuestos municipales · Gas",
                  estado: "Planificado",
                  estadoColor: "text-tropico-mute",
                },
                {
                  fase: "2027",
                  servicios: "Nómina empresarial · Seguro HCM · Pago a proveedores",
                  estado: "Roadmap",
                  estadoColor: "text-tropico-mute",
                },
              ].map(({ fase, servicios, estado, estadoColor }) => (
                <tr key={fase} className="transition hover:bg-tropico-panel/60">
                  <td className="px-5 py-3 font-semibold text-tropico-sun">{fase}</td>
                  <td className="px-5 py-3 text-tropico-text">{servicios}</td>
                  <td className={`px-5 py-3 font-medium ${estadoColor}`}>{estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-tropico-border pt-6 text-xs text-tropico-mute">
        Tropico nunca toca tus llaves. Cada pago queda registrado en Solana.{" "}
        <a
          href="https://solscan.io"
          target="_blank"
          rel="noreferrer"
          className="text-tropico-green underline"
        >
          Verificar en Solscan
        </a>
        .
      </footer>
    </main>
  );
}
