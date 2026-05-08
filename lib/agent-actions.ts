/**
 * Definición de las 4 acciones agentic de Carlos.
 *
 * En MVP están SIMULADAS. En producción Q3 van sobre arquitectura híbrida:
 *  - Hermes (Nous Research) para razonamiento + memoria + skill orchestration
 *  - OpenClaw + Privy delegated session keys para ejecución on-chain
 * Ver `docs/TROPICO_BRIEF.md` sección 23.
 *
 * Cada acción tiene:
 *  - id estable (para localStorage)
 *  - icon emoji y gradient (para UI)
 *  - título + descripción (para usuario)
 *  - configuración default
 *  - policy en producción (límites declarativos)
 *  - simulateExecution(): qué pasa cuando "se ejecuta" en demo
 */

import type { TokenSymbol } from "./tokens";

export type AgentActionId =
  | "dca-semanal"
  | "auto-yield-remesa"
  | "auto-cashback-claim"
  | "rebalance-portafolio";

export type AgentActionConfig =
  | DcaConfig
  | AutoYieldConfig
  | CashbackConfig
  | RebalanceConfig;

export type DcaConfig = {
  type: "dca-semanal";
  monto: number; // USD
  tokenDestino: TokenSymbol; // SOL/JTO/mSOL/JUP
  diaSemana: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = domingo
  hora: number; // 0-23
};

export type AutoYieldConfig = {
  type: "auto-yield-remesa";
  umbral: number; // USD a partir del cual disparar
  porcentaje: number; // % a mover (0-100)
  estrategia: "msol" | "kamino-usdc";
};

export type CashbackConfig = {
  type: "auto-cashback-claim";
  frecuencia: "semanal" | "mensual";
  umbralMinimo: number; // USD mínimo para reclamar
};

export type RebalanceConfig = {
  type: "rebalance-portafolio";
  tokenObjetivo: TokenSymbol;
  thresholdSubida: number; // % de subida que dispara
  ventanaDias: number; // días a observar
  porcentajeVender: number; // % del holding a vender
};

export type AgentAction = {
  id: AgentActionId;
  icon: string; // emoji
  gradient: string; // tailwind classes
  titulo: string;
  descripcionUsuario: string;
  policy: string; // resumen humano de límites en producción
  triggerProduccion: string;
  defaultConfig: AgentActionConfig;
};

/**
 * Catálogo de las 4 acciones disponibles.
 */
export const AGENT_ACTIONS: AgentAction[] = [
  {
    id: "dca-semanal",
    icon: "🗓️",
    gradient: "from-tropico-purple/30 to-tropico-green/10",
    titulo: "DCA semanal",
    descripcionUsuario:
      "Comprá automáticamente un monto fijo de un token cada semana. Te despreocupás de los picos del mercado.",
    policy: "Máximo $200/semana, máximo $50 por ejecución",
    triggerProduccion: "Cron semanal en Vercel",
    defaultConfig: {
      type: "dca-semanal",
      monto: 50,
      tokenDestino: "SOL",
      diaSemana: 1, // lunes
      hora: 10,
    } satisfies DcaConfig,
  },
  {
    id: "auto-yield-remesa",
    icon: "💰",
    gradient: "from-tropico-sea/30 to-tropico-green/10",
    titulo: "Auto-yield al recibir remesa",
    descripcionUsuario:
      "Cuando recibas más de un monto X (típicamente una remesa), Carlos mueve el excedente a Save automáticamente. Tu plata trabaja sola.",
    policy: "Máximo 1 ejecución por día, solo si saldo USDC > umbral",
    triggerProduccion: "Webhook on-chain del wallet del usuario",
    defaultConfig: {
      type: "auto-yield-remesa",
      umbral: 50,
      porcentaje: 70,
      estrategia: "msol",
    } satisfies AutoYieldConfig,
  },
  {
    id: "auto-cashback-claim",
    icon: "🎁",
    gradient: "from-tropico-sun/30 to-tropico-coral/10",
    titulo: "Auto-cashback de comercios",
    descripcionUsuario:
      "Reclamá automáticamente el cashback acumulado de comercios afiliados Tropico. Sin recordar manualmente.",
    policy: "Máximo $50 por claim, cooldown 24h",
    triggerProduccion: "Cron semanal o mensual según preferencia",
    defaultConfig: {
      type: "auto-cashback-claim",
      frecuencia: "semanal",
      umbralMinimo: 1,
    } satisfies CashbackConfig,
  },
  {
    id: "rebalance-portafolio",
    icon: "⚖️",
    gradient: "from-tropico-coral/30 to-tropico-purple/10",
    titulo: "Re-balance de portafolio",
    descripcionUsuario:
      "Si un token sube X% en Y días, vendé Z% a USDC para tomar ganancia. Disciplina automática.",
    policy: "Máximo 50% del holding, máximo 1 rebalance por token por semana",
    triggerProduccion: "Poll de precios cada 15 minutos vs holdings",
    defaultConfig: {
      type: "rebalance-portafolio",
      tokenObjetivo: "JTO",
      thresholdSubida: 20,
      ventanaDias: 7,
      porcentajeVender: 10,
    } satisfies RebalanceConfig,
  },
];

