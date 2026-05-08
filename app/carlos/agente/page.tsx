"use client";

import Link from "next/link";
import { useState } from "react";
import { AGENT_ACTIONS } from "@/lib/agent-actions";
import { AgentToggle } from "@/components/AgentToggle";
import { AgentActionCard } from "@/components/AgentActionCard";
import { AgentHistory } from "@/components/AgentHistory";

export default function ModoAgentePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-8 px-5 py-10">
      {/* Header */}
      <header className="flex flex-col gap-4">
        <Link
          href="/carlos"
          className="w-fit text-sm text-tropico-mute transition hover:text-tropico-text"
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
                Carlos puede ejecutar acciones con tu permiso, dentro de l&iacute;mites que vos defin&iacute;s
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
          <span className="font-semibold text-tropico-coral">
            Demo del hackathon
          </span>
          <span className="text-tropico-mute">
            Las acciones se ejecutan manualmente con un click. En producci&oacute;n
            (Q3 2026) van sobre arquitectura h&iacute;brida{" "}
            <strong>Hermes (cerebro) + OpenClaw (manos)</strong> con Privy delegated
            session keys.
          </span>
        </div>
      </div>

      {/* Arquitectura visible */}
      <section className="panel grid gap-6 p-6 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <header className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>🧠</span>
            <h3 className="font-display text-lg font-bold">Hermes — el cerebro</h3>
          </header>
          <p className="text-sm text-tropico-mute">
            Memoria persistente por usuario, razonamiento sobre cu&aacute;ndo proponer
            acciones, skill orchestration. Open source de Nous Research.
          </p>
          <ul className="flex flex-col gap-1 text-xs text-tropico-mute">
            <li>• Recuerda tus conversaciones previas</li>
            <li>• Decide cu&aacute;ndo es el momento de proponer</li>
            <li>• Multi-plataforma (Q4: Telegram/WhatsApp)</li>
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <header className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>🤲</span>
            <h3 className="font-display text-lg font-bold">OpenClaw — las manos</h3>
          </header>
          <p className="text-sm text-tropico-mute">
            Session keys delegadas con expiraci&oacute;n, policy engine pre-tx,
            ejecuci&oacute;n on-chain v&iacute;a Privy. Llaves nunca expuestas.
          </p>
          <ul className="flex flex-col gap-1 text-xs text-tropico-mute">
            <li>• Sesiones expiran en 1h por defecto (max 24h)</li>
            <li>• Policy engine valida cada tx antes de ejecutar</li>
            <li>• Pod&eacute;s revocar el agente en tiempo real</li>
          </ul>
        </div>
      </section>

      {/* Las 4 acciones */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Las 4 acciones disponibles</h2>
          <p className="text-sm text-tropico-mute">
            Activ&aacute; las que te interesen. Configurar&aacute;s los l&iacute;mites espec&iacute;ficos
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
          Verific&aacute; en{" "}
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
      </footer>
    </main>
  );
}
