"use client";

import {
  ArrowLeftRight,
  Bot,
  ExternalLink,
  Fingerprint,
  Gift,
  MessageCircle,
  QrCode,
  Send,
  Shield,
  Sprout,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const CAPABILITIES = [
  {
    icon: Wallet,
    skill: "tropico-balances",
    name: "Saldos",
    desc: "Consulta SOL + SPL tokens de tu wallet en tiempo real via Helius RPC.",
    example: "¿Cuánto tengo en mi wallet?",
    cmd: "python lumen-capabilities/balances/get_balances.py --wallet <pubkey>",
    color: "sea",
  },
  {
    icon: TrendingUp,
    skill: "tropico-prices",
    name: "Precios",
    desc: "Cotización USD/VES y precio de cualquier token via ve.dolarapi.com + Jupiter Price API.",
    example: "¿Cuánto vale el dólar hoy?",
    cmd: "python lumen-capabilities/prices/precio_bs.py",
    color: "sun",
  },
  {
    icon: ArrowLeftRight,
    skill: "tropico-swap",
    name: "Swap",
    desc: "Quote real de Jupiter v6 + construcción de transacción con fee 0.5%.",
    example: "Cambia $50 de SOL a USDC",
    cmd: "python lumen-capabilities/swap/jupiter_quote.py --in SOL --out USDC --amount 50",
    color: "purple",
  },
  {
    icon: QrCode,
    skill: "tropico-pay",
    name: "Pago QR",
    desc: "Genera URL Solana Pay + QR para cobrar o pagar cualquier wallet.",
    example: "Genera un QR para cobrar $5",
    cmd: "python lumen-capabilities/pay/generate_qr.py --amount 5 --token USDC",
    color: "coral",
  },
  {
    icon: Sprout,
    skill: "tropico-yield",
    name: "Yield",
    desc: "Estrategias mSOL (Marinade) y Kamino USDC vault con APY estimado.",
    example: "¿Dónde puedo poner mi USDC a generar?",
    cmd: "python lumen-capabilities/yield/get_strategies.py",
    color: "green",
  },
  {
    icon: Gift,
    skill: "tropico-cashback",
    name: "Cashback",
    desc: "Saldo de cashback acumulado por compras en comercios Tropico afiliados.",
    example: "¿Cuánto cashback tengo acumulado?",
    cmd: "python lumen-capabilities/cashback/get_balance.py --wallet <pubkey>",
    color: "sun",
  },
  {
    icon: Bot,
    skill: "tropico-agent-actions",
    name: "Modo Agente",
    desc: "Orquesta las 4 acciones autónomas (DCA, auto-yield, cashback, rebalance) via OpenClaw.",
    example: "Activa DCA semanal de $50 a SOL",
    cmd: "# OpenClaw + Privy delegated session key (Q3 2026)",
    color: "purple",
  },
];

const COLOR_MAP: Record<
  string,
  { border: string; bg: string; text: string; badge: string }
> = {
  sea: {
    border: "border-tropico-sea/30",
    bg: "bg-tropico-sea/5",
    text: "text-tropico-sea",
    badge: "bg-tropico-sea/20 text-tropico-sea",
  },
  sun: {
    border: "border-tropico-sun/30",
    bg: "bg-tropico-sun/5",
    text: "text-tropico-sun",
    badge: "bg-tropico-sun/20 text-tropico-sun",
  },
  purple: {
    border: "border-tropico-purple/30",
    bg: "bg-tropico-purple/5",
    text: "text-tropico-purple",
    badge: "bg-tropico-purple/20 text-tropico-purple",
  },
  coral: {
    border: "border-tropico-coral/30",
    bg: "bg-tropico-coral/5",
    text: "text-tropico-coral",
    badge: "bg-tropico-coral/20 text-tropico-coral",
  },
  green: {
    border: "border-tropico-green/30",
    bg: "bg-tropico-green/5",
    text: "text-tropico-green",
    badge: "bg-tropico-green/20 text-tropico-green",
  },
};

const CANNED: Record<string, string> = {
  "¿Cuánto tengo en mi wallet?":
    "Mi pana, para ver tu saldo necesito que conectes tu wallet. Una vez conectada, consulto SOL + todos tus tokens SPL vía Helius RPC en menos de un segundo. ¿Le damos?",
  "¿Cuánto vale el dólar hoy?":
    "Ahorita el paralelo está en torno a Bs 53.40 por dólar (ve.dolarapi.com, actualizado hace 2 min). El SOL ronda los $148 USD. ¿Te ayudo a calcular cuánto tienes en bolívares?",
  "Cambia $50 de SOL a USDC":
    "Claro. Con Jupiter v6 el quote es ~$49.75 USDC después del fee (0.5% Tropico + spread del mercado). Para ejecutar el swap dale al botón Cambiar en el menú. ¿Algo más, panita?",
  "Activa DCA semanal de $50 a SOL":
    "¡Buena estrategia! El DCA semanal reduce el riesgo de comprar en el pico. Ve a Modo Agente → DCA y configura $50 a SOL cada 7 días. En Q3 se ejecuta automático; por ahora lo apruebas con un click. ¿Vamos?",
};

export default function GuacamaPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "guacama"; text: string }[]
  >([]);

  const hasApiKey =
    typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_HAS_GEMINI === "true" ||
      process.env.NEXT_PUBLIC_HAS_DEEPSEEK === "true");

  const send = async (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");

    if (!hasApiKey) {
      const canned =
        CANNED[text] ??
        "¡Epa! Para respuestas reales configura tu API key en .env.local. Por ahora estoy en modo demo. ¿Quieres que te muestre qué puedo hacer?";
      setMessages((prev) => [...prev, { role: "guacama", text: canned }]);
      return;
    }

    try {
      const res = await fetch("/api/guacama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: [],
          currentScreen: "guacama",
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "guacama", text: data.text ?? "Sin respuesta." },
      ]);
    } catch {
      console.log("[Guacama stub] prompt:", text);
      setMessages((prev) => [
        ...prev,
        {
          role: "guacama",
          text: "¡Epa! Algo salió mal conectando con el backend. Intenta de nuevo, panita.",
        },
      ]);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-5 py-10">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <header className="flex flex-col gap-3 pt-4">
        <Link
          href="/"
          className="w-fit text-sm text-tropico-mute transition hover:text-tropico-sun"
        >
          &larr; Volver
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-tropico-purple to-tropico-sea">
            <span className="text-2xl">🌴</span>
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">Guacama AI</h1>
            <p className="text-xs text-tropico-mute">
              Agente autónomo sobre Lumen Web3 Kit
            </p>
          </div>
        </div>
      </header>

      {/* ── Selector de modo — Agente vs Chatbot ────────────────── */}
      <section className="grid gap-3 md:grid-cols-2">
        {/* Modo Agente — destacado, gradient purple */}
        <Link
          href="/guacama/agente"
          className="panel group relative overflow-hidden border-tropico-purple/40 p-5 transition hover:border-tropico-purple"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-tropico-purple/25 via-tropico-coral/10 to-tropico-sun/10 opacity-80 transition group-hover:opacity-100" />
          <div className="relative flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-tropico-ink/70 text-tropico-purple ring-1 ring-tropico-purple/40">
                <Bot className="size-5" />
              </div>
              <span className="rounded-md bg-tropico-purple/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-tropico-purple">
                Único · Autónomo
              </span>
            </div>
            <div>
              <h3 className="font-display text-lg font-bold">Modo Agente</h3>
              <p className="mt-1 text-sm text-tropico-text/85">
                Guacama <strong>ejecuta acciones</strong> por ti con tus límites:
                DCA, auto-yield, rebalance, cashback. Tú diriges, él actúa.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-tropico-purple transition group-hover:translate-x-1">
              Configurar agente →
            </span>
          </div>
        </Link>

        {/* Modo Chat — secundario */}
        <a
          href="#guacama-chat"
          className="panel group relative overflow-hidden p-5 transition hover:border-tropico-sea/60"
        >
          <div className="relative flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-tropico-ink/70 text-tropico-sea ring-1 ring-tropico-sea/30">
                <MessageCircle className="size-5" />
              </div>
              <span className="rounded-md bg-tropico-sea/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-tropico-sea">
                Conversa
              </span>
            </div>
            <div>
              <h3 className="font-display text-lg font-bold">Modo Chat</h3>
              <p className="mt-1 text-sm text-tropico-text/85">
                Guacama <strong>te responde</strong> consultas en español:
                saldos, precios, qué es cada token, cómo armar un swap.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-tropico-sea transition group-hover:translate-x-1">
              Abrir chat ↓
            </span>
          </div>
        </a>
      </section>

      {/* ── Chat ───────────────────────────────────────────────── */}
      <section id="guacama-chat" className="panel flex flex-col gap-4 p-6">
        {/* Messages */}
        <div className="flex flex-col gap-3">
          <p className="text-tropico-text/90">
            ¡Epa, panita! Soy Guacama, tu copiloto en Solana. Pregúntame qué es
            cualquier token, cómo funciona el staking, o por qué Solana le pega
            a Ethereum. ¿En qué te ayudo?
          </p>
          {messages.map((m, i) => (
            <div
              key={`${m.role}-${i}-${m.text.slice(0, 16)}`}
              className={`rounded-xl px-4 py-3 text-sm ${
                m.role === "user"
                  ? "self-end bg-tropico-purple/20 text-tropico-text"
                  : "self-start bg-tropico-ink/60 text-tropico-text/90"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>

        {/* Input */}
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregúntame algo sobre Solana..."
            className="flex-1 rounded-xl border border-tropico-border bg-tropico-ink/60 px-4 py-3 text-sm text-tropico-text placeholder:text-tropico-mute focus:border-tropico-purple focus:outline-none"
          />
          <button
            type="submit"
            className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-tropico-purple text-white transition hover:bg-tropico-purple/80"
            aria-label="Enviar"
          >
            <Send className="size-4" />
          </button>
        </form>

        {/* Status bar */}
        <p className="text-center text-[11px] text-tropico-mute">
          Guacama corre sobre Lumen Web3 Kit — 1 KIT + 7 SKILLS + 8 capabilities
          Python.{" "}
          <span className="text-tropico-text/70">
            Modelo actual: DeepSeek-V4-flash via LiteLLM
          </span>
        </p>
      </section>

      {/* ── Quick prompts ──────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm uppercase tracking-wider text-tropico-mute">
          Prueba preguntarme…
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.keys(CANNED).map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => send(p)}
              className="rounded-full border border-tropico-border bg-tropico-panel px-3 py-1.5 text-sm transition hover:border-tropico-purple hover:text-tropico-text"
            >
              {p}
            </button>
          ))}
        </div>
      </section>

      {/* ── Las 7 capacidades ──────────────────────────────────── */}
      <section className="flex flex-col gap-5">
        <div>
          <h2 className="font-display text-2xl font-bold">
            Las 7 capacidades de Guacama
          </h2>
          <p className="mt-1 text-sm text-tropico-mute">
            Cada capacidad es un skill de Lumen respaldado por una capability
            Python real.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {CAPABILITIES.map((cap) => {
            const Icon = cap.icon;
            const c = COLOR_MAP[cap.color] ?? COLOR_MAP.sea;
            return (
              <div
                key={cap.skill}
                className={`flex flex-col gap-3 rounded-xl border p-4 ${c.border} ${c.bg}`}
              >
                <header className="flex items-center gap-2">
                  <Icon className={`size-5 ${c.text}`} />
                  <h3 className={`font-display text-base font-bold ${c.text}`}>
                    {cap.name}
                  </h3>
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-mono ${c.badge}`}
                  >
                    {cap.skill}
                  </span>
                </header>
                <p className="text-xs leading-relaxed text-tropico-mute">
                  {cap.desc}
                </p>
                <div className="rounded-lg bg-tropico-ink/60 px-3 py-2">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-tropico-mute">
                    Ejemplo de pregunta
                  </p>
                  <p className="text-xs italic text-tropico-text/80">
                    &ldquo;{cap.example}&rdquo;
                  </p>
                </div>
                <details className="group">
                  <summary className="cursor-pointer text-[10px] text-tropico-mute transition hover:text-tropico-text">
                    Ver capability subyacente ↓
                  </summary>
                  <code className="mt-1 block rounded bg-tropico-ink/80 px-3 py-2 text-[10px] text-tropico-text/70 font-mono break-all">
                    {cap.cmd}
                  </code>
                </details>
              </div>
            );
          })}
        </div>

        {/* Footer Lumen credit */}
        <div className="flex flex-col items-center gap-1 rounded-xl border border-tropico-purple/20 bg-tropico-purple/5 p-4 text-center">
          <p className="text-sm text-tropico-mute">
            Powered by{" "}
            <a
              href="https://github.com/lumen-agent/lumen"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-tropico-purple hover:underline"
            >
              Lumen
            </a>{" "}
            — framework open source de agentes en español.
          </p>
        </div>
      </section>

      {/* ── Guacama WhatsApp — demo interactivo ──────────────────── */}
      <Link
        href="/guacama/whatsapp"
        className="panel group relative overflow-hidden p-6 transition hover:border-tropico-green/50"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-tropico-green/10 via-transparent to-tropico-purple/10 opacity-70 transition group-hover:opacity-100" />
        <div className="relative flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-tropico-green/15 text-tropico-green">
                <MessageCircle className="size-6" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-xl font-bold">
                    Guacama por WhatsApp
                  </h3>
                  <span className="rounded-full bg-tropico-green/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-tropico-green">
                    Demo
                  </span>
                </div>
                <p className="text-sm text-tropico-mute">
                  Controla tu wallet con comandos de texto. "guacama saldo",
                  "guacama pagar 5 a 04141234567" — acciones on-chain requieren
                  aprobación biométrica en la app.
                </p>
              </div>
            </div>
            <span className="hidden shrink-0 text-sm font-semibold text-tropico-green/80 transition group-hover:translate-x-1 group-hover:text-tropico-green md:block">
              Probar →
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-start gap-2 rounded-lg border border-tropico-border bg-tropico-ink/40 p-3">
              <Fingerprint className="mt-0.5 size-4 shrink-0 text-tropico-green" />
              <div>
                <p className="text-xs font-semibold text-tropico-text">
                  Aprobación biométrica
                </p>
                <p className="text-[11px] text-tropico-mute">
                  Cada acción on-chain se confirma con Face ID. WhatsApp solo
                  conversa.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-tropico-border bg-tropico-ink/40 p-3">
              <Shield className="mt-0.5 size-4 shrink-0 text-tropico-purple" />
              <div>
                <p className="text-xs font-semibold text-tropico-text">
                  Las llaves no salen del teléfono
                </p>
                <p className="text-[11px] text-tropico-mute">
                  Privy MPC sigue al mando. WhatsApp es canal de UX, no de
                  custodia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </main>
  );
}
