import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: [
    '@rainbow-me/rainbowkit',
    'wagmi',
    'viem',
    '@safe-global/safe-apps-provider',
    '@safe-global/safe-apps-sdk',
    '@walletconnect/ethereum-provider'
  ],
};

export default nextConfig;
