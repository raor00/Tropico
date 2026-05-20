export type PropertyInfo = {
  id: string;
  shareMint: string;
  name: string;
  city: string;
  address: string;
  images: string[];
  tourUrl: string;
  tourModelUrl?: string;
  pricePerShare: number;
  totalShares: number;
  sharesSold: number;
  valuationUsdc: number;
  apyEstimate: number;
  legalDocHash: string;
  bedrooms: number;
  m2: number;
  vibe: string;
  pitchVE: string;
};

export const PROPERTIES: Record<string, PropertyInfo> = {
  "residencias-avila-v2": {
    id: "residencias-avila-v2",
    shareMint: process.env.NEXT_PUBLIC_REALESTATE_PROGRAM_ID
      ? ""
      : "PLACEHOLDER_SHARE_MINT_AVILA",
    name: "Residencias Ávila #1",
    city: "Caracas",
    address: "Av. Principal de Los Palos Grandes, Municipio Chacao",
    images: [
      "/properties/avila-001-1.jpg",
      "/properties/avila-001-2.jpg",
      "/properties/avila-001-3.jpg",
    ],
    tourUrl: "https://llave-ruby.vercel.app/inmueble/e5d022c7-4295-4969-af83-fc8a8d3ca0bd",
    tourModelUrl:
      "https://tpffeqomdefynbkpjjtn.supabase.co/storage/v1/object/public/properties/loft-hackathon.glb",
    pricePerShare: 5,
    totalShares: 2400,
    sharesSold: 0,
    valuationUsdc: 120_000,
    apyEstimate: 8,
    legalDocHash: "abababababababababababababababababababababababababababababababababab",
    bedrooms: 3,
    m2: 110,
    vibe: "Exclusivo residencial, vista al Ávila",
    pitchVE:
      "Apartamento en Los Palos Grandes, uno de los sectores más estables de Caracas. Desde $5 tenés tu pedazo en un edificio de 3 dormitorios con ~8% APY en renta.",
  },
  "la-candelaria-v2": {
    id: "la-candelaria-v2",
    shareMint: "PLACEHOLDER_SHARE_MINT_CANDELARIA",
    name: "La Candelaria Centro #2",
    city: "Caracas",
    address: "Calle Este 2, La Candelaria, Caracas",
    images: [
      "/properties/candelaria-002-1.jpg",
      "/properties/candelaria-002-2.jpg",
    ],
    tourUrl: "https://tour.tropico.app/candelaria-002",
    pricePerShare: 3,
    totalShares: 1500,
    sharesSold: 0,
    valuationUsdc: 45_000,
    apyEstimate: 10,
    legalDocHash: "cdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcd",
    bedrooms: 2,
    m2: 70,
    vibe: "Comercial histórico, alta demanda de alquiler",
    pitchVE:
      "Local comercial en La Candelaria, zona histórica con alta rotación de inquilinos. ~10% APY. Desde $3 la acción.",
  },
  "maracaibo-lago-v2": {
    id: "maracaibo-lago-v2",
    shareMint: "PLACEHOLDER_SHARE_MINT_MARACAIBO",
    name: "Lago Towers Maracaibo #3",
    city: "Maracaibo",
    address: "Av. 5 de Julio, Santa Rita, Maracaibo, Zulia",
    images: [
      "/properties/maracaibo-003-1.jpg",
      "/properties/maracaibo-003-2.jpg",
    ],
    tourUrl: "https://tour.tropico.app/maracaibo-003",
    pricePerShare: 2,
    totalShares: 3200,
    sharesSold: 0,
    valuationUsdc: 80_000,
    apyEstimate: 9,
    legalDocHash: "efefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefef",
    bedrooms: 4,
    m2: 140,
    vibe: "Capitalizar el boom energético de Zulia",
    pitchVE:
      "Apartamento premium en Maracaibo, ciudad con reactivación económica por el petróleo. Desde $2 la acción, ~9% APY esperado.",
  },
};

export const PROPERTY_LIST: PropertyInfo[] = Object.values(PROPERTIES);

export function getPropertyById(id: string): PropertyInfo | undefined {
  return PROPERTIES[id];
}

export function getProgressPercent(p: PropertyInfo): number {
  if (p.totalShares === 0) return 0;
  return Math.min(100, (p.sharesSold / p.totalShares) * 100);
}
