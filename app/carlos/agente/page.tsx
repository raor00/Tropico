"use client";

import Link from "next/link";
import { useState } from "react";
import { AGENT_ACTIONS } from "@/lib/agent-actions";
import { AgentToggle } from "@/components/AgentToggle";
import { AgentActionCard } from "@/components/AgentActionCard";
import { AgentHistory } from "@/components/AgentHistory";
import { Header } from "@/components/Header";

export default function ModoAgentePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-8 px-5 py-10">
      <Header badge={{ label: "Modo Agente", tone: "sea" }} />

      {/* Header de página */}
      <header className="flex flex-col gap-4 pt-4">
        <Link
          href="/carlos"
          className="w-fit text-sm text-tropico-mute transition hover:text-tropico-sun"
        >
          &larr; Volver a Carlos
        </Link>

        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-tropico-purple to-tropico-sea">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">Modo Agente</h1>
              <p className="text-sm text-tropico-mute">
                Carlos puede ejecutar acciones con tu permiso, dentro de l&iacute;mites que tú defines
              </p>
            </div>
          </div>
          <AgentToggle />
        </div>
      </header>

      {/* Banner de showcase MVP */}
      <div className="panel flex flex-col gap-2 border-tropico-coral/30 bg-tropico-coral/5 p-4 text-sm md:flex-row md:items-center md:gap-4">
        <span className="text-xl" aria-hidden>⚠️</span>
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-tropico-coral">Demo del hackathon</span>
          <span className="text-tropico-mute">
            Las acciones se ejecutan manualmente con un click. En producci&oacute;n
            (Q3 2026) van sobre el stack ag&eacute;ntico h&iacute;brido descrito m&aacute;s abajo.
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* SECCIÓN: Tropico Web3 Kit (Lumen) — el kit que construimos  */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="panel flex flex-col gap-5 p-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden>🧰</span>
            <div>
              <h2 className="font-display text-2xl font-bold">Tropico Web3 Kit</h2>
              <p className="text-xs text-tropico-mute">
                El primer kit Web3 para Lumen — open source, replicable con Hermes y OpenClaw
              </p>
            </div>
          </div>
          <a
            href="https://github.com/gabogabucho/lumen-agent"
            target="_blank"
            rel="noreferrer"
            className="w-fit rounded-full border border-tropico-purple/40 bg-tropico-purple/10 px-3 py-1.5 text-xs font-semibold text-tropico-purple transition hover:bg-tropico-purple/20"
          >
            Ver Lumen en GitHub →
          </a>
        </header>

        <p className="text-sm leading-relaxed text-tropico-mute">
          Carlos no es un wrapper de ChatGPT. Es un agente con personalidad, conocimiento de
          dominio y acceso a herramientas reales — corriendo sobre{" "}
          <a
            href="https://github.com/gabogabucho/lumen-agent"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-tropico-purple underline"
          >
            Lumen
          </a>
          , el framework open source de agentes en espa&ntilde;ol creado por{" "}
          <a
            href="https://github.com/gabogabucho/lumen-agent"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-tropico-purple underline"
          >
            @gabogabucho
          </a>
          .
          Construimos un kit de tres capas — <strong>KIT &middot; SKILLS &middot; CAPABILITIES</strong> — que
          es portable a cualquier orquestador compatible con la spec de skills (incluido
          Hermes/OpenClaw).
        </p>

        {/* Diagrama de las 3 capas */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-tropico-sun/30 bg-tropico-sun/5 p-4">
            <header className="mb-2 flex items-center gap-2">
              <span className="text-lg">🎭</span>
              <h3 className="font-display text-base font-bold text-tropico-sun">KIT</h3>
            </header>
            <p className="text-xs text-tropico-mute">
              <code className="text-tropico-text">module.yaml</code> +{" "}
              <code className="text-tropico-text">personality.yaml</code>
            </p>
            <p className="mt-2 text-xs text-tropico-mute">
              Define qu&eacute; es Carlos, c&oacute;mo habla (espa&ntilde;ol venezolano, sin jerga),
              qu&eacute; nunca hace (pol&iacute;tica, prometer rendimientos).
            </p>
          </div>
          <div className="rounded-xl border border-tropico-sea/30 bg-tropico-sea/5 p-4">
            <header className="mb-2 flex items-center gap-2">
              <span className="text-lg">📚</span>
              <h3 className="font-display text-base font-bold text-tropico-sea">7 SKILLS</h3>
            </header>
            <p className="text-xs text-tropico-mute">
              <code className="text-tropico-text">SKILL.md</code> + <code className="text-tropico-text">module.yaml</code> por skill
            </p>
            <p className="mt-2 text-xs text-tropico-mute">
              Hoja de ruta operativa que el LLM lee para saber qu&eacute; comandos
              correr y c&oacute;mo rutear pedidos.
            </p>
          </div>
          <div className="rounded-xl border border-tropico-coral/30 bg-tropico-coral/5 p-4">
            <header className="mb-2 flex items-center gap-2">
              <span className="text-lg">⚙️</span>
              <h3 className="font-display text-base font-bold text-tropico-coral">CAPABILITIES</h3>
            </header>
            <p className="text-xs text-tropico-mute">
              Scripts Python (Jupiter, Solana RPC, Helius)
            </p>
            <p className="mt-2 text-xs text-tropico-mute">
              Lo que se ejecuta de verdad — quote a Jupiter, lookup de saldo,
              tasa USD/Bs, firma v&iacute;a Privy delegated key.
            </p>
          </div>
        </div>

        {/* Lista de los 6 skills */}
        <div className="flex flex-col gap-2 rounded-xl border border-tropico-border bg-tropico-ink/40 p-4">
          <h4 className="font-display text-sm font-bold text-tropico-text">
            Los 6 skills del kit
          </h4>
          <ul className="grid gap-x-6 gap-y-1.5 text-xs text-tropico-mute md:grid-cols-2">
            <li><code className="text-tropico-sun">tropico-balances</code> — saldos SPL del wallet</li>
            <li><code className="text-tropico-sun">tropico-prices</code> — USD/Bs, USD/SOL via DolarAPI</li>
            <li><code className="text-tropico-sun">tropico-swap</code> — quote v&iacute;a Jupiter v6 + 0.5% fee</li>
            <li><code className="text-tropico-sun">tropico-pay</code> — Solana Pay QR + reference tracking</li>
            <li><code className="text-tropico-sun">tropico-yield</code> — vaults Marinade/Kamino, APY estimado</li>
            <li><code className="text-tropico-sun">tropico-cashback</code> — saldo acumulado por merchant</li>
            <li className="md:col-span-2 mt-1 border-t border-tropico-border pt-1.5">
              <code className="text-tropico-purple">tropico-agent-actions</code> —
              orquesta las 4 acciones aut&oacute;nomas v&iacute;a OpenClaw + Privy delegated keys
            </li>
          </ul>
        </div>

        {/* Por qué importa */}
        <div className="grid gap-3 text-xs text-tropico-mute md:grid-cols-2">
          <div className="rounded-lg bg-tropico-ink/40 p-3">
            <strong className="text-tropico-text">¿Por qu&eacute; un kit?</strong>{" "}
            En lugar de un prompt monstruo, separamos personalidad de capacidades. Puedes
            cambiar el modelo (DeepSeek hoy, Claude ma&ntilde;ana) sin tocar las skills.
          </div>
          <div className="rounded-lg bg-tropico-ink/40 p-3">
            <strong className="text-tropico-text">¿Por qu&eacute; replicable?</strong>{" "}
            Las skills son markdown + YAML — la misma definici&oacute;n corre sobre Lumen,
            Hermes (a trav&eacute;s de un adapter) o cualquier MCP server. Las capabilities son
            scripts Python est&aacute;ndar.
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* SECCIÓN: Carlos AI corre sobre Lumen — Hermes y OpenClaw    */}
      {/* son alternativas portables (no combinación obligatoria)     */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="panel flex flex-col gap-5 p-6">
        <header className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden>🌟</span>
          <div>
            <h2 className="font-display text-2xl font-bold">
              Carlos AI <span className="text-tropico-purple">by Lumen</span>
            </h2>
            <p className="text-xs text-tropico-mute">
              Tropico eligi&oacute; Lumen como motor. El kit es portable —
              Hermes y OpenClaw son alternativas opcionales para quien las quiera.
            </p>
          </div>
        </header>

        {/* Lumen — protagonista */}
        <div className="flex flex-col gap-3 rounded-xl border border-tropico-sun/50 bg-gradient-to-br from-tropico-sun/10 to-tropico-coral/5 p-5">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌟</span>
              <h3 className="font-display text-lg font-bold text-tropico-sun">Lumen — el motor de Carlos</h3>
            </div>
            <span className="rounded-full bg-tropico-green/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-tropico-green">
              Activo en MVP
            </span>
          </header>
          <p className="text-sm leading-relaxed text-tropico-mute">
            Framework open source MIT en espa&ntilde;ol por{" "}
            <a
              href="https://github.com/gabogabucho/lumen-agent"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-tropico-purple underline"
            >
              @gabogabucho
            </a>. Orquesta el Tropico Web3 Kit completo: carga la personality,
            invoca skills via tool calling, ejecuta capabilities Python con allowlist de binarios,
            expone REST API. Es lo que Tropico usa hoy en producci&oacute;n.
          </p>
          <ul className="flex flex-col gap-1 text-xs text-tropico-mute">
            <li>• <strong className="text-tropico-text">Personality + skills + capabilities</strong> en arquitectura declarativa de 3 capas</li>
            <li>• <strong className="text-tropico-text">Hot reload</strong> de skills sin restart del server</li>
            <li>• <strong className="text-tropico-text">Espa&ntilde;ol nativo</strong> — no es orquestador con diseño nativo para LATAM</li>
            <li>• <strong className="text-tropico-text">Tool calling</strong> a scripts Python (Helius, Jupiter, DolarAPI)</li>
          </ul>
        </div>

        {/* Hermes / OpenClaw — alternativas opcionales */}
        <div className="flex flex-col gap-2">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-tropico-mute">
            Alternativas opcionales · el kit funciona con cualquiera de los tres
          </h3>
          <p className="text-xs text-tropico-mute">
            El Tropico Web3 Kit (markdown + YAML + Python) <strong>no tiene dependencias propietarias de Lumen</strong>.
            Otro equipo puede portarlo a Hermes u OpenClaw con un adapter de ~30 l&iacute;neas. No es combinaci&oacute;n
            obligatoria — es elecci&oacute;n de quien implementa.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Hermes */}
          <div className="flex flex-col gap-3 rounded-xl border border-tropico-purple/30 bg-tropico-purple/5 p-4">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧠</span>
                <h3 className="font-display text-base font-bold text-tropico-purple">Hermes</h3>
              </div>
              <span className="rounded-full bg-tropico-mute/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-tropico-mute">
                Opcional
              </span>
            </header>
            <p className="text-xs leading-relaxed text-tropico-mute">
              Si quieres memoria persistente por usuario + razonamiento sobre <em>cu&aacute;ndo</em> proponer.
              Open source de Nous Research. Adapter convierte skills Lumen → formato Hermes en ~30 l&iacute;neas.
            </p>
            <ul className="flex flex-col gap-1 text-[11px] text-tropico-mute">
              <li>• Recuerda conversaciones previas</li>
              <li>• Multi-canal (web, Telegram, WhatsApp)</li>
              <li>• Tropico evaluar&aacute; en Q3 2026 para Carlos proactivo</li>
            </ul>
          </div>

          {/* OpenClaw */}
          <div className="flex flex-col gap-3 rounded-xl border border-tropico-sea/30 bg-tropico-sea/5 p-4">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤲</span>
                <h3 className="font-display text-base font-bold text-tropico-sea">OpenClaw</h3>
              </div>
              <span className="rounded-full bg-tropico-mute/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-tropico-mute">
                Opcional
              </span>
            </header>
            <p className="text-xs leading-relaxed text-tropico-mute">
              Si quieres firma delegada on-chain con policy engine. Session keys con expiraci&oacute;n,
              valida tx pre-firma, integraci&oacute;n con Privy. Llaves nunca tocan al server.
            </p>
            <ul className="flex flex-col gap-1 text-[11px] text-tropico-mute">
              <li>• Sesiones expiran en 1h default (max 24h)</li>
              <li>• Policy engine valida cada tx</li>
              <li>• Tropico evaluar&aacute; en Q3 2026 para Modo Agente real</li>
            </ul>
          </div>
        </div>

        {/* Diagrama del flow — Lumen es el motor, todo lo demás es opcional */}
        <div className="overflow-x-auto rounded-xl border border-tropico-border bg-tropico-ink/60 p-3 font-mono text-[10px] leading-relaxed text-tropico-mute sm:p-4 sm:text-[11px]">
          <div className="text-tropico-text mb-1">// Flujo de Carlos sobre Lumen (MVP hoy)</div>
          <pre className="min-w-max whitespace-pre">{`Usuario  ──▶  Lumen (orquestador + tool calling)
                  │ "DCA semanal — quieres ejecutar?"
                  ▼
              Tropico Web3 Kit (skill: tropico-agent-actions)
                  │ valida regla activa, arma payload
                  ▼
              Capability Python (agent_execute.py)
                  │ MVP: stub OpenClaw → Q3 firma real
                  ▼
              Solana mainnet ──▶ tx signature ──▶ histórico

// Q3 (opcional): si el equipo quiere memoria + delegated keys
Usuario  ──▶  [Hermes opcional]  ──▶  Lumen Kit
                                      ──▶  [OpenClaw opcional] ──▶ Privy ──▶ Solana
`}</pre>
        </div>

        <p className="text-xs text-tropico-mute">
          <strong className="text-tropico-text">Resumen:</strong>{" "}
          Tropico hoy corre <strong className="text-tropico-sun">Carlos AI by Lumen</strong>.
          Hermes a&ntilde;ade memoria persistente si lo quieres; OpenClaw a&ntilde;ade firma
          delegada on-chain si la quieres. El Tropico Web3 Kit es la pieza com&uacute;n que
          puede viajar entre los tres — eso lo hace replicable. <strong className="text-tropico-text">
          No son combinaci&oacute;n obligatoria.</strong>
        </p>
      </section>

      {/* Las 4 acciones */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Las 4 acciones disponibles</h2>
          <p className="text-sm text-tropico-mute">
            Activa las que te interesen. Configurar&aacute;s los l&iacute;mites espec&iacute;ficos
            para cada una. Cada acci&oacute;n requiere tu permiso explicito al activarse.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {AGENT_ACTIONS.map((action) => (
            <AgentActionCard
              key={action.id}
              action={action}
              onExecute={() => setRefreshKey((k) => k + 1)}
            />
          ))}
        </div>
      </section>

      {/* Historial */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-bold">Historial de acciones</h2>
        <AgentHistory refreshKey={refreshKey} />
      </section>

      {/* Footer / disclaimer */}
      <footer className="flex flex-col gap-2 border-t border-tropico-border pt-6 text-xs text-tropico-mute">
        <p>
          <strong>Non-custodial:</strong> Tropico nunca toca tus llaves privadas.
          Las sesiones del agente son scoped y expiran solas.
        </p>
        <p>
          <strong>Auditor&iacute;a:</strong> cada acci&oacute;n queda en blockchain p&uacute;blica.
          Verifica en{" "}
          <a
            href="https://solscan.io"
            target="_blank"
            rel="noreferrer"
            className="text-tropico-green underline"
          >
            Solscan
          </a>
          .
        </p>
        <p>
          <strong>Gu&iacute;a t&eacute;cnica:</strong>{" "}
          <Link href="/docs/lumen" className="text-tropico-sun underline">
            c&oacute;mo se construye el Tropico Web3 Kit (Lumen)
          </Link>{" "}
          — open source, MIT, replicable.
        </p>
      </footer>
    </main>
  );
}
