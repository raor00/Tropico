"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown, Wallet, AlertTriangle } from "lucide-react";
import { hasLocalWallet } from "@/lib/wallet-local";

/**
 * InAppPreviewBanner — banner que aparece en pages "marketing" (/comercios,
 * /remesas, /integraciones) cuando el user YA tiene wallet activa.
 *
 * Indica que está viendo la versión marketing/landing pero puede usar
 * la app directamente. Banner amarillo con CTA + nota de que es demo.
 */
export function InAppPreviewBanner({
  modulo,
  appHref,
  appLabel,
}: {
  modulo: string;
  appHref: string;
  appLabel: string;
}) {
  const [hasWallet, setHasWallet] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const h = hasLocalWallet() || !!localStorage.getItem("tropico:dev-wallet");
    setHasWallet(h);
  }, []);

  if (!mounted || !hasWallet) return null;

  return (
    <section className="panel sticky top-20 z-30 flex flex-col gap-3 border-tropico-sun/40 bg-tropico-sun/10 p-4 backdrop-blur-md md:flex-row md:items-center md:gap-4">
      <div className="flex shrink-0 items-center gap-2">
        <AlertTriangle className="size-4 text-tropico-sun" />
        <span className="text-xs font-bold uppercase tracking-wider text-tropico-sun">
          Demo del hackathon
        </span>
      </div>
      <p className="flex-1 text-xs text-tropico-mute">
        Estos datos de <strong className="text-tropico-text">{modulo}</strong> son
        simulados — parte de la escalabilidad del proyecto. En producción Q3 2026
        conectamos con partners reales. Mientras tanto puedes probar el flow de la
        app:
      </p>
      <Link
        href={appHref}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-tropico-sun px-4 py-2 text-xs font-bold text-tropico-ink transition hover:opacity-90"
      >
        <Wallet className="size-4" />
        {appLabel}
      </Link>
    </section>
  );
}
