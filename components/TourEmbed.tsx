"use client";

import Script from "next/script";
import { createElement } from "react";
import { ExternalLink, Video } from "lucide-react";

function safeHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

export function TourEmbed({
  tourUrl,
  tourModelUrl,
  name,
}: {
  tourUrl: string;
  tourModelUrl?: string;
  name: string;
}) {
  // El tour 3D de Llave es un modelo .glb hospedado en su backend (Supabase).
  // Si existe, lo renderizamos solo (sin el chrome de Llave) y marcamos el origen.
  const fromLlave =
    /(^|\.)llave/i.test(safeHost(tourUrl)) || Boolean(tourModelUrl);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-tropico-mute">
          <Video className="size-3.5" />
          Tour 3D
          {fromLlave && (
            <span className="rounded-md bg-tropico-sea/15 px-1.5 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-tropico-sea">
              por Llave
            </span>
          )}
        </span>
        <a
          href={tourUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-[11px] text-tropico-sea hover:underline"
        >
          {fromLlave ? "Ver en Llave" : "Abrir en nueva pestaña"}{" "}
          <ExternalLink className="size-3" />
        </a>
      </div>
      <div className="relative overflow-hidden rounded-xl border border-tropico-border bg-tropico-ink/40">
        <div className="aspect-video w-full">
          {tourModelUrl ? (
            <>
              <Script
                type="module"
                src="https://unpkg.com/@google/model-viewer@4.0.0/dist/model-viewer.min.js"
                strategy="afterInteractive"
              />
              {createElement("model-viewer", {
                src: tourModelUrl,
                alt: `Tour 3D — ${name}`,
                "camera-controls": true,
                "auto-rotate": true,
                "touch-action": "pan-y",
                "shadow-intensity": "1",
                exposure: "1",
                style: { width: "100%", height: "100%", backgroundColor: "transparent" },
              })}
            </>
          ) : (
            <iframe
              src={tourUrl}
              title={`Tour 3D — ${name}`}
              className="size-full"
              allowFullScreen
              loading="lazy"
            />
          )}
        </div>
      </div>
      {fromLlave && (
        <p className="text-[10px] text-tropico-mute">
          Modelo 3D provisto por{" "}
          <a
            href="https://llave-ruby.vercel.app"
            target="_blank"
            rel="noreferrer"
            className="text-tropico-sea hover:underline"
          >
            Llave
          </a>{" "}
          — alquiler sin depósitos ni comisiones.
        </p>
      )}
    </div>
  );
}
