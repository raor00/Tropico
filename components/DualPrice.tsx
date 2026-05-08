"use client";

import { useQuery } from "@tanstack/react-query";
import { formatBs, formatUSD } from "@/lib/formato";
import type { PrecioBs } from "@/lib/precio-bs";

async function getPrecioBs(): Promise<PrecioBs> {
  const res = await fetch("/api/precio-bs");
  if (!res.ok) throw new Error("Error al obtener precio bs");
  return res.json();
}

/**
 * Muestra un valor en USD + su equivalente en bolívares (en vivo, refresh 30s).
 * Es el componente firma del producto — el venezolano necesita ver bs siempre.
 */
export function DualPrice({
  usd,
  size = "md",
  align = "left",
}: {
  usd: number;
  size?: "sm" | "md" | "lg" | "xl";
  align?: "left" | "right" | "center";
}) {
  const { data: precio } = useQuery({
    queryKey: ["precio-bs"],
    queryFn: getPrecioBs,
    refetchInterval: 30_000,
    staleTime: 30_000,
  });

  const bs = precio ? usd * precio.usdToBs : null;

  const sizeMap = {
    sm: { usd: "text-base", bs: "text-xs" },
    md: { usd: "text-xl", bs: "text-sm" },
    lg: { usd: "text-3xl", bs: "text-base" },
    xl: { usd: "text-5xl md:text-6xl", bs: "text-lg" },
  };

  const alignMap = {
    left: "items-start text-left",
    right: "items-end text-right",
    center: "items-center text-center",
  };

  return (
    <div className={`flex flex-col ${alignMap[align]}`}>
      <span className={`font-display font-bold tracking-tight ${sizeMap[size].usd}`}>
        {formatUSD(usd)}
      </span>
      <span className={`text-tropico-mute ${sizeMap[size].bs}`}>
        {bs !== null ? formatBs(bs) : "Bs. —"}
      </span>
    </div>
  );
}
