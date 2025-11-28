import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: [
    "@rainbow-me/rainbowkit",
    "wagmi",
    "viem",
    "@safe-global/safe-apps-provider",
    "@safe-global/safe-apps-sdk",
    "@walletconnect/ethereum-provider",
  ],
  turbopack: {
    resolveAlias: {
      'pino-pretty': './empty.js',
      'lokijs': './empty.js',
      'encoding': './empty.js',
    },
  },
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");

    // Ignore test files that cause build issues
    config.module.rules.push({
      test: /\.test\.(js|ts|tsx)$/,
      loader: "ignore-loader",
    });

    return config;
  },
};

export default nextConfig;
