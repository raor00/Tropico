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

  return (
    <div className="flex flex-col gap-0.5 px-1">
      <h2 className="font-display text-xl font-bold leading-tight text-tropico-text md:text-2xl">
        {greeting}{name ? "," : ""}
        {name && (
          <span className="bg-gradient-to-r from-tropico-sun via-tropico-coral to-tropico-purple bg-clip-text text-transparent">
            {" "}{name}
          </span>
        )}
      </h2>
    </div>
  );
}
