import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Allow external domains for avatar images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "effigy.im",
      },
      {
        protocol: "https",
        hostname: "*.neynar.com",
      },
      {
        protocol: "https",
        hostname: "imagedelivery.net",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
      {
        protocol: "https",
        hostname: "*.ipfs.io",
      },
      {
        protocol: "https",
        hostname: "*.cloudflare-ipfs.com",
      },
      {
        protocol: "https",
        hostname: "*.imgix.net",
      },
      {
        protocol: "https",
        hostname: "euc.li",
      },
      {
        protocol: "https",
        hostname: "*.warpcast.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
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
      "pino-pretty": "./empty.js",
      lokijs: "./empty.js",
      encoding: "./empty.js",
    },
  },
  output: "standalone",
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");

    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": false,
    };

    // Ignore test files that cause build issues
    config.module.rules.push({
      test: /\.test\.(js|ts|tsx)$/,
      loader: "ignore-loader",
    });

    return config;
  },
};

export default nextConfig;
