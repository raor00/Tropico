/**
 * Persistencia local de reglas activas de Guacama Modo Agente + histórico de ejecuciones.
 *
 * MVP: localStorage del browser (no se sincroniza entre dispositivos).
 * Producción Q3: backend persistente con Cloudflare KV o Postgres.
 *
 * El usuario puede activar/desactivar el modo entero, configurar cada regla,
 * y ver el histórico de acciones ejecutadas.
 */

import type { AgentActionConfig, AgentActionId } from "./agent-actions";

const STORAGE_KEY_RULES = "tropico:agent:rules:v1";
const STORAGE_KEY_HISTORY = "tropico:agent:history:v1";
const STORAGE_KEY_ENABLED = "tropico:agent:enabled:v1";

export type AgentRule = {
  actionId: AgentActionId;
  active: boolean;
  config: AgentActionConfig;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type AgentHistoryEntry = {
  id: string; // uuid simple
  actionId: AgentActionId;
  executedAt: string; // ISO
  mensaje: string;
  detalle?: string;
  status: "success" | "skipped" | "error";
};

/* --- Rules --- */

export function loadRules(): AgentRule[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RULES);
    return raw ? (JSON.parse(raw) as AgentRule[]) : [];
  } catch {
    return [];
  }
}

export function saveRules(rules: AgentRule[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(rules));
}

export function getRule(actionId: AgentActionId): AgentRule | undefined {
  return loadRules().find((r) => r.actionId === actionId);
}

export function upsertRule(
  actionId: AgentActionId,
  config: AgentActionConfig,
  active = true
): AgentRule {
  const rules = loadRules();
  const now = new Date().toISOString();
  const existing = rules.find((r) => r.actionId === actionId);

  let updated: AgentRule;
  if (existing) {
    updated = { ...existing, config, active, updatedAt: now };
    const idx = rules.indexOf(existing);
    rules[idx] = updated;
  } else {
    updated = { actionId, config, active, createdAt: now, updatedAt: now };
    rules.push(updated);
  }
  saveRules(rules);
  return updated;
}

export function toggleRule(actionId: AgentActionId, active: boolean): void {
  const rules = loadRules();
  const rule = rules.find((r) => r.actionId === actionId);
  if (rule) {
    rule.active = active;
    rule.updatedAt = new Date().toISOString();
    saveRules(rules);
  }
}

export function deleteRule(actionId: AgentActionId): void {
  const rules = loadRules().filter((r) => r.actionId !== actionId);
  saveRules(rules);
}

/* --- History --- */

const MAX_HISTORY = 50;

export function loadHistory(): AgentHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    return raw ? (JSON.parse(raw) as AgentHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function appendHistory(entry: Omit<AgentHistoryEntry, "id" | "executedAt">): AgentHistoryEntry {
  const history = loadHistory();
  const newEntry: AgentHistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    executedAt: new Date().toISOString(),
  };
  const next = [newEntry, ...history].slice(0, MAX_HISTORY);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(next));
  }
  return newEntry;
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY_HISTORY);
}

/* --- Global enable/disable --- */

export function isAgentEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY_ENABLED) === "1";
}

export function setAgentEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_ENABLED, enabled ? "1" : "0");
  // dispatch storage event para que otros tabs/componentes reaccionen
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY_ENABLED }));
}
