/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [320, 420, 640, 768, 1024, 1280, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      { protocol: "https", hostname: "**.solana.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "static.jup.ag" },
      { protocol: "https", hostname: "**.coingecko.com" },
    ],
  },
  experimental: {
    // Lucide-react genera muchos modules — optimizePackageImports los rebundlea
    // tree-shakeados para reducir cold start y bundle inicial.
    optimizePackageImports: ["lucide-react"],
  },
  webpack: (config) => {
    config.externals.push(
      "pino-pretty",
      "lokijs",
      "encoding",
      "utf-8-validate",
      "bufferutil"
    );
    return config;
  },
};

export default nextConfig;
