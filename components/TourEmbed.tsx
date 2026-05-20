"use client";

import { ExternalLink, Video } from "lucide-react";

function safeHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

export function TourEmbed({ tourUrl, name }: { tourUrl: string; name: string }) {
  const fromLlave = /(^|\.)llave/i.test(safeHost(tourUrl));
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-tropico-mute">
          <Video className="size-3.5" />
          Tour 3D
          {fromLlave && (
            <span className="rounded-md bg-tropico-sea/15 px-1.5 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-tropico-sea">
              Llave
            </span>
          )}
        </span>
        <a
          href={tourUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-[11px] text-tropico-sea hover:underline"
        >
          Abrir en nueva pestaña <ExternalLink className="size-3" />
        </a>
      </div>
      <div className="relative overflow-hidden rounded-xl border border-tropico-border bg-tropico-ink/40">
        <div className="aspect-video w-full">
          <iframe
            src={tourUrl}
            title={`Tour 3D — ${name}`}
            className="size-full"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
