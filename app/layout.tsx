import type { Metadata, Viewport } from "next";
import { Manrope, Bricolage_Grotesque, Honk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SplashScreen } from "@/components/SplashScreen";
import { BottomNav } from "@/components/BottomNav";

// Body / UI: Manrope — geométrica moderna, menos genérica que Inter
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

// Display secundario: Bricolage Grotesque — para titulares h2/h3
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

// Wordmark "TROPICO": Honk — variable font 2024, super expresiva, casi nadie la usa
const honk = Honk({
  subsets: ["latin"],
  variable: "--font-honk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tropico — La red económica del venezolano en Solana",
  description:
    "Ahorrá ganando, pagá sin perder. Red de pagos non-custodial sobre Solana. Hecho en Venezuela.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Tropico — La red económica del venezolano en Solana",
    description: "MercadoPago para Solana. Non-custodial. Hecho en Venezuela.",
    type: "website",
    locale: "es_VE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tropico",
    description: "La red económica del venezolano en Solana.",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a0d2e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-VE" className={`${manrope.variable} ${bricolage.variable} ${honk.variable}`}>
      <body className="tropico-glow min-h-dvh pb-20 md:pb-0">
        <SplashScreen />
        <Providers>
          {children}
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
