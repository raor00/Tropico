"use client";

import {
  CheckCheck,
  ExternalLink,
  Fingerprint,
  Info,
  Mic,
  MoreVertical,
  Paperclip,
  Phone,
  Send,
  SmilePlus,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type MsgRole = "user" | "carlos";

type Message = {
  id: string;
  role: MsgRole;
  text: string;
  time: string;
  status?: "sent" | "delivered" | "read";
  action?: "approve";
  actionLabel?: string;
  approved?: boolean;
};

const MOCK_BALANCE = { usdc: 125.5, sol: 0.45, bs: 0 };
const MOCK_RATE_BS = 36.9;

function ts() {
  return new Date().toLocaleTimeString("es-VE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseCommand(raw: string): {
  type: "saldo" | "precio" | "pagar" | "cobrar" | "ayuda" | "unknown";
  amount?: number;
  phone?: string;
  for?: string;
} {
  const input = raw
    .toLowerCase()
    .trim()
    .replace(/^carlos\s*/i, "");

  if (/^saldo/.test(input)) return { type: "saldo" };
  if (/^precio(\s+bs)?$/.test(input)) return { type: "precio" };

  const pagarMatch = input.match(
    /^pagar\s+([\d.]+)\s+(?:usdc\s+)?a\s+(04\d{9}|\w+)/,
  );
  if (pagarMatch) {
    return {
      type: "pagar",
      amount: Number.parseFloat(pagarMatch[1]),
      phone: pagarMatch[2],
    };
  }

  const cobrarMatch = input.match(/^cobrar\s+([\d.]+)/);
  if (cobrarMatch) {
    return { type: "cobrar", amount: Number.parseFloat(cobrarMatch[1]) };
  }

  if (/^(ayuda|help|\?)/.test(input)) return { type: "ayuda" };

  return { type: "unknown" };
}

function buildResponse(cmd: ReturnType<typeof parseCommand>): Partial<Message> {
  switch (cmd.type) {
    case "saldo":
      return {
        text: `Tu saldo actual 💰\n\n*USDC:* ${MOCK_BALANCE.usdc.toFixed(2)} USDC\n*SOL:* ${MOCK_BALANCE.sol.toFixed(4)} SOL\n\nEquivalente total: ~$${(MOCK_BALANCE.usdc + MOCK_BALANCE.sol * 155).toFixed(2)} USD`,
      };
    case "precio":
      return {
        text: `Tasa de cambio actual 📊\n\n*BCV oficial:* ${MOCK_RATE_BS.toFixed(2)} Bs/USD\n*Tasa Tropico:* ${(MOCK_RATE_BS * 1.015).toFixed(2)} Bs/USD (BCV+1.5%)\n\n_Actualizado ahora mismo_`,
      };
    case "pagar":
      return {
        text: `Pago pendiente de aprobación 🔐\n\n*Destinatario:* ${cmd.phone}\n*Monto:* ${cmd.amount?.toFixed(2)} USDC\n*Equivale a:* ${((cmd.amount ?? 0) * MOCK_RATE_BS * 1.015).toFixed(2)} Bs aprox\n\nNecesito tu aprobación biométrica para ejecutar. Toca el botón de abajo ↓`,
        action: "approve",
        actionLabel: `Aprobar pago de ${cmd.amount?.toFixed(2)} USDC`,
      };
    case "cobrar":
      return {
        text: `Link de cobro creado ✅\n\n*Monto:* ${cmd.amount?.toFixed(2)} USDC\n*Link:* tropico.app/claim/${Date.now().toString(36)}?monto=${cmd.amount}\n\n_Comparte este link para recibir el pago_`,
      };
    case "ayuda":
      return {
        text: `Comandos disponibles 📋\n\n*carlos saldo* — ver tu balance\n*carlos precio bs* — tasa BCV actual\n*carlos pagar 5 a 04141234567* — enviar USDC\n*carlos cobrar 10* — generar link de cobro\n\n_Escribe sin "carlos" también funciona_`,
      };
    default:
      return {
        text: `No entendí ese comando 🤔\n\nEscribe *carlos ayuda* para ver qué puedo hacer.`,
      };
  }
}

const DEMO_HISTORY: Message[] = [
  {
    id: "d1",
    role: "user",
    text: "carlos saldo",
    time: "09:14",
    status: "read",
  },
  {
    id: "d2",
    role: "carlos",
    text: "Tu saldo actual 💰\n\n*USDC:* 125.50 USDC\n*SOL:* 0.4500 SOL\n\nEquivalente total: ~$195.25 USD",
    time: "09:14",
  },
  {
    id: "d3",
    role: "user",
    text: "carlos pagar 10 a 04141234567",
    time: "09:15",
    status: "read",
  },
  {
    id: "d4",
    role: "carlos",
    text: "Pago pendiente de aprobación 🔐\n\n*Destinatario:* 04141234567\n*Monto:* 10.00 USDC\n*Equivale a:* 374.54 Bs aprox\n\nNecesito tu aprobación biométrica para ejecutar. Toca el botón de abajo ↓",
    time: "09:15",
    action: "approve",
    actionLabel: "Aprobar pago de 10.00 USDC",
    approved: true,
  },
];

function renderText(text: string) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*[^*]+\*)/g).map((part, j) =>
      part.startsWith("*") && part.endsWith("*") ? (
        <strong key={j}>{part.slice(1, -1)}</strong>
      ) : part.startsWith("_") && part.endsWith("_") ? (
        <em key={j} className="text-white/60">
          {part.slice(1, -1)}
        </em>
      ) : (
        <span key={j}>{part}</span>
      ),
    );
    return (
      <span key={i} className={i > 0 ? "block" : ""}>
        {parts}
      </span>
    );
  });
}

