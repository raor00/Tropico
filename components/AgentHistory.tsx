"use client";

import { useEffect, useState } from "react";
import { type AgentHistoryEntry, loadHistory, clearHistory } from "@/lib/agent-rules-store";
import { getAction } from "@/lib/agent-actions";
import { formatRelativeTime } from "@/lib/formato";

export function AgentHistory({ refreshKey = 0 }: { refreshKey?: number }) {
  const [entries, setEntries] = useState<AgentHistoryEntry[]>([]);

  useEffect(() => {
    setEntries(loadHistory());
  }, [refreshKey]);

  function onClear() {
    clearHistory();
    setEntries([]);
  }

  if (entries.length === 0) {
    return (
      <div className="panel flex flex-col items-center gap-2 p-8 text-center">
        <span className="text-3xl" aria-hidden>📋</span>
        <h3 className="font-display text-lg font-bold">Sin acciones aún</h3>
        <p className="text-sm text-tropico-mute">
          Cuando Carlos ejecute una acci&oacute;n agentic, aparecer&aacute; ac&aacute;.
          Activa alguna regla y simul&aacute; una ejecuci&oacute;n para empezar.
        </p>
      </div>
    );
  }

  return (
    <div className="panel flex flex-col">
      <header className="flex items-center justify-between border-b border-tropico-border px-5 py-3">
        <h3 className="font-display text-lg font-bold">Historial</h3>
        <button
          onClick={onClear}
          className="text-xs text-tropico-mute transition hover:text-tropico-coral"
        >
          Limpiar
        </button>
      </header>
      <ul className="divide-y divide-tropico-border">
        {entries.map((entry) => {
          const action = getAction(entry.actionId);
          return (
            <li key={entry.id} className="flex gap-3 px-5 py-3">
              <span className="text-2xl" aria-hidden>{action?.icon ?? "🤖"}</span>
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold">{entry.mensaje}</span>
                  <span className="text-xs text-tropico-mute">
                    {formatRelativeTime(new Date(entry.executedAt).getTime())}
                  </span>
                </div>
                {entry.detalle && (
                  <p className="text-xs text-tropico-mute">{entry.detalle}</p>
                )}
                <span
                  className={`w-fit rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    entry.status === "success"
                      ? "bg-tropico-green/10 text-tropico-green"
                      : entry.status === "skipped"
                        ? "bg-tropico-mute/10 text-tropico-mute"
                        : "bg-tropico-coral/10 text-tropico-coral"
                  }`}
                >
                  {entry.status}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
