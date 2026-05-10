/**
 * Libreta de contactos local — pubkeys a las que ya enviaste.
 *
 * Diseño privacy-first:
 * - Storage key incluye el pubkey de la wallet ACTIVA → aislado por wallet.
 *   Si abrís otra wallet en el mismo browser, NO ves contactos de la anterior.
 * - Nada se sube a ningún backend. Solo localStorage.
 * - El nombre que pongas existe solo en tu device. Para el resto del mundo
 *   esa wallet sigue siendo solo una pubkey anónima.
 */

const PREFIX = "tropico:contacts:";

export type Contact = {
  pubkey: string;
  /** Alias privado del usuario para esta pubkey (opcional) */
  name?: string;
  /** ISO timestamp del último envío exitoso */
  lastSentAt: string;
  /** Cuántas veces le enviaste */
  sentCount: number;
};

function storageKey(ownerPubkey: string): string {
  return `${PREFIX}${ownerPubkey}`;
}

function read(ownerPubkey: string): Contact[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(ownerPubkey));
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function write(ownerPubkey: string, list: Contact[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(ownerPubkey), JSON.stringify(list));
  } catch {
    // quota exceeded — no-op
  }
}

/** Lista contactos de la wallet activa, ordenados por último envío DESC */
export function listContacts(ownerPubkey: string): Contact[] {
  return read(ownerPubkey).sort((a, b) =>
    b.lastSentAt.localeCompare(a.lastSentAt)
  );
}

/** Devuelve el alias privado para una pubkey (o undefined) */
export function getContactName(
  ownerPubkey: string,
  pubkey: string
): string | undefined {
  return read(ownerPubkey).find((c) => c.pubkey === pubkey)?.name;
}

/**
 * Upsert: si ya existe, incrementa sentCount + actualiza lastSentAt y opcionalmente
 * el nombre. Si no, lo crea. Devuelve el contacto resultante.
 */
export function recordSend(
  ownerPubkey: string,
  pubkey: string,
  name?: string
): Contact {
  const list = read(ownerPubkey);
  const idx = list.findIndex((c) => c.pubkey === pubkey);
  const now = new Date().toISOString();
  if (idx >= 0) {
    const existing = list[idx];
    const updated: Contact = {
      ...existing,
      lastSentAt: now,
      sentCount: existing.sentCount + 1,
      name: name?.trim() || existing.name,
    };
    list[idx] = updated;
    write(ownerPubkey, list);
    return updated;
  }
  const fresh: Contact = {
    pubkey,
    name: name?.trim() || undefined,
    lastSentAt: now,
    sentCount: 1,
  };
  list.push(fresh);
  write(ownerPubkey, list);
  return fresh;
}

/** Renombra un contacto existente (no incrementa contador) */
export function renameContact(
  ownerPubkey: string,
  pubkey: string,
  name: string
): void {
  const list = read(ownerPubkey);
  const idx = list.findIndex((c) => c.pubkey === pubkey);
  if (idx < 0) return;
  list[idx] = { ...list[idx], name: name.trim() || undefined };
  write(ownerPubkey, list);
}

/** Borra un contacto */
export function deleteContact(ownerPubkey: string, pubkey: string): void {
  const list = read(ownerPubkey).filter((c) => c.pubkey !== pubkey);
  write(ownerPubkey, list);
}

/** Borra TODA la libreta de la wallet activa */
export function clearContacts(ownerPubkey: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey(ownerPubkey));
}