export default function WhatsAppDemoPage() {
  const [messages, setMessages] = useState<Message[]>(DEMO_HISTORY);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function send() {
    const raw = input.trim();
    if (!raw) return;
    setInput("");

    const userMsg: Message = {
      id: `u${Date.now()}`,
      role: "user",
      text: raw,
      time: ts(),
      status: "read",
    };
    setMessages((m) => [...m, userMsg]);
    setTyping(true);

    const cmd = parseCommand(raw);
    const responseDelay = cmd.type === "pagar" ? 1800 : 1000;

    setTimeout(() => {
      const { text, action, actionLabel } = buildResponse(cmd);
      const carlosMsg: Message = {
        id: `c${Date.now()}`,
        role: "carlos",
        text: text ?? "...",
        time: ts(),
        action,
        actionLabel,
      };
      setMessages((m) => [...m, carlosMsg]);
      setTyping(false);
    }, responseDelay);
  }

  function handleApprove(id: string) {
    setMessages((m) =>
      m.map((msg) => (msg.id === id ? { ...msg, approved: true } : msg)),
    );
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: `c${Date.now()}`,
          role: "carlos",
          text: "✅ Pago ejecutado on-chain\n\n*Tx:* DemoABCD...1234\n*Status:* Confirmado\n\n_Ver en Solscan_",
          time: ts(),
        },
      ]);
      setTyping(false);
    }, 2200);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#0a0a14]">
      {/* WA top bar */}
      <header className="flex items-center gap-3 bg-[#1f2937] px-4 py-3 shadow">
        <Link
          href="/carlos"
          className="text-tropico-mute hover:text-tropico-sun"
        >
          ←
        </Link>
        <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-tropico-purple to-tropico-sea text-sm font-black text-white">
          C
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">Carlos AI</p>
          <p className="text-[10px] text-green-400">en línea</p>
        </div>
        <div className="flex items-center gap-4 text-tropico-mute">
          <Video className="size-5" />
          <Phone className="size-5" />
          <MoreVertical className="size-5" />
        </div>
      </header>

      {/* Concept banner */}
      <div className="flex items-start gap-3 border-b border-tropico-border bg-tropico-purple/10 px-4 py-3">
        <Info className="mt-0.5 size-4 shrink-0 text-tropico-purple" />
        <p className="text-[11px] text-tropico-mute">
          <strong className="text-tropico-text">Demo WhatsApp Bot — </strong>
          Carlos escucha comandos vía WhatsApp Cloud API. Acciones que mueven
          fondos requieren aprobación biométrica en la app. Producción Q3 2026.
        </p>
      </div>

      {/* WA wallpaper chat area */}
      <div
        className="flex-1 overflow-y-auto px-3 py-4"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(139,92,246,0.05) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(56,189,248,0.04) 0%, transparent 60%), #0f1117",
        }}
      >
        {/* Date chip */}
        <div className="mb-4 flex justify-center">
          <span className="rounded-full bg-[#1f2937]/80 px-3 py-1 text-[10px] text-white/50">
            Hoy
          </span>
        </div>

        {/* Commands hint */}
        <div className="mx-auto mb-4 flex max-w-[80%] justify-center">
          <div className="rounded-xl bg-[#1f2937]/80 px-4 py-3 text-[11px] text-white/50 text-center leading-relaxed">
            Prueba:{" "}
            <span className="text-green-300 font-mono">carlos saldo</span> ·{" "}
            <span className="text-green-300 font-mono">carlos precio bs</span> ·{" "}
            <span className="text-green-300 font-mono">
              carlos pagar 5 a 04141234567
            </span>{" "}
            · <span className="text-green-300 font-mono">carlos cobrar 10</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              msg={msg}
              onApprove={() => handleApprove(msg.id)}
            />
          ))}

          {typing && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-tl-none bg-[#262d3d] px-4 py-3 shadow">
                <div className="flex items-center gap-1">
                  <span className="size-1.5 animate-bounce rounded-full bg-white/40 [animation-delay:0ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-white/40 [animation-delay:150ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-white/40 [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-2 bg-[#1f2937] px-3 py-2.5">
        <button type="button" className="text-white/50">
          <SmilePlus className="size-6" />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Escribe un mensaje"
          className="flex-1 rounded-full bg-[#2d3748] px-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none"
        />
        {input ? (
          <button
            type="button"
            onClick={send}
            className="flex size-10 items-center justify-center rounded-full bg-green-600 text-white transition hover:bg-green-500"
          >
            <Send className="size-5" />
          </button>
        ) : (
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full bg-green-600 text-white"
          >
            <Mic className="size-5" />
          </button>
        )}
      </div>
    </div>
  );
}

