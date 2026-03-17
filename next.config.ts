import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      // Disable Turbopack - use stable webpack instead
    },
  },
  turbopack: false,
};

export default nextConfig;
