"use client";

import { useState } from "react";
import { ArrowLeftRight, Banknote } from "lucide-react";
import { SwapForm } from "@/components/SwapForm";
import { BsSwapForm } from "@/components/BsSwapForm";

type Tab = "tokens" | "bolivares";

export function CambiarTabs() {
  const [tab, setTab] = useState<Tab>("tokens");

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-tropico-border bg-tropico-ink/40 p-1.5">
        <button
          onClick={() => setTab("tokens")}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition ${
            tab === "tokens"
              ? "bg-tropico-sun text-tropico-ink shadow-sm shadow-tropico-sun/30"
              : "text-tropico-mute hover:text-tropico-sun"
          }`}
        >
          <ArrowLeftRight className="size-4" />
          Tokens (Jupiter)
        </button>
        <button
          onClick={() => setTab("bolivares")}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition ${
            tab === "bolivares"
              ? "bg-tropico-sea text-tropico-ink shadow-sm shadow-tropico-sea/30"
              : "text-tropico-mute hover:text-tropico-sea"
          }`}
        >
          <Banknote className="size-4" />
          Bolívares ↔ USDC
        </button>
      </div>

      {tab === "tokens" ? <SwapForm /> : <BsSwapForm />}
    </div>
  );
}