function ChatBubble({
  msg,
  onApprove,
}: { msg: Message; onApprove: () => void }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${
          isUser
            ? "rounded-tr-none bg-[#0f4c2f] text-white"
            : "rounded-tl-none bg-[#262d3d] text-white"
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {renderText(msg.text)}
        </p>

        {msg.action === "approve" && !msg.approved && (
          <button
            type="button"
            onClick={onApprove}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-tropico-purple/20 border border-tropico-purple/40 px-4 py-2.5 text-sm font-semibold text-tropico-purple transition hover:bg-tropico-purple/30"
          >
            <Fingerprint className="size-4" />
            {msg.actionLabel ?? "Aprobar con biométrico"}
          </button>
        )}

        {msg.action === "approve" && msg.approved && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-green-400">
            <CheckCheck className="size-3.5" />
            Aprobado con biométrico
          </div>
        )}

        {msg.text.includes("Ver en Solscan") && (
          <a
            href="https://solscan.io"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-[11px] text-green-400 hover:underline"
          >
            Ver en Solscan <ExternalLink className="size-3" />
          </a>
        )}

        <div
          className={`mt-1 flex items-center gap-1 ${isUser ? "justify-end" : "justify-start"}`}
        >
          <span className="text-[9px] text-white/40">{msg.time}</span>
          {isUser && msg.status === "read" && (
            <CheckCheck className="size-3 text-blue-400" />
          )}
        </div>
      </div>
    </div>
  );
}
