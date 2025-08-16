import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["http://192.168.56.1:3000"],
  experimental: {
    browserDebugInfoInTerminal: true,
  },
};

export default nextConfig;
