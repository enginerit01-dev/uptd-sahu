import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    useTypeScriptCli: false,
    serverActions: {
      bodySizeLimit: "27mb",
    },
  },
};

export default nextConfig;
