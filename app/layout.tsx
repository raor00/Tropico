import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { LanguageProvider } from "@/lib/i18n/context";
import { AuthProvider } from "@/lib/auth-context";
import { SplashScreen } from "@/components/SplashScreen";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";

// Inter — diseñada para UI screens, máxima legibilidad en cualquier tamaño/monitor.
// Una sola familia para body + display: consistencia y rendering crisp en HiDPI 27"+.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700", "800"],
});

const interDisplay = Inter({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  preload: true,
  weight: ["600", "700", "800", "900"],
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
    <html lang="es-VE" className={`${inter.variable} ${interDisplay.variable}`}>
      <body className="tropico-glow min-h-dvh pb-20 md:pb-0">
        <SplashScreen />
        <Providers>
          <LanguageProvider>
            <AuthProvider>
              {/* Header global — fuera del main de cada page para usar viewport completo y mantener consistencia */}
              <Header />
              {children}
              <BottomNav />
            </AuthProvider>
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
