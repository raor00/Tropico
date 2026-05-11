import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tropico palette — Solana-Maxi vibe with Caribbean warmth
        tropico: {
          ink: "#0a0a14",        // background — deep purple-black
          panel: "#13131f",      // card surfaces
          border: "#1f1f30",     // hairlines
          mute: "#9b9bb4",       // muted text — más claro para legibilidad sobre fondo dark
          text: "#e9e9f1",       // primary text
          // Solana brand colors (the maxi part)
          purple: "#9945FF",
          green: "#14F195",
          // Caribbean accents (the venezolano part)
          sun: "#FFD166",        // warm yellow
          coral: "#EF476F",      // hot pink-coral
          sea: "#06D6A0",        // sea green
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
        display: ["var(--font-bricolage)", "system-ui", "sans-serif"],
        wordmark: ["var(--font-bricolage)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-up": "fade-up 400ms ease-out forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
