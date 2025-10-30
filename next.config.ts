import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Для работы в Telegram WebApp
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : undefined,
  // Для Docker (standalone mode)
  output: 'standalone',
};

export default nextConfig;
