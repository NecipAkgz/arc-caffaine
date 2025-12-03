type Chain = {
  id: number
  name: string
  bridgeKitName: string
  iconName: string // web3icons component name
  nativeCurrency: string
  usdcAddress?: string
  isDestination?: boolean
}

export const SUPPORTED_CHAINS: Chain[] = [
  {
    id: 11155111, // Sepolia chain ID
    name: 'Ethereum Sepolia',
    bridgeKitName: 'Ethereum_Sepolia',
    iconName: 'Ethereum', // Ethereum symbol
    nativeCurrency: 'ETH',
    usdcAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC on Sepolia
  },
  {
    id: 84532,
    name: 'Base Sepolia',
    bridgeKitName: 'Base_Sepolia',
    iconName: 'Base', // Base symbol
    nativeCurrency: 'ETH',
    usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC on Base Sepolia
  },
  {
    id: 421614,
    name: 'Arbitrum Sepolia',
    bridgeKitName: 'Arbitrum_Sepolia',
    iconName: 'Arbitrum', // Arbitrum symbol
    nativeCurrency: 'ETH',
    usdcAddress: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // USDC on Arbitrum Sepolia
  },
  {
    id: 80002,
    name: 'Polygon Amoy',
    bridgeKitName: 'Polygon_Amoy',
    iconName: 'Polygon', // Polygon symbol
    nativeCurrency: 'MATIC',
    usdcAddress: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', // USDC on Polygon Amoy
  },
  {
    id: 5042002, // Arc Testnet
    name: 'Arc Testnet',
    bridgeKitName: 'Arc_Testnet',
    iconName: 'arc',
    nativeCurrency: 'ETH',
    usdcAddress: '0x3600000000000000000000000000000000000000',
    isDestination: true,
  },
]

export const ARC_TESTNET = SUPPORTED_CHAINS.find(c => c.isDestination)!

export function getChainByWagmiId(chainId: number) {
  return SUPPORTED_CHAINS.find(c => c.id === chainId)
}

export function getBridgeKitChainName(chainId: number) {
  return getChainByWagmiId(chainId)?.bridgeKitName
}

export function isBridgeSupported(chainId: number) {
  const chain = getChainByWagmiId(chainId)
  return chain && !chain.isDestination
}
