export type TokenSymbol =
  | "SOL"
  | "USDC"
  | "USDT"
  | "JUP"
  | "JTO"
  | "mSOL"
  | "KMNO"
  | "RAY"
  | "BONK";

export type TokenInfo = {
  symbol: TokenSymbol;
  name: string;
  mint: string;
  decimals: number;
  logoURI: string;
  /** Vibe / posicionamiento corto para la home y el descubrir */
  vibe: string;
  /** Explicaci&oacute;n en espa&ntilde;ol venezolano, sin jerga */
  pitchVE: string;
  /** Riesgo percibido (1=estable, 5=memecoin volatil) */
  riesgo: 1 | 2 | 3 | 4 | 5;
  /** Color de marca aproximado para gradientes */
  brand: string;
};

// Mainnet mint addresses. Para devnet, USDC tiene un mint distinto:
// devnet USDC: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
// El swap de Jupiter solo funciona con mainnet — para demo final, set NEXT_PUBLIC_SOLANA_CLUSTER=mainnet-beta.
export const TOKENS: Record<TokenSymbol, TokenInfo> = {
  SOL: {
    symbol: "SOL",
    name: "Solana",
    mint: "So11111111111111111111111111111111111111112", // wSOL
    decimals: 9,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    vibe: "El motor del ecosistema",
    pitchVE:
      "El token nativo de Solana, mi pana. Lo usas para pagar comisiones (centavos), hacer staking, y es la base de todo lo que pasa en esta red. Si Solana sube, SOL sube.",
    riesgo: 3,
    brand: "#9945FF",
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
    vibe: "El d&oacute;lar digital m&aacute;s confiable",
    pitchVE:
      "1 USDC = 1 USD, siempre. Respaldado por d&oacute;lares reales en bancos auditados. Si quieres ahorrar sin que se te pierda valor, esto es lo m&aacute;s parecido a un d&oacute;lar en tu bolsillo digital.",
    riesgo: 1,
    brand: "#2775CA",
  },
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    decimals: 6,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg",
    vibe: "El que ya conoc&eacute;s, ahora en Solana",
    pitchVE:
      "El mismo USDT que usas en Binance, pero en Solana es m&aacute;s r&aacute;pido y m&aacute;s barato. Si vens del mundo Tron, este es tu puente directo.",
    riesgo: 2,
    brand: "#26A17B",
  },
  JUP: {
    symbol: "JUP",
    name: "Jupiter",
    mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    decimals: 6,
    logoURI: "https://static.jup.ag/jup/icon.png",
    vibe: "El Booking de los swaps",
    pitchVE:
      "Jupiter es la app que te busca el mejor precio entre todas las exchanges de Solana. Cada swap que hazs en Tropico pasa por Jupiter. JUP es su token: si la app crece, el token crece.",
    riesgo: 3,
    brand: "#FBA43A",
  },
  JTO: {
    symbol: "JTO",
    name: "Jito",
    mint: "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL",
    decimals: 9,
    logoURI:
      "https://metadata.jito.network/token/jto/image",
    vibe: "Tu SOL trabajando en background",
    pitchVE:
      "JTO es el token de Jito, una plataforma de staking que paga m&aacute;s que el staking normal. Piensa en JTO como ser due&ntilde;o de un peda&ccedil;ito de esa plataforma — si m&aacute;s gente la usa, m&aacute;s ganas.",
    riesgo: 3,
    brand: "#00D9C0",
  },
  mSOL: {
    symbol: "mSOL",
    name: "Marinade Staked SOL",
    mint: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
    decimals: 9,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png",
    vibe: "SOL con yield autom&aacute;tico",
    pitchVE:
      "mSOL es como tener SOL pero ganando ~7% al a&ntilde;o autom&aacute;ticamente, sin hacer nada. 1 mSOL siempre vale m&aacute;s que 1 SOL porque acumula recompensas. Para ahorrar a mediano plazo, golazo.",
    riesgo: 2,
    brand: "#5C6FF7",
  },
  KMNO: {
    symbol: "KMNO",
    name: "Kamino",
    mint: "KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS",
    decimals: 6,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS/logo.png",
    vibe: "Banco descentralizado de Solana",
    pitchVE:
      "Kamino te deja prestar tus tokens y ganar inter&eacute;s, o pedir prestado contra ellos. Es un banco, pero sin gerente, sin papeleo, y sin que nadie te congele la cuenta. KMNO es su token de gobierno.",
    riesgo: 4,
    brand: "#FF6B35",
  },
  RAY: {
    symbol: "RAY",
    name: "Raydium",
    mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
    decimals: 6,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png",
    vibe: "Una de las primeras exchanges descentralizadas",
    pitchVE:
      "Raydium es uno de los DEX m&aacute;s usados de Solana. Cuando hazs un swap aqu&iacute; en Tropico, una parte de tu transacci&oacute;n probablemente pasa por Raydium. Su token gana valor mientras m&aacute;s gente la use.",
    riesgo: 4,
    brand: "#C200FB",
  },
  BONK: {
    symbol: "BONK",
    name: "Bonk",
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    decimals: 5,
    logoURI:
      "https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I",
    vibe: "La memecoin oficial de Solana",
    pitchVE:
      "BONK es una memecoin — sub&eacute; y baja r&aacute;pido, no tiene m&aacute;s utilidad que la cultura. Si quieres jugar con plata que puedes perder y divertirte, BONK. Pero no metas tus ahorros aqu&iacute;, panita.",
    riesgo: 5,
    brand: "#FFB938",
  },
};

export const TOKEN_LIST: TokenInfo[] = [
  TOKENS.SOL,
  TOKENS.USDC,
  TOKENS.USDT,
  TOKENS.JUP,
  TOKENS.JTO,
  TOKENS.mSOL,
  TOKENS.KMNO,
  TOKENS.RAY,
  TOKENS.BONK,
];

/** Tokens recomendados para descubrir (excluye USDT por estar over-representado en VE) */
export const DESCUBRIR_TOKENS: TokenInfo[] = [
  TOKENS.SOL,
  TOKENS.USDC,
  TOKENS.JUP,
  TOKENS.JTO,
  TOKENS.mSOL,
  TOKENS.KMNO,
  TOKENS.RAY,
  TOKENS.BONK,
];

export function getTokenByMint(mint: string): TokenInfo | undefined {
  return TOKEN_LIST.find((t) => t.mint === mint);
}

export function getTokenBySymbol(symbol: string): TokenInfo | undefined {
  return TOKEN_LIST.find((t) => t.symbol.toLowerCase() === symbol.toLowerCase());
}
