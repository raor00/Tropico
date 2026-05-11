"use client";

import { useState } from "react";
import {
  Zap,
  Droplets,
  Flame,
  Smartphone,
  Wifi,
  Tv,
  Play,
  Users,
  X,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { DualPrice } from "@/components/DualPrice";
import { whatsappShareUrl } from "@/lib/solana-pay";

type Categoria = {
  id: string;
  nombre: string;
  Icon: React.ElementType;
  color: string;
  gradient: string;
  proveedores: string[];
  placeholder: string;
  labelNumero: string;
};

const CATEGORIAS: Categoria[] = [
  {
    id: "luz",
    nombre: "Luz",
    Icon: Zap,
    color: "text-tropico-sun",
    gradient: "from-tropico-sun/20 to-tropico-sun/5",
    proveedores: ["Corpoelec"],
    placeholder: "N° de contrato (ej. 1234567)",
    labelNumero: "Número de contrato",
  },
  {
    id: "agua",
    nombre: "Agua",
    Icon: Droplets,
    color: "text-tropico-sea",
    gradient: "from-tropico-sea/20 to-tropico-sea/5",
    proveedores: ["Hidrocapital", "Hidrolago", "Hidrocentro"],
    placeholder: "N° de contrato (ej. 987654)",
    labelNumero: "Número de contrato",
  },
  {
    id: "gas",
    nombre: "Gas",
    Icon: Flame,
    color: "text-tropico-coral",
    gradient: "from-tropico-coral/20 to-tropico-coral/5",
    proveedores: ["PDVSA Gas Comunal"],
    placeholder: "N° de cliente",
    labelNumero: "Número de cliente",
  },
  {
    id: "telefonia",
    nombre: "Telefonía",
    Icon: Smartphone,
    color: "text-tropico-green",
    gradient: "from-tropico-green/20 to-tropico-green/5",
    proveedores: ["Movistar", "Digitel", "Movilnet"],
    placeholder: "0412-1234567",
    labelNumero: "Número de teléfono",
  },
  {
    id: "internet",
    nombre: "Internet / TV",
    Icon: Wifi,
    color: "text-tropico-purple",
    gradient: "from-tropico-purple/20 to-tropico-purple/5",
    proveedores: ["CANTV (Aba)", "Inter", "NetUno", "SuperCable", "DirecTV"],
    placeholder: "N° de contrato o cédula",
    labelNumero: "Número de contrato",
  },
  {
    id: "streaming",
    nombre: "Streaming",
    Icon: Play,
    color: "text-tropico-coral",
    gradient: "from-tropico-coral/15 to-tropico-purple/10",
    proveedores: ["Netflix", "Disney+", "Spotify", "HBO Max"],
    placeholder: "Email de la cuenta",
    labelNumero: "Email de la cuenta",
  },
  // Pago Móvil ya tiene su propio flow on top via Suiche7BScan (QR + manual).
  // Removido de esta grid para evitar duplicado y confusión.
];

type ReciboDemo = {
  proveedor: string;
  numero: string;
  monto: number;
  cedula?: string;
  txSig: string;
};

function mockTxSignature() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789";
  let s = "";
  for (let i = 0; i < 88; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function buildReciboMessage(r: ReciboDemo): string {
  const cedula = r.cedula ? `\nCédula: ${r.cedula}` : "";
  return (
    `🌴 Recibo Tropico\n\n` +
      `Pagaste $${r.monto.toFixed(2)} USDC a ${r.proveedor}\n` +
      `Cuenta: ${r.numero}${cedula}\n\n` +
      `Verificable on-chain:\nhttps://solscan.io/tx/${r.txSig}`
  );
}

function PagoModal({
  cat,
  onClose,
}: {
  cat: Categoria;
  onClose: () => void;
}) {
  const [proveedor, setProveedor] = useState(cat.proveedores[0]);
  const [numero, setNumero] = useState("");
  const [cedula, setCedula] = useState("");
  const [monto, setMonto] = useState(10);
  const [recibo, setRecibo] = useState<ReciboDemo | null>(null);

  const esPagoMovil = cat.id === "pago-movil";
  const esStreaming = cat.id === "streaming";

  function compartirWhatsApp() {
    if (!recibo) return;
    window.open(whatsappShareUrl(buildReciboMessage(recibo)), "_blank");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-tropico-ink/70 backdrop-blur-sm sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="panel relative flex w-full max-w-md flex-col gap-5 rounded-t-3xl p-6 sm:rounded-2xl">
        {/* Header modal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex size-10 items-center justify-center rounded-xl bg-tropico-ink/60 ${cat.color}`}>
              <cat.Icon className="size-5" strokeWidth={1.75} aria-hidden />
            </div>
            <h2 className="font-display text-xl font-bold">Pagar {cat.nombre}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-9 items-center justify-center rounded-lg border border-tropico-border text-tropico-mute transition hover:border-tropico-coral hover:text-tropico-coral"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Proveedor */}
        {cat.proveedores.length > 1 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-tropico-mute">Proveedor</label>
            <select
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              className="h-11 rounded-xl border border-tropico-border bg-tropico-ink px-3 text-sm text-tropico-text focus:border-tropico-sun focus:outline-none"
            >
              {cat.proveedores.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Número de servicio */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-tropico-mute">{cat.labelNumero}</label>
          <input
            type={esStreaming ? "email" : "text"}
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            placeholder={cat.placeholder}
            className="h-11 rounded-xl border border-tropico-border bg-tropico-ink px-3 text-sm text-tropico-text placeholder-tropico-mute/50 focus:border-tropico-sun focus:outline-none"
          />
        </div>

        {/* Cédula — solo para Pago Móvil */}
        {esPagoMovil && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-tropico-mute">Cédula del destinatario</label>
            <input
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              placeholder="V-12345678"
              className="h-11 rounded-xl border border-tropico-border bg-tropico-ink px-3 text-sm text-tropico-text placeholder-tropico-mute/50 focus:border-tropico-sun focus:outline-none"
            />
          </div>
        )}

        {/* Monto */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-tropico-mute">Monto en USD</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-tropico-mute">
              $
            </span>
            <input
              type="number"
              min={1}
              step={0.5}
              value={monto}
              onChange={(e) => setMonto(Math.max(0.5, Number(e.target.value)))}
              className="h-11 w-full rounded-xl border border-tropico-border bg-tropico-ink pl-7 pr-3 font-display text-lg font-bold tabular-nums text-tropico-text focus:border-tropico-sun focus:outline-none"
            />
          </div>
          <div className="pt-1">
            <DualPrice usd={monto} size="sm" />
          </div>
        </div>

        {/* CTA */}
        {recibo ? (
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-tropico-green/40 bg-tropico-green/10 p-4">
              <div className="flex items-center gap-2 font-display text-base font-bold text-tropico-green">
                <span aria-hidden>✅</span> Pago confirmado on-chain
              </div>
              <p className="mt-1 text-xs text-tropico-mute">
                ${recibo.monto.toFixed(2)} USDC a {recibo.proveedor} — cuenta {recibo.numero}.
              </p>
              <a
                href={`https://solscan.io/tx/${recibo.txSig}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-tropico-green hover:underline"
              >
                Ver en Solscan <ExternalLink className="size-3" />
              </a>
            </div>
            <button
              onClick={compartirWhatsApp}
              className="btn-primary flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold"
            >
              Compartir recibo por WhatsApp 📱
            </button>
            <button
              onClick={onClose}
              className="btn-ghost h-10 rounded-xl text-sm"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              if (!numero.trim()) {
                alert("Por favor escribe el número de servicio.");
                return;
              }
              setRecibo({
                proveedor,
                numero,
                monto,
                cedula: esPagoMovil ? cedula : undefined,
                txSig: mockTxSignature(),
              });
            }}
            className="btn-primary mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold"
          >
            Pagar con Tropico
            <ChevronRight className="size-4" strokeWidth={2.5} />
          </button>
        )}

        <p className="text-center text-[11px] text-tropico-mute">
          Demo hackathon — sin cargos reales. En producción vía agregador BCV-compliant.
        </p>
      </div>
    </div>
  );
}

export function PagarServiciosClient() {
  const [catActiva, setCatActiva] = useState<Categoria | null>(null);

  return (
    <>
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-bold">¿Qué quieres pagar?</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCatActiva(cat)}
              className={`panel group relative flex flex-col gap-3 overflow-hidden p-5 text-left transition hover:border-tropico-sun/30`}
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-60 transition group-hover:opacity-100`}
              />
              <div className="relative flex flex-col gap-2">
                <div className={`flex size-11 items-center justify-center rounded-xl bg-tropico-ink/60 ring-1 ring-tropico-sun/20 transition group-hover:ring-tropico-sun/50 ${cat.color}`}>
                  <cat.Icon className="size-5" strokeWidth={1.75} aria-hidden />
                </div>
                <h3 className="font-display text-lg font-bold leading-tight">{cat.nombre}</h3>
                <p className="text-xs leading-relaxed text-tropico-mute">
                  {cat.proveedores.join(" · ")}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {catActiva && (
        <PagoModal cat={catActiva} onClose={() => setCatActiva(null)} />
      )}
    </>
  );
}