export function getAction(id: AgentActionId): AgentAction | undefined {
  return AGENT_ACTIONS.find((a) => a.id === id);
}

/**
 * Simula la ejecución de una acción para el demo del MVP.
 * Devuelve un resumen humano + datos para el histórico.
 *
 * En producción Q3 esto se reemplaza por una llamada real a la skill
 * de OpenClaw que firma con el delegated session key del usuario.
 * Hermes decide cuándo proponer/ejecutar; OpenClaw firma.
 */
export type SimulationResult = {
  exito: boolean;
  mensaje: string;
  detalle?: string;
  /** Cuando aplica, sugiere navegar a otra pantalla */
  navegarA?: string;
};

export function simulateExecution(
  action: AgentAction,
  config: AgentActionConfig
): SimulationResult {
  switch (config.type) {
    case "dca-semanal":
      return {
        exito: true,
        mensaje: `Ejecutando DCA: $${config.monto} USDC → ${config.tokenDestino}`,
        detalle:
          "En el demo, esto te lleva al módulo Cambiar con los parámetros pre-llenados. En producción, se ejecuta automático cada semana.",
        navegarA: `/cambiar?from=USDC&to=${config.tokenDestino}&amount=${config.monto}`,
      };

    case "auto-yield-remesa":
      const aMover = Math.round(config.umbral * 3 * (config.porcentaje / 100));
      return {
        exito: true,
        mensaje: `Moviendo $${aMover} a ${config.estrategia === "msol" ? "mSOL (Marinade)" : "Kamino USDC vault"}`,
        detalle: `Detección simulada de transfer entrante de $${config.umbral * 3}. Carlos sugiere mover el ${config.porcentaje}% del excedente a Save para generar ~5% APY.`,
      };

    case "auto-cashback-claim":
      const acumulado = 3.2; // simulado
      return {
        exito: true,
        mensaje: `Reclamados $${acumulado.toFixed(2)} de cashback`,
        detalle: `Acumulado de 4 comercios afiliados. Cashback transferido a tu wallet en USDC.`,
      };

    case "rebalance-portafolio":
      const valorVendido = 8; // simulado
      return {
        exito: true,
        mensaje: `Vendiendo 10% de ${config.tokenObjetivo} → USDC (~$${valorVendido})`,
        detalle: `${config.tokenObjetivo} subió ${config.thresholdSubida}%+ en los últimos ${config.ventanaDias} días. Tomando ganancia parcial según tu regla.`,
        navegarA: `/cambiar?from=${config.tokenObjetivo}&to=USDC&amount=${valorVendido}`,
      };
  }
}

/**
 * Formato humano del trigger (cuándo se ejecutaría) para mostrar al usuario.
 */
export function describeTrigger(config: AgentActionConfig): string {
  switch (config.type) {
    case "dca-semanal":
      const dias = ["domingos", "lunes", "martes", "miércoles", "jueves", "viernes", "sábados"];
      return `Cada ${dias[config.diaSemana]} a las ${String(config.hora).padStart(2, "0")}:00`;
    case "auto-yield-remesa":
      return `Cuando recibas más de $${config.umbral}`;
    case "auto-cashback-claim":
      return config.frecuencia === "semanal" ? "Cada semana" : "Cada mes";
    case "rebalance-portafolio":
      return `Si ${config.tokenObjetivo} sube +${config.thresholdSubida}% en ${config.ventanaDias} días`;
  }
}
