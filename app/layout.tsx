import type { Metadata, Viewport } from "next";
import { Manrope, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SplashScreen } from "@/components/SplashScreen";
import { BottomNav } from "@/components/BottomNav";

// Body / UI: Manrope — geométrica moderna, menos genérica que Inter
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  preload: true,
});

// Display secundario: Bricolage Grotesque — titulares h1/h2/h3 + wordmark
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Tropico — La red económica del venezolano en Solana",
  description:
    "Ahorra ganando intereses. Paga sin perder valor. Red de pagos non-custodial sobre Solana. Hecho en Venezuela.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Tropico — La red económica del venezolano en Solana",
    description: "La wallet caribeña en Solana. Non-custodial. USDC + yield + QR para comercios. Hecho en Venezuela.",
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-VE" className={`${manrope.variable} ${bricolage.variable}`}>
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
