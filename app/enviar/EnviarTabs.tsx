"use client";

import { useState } from "react";
import { Link as LinkIcon, QrCode, Wallet } from "lucide-react";
import { SendForm } from "@/components/SendForm";
import { SendToAddressEntry } from "@/components/SendToAddressPrivy";
import { PagarComercioBsEntry } from "@/components/PagarComercioBsEntry";

type Tab = "comercio" | "address" | "claim";

export function EnviarTabs() {
  // Comercio (Bs) primero — caso de uso principal VE (escanear QR + pagar Pago Móvil)
  const [tab, setTab] = useState<Tab>("comercio");

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2 rounded-xl border border-tropico-border bg-tropico-ink/40 p-1.5">
        <button
          type="button"
          onClick={() => setTab("comercio")}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition ${
            tab === "comercio"
              ? "bg-tropico-sun text-tropico-ink shadow-sm shadow-tropico-sun/30"
              : "text-tropico-mute hover:text-tropico-sun"
          }`}
        >
          <QrCode className="size-4" />
          A comercio (Bs)
        </button>
        <button
          type="button"
          onClick={() => setTab("address")}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition ${
            tab === "address"
              ? "bg-tropico-sea text-tropico-ink shadow-sm shadow-tropico-sea/30"
              : "text-tropico-mute hover:text-tropico-sea"
          }`}
        >
          <Wallet className="size-4" />
          A wallet
        </button>
        <button
          type="button"
          onClick={() => setTab("claim")}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition ${
            tab === "claim"
              ? "bg-tropico-purple text-white shadow-sm shadow-tropico-purple/30"
              : "text-tropico-mute hover:text-tropico-purple"
          }`}
        >
          <LinkIcon className="size-4" />
          Claim link
        </button>
      </div>

      {tab === "comercio" && <PagarComercioBsEntry />}
      {tab === "address" && <SendToAddressEntry />}
      {tab === "claim" && <SendForm />}
    </div>
  );
}
