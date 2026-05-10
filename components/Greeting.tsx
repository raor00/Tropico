"use client";

import { useEffect, useState } from "react";
import { getCaracasHour, getGreeting } from "@/lib/greeting";
import { getDisplayName } from "@/lib/profile-store";
import { useT } from "@/lib/i18n/context";
import { useWalletAuth } from "@/lib/auth-context";

/**
 * Saludo sutil arriba del saldo. Hora Caracas (no del device).
 * Re-render cada minuto para que el saludo cambie de día/tarde/noche.
 */
export function Greeting() {
  const { lang } = useT();
  const { pubkey } = useWalletAuth();
  const [hour, setHour] = useState<number>(() => getCaracasHour());
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setHour(getCaracasHour());
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setName(getDisplayName(pubkey));
    function onStorage(e: StorageEvent) {
      if (e.key?.startsWith("tropico:profile:")) {
        setName(getDisplayName(pubkey));
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [pubkey]);

  const greeting = getGreeting(lang, hour);
  const display = name ? `${greeting}, ${name}` : greeting;

  return (
    <div className="flex items-baseline gap-2 px-1">
      <span className="text-sm font-medium text-tropico-mute md:text-base">
        {display}
      </span>
      <span className="text-xs text-tropico-mute/60" aria-label="Hora Caracas">
        · Caracas
      </span>
    </div>
  );
}
