import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    browserDebugInfoInTerminal: true,
  },
};

export default nextConfig;
