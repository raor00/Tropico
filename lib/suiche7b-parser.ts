/**
 * Parser de QR Suiche7B (red interbancaria de Pago Móvil VE).
 *
 * Suiche7B genera QRs con datos del comercio para Pago Móvil C2P/B2P:
 *   banco destino · teléfono · cédula · monto en Bs · referencia · concepto
 *
 * No hay spec pública oficial — estos QRs varían por wallet emisor (banca digital
 * Banesco, BDV, Mercantil, Provincial, etc.) pero típicamente serializan en JSON
 * o pares key=value separados por delimitador.
 *
 * Este parser intenta varios formatos comunes y devuelve un objeto normalizado.
 * Si el QR no matchea nada, devuelve null y la UI muestra error claro.
 */

export type Suiche7BPayload = {
  /** Código corto del banco destino (4 dígitos típicamente) */
  banco: string;
  /** Nombre legible del banco (mapeado desde código si conocido) */
  bancoNombre?: string;
  /** Teléfono pago móvil del comercio (10 dígitos sin espacios) */
  telefono: string;
  /** Cédula del titular (V12345678 o J123456789) */
  cedula: string;
  /** Monto en Bolívares (con dos decimales) */
  montoBs: number;
  /** Referencia del cobro (única por tx) */
  referencia?: string;
  /** Concepto del pago (descripción del comercio) */
  concepto?: string;
  /** Comercio origen (RIF o nombre) */
  comercio?: string;
};

const BANCOS_VE: Record<string, string> = {
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
  "0163": "Tesoro",
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

/**
 * Parsea el contenido de un QR. Acepta:
 *   1. JSON: {"banco":"0134","telefono":"04141234567","cedula":"V12345678","montoBs":150.50}
 *   2. Pipe-separated: SUICHE7B|0134|04141234567|V12345678|150.50|REF123|Concepto
 *   3. Key=value: banco=0134;telefono=04141234567;cedula=V12345678;monto=150.50
 *
 * En todos los casos, el campo `montoBs` se normaliza como Number con dos decimales.
 */
export function parseSuiche7BQR(raw: string): Suiche7BPayload | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();

  // Intento 1: JSON
  if (trimmed.startsWith("{")) {
    try {
      const obj = JSON.parse(trimmed);
      return normalize({
        banco: String(obj.banco ?? obj.bank ?? ""),
        telefono: String(obj.telefono ?? obj.phone ?? ""),
        cedula: String(obj.cedula ?? obj.id ?? ""),
        montoBs: Number(obj.montoBs ?? obj.monto ?? obj.amount ?? 0),
        referencia: obj.referencia ?? obj.ref,
        concepto: obj.concepto ?? obj.description,
        comercio: obj.comercio ?? obj.merchant,
      });
    } catch {
      return null;
    }
  }

  // Intento 2: Pipe-separated con prefijo SUICHE7B
  if (trimmed.startsWith("SUICHE7B|") || trimmed.startsWith("S7B|")) {
    const parts = trimmed.split("|");
    return normalize({
      banco: parts[1] ?? "",
      telefono: parts[2] ?? "",
      cedula: parts[3] ?? "",
      montoBs: Number(parts[4] ?? 0),
      referencia: parts[5],
      concepto: parts[6],
      comercio: parts[7],
    });
  }

  // Intento 3: key=value separado por ; o &
  if (trimmed.includes("=")) {
    const sep = trimmed.includes(";") ? ";" : "&";
    const map: Record<string, string> = {};
    for (const pair of trimmed.split(sep)) {
      const [k, v] = pair.split("=");
      if (k && v !== undefined) map[k.trim().toLowerCase()] = v.trim();
    }
    if (map.banco || map.bank) {
      return normalize({
        banco: map.banco ?? map.bank ?? "",
        telefono: map.telefono ?? map.phone ?? "",
        cedula: map.cedula ?? map.id ?? "",
        montoBs: Number(map.monto ?? map.montobs ?? map.amount ?? 0),
        referencia: map.ref ?? map.referencia,
        concepto: map.concepto ?? map.descripcion,
        comercio: map.comercio ?? map.merchant,
      });
    }
  }

  return null;
}

function normalize(p: Partial<Suiche7BPayload>): Suiche7BPayload | null {
  const banco = (p.banco ?? "").replace(/\D/g, "").slice(0, 4);
  const telefono = (p.telefono ?? "").replace(/\D/g, "");
  const cedula = (p.cedula ?? "").toUpperCase().replace(/\s/g, "");
  const montoBs = Number(p.montoBs);

  if (!banco || banco.length !== 4) return null;
  if (!telefono || telefono.length < 10) return null;
  if (!cedula) return null;
  if (!Number.isFinite(montoBs) || montoBs <= 0) return null;

  return {
    banco,
    bancoNombre: BANCOS_VE[banco] ?? `Banco ${banco}`,
    telefono,
    cedula,
    montoBs: Math.round(montoBs * 100) / 100,
    referencia: p.referencia,
    concepto: p.concepto,
    comercio: p.comercio,
  };
}

/** Genera un QR de prueba (útil para demo del hackathon) */
export function buildDemoQRPayload(opts?: Partial<Suiche7BPayload>): string {
  const sample: Suiche7BPayload = {
    banco: opts?.banco ?? "0134",
    telefono: opts?.telefono ?? "04141234567",
    cedula: opts?.cedula ?? "V12345678",
    montoBs: opts?.montoBs ?? 850.5,
    referencia: opts?.referencia ?? `T${Date.now().toString().slice(-8)}`,
    concepto: opts?.concepto ?? "Pago consumo",
    comercio: opts?.comercio ?? "Bodegón Caracas",
  };
  return JSON.stringify(sample);
}
