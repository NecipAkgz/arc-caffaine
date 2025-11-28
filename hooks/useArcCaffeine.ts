import { useAccount, usePublicClient, useWalletClient, useSwitchChain } from 'wagmi'
import { ARC_CAFFEINE_ABI, CONTRACT_ADDRESS } from '@/lib/abi'
import { useState, useEffect, useCallback } from 'react'
import { parseEther } from 'viem'
import { arcTestnet } from '@/lib/chain'

export function useArcCaffeine() {
  const { address, chainId } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { switchChainAsync } = useSwitchChain()

  const [username, setUsername] = useState<string | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [loading, setLoading] = useState(false)

  const checkRegistration = useCallback(async () => {
    if (!address || !publicClient) {
        setIsRegistered(false)
        setUsername(null)
        return
    }
    try {
      const name = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ARC_CAFFEINE_ABI,
        functionName: 'usernames',
        args: [address]
      })
      if (name) {
        setUsername(name)
        setIsRegistered(true)
      } else {
        setIsRegistered(false)
        setUsername(null)
      }
    } catch (error) {
      console.error("Error checking registration", error)
      // In case of error (e.g. contract not deployed on placeholder address), we might want to handle it gracefully
    }
  }, [address, publicClient])

  useEffect(() => {
    checkRegistration()
  }, [checkRegistration])

  const ensureNetwork = async () => {
    if (chainId !== arcTestnet.id) {
        await switchChainAsync({ chainId: arcTestnet.id })
    }
  }

  const register = async (newUsername: string) => {
    if (!walletClient || !address) return
    setLoading(true)
    try {
      await ensureNetwork()
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: ARC_CAFFEINE_ABI,
        functionName: 'registerUser',
        args: [newUsername],
        account: address,
        chain: arcTestnet
      })
      await publicClient?.waitForTransactionReceipt({ hash })
      await checkRegistration()
    } catch (error) {
      console.error("Registration failed", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const buyCoffee = async (recipientUsername: string, name: string, message: string, amount: string) => {
    if (!walletClient || !address) return
    setLoading(true)
    try {
      await ensureNetwork()
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: ARC_CAFFEINE_ABI,
        functionName: 'buyCoffee',
        args: [recipientUsername, name, message],
        value: parseEther(amount),
        account: address,
        chain: arcTestnet
      })
      await publicClient?.waitForTransactionReceipt({ hash })
    } catch (error) {
      console.error("Buy Coffee failed", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const withdraw = async () => {
    if (!walletClient || !address) return
    setLoading(true)
    try {
      await ensureNetwork()
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: ARC_CAFFEINE_ABI,
        functionName: 'withdraw',
        account: address,
        chain: arcTestnet
      })
      await publicClient?.waitForTransactionReceipt({ hash })
    } catch (error) {
      console.error("Withdraw failed", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getBalance = async () => {
      if (!address || !publicClient) return BigInt(0)
      return await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ARC_CAFFEINE_ABI,
        functionName: 'balances',
        args: [address]
      })
  }

  return {
    username,
    isRegistered,
    loading,
    register,
    buyCoffee,
    withdraw,
    getBalance
  }
}
