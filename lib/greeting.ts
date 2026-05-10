/**
 * Saludo según hora local de Caracas (America/Caracas = UTC-4).
 *
 * Usamos Intl.DateTimeFormat para sacar la hora en zona Caracas
 * independientemente del timezone del usuario (importante para diáspora).
 */

export type GreetingPeriod = "morning" | "afternoon" | "evening" | "night";

export function getCaracasHour(): number {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Caracas",
      hour: "numeric",
      hour12: false,
    });
    const parts = fmt.formatToParts(new Date());
    const h = parts.find((p) => p.type === "hour")?.value;
    return h ? parseInt(h, 10) : new Date().getHours();
  } catch {
    return new Date().getHours();
  }
}

export function getGreetingPeriod(hour: number = getCaracasHour()): GreetingPeriod {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 19) return "afternoon";
  if (hour >= 19 && hour < 23) return "evening";
  return "night";
}

const GREETINGS: Record<GreetingPeriod, { es: string; en: string; pt: string; fr: string }> = {
  morning: {
    es: "Buenos días",
    en: "Good morning",
    pt: "Bom dia",
    fr: "Bonjour",
  },
  afternoon: {
    es: "Buenas tardes",
    en: "Good afternoon",
    pt: "Boa tarde",
    fr: "Bon après-midi",
  },
  evening: {
    es: "Buenas noches",
    en: "Good evening",
    pt: "Boa noite",
    fr: "Bonsoir",
  },
  night: {
    es: "Buenas noches",
    en: "Good night",
    pt: "Boa noite",
    fr: "Bonne nuit",
  },
};

export function getGreeting(
  lang: "es" | "en" | "pt" | "fr" = "es",
  hour: number = getCaracasHour()
): string {
  const period = getGreetingPeriod(hour);
  return GREETINGS[period][lang];
}
