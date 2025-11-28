'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createWalletClient, custom, WalletClient, PublicClient, createPublicClient, http } from 'viem'
import { arcTestnet } from '@/lib/chain'

interface WalletContextType {
  address: `0x${string}` | null
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
  walletClient: WalletClient | null
  publicClient: PublicClient | null
  chainId: number | null
  switchNetwork: () => Promise<void>
}

const WalletContext = createContext<WalletContextType>({} as WalletContextType)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<`0x${string}` | null>(null)
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null)
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)

  useEffect(() => {
    // Init public client
    const pc = createPublicClient({
      chain: arcTestnet,
      transport: http()
    })
    setPublicClient(pc)

    // Check if already connected
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const wc = createWalletClient({
        chain: arcTestnet,
        transport: custom((window as any).ethereum)
      })
      setWalletClient(wc)

      wc.getAddresses().then((addresses) => {
        if (addresses.length > 0) {
          setAddress(addresses[0])
        }
      }).catch(() => {})

      wc.getChainId().then(setChainId).catch(() => {})

      // Listen for account changes
      ;(window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0] as `0x${string}`)
        } else {
          setAddress(null)
        }
      })

      // Listen for chain changes
      ;(window as any).ethereum.on('chainChanged', (id: string) => {
        setChainId(parseInt(id, 16))
      })
    }
  }, [])

  const switchNetwork = async () => {
    if (!walletClient) return
    try {
      await walletClient.switchChain({ id: arcTestnet.id })
    } catch (e: any) {
      // 4902: Unrecognized chain ID
      if (e.code === 4902) {
        try {
          await walletClient.addChain({ chain: arcTestnet })
        } catch (addError) {
          console.error("Failed to add chain", addError)
        }
      } else {
        console.error("Failed to switch chain", e)
      }
    }
  }

  const connect = async () => {
    if (!walletClient) {
      alert("Please install a crypto wallet like Metamask or Arc Wallet")
      return
    }
    try {
      const addresses = await walletClient.requestAddresses()
      setAddress(addresses[0])

      await switchNetwork()
    } catch (error) {
      console.error("Connection failed", error)
    }
  }

  const disconnect = () => {
    setAddress(null)
  }

  return (
    <WalletContext.Provider value={{
      address,
      isConnected: !!address,
      connect,
      disconnect,
      walletClient,
      publicClient,
      chainId,
      switchNetwork
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
