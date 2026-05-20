import Link from "next/link";

export const metadata = { title: "Términos token-holders — Tropico" };

export default function TokenHoldersPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-5 py-10">
      <Link href="/inmuebles" className="w-fit text-sm text-tropico-mute hover:text-tropico-text">
        &larr; Volver
      </Link>

      <header>
        <span className="inline-block rounded-full border border-tropico-coral/30 bg-tropico-coral/10 px-3 py-1 text-xs text-tropico-coral mb-3">
          Documento legal — Fase 0 placeholder
        </span>
        <h1 className="font-display text-2xl font-bold">
          Acuerdo de Token-Holders — Inmuebles Tokenizados
        </h1>
        <p className="mt-2 text-sm text-tropico-mute">
          Última revisión: 2026-05-20 · Sujeto a revisión con counsel antes del piloto mainnet.
        </p>
      </header>

      <div className="flex flex-col gap-6 text-sm text-tropico-mute leading-relaxed">
        <section>
          <h2 className="font-semibold text-tropico-text mb-2">1. Naturaleza del token</h2>
          <p>
            Cada token SPL emitido por el programa <code>tropico_realestate</code> representa
            una participación fraccionada en el vehículo de propósito especial (SPV) que
            detenta el título legal del inmueble. El token otorga derechos de gobernanza
            (voto ponderado) y participación proporcional en la distribución de renta.
            No constituye título directo sobre el inmueble.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-tropico-text mb-2">2. Distribución de renta</h2>
          <p>
            La renta se distribuye pull-based vía <code>claim_reward</code>. El SPV (operado
            por Crixto bajo licencia Sunacrip) deposita USDC mensualmente. Trópico registra
            cada depósito on-chain con atestación del oracle Crixto.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-tropico-text mb-2">3. Fees</h2>
          <p>
            Venta primaria: 1,5% sobre el precio (90 bps Crixto / 60 bps Trópico).
            Transfer secundario: 1% (50/50). Gestión de renta: 10% sobre el bruto (60% Crixto / 40% Trópico).
            Todos los fees se registran on-chain en <code>tropico_treasury</code>.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-tropico-text mb-2">4. Riesgos</h2>
          <p>
            Invertir en inmuebles tokenizados conlleva riesgos de liquidez, legales,
            cambiarios, y de mercado. Trópico y Crixto no garantizan retornos. Este
            documento no constituye asesoría financiera ni de inversión.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-tropico-text mb-2">5. KYC y compliance</h2>
          <p>
            El acceso a compra y transfer de acciones requiere verificación KYC completada
            por Crixto (autoridad licenciada Sunacrip). La Whitelist PDA on-chain es la
            fuente de verdad del estado KYC.
          </p>
        </section>

        <section className="rounded-lg border border-tropico-coral/30 bg-tropico-coral/5 p-4">
          <p className="text-xs text-tropico-coral">
            <strong>Fase 0 — POC devnet:</strong> Este documento es un placeholder para el
            demo de pitch. El texto legal definitivo será redactado con counsel legal
            venezolano e internacional antes del piloto en mainnet (Fase 1).
            El hash de este documento se registrará on-chain en <code>PropertyConfig.legal_doc_hash</code>.
          </p>
        </section>
      </div>
    </main>
  );
}
