"use client";

import { useState } from "react";
import { Wallet, Link as LinkIcon } from "lucide-react";
import { SendForm } from "@/components/SendForm";
import { SendToAddressEntry } from "@/components/SendToAddressPrivy";

type Tab = "address" | "claim";

export function EnviarTabs() {
  const [tab, setTab] = useState<Tab>("address");

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-tropico-border bg-tropico-ink/40 p-1.5">
        <button
          onClick={() => setTab("address")}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition ${
            tab === "address"
              ? "bg-tropico-sea text-tropico-ink shadow-sm shadow-tropico-sea/30"
              : "text-tropico-mute hover:text-tropico-sea"
          }`}
        >
          <Wallet className="size-4" />
          A wallet (address)
        </button>
        <button
          onClick={() => setTab("claim")}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition ${
            tab === "claim"
              ? "bg-tropico-sun text-tropico-ink shadow-sm shadow-tropico-sun/30"
              : "text-tropico-mute hover:text-tropico-sun"
          }`}
        >
          <LinkIcon className="size-4" />
          Claim link (sin wallet)
        </button>
      </div>

      {tab === "address" ? <SendToAddressEntry /> : <SendForm />}
    </div>
  );
}
