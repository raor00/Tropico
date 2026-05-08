/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.solana.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "static.jup.ag" },
      { protocol: "https", hostname: "**.coingecko.com" },
    ],
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
