import { NextResponse } from "next/server";
import { GUACAMA_SYSTEM_PROMPT } from "@/lib/guacama-prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/guacama
 *
 * Endpoint del chat de Guacama AI by Lumen. Provider priority:
 *   1. DEEPSEEK_API_KEY  → DeepSeek-V4 chat (recomendado, OpenAI-compatible)
 *   2. GEMINI_API_KEY    → Gemini 2.0 Flash
 *   3. ninguna           → smart fallback (keyword-routed canned answers)
 *
 * Body:
 *   {
 *     message: string,                                  // pregunta del usuario
 *     history?: { role: "user" | "guacama", text }[],    // últimos turnos
 *     currentScreen?: string                            // contexto UI (guacama|home|cobrar|...)
 *   }
 *
 * Response:
 *   { text: string, model: string, capabilitiesUsed?: string[] }
 */
export async function POST(req: Request) {
  let body: {
    message?: string;
    history?: { role: "user" | "guacama"; text: string }[];
    currentScreen?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Body debe ser JSON válido" },
      { status: 400 }
    );
  }

  const message = (body.message ?? "").trim();
  if (!message) {
    return NextResponse.json(
      { error: "missing_message", message: "Falta `message` en el body" },
      { status: 400 }
    );
  }

  const history = body.history ?? [];
  const screen = body.currentScreen ?? "guacama";
  const contextNote = `Pantalla actual del usuario: /${screen}.`;

  // Provider priority: DeepSeek → Gemini → fallback
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  try {
    if (deepseekKey) {
      const text = await callDeepseek({ message, history, contextNote, apiKey: deepseekKey });
      return NextResponse.json({ text, model: "deepseek-chat" });
    }
    if (geminiKey) {
      const text = await callGemini({ message, history, contextNote, apiKey: geminiKey });
      return NextResponse.json({ text, model: "gemini-2.0-flash" });
    }
  } catch (err) {
    console.error("[guacama] LLM call failed:", err);
    // cae a fallback en lugar de tirar 500 — mejor UX
  }

  // Sin LLM configurado → smart fallback
  const fallback = smartFallback(message);
  return NextResponse.json({
    text: fallback.text,
    model: "fallback",
    capabilitiesUsed: fallback.capabilities,
  });
}

