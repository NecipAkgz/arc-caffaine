import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia, baseSepolia, unichainSepolia } from "wagmi/chains";
import { arcTestnet } from "./chain";

export const config = getDefaultConfig({
  appName: "ArcCaffeine",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [arcTestnet, sepolia, baseSepolia, unichainSepolia],
  ssr: true,
});
