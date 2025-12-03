import { BridgeKit } from '@circle-fin/bridge-kit'
import { createAdapterFromProvider } from '@circle-fin/adapter-viem-v2'
import { useWalletClient, useAccount } from 'wagmi'
import { useState, useCallback } from 'react'
import { getBridgeKitChainName, ARC_TESTNET } from '@/lib/bridge-kit/chains'

type BridgeStatus = 'idle' | 'bridging' | 'complete' | 'error'

export function useBridgeKit() {
  const { data: walletClient } = useWalletClient()
  const { chain, connector } = useAccount()
  const [status, setStatus] = useState<BridgeStatus>('idle')
  const [error, setError] = useState<Error | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const kit = new BridgeKit()

  const bridgeToArc = useCallback(async (amount: string, sourceChainId: number) => {
    if (!walletClient || !connector) {
      throw new Error('Wallet not connected')
    }

    try {
      setStatus('bridging')
      setError(null)
      setTxHash(null)

      // Get the EIP-1193 provider from connector
      let eip1193Provider = null

      if (connector?.getProvider) {
        try {
          eip1193Provider = await connector.getProvider()
        } catch (err) {
          console.error('Failed to get provider from connector:', err)
        }
      }

      // Fallback to window.ethereum
      if (!eip1193Provider && typeof window !== 'undefined' && window.ethereum) {
        eip1193Provider = window.ethereum
      }

      if (!eip1193Provider) {
        throw new Error('No EIP-1193 provider found. Please ensure your wallet is connected.')
      }

      // Create adapter with provider object
      const adapter = await createAdapterFromProvider({ provider: eip1193Provider })

      const sourceChain = getBridgeKitChainName(sourceChainId)

      if (!sourceChain) {
        throw new Error('Unsupported chain')
      }

      // Bridge USDC to Arc Network
      const result = await kit.bridge({
        from: {
          adapter,
          chain: sourceChain as any // Type cast for Bridge Kit compatibility
        },
        to: {
          adapter,
          chain: ARC_TESTNET.bridgeKitName as any
        },
        amount: amount,
      })

      // Extract transaction hash if available
      if (result && typeof result === 'object' && 'txHash' in result) {
        setTxHash((result as any).txHash)
      }

      setStatus('complete')
      return result

    } catch (err) {
      console.error('Bridge error:', err)
      setStatus('error')
      setError(err as Error)
      throw err
    }
  }, [walletClient, chain, kit])

  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
    setTxHash(null)
  }, [])

  return {
    bridgeToArc,
    reset,
    status,
    error,
    txHash,
    isIdle: status === 'idle',
    isBridging: status === 'bridging',
    isComplete: status === 'complete',
    hasError: status === 'error',
  }
}
