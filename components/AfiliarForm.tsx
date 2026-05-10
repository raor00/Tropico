"use client";

import { useState, type FormEvent } from "react";

const TIPOS = [
  { value: "bodega", label: "Bodega / Abasto" },
  { value: "restaurant", label: "Restaurant / Comida" },
  { value: "freelancer", label: "Freelancer / Servicios" },
  { value: "tienda-online", label: "Tienda online" },
  { value: "otro", label: "Otro" },
] as const;

export function AfiliarForm() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // En producción: POST a /api/comercios/afiliar
    // En MVP: guarda en localStorage + muestra success
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    if (typeof window !== "undefined") {
      const existing = JSON.parse(
        localStorage.getItem("tropico:waitlist:comercios") ?? "[]"
      );
      existing.push({ ...payload, fecha: new Date().toISOString() });
      localStorage.setItem(
        "tropico:waitlist:comercios",
        JSON.stringify(existing)
      );
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="panel flex flex-col gap-3 p-6 text-center">
        <div className="text-4xl">🌴</div>
        <h3 className="font-display text-2xl font-bold text-tropico-green">
          &iexcl;Listo, panita!
        </h3>
        <p className="text-tropico-mute">
          Te contactamos por WhatsApp en las próximas 24 horas con tu QR de cobro
          y el logo «Acepta Tropico» para tu local.
        </p>
        <p className="text-xs text-tropico-mute">
          Mientras tanto, dile a tus clientes que ya pueden pagarte con Tropico.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="panel flex flex-col gap-4 p-6">
      <div>
        <h3 className="font-display text-2xl font-bold">Afiliá tu negocio gratis</h3>
        <p className="text-sm text-tropico-mute">
          Sin contrato, sin papeles, sin RIF. 5 minutos máximo.
        </p>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-tropico-mute">Nombre del negocio</span>
        <input
          name="negocio"
          required
          maxLength={60}
          placeholder="Ej. Bodega La Esquina"
          className="rounded-lg border border-tropico-border bg-tropico-ink px-3 py-2 outline-none transition focus:border-tropico-purple"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-tropico-mute">Tu nombre</span>
        <input
          name="nombre"
          required
          maxLength={60}
          placeholder="Ej. María Pérez"
          className="rounded-lg border border-tropico-border bg-tropico-ink px-3 py-2 outline-none transition focus:border-tropico-purple"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-tropico-mute">Ciudad</span>
          <input
            name="ciudad"
            required
            placeholder="Ej. Caracas"
            className="rounded-lg border border-tropico-border bg-tropico-ink px-3 py-2 outline-none transition focus:border-tropico-purple"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-tropico-mute">Tipo de negocio</span>
          <select
            name="tipo"
            required
            className="rounded-lg border border-tropico-border bg-tropico-ink px-3 py-2 outline-none transition focus:border-tropico-purple"
          >
            <option value="">Elige uno</option>
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-tropico-mute">WhatsApp de contacto</span>
        <input
          name="whatsapp"
          required
          type="tel"
          placeholder="+58 412 555 1234"
          className="rounded-lg border border-tropico-border bg-tropico-ink px-3 py-2 outline-none transition focus:border-tropico-purple"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-tropico-mute">Email</span>
        <input
          name="email"
          required
          type="email"
          placeholder="tu@email.com"
          className="rounded-lg border border-tropico-border bg-tropico-ink px-3 py-2 outline-none transition focus:border-tropico-purple"
        />
      </label>

      <button type="submit" className="btn-primary mt-2">
        Afiliar mi negocio &rarr;
      </button>

      <p className="text-center text-xs text-tropico-mute">
        Cero costo de afiliación. Solo pagas 1% por cobro recibido.
      </p>
    </form>
  );
}
