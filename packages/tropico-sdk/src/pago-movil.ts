/**
 * @tropico/sdk — Pago Móvil VE helpers
 *
 * Provides validation, QR formatting (Suiche7B-compatible), and parsing of
 * Pago Móvil intents. No real network calls — pure data transformation.
 *
 * Format mirrored from the internal suiche7b-parser (not imported — copied).
 */

import type { PagoMovilIntent } from "./types.js";
import { PagoMovilError } from "./errors.js";

// --- Bank codes ---

export const VENEZUELAN_BANK_CODES: Record<string, string> = {
  "0102": "Banco de Venezuela",
  "0104": "Venezolano de Crédito",
  "0105": "Mercantil",
  "0108": "BBVA Provincial",
  "0114": "Bancaribe",
  "0115": "Exterior",
  "0128": "Caroní",
  "0134": "Banesco",
  "0137": "Sofitasa",
  "0138": "Plaza",
  "0151": "BFC",
  "0156": "100% Banco",
  "0157": "DelSur",
  "0163": "Banco del Tesoro",
  "0166": "Agrícola",
  "0168": "Bancrecer",
  "0169": "Mi Banco",
  "0171": "Bancamiga",
  "0172": "Bancamiga",
  "0174": "Banplus",
  "0175": "Bicentenario",
  "0177": "Banfanb",
  "0191": "BNC",
};

// --- Validation ---

export type PagoMovilValidationError = {
  field: keyof PagoMovilIntent;
  message: string;
};

/**
 * Validate a PagoMovilIntent. Returns an array of validation errors.
 * An empty array means the intent is valid.
 */
export function validatePagoMovilIntent(
  intent: PagoMovilIntent
): PagoMovilValidationError[] {
  const errors: PagoMovilValidationError[] = [];

  // banco: must be exactly 4 digits and a known code
  const banco = String(intent.banco ?? "").replace(/\D/g, "");
  if (banco.length !== 4) {
    errors.push({ field: "banco", message: "Bank code must be exactly 4 digits" });
  } else if (!VENEZUELAN_BANK_CODES[banco]) {
    errors.push({
      field: "banco",
      message: `Unknown bank code: ${banco}. Check VENEZUELAN_BANK_CODES for valid codes.`,
    });
  }

  // telefono: 10–11 digits (Venezuelan mobile numbers)
  const telefono = String(intent.telefono ?? "").replace(/\D/g, "");
  if (telefono.length < 10 || telefono.length > 11) {
    errors.push({
      field: "telefono",
      message: "Phone number must be 10–11 digits (e.g. 04141234567)",
    });
  }

  // cedula: V/J followed by 7–10 digits
  const cedula = String(intent.cedula ?? "").toUpperCase().trim();
  if (!/^[VJvj]\d{7,10}$/.test(cedula)) {
    errors.push({
      field: "cedula",
      message: 'Cédula must be in format V12345678 or J123456789',
    });
  }

  // monto: positive number
  if (typeof intent.monto !== "number" || !Number.isFinite(intent.monto) || intent.monto <= 0) {
    errors.push({ field: "monto", message: "monto must be a positive number" });
  }

  return errors;
}

/**
 * Throw a PagoMovilError if the intent is invalid.
 */
export function assertValidPagoMovilIntent(intent: PagoMovilIntent): void {
  const errors = validatePagoMovilIntent(intent);
  if (errors.length > 0) {
    const fields = errors.map((e) => e.field);
    const messages = errors.map((e) => `${e.field}: ${e.message}`).join("; ");
    throw new PagoMovilError(`Invalid PagoMovilIntent — ${messages}`, fields);
  }
}

// --- QR formatting (Suiche7B-compatible) ---

export type FormattedPagoMovilQR = {
  /** JSON serialization (primary format) */
  json: string;
  /** Pipe-delimited Suiche7B string (legacy compat) */
  suiche7b: string;
};

/**
 * Serialize a PagoMovilIntent into the two Suiche7B-compatible formats:
 *   1. JSON  → standard `{"banco":...}` object
 *   2. Pipe  → `SUICHE7B|<banco>|<telefono>|<cedula>|<monto>|<ref>|<concepto>`
 */
