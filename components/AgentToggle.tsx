"use client";

import { useEffect, useState } from "react";
import { isAgentEnabled, setAgentEnabled } from "@/lib/agent-rules-store";

export function AgentToggle() {
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setEnabled(isAgentEnabled());
    function onStorage(e: StorageEvent) {
      if (e.key === "tropico:agent:enabled:v1") {
        setEnabled(isAgentEnabled());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function onToggle() {
    const next = !enabled;
    setEnabled(next);
    setAgentEnabled(next);
  }

  if (!mounted) {
    return <div className="h-10 w-32 animate-pulse rounded-full bg-tropico-panel" />;
  }

  return (
    <button
      onClick={onToggle}
      className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
        enabled
          ? "border-tropico-green bg-tropico-green/10 text-tropico-green"
          : "border-tropico-border bg-tropico-panel text-tropico-mute hover:border-tropico-mute"
      }`}
      aria-pressed={enabled}
    >
      <span
        className={`size-2 rounded-full transition ${
          enabled ? "bg-tropico-green animate-pulse-slow" : "bg-tropico-mute"
        }`}
      />
      {enabled ? "Modo Agente activo" : "Modo Agente desactivado"}
    </button>
  );
}
