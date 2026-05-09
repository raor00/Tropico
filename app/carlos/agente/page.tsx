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
      <Header
        nav={[
          { href: "/home", label: "Wallet" },
          { href: "/carlos", label: "Carlos" },
          { href: "/carlos/agente", label: "Modo Agente" },
        ]}
        badge={{ label: "Agente", tone: "sea" }}
      />

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
            href="https://github.com/raor00/Tropico/tree/main/lumen-kit"
            target="_blank"
            rel="noreferrer"
            className="w-fit rounded-full border border-tropico-sea/40 bg-tropico-sea/10 px-3 py-1.5 text-xs font-semibold text-tropico-sea transition hover:bg-tropico-sea/20"
          >
            Ver en GitHub →
          </a>
        </header>

        <p className="text-sm leading-relaxed text-tropico-mute">
          Carlos no es un wrapper de ChatGPT. Es un agente con personalidad, conocimiento de
          dominio y acceso a herramientas reales — corriendo sobre{" "}
          <a
            href="https://github.com/lumenagents/lumen"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-tropico-sun underline"
          >
            Lumen
          </a>
          , el framework open source de agentes en espa&ntilde;ol.
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
              <h3 className="font-display text-base font-bold text-tropico-sea">6 SKILLS</h3>
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
      {/* SECCIÓN: Stack agéntico — Lumen + Hermes + OpenClaw         */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="panel flex flex-col gap-5 p-6">
        <header className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden>🏗️</span>
          <div>
            <h2 className="font-display text-2xl font-bold">Stack ag&eacute;ntico</h2>
            <p className="text-xs text-tropico-mute">
              Tres piezas, cada una con un rol claro. Hoy MVP corre sobre Lumen; Q3 sumamos las otras dos.
            </p>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Lumen */}
          <div className="flex flex-col gap-3 rounded-xl border border-tropico-sun/40 bg-tropico-sun/5 p-4">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎙️</span>
                <h3 className="font-display text-base font-bold text-tropico-sun">Lumen</h3>
              </div>
              <span className="rounded-full bg-tropico-green/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-tropico-green">
                MVP hoy
              </span>
            </header>
            <p className="text-xs leading-relaxed text-tropico-mute">
              Orquestador del kit. Carga personality + skills, expone <code>/api/chat</code>,
              ejecuta capabilities v&iacute;a terminal connector con allowlist de binarios.
            </p>
            <ul className="flex flex-col gap-1 text-[11px] text-tropico-mute">
              <li>• Web server modo</li>
              <li>• Skills cargadas dynamic (hot reload)</li>
              <li>• <code>confirm_terminal: false</code> para tool calls fluidos</li>
            </ul>
          </div>

          {/* Hermes */}
          <div className="flex flex-col gap-3 rounded-xl border border-tropico-purple/40 bg-tropico-purple/5 p-4">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧠</span>
                <h3 className="font-display text-base font-bold text-tropico-purple">Hermes</h3>
              </div>
              <span className="rounded-full bg-tropico-coral/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-tropico-coral">
                Q3 2026
              </span>
            </header>
            <p className="text-xs leading-relaxed text-tropico-mute">
              Memoria persistente por usuario y razonamiento sobre <em>cu&aacute;ndo</em> proponer.
              Open source de Nous Research. Adapter convierte skills Lumen al formato Hermes.
            </p>
            <ul className="flex flex-col gap-1 text-[11px] text-tropico-mute">
              <li>• Recuerda conversaciones previas</li>
              <li>• Decide momento de proactividad</li>
              <li>• Multi-canal (web, Telegram, WhatsApp)</li>
            </ul>
          </div>

          {/* OpenClaw */}
          <div className="flex flex-col gap-3 rounded-xl border border-tropico-sea/40 bg-tropico-sea/5 p-4">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤲</span>
                <h3 className="font-display text-base font-bold text-tropico-sea">OpenClaw</h3>
              </div>
              <span className="rounded-full bg-tropico-coral/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-tropico-coral">
                Q3 2026
              </span>
            </header>
            <p className="text-xs leading-relaxed text-tropico-mute">
              Las manos. Session keys delegadas con expiraci&oacute;n, policy engine pre-tx,
              firma v&iacute;a Privy. Las llaves nunca tocan a Tropico.
            </p>
            <ul className="flex flex-col gap-1 text-[11px] text-tropico-mute">
              <li>• Sesiones expiran en 1h default (max 24h)</li>
              <li>• Policy engine valida cada tx</li>
              <li>• Revocable en tiempo real</li>
            </ul>
          </div>
        </div>

        {/* Diagrama del flow */}
        <div className="overflow-x-auto rounded-xl border border-tropico-border bg-tropico-ink/60 p-4 font-mono text-[11px] leading-relaxed text-tropico-mute">
          <div className="text-tropico-text mb-1">// Flujo de una acci&oacute;n aut&oacute;noma en producci&oacute;n</div>
          <pre className="whitespace-pre-wrap">{`Usuario  ──▶  Hermes (cerebro + memoria)
                  │ "DCA semanal toca, propongo $50→SOL"
                  ▼
              Lumen Kit (skill: tropico-agent-actions)
                  │ valida regla activa, arma payload
                  ▼
              OpenClaw API (policy engine)
                  │ chequea: max $200/sem, ventana, frequency
                  ▼
              Privy delegated session key (firma server-side)
                  │
                  ▼
              Solana mainnet ──▶ tx signature ──▶ histórico
`}</pre>
        </div>

        <p className="text-xs text-tropico-mute">
          <strong className="text-tropico-text">Por qu&eacute; estos tres juntos:</strong>{" "}
          Lumen ya nos da el orquestador y la voz; Hermes a&ntilde;ade memoria y proactividad
          (decide <em>cu&aacute;ndo</em>); OpenClaw a&ntilde;ade ejecuci&oacute;n on-chain
          segura con policies (decide <em>si se puede</em>). El Web3 Kit es la pieza
          comp&uacute;n que viaja entre los tres.
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
