export type Chain = {
  id: number;
  name: string;
  bridgeKitName: string;
  iconName: string; // web3icons component name
  nativeCurrency: string;
  usdcAddress?: string;
  explorerUrl: string;
  isDestination?: boolean;
};

export const SUPPORTED_CHAINS: Chain[] = [
  {
    id: 11155111, // Sepolia chain ID
    name: "Ethereum Sepolia",
    bridgeKitName: "Ethereum_Sepolia",
    iconName: "Ethereum", // Ethereum symbol
    nativeCurrency: "ETH",
    usdcAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC on Sepolia
    explorerUrl: "https://sepolia.etherscan.io",
  },
  {
    id: 84532,
    name: "Base Sepolia",
    bridgeKitName: "Base_Sepolia",
    iconName: "Base", // Base symbol
    nativeCurrency: "ETH",
    usdcAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC on Base Sepolia
    explorerUrl: "https://sepolia.basescan.org",
  },
  {
    id: 1301,
    name: "Unichain Sepolia",
    bridgeKitName: "Unichain_Sepolia",
    iconName: "Unichain", // Unichain symbol
    nativeCurrency: "ETH",
    usdcAddress: "0x31d0220469e10c4E71834a79b1f276d740d3768F", // USDC on Unichain Sepolia
    explorerUrl: "https://sepolia.uniscan.xyz",
  },
  {
    id: 5042002, // Arc Testnet
    name: "Arc Testnet",
    bridgeKitName: "Arc_Testnet",
    iconName: "arc",
    nativeCurrency: "ETH",
    usdcAddress: "0x3600000000000000000000000000000000000000",
    explorerUrl: "https://testnet.arcscan.app",
    isDestination: true,
  },
];

export const ARC_TESTNET = SUPPORTED_CHAINS.find((c) => c.isDestination)!;

export function getChainByWagmiId(chainId: number) {
  return SUPPORTED_CHAINS.find((c) => c.id === chainId);
}

export function getBridgeKitChainName(chainId: number) {
  return getChainByWagmiId(chainId)?.bridgeKitName;
}

export function isBridgeSupported(chainId: number) {
  const chain = getChainByWagmiId(chainId);
  return chain && !chain.isDestination;
}
