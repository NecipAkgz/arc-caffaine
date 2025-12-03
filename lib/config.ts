import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, baseSepolia, arbitrumSepolia, polygonAmoy } from 'wagmi/chains';
import { arcTestnet } from './chain';

export const config = getDefaultConfig({
  appName: 'ArcCaffeine',
  projectId: '71d4aee8d44f0451001fdeeccbe7a12a',
  chains: [
    arcTestnet,
    sepolia,
    baseSepolia,
    arbitrumSepolia,
    polygonAmoy,
  ],
  ssr: true,
});