export function formatPagoMovilQR(intent: PagoMovilIntent): FormattedPagoMovilQR {
  const parts = [
    "SUICHE7B",
    intent.banco,
    intent.telefono,
    intent.cedula,
    String(intent.monto),
    intent.ref ?? "",
    intent.concepto ?? "",
  ];

  return {
    json: JSON.stringify({
      banco: intent.banco,
      telefono: intent.telefono,
      cedula: intent.cedula,
      montoBs: intent.monto,
      referencia: intent.ref,
      concepto: intent.concepto,
    }),
    suiche7b: parts.join("|"),
  };
}

/**
 * Parse a raw QR string (JSON, pipe-delimited, or key=value) back into a
 * PagoMovilIntent. Returns null if the input cannot be recognized.
 *
 * Mirrors the parser logic from the internal suiche7b-parser.ts.
 */
export function parseSuiche7BQR(raw: string): PagoMovilIntent | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();

  // Format 1: JSON
  if (trimmed.startsWith("{")) {
    try {
      const obj = JSON.parse(trimmed) as Record<string, unknown>;
      return normalize({
        banco: String(obj["banco"] ?? obj["bank"] ?? ""),
        telefono: String(obj["telefono"] ?? obj["phone"] ?? ""),
        cedula: String(obj["cedula"] ?? obj["id"] ?? ""),
        monto: Number(obj["montoBs"] ?? obj["monto"] ?? obj["amount"] ?? 0),
        ref: optString(obj["referencia"] ?? obj["ref"]),
        concepto: optString(obj["concepto"] ?? obj["description"]),
      });
    } catch {
      return null;
    }
  }

  // Format 2: Pipe-delimited with SUICHE7B / S7B prefix
  if (trimmed.startsWith("SUICHE7B|") || trimmed.startsWith("S7B|")) {
    const parts = trimmed.split("|");
    return normalize({
      banco: parts[1] ?? "",
      telefono: parts[2] ?? "",
      cedula: parts[3] ?? "",
      monto: Number(parts[4] ?? 0),
      ref: parts[5] || undefined,
      concepto: parts[6] || undefined,
    });
  }

  // Format 3: key=value separated by ; or &
  if (trimmed.includes("=")) {
    const sep = trimmed.includes(";") ? ";" : "&";
    const map: Record<string, string> = {};
    for (const pair of trimmed.split(sep)) {
      const eqIdx = pair.indexOf("=");
      if (eqIdx === -1) continue;
      const k = pair.slice(0, eqIdx).trim().toLowerCase();
      const v = pair.slice(eqIdx + 1).trim();
      map[k] = v;
    }
    if (map["banco"] || map["bank"]) {
      return normalize({
        banco: map["banco"] ?? map["bank"] ?? "",
        telefono: map["telefono"] ?? map["phone"] ?? "",
        cedula: map["cedula"] ?? map["id"] ?? "",
        monto: Number(map["monto"] ?? map["montobs"] ?? map["amount"] ?? 0),
        ref: map["ref"] ?? map["referencia"],
        concepto: map["concepto"] ?? map["descripcion"],
      });
    }
  }

  return null;
}

// --- Internals ---

function normalize(p: Partial<PagoMovilIntent>): PagoMovilIntent | null {
  const banco = String(p.banco ?? "").replace(/\D/g, "").slice(0, 4);
  const telefono = String(p.telefono ?? "").replace(/\D/g, "");
  const cedula = String(p.cedula ?? "").toUpperCase().replace(/\s/g, "");
  const monto = Number(p.monto);

  if (!banco || banco.length !== 4) return null;
  if (!telefono || telefono.length < 10) return null;
  if (!cedula) return null;
  if (!Number.isFinite(monto) || monto <= 0) return null;

  const result: PagoMovilIntent = {
    banco,
    telefono,
    cedula,
    monto: Math.round(monto * 100) / 100,
  };
  if (p.ref) result.ref = p.ref;
  if (p.concepto) result.concepto = p.concepto;
  return result;
}

function optString(v: unknown): string | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  return String(v);
}
