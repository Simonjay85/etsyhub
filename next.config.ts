import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: '/tmp/etsyhub-next',
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
