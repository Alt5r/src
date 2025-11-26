import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Turbopack (default in Next.js 16)
  turbopack: {},
  
  // Allow loading Cesium assets from CDN
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cesium.com',
      },
    ],
  },
};

export default nextConfig;
