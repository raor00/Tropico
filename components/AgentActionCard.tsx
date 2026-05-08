"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type AgentAction,
  describeTrigger,
  simulateExecution,
} from "@/lib/agent-actions";
import {
  appendHistory,
  getRule,
  toggleRule,
  upsertRule,
} from "@/lib/agent-rules-store";

export function AgentActionCard({
  action,
  onExecute,
  onConfigure,
}: {
  action: AgentAction;
  onExecute?: () => void;
  onConfigure?: () => void;
}) {
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [config, setConfig] = useState(action.defaultConfig);

  useEffect(() => {
    const rule = getRule(action.id);
    if (rule) {
      setActive(rule.active);
      setConfig(rule.config);
    } else {
      // Auto-crear con defaults pero inactivo
      upsertRule(action.id, action.defaultConfig, false);
    }
  }, [action.id, action.defaultConfig]);

  function onToggle() {
    const next = !active;
    setActive(next);
    toggleRule(action.id, next);
  }

  function onSimulate() {
    const result = simulateExecution(action, config);
    appendHistory({
      actionId: action.id,
      mensaje: result.mensaje,
      detalle: result.detalle,
      status: result.exito ? "success" : "error",
    });
    onExecute?.();
    if (result.navegarA) {
      setTimeout(() => router.push(result.navegarA!), 800);
    }
  }

  return (
    <article
      className={`panel relative flex flex-col gap-3 overflow-hidden p-5 transition ${
        active ? "border-tropico-green/40" : ""
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-60`}
      />
      <div className="relative flex flex-col gap-3">
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden>{action.icon}</span>
            <div>
              <h3 className="font-display text-lg font-bold leading-tight">
                {action.titulo}
              </h3>
              <p className="text-xs text-tropico-mute">
                {describeTrigger(config)}
              </p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className={`relative h-6 w-11 rounded-full transition ${
              active ? "bg-tropico-green" : "bg-tropico-border"
            }`}
            aria-pressed={active}
            aria-label={`${active ? "Desactivar" : "Activar"} ${action.titulo}`}
          >
            <span
              className={`absolute top-0.5 size-5 rounded-full bg-tropico-ink transition ${
                active ? "left-5" : "left-0.5"
              }`}
            />
          </button>
        </header>

        <p className="text-sm leading-relaxed text-tropico-mute">
          {action.descripcionUsuario}
        </p>

        <div className="rounded-lg border border-tropico-border bg-tropico-ink/40 px-3 py-2 text-xs">
          <span className="text-tropico-mute">Policy producción:</span>{" "}
          <span className="text-tropico-text/80">{action.policy}</span>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={onSimulate}
            disabled={!active}
            className="flex-1 rounded-lg bg-gradient-to-r from-tropico-purple to-tropico-green px-4 py-2 text-sm font-semibold text-tropico-ink transition hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          >
            Simular ejecución →
          </button>
          {onConfigure && (
            <button
              onClick={onConfigure}
              className="rounded-lg border border-tropico-border bg-tropico-panel px-4 py-2 text-sm font-semibold text-tropico-mute transition hover:border-tropico-mute hover:text-tropico-text"
            >
              Configurar
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