/* ─────────────────────────────────────────────────────────────────── */
/* Provider: DeepSeek (OpenAI-compatible)                              */
/* ─────────────────────────────────────────────────────────────────── */
async function callDeepseek(opts: {
  message: string;
  history: { role: "user" | "guacama"; text: string }[];
  contextNote: string;
  apiKey: string;
}): Promise<string> {
  const messages = [
    { role: "system" as const, content: GUACAMA_SYSTEM_PROMPT },
    { role: "system" as const, content: opts.contextNote },
    ...opts.history.map((m) => ({
      role: m.role === "guacama" ? ("assistant" as const) : ("user" as const),
      content: m.text,
    })),
    { role: "user" as const, content: opts.message },
  ];

  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      temperature: 0.6,
      max_tokens: 600,
      stream: false,
    }),
  });

  if (!res.ok) throw new Error(`DeepSeek HTTP ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() ?? "Sin respuesta del modelo.";
}

/* ─────────────────────────────────────────────────────────────────── */
/* Provider: Gemini 2.0 Flash                                          */
/* ─────────────────────────────────────────────────────────────────── */
async function callGemini(opts: {
  message: string;
  history: { role: "user" | "guacama"; text: string }[];
  contextNote: string;
  apiKey: string;
}): Promise<string> {
  // Gemini concatena system + history + user en `contents`
  const contents = [
    {
      role: "user" as const,
      parts: [{ text: `${GUACAMA_SYSTEM_PROMPT}\n\n${opts.contextNote}` }],
    },
    ...opts.history.map((m) => ({
      role: m.role === "guacama" ? ("model" as const) : ("user" as const),
      parts: [{ text: m.text }],
    })),
    { role: "user" as const, parts: [{ text: opts.message }] },
  ];

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${opts.apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature: 0.6, maxOutputTokens: 600 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as {
    candidates?: { content: { parts: { text: string }[] } }[];
  };
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
    "Sin respuesta del modelo."
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/* Smart fallback — keyword routing a respuestas con voz Guacama        */
/* ─────────────────────────────────────────────────────────────────── */
function smartFallback(message: string): { text: string; capabilities: string[] } {
  const m = message.toLowerCase();

  // Saldos
  if (/(salao|saldo|balance|cuanto tengo|cuánto tengo)/.test(m)) {
    return {
      capabilities: ["tropico-balances"],
      text: "Para ver tu saldo real necesitas conectar tu wallet con Privy o el modo dev. Capability: `tropico-balances` consulta SOL + SPL via Helius RPC. Configura `NEXT_PUBLIC_PRIVY_APP_ID` o usa el toggle Modo dev (devnet) en cualquier CTA. ¿Te muestro?",
    };
  }
  // Precios
  if (/(precio|cotiz|d(ó|o)lar|bs|bol(í|i)var|paralelo)/.test(m)) {
    return {
      capabilities: ["tropico-prices"],
      text: "Capability `tropico-prices` lee la tasa USD/Bs del paralelo via ve.dolarapi.com y precios de tokens via Jupiter Price API. Para LLM real configura `DEEPSEEK_API_KEY` o `GEMINI_API_KEY` en .env.local — ahí Guacama te explica con contexto del momento. ¿Configuras?",
    };
  }
  // Swap
  if (/(swap|cambia|cambiar|intercambi|jupiter)/.test(m)) {
    return {
      capabilities: ["tropico-swap"],
      text: "Para swaps reales abre `/cambiar` — usa Jupiter v6 con fee 0.5% (`platformFeeBps=50`). Capability: `tropico-swap` arma quote + tx. La fee aterriza en el ATA del treasury de Tropico. ¿Vamos a Cambiar?",
    };
  }
  // Pago / QR
  if (/(qr|cobr|pago|recibir)/.test(m)) {
    return {
      capabilities: ["tropico-pay"],
      text: "Capability `tropico-pay` genera URL Solana Pay + QR. Para cobrar abre `/cobrar`. Para integrar en tu app abre `/integraciones` (REST API + drop-in JS + hosted checkout). Modelo de fee HACIA ARRIBA: cliente paga el fee, merchant recibe el precio exacto. ¿Qué prefieres?",
    };
  }
  // Yield
  if (/(yield|ahorr|rendimi|m?sol|kamino|interes|interés|apy)/.test(m)) {
    return {
      capabilities: ["tropico-yield"],
      text: "Capability `tropico-yield` muestra estrategias: mSOL ~7%, Kamino USDC ~5%, Kamino LP ~12%. Yield ON por default en `/guardar`. Recuerda: APY estimados, no garantizados — el precio del token puede subir o bajar. Es non-custodial: tu plata sigue siendo tuya.",
    };
  }
  // Cashback
  if (/(cashback|recompens)/.test(m)) {
    return {
      capabilities: ["tropico-cashback"],
      text: "Capability `tropico-cashback` lee tu acumulado en comercios afiliados. Reclámalo manual o activa Modo Agente → auto-cashback semanal. En `/guacama/agente` lo configuras con policy (max $50 por claim, cooldown 24h).",
    };
  }
  // Modo Agente
  if (/(agente|dca|autom|programad|recurr)/.test(m)) {
    return {
      capabilities: ["tropico-agent-actions"],
      text: "Modo Agente vive en `/guacama/agente`. 4 acciones: DCA semanal · auto-yield al recibir remesa · auto-cashback claim · re-balance de portafolio. En MVP se ejecutan manual con un click. Q3 2026 van sobre OpenClaw + Privy delegated session keys. ¿Las configuro?",
    };
  }
  // Política / prohibido
  if (/(pol(í|i)tica|gobierno|maduro|chavez|sanci(o|ó)n|bcv)/.test(m)) {
    return {
      capabilities: [],
      text: "De política no hablamos por aquí, panita. Pero te puedo ayudar con cómo el USDC te protege contra la inflación. ¿Vemos?",
    };
  }
  // Genérico
  return {
    capabilities: [],
    text: `¡Epa! Estoy en modo fallback (sin LLM real). Para chat completo configura \`DEEPSEEK_API_KEY\` o \`GEMINI_API_KEY\` en .env.local. Mientras tanto, prueba preguntas tipo "¿cuánto vale el dólar?", "cómo funciona el swap?", "muéstrame yield". O abre Modo Agente en /guacama/agente.`,
  };
}

export async function GET() {
  return NextResponse.json({
    name: "Guacama AI by Lumen",
    version: "0.1.0",
    providers: {
      deepseek: Boolean(process.env.DEEPSEEK_API_KEY),
      gemini: Boolean(
        process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
      ),
    },
    capabilities: [
      "tropico-balances",
      "tropico-prices",
      "tropico-swap",
      "tropico-pay",
      "tropico-yield",
      "tropico-cashback",
      "tropico-agent-actions",
    ],
    docs: "/docs/GUACAMA_AI.md",
  });
}
