import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed output: "export" to enable proper client-side hydration
  // for Framer Motion animations and Recharts
  
  // Keep image optimization disabled for now
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
