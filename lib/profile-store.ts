/**
 * Profile local — nombre privado del usuario, scoped por wallet activa.
 * Se guarda solo en este device (localStorage). No se sube a ningún backend.
 */

const PREFIX = "tropico:profile:";

export type Profile = {
  /** Nombre/alias que el usuario eligió mostrar */
  name?: string;
  /** Pubkey de la wallet asociada al perfil */
  pubkey?: string;
  /** Cuándo se creó */
  createdAt: string;
};

function key(pubkey: string): string {
  return `${PREFIX}${pubkey}`;
}

export function getProfile(pubkey: string): Profile | null {
  if (typeof window === "undefined" || !pubkey) return null;
  try {
    const raw = localStorage.getItem(key(pubkey));
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

export function setProfileName(pubkey: string, name: string): Profile {
  const existing = getProfile(pubkey);
  const next: Profile = {
    ...(existing ?? { createdAt: new Date().toISOString() }),
    name: name.trim() || undefined,
    pubkey,
  };
  localStorage.setItem(key(pubkey), JSON.stringify(next));
  window.dispatchEvent(
    new StorageEvent("storage", { key: key(pubkey) })
  );
  return next;
}

export function clearProfile(pubkey: string): void {
  if (typeof window === "undefined" || !pubkey) return;
  localStorage.removeItem(key(pubkey));
}

/** Helper: nombre o pubkey corto para mostrar en saludo */
export function getDisplayName(pubkey: string | null): string | null {
  if (!pubkey) return null;
  const p = getProfile(pubkey);
  return p?.name ?? null;
}
