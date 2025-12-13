'use client'

import { useState, useEffect } from 'react'
import { ArrowDown, AlertCircle, Wallet, ChevronDown, CheckCircle2 } from 'lucide-react'
import { useAccount, useSwitchChain, useReadContract } from 'wagmi'
import { SUPPORTED_CHAINS, ARC_TESTNET } from '@/lib/bridge-kit/chains'
import { formatUnits } from 'viem'
import { ChainIcon } from '@/components/ChainIcon'
import { cn } from '@/lib/utils'

// ERC20 ABI for balanceOf function
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
] as const

interface BridgeFormProps {
  defaultAmount: string
  onBridge: (amount: string, chainId: number) => Promise<void>
}

/**
 * Bridge Form Component
 *
 * Handles the input form for selecting source chain and amount to bridge.
 */
export function BridgeForm({ defaultAmount, onBridge }: BridgeFormProps) {
  const { chain, address } = useAccount()
  const { switchChain } = useSwitchChain()
  const [selectedChain, setSelectedChain] = useState(chain?.id)
  const [bridgeAmount, setBridgeAmount] = useState(defaultAmount)
  const [showChainDropdown, setShowChainDropdown] = useState(false)

  // Fetch USDC balance for selected chain
  const selectedChainData = SUPPORTED_CHAINS.find(c => c.id === selectedChain)
  const { data: balanceData, isLoading: isLoadingBalance } = useReadContract({
    address: selectedChainData?.usdcAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: selectedChain,
    query: {
      enabled: !!address && !!selectedChainData?.usdcAddress && !!selectedChain,
    }
  })

  const usdcBalance = balanceData ? formatUnits(balanceData as bigint, 6) : '0.00'

  // Sync bridge amount when default amount changes
  useEffect(() => {
    setBridgeAmount(defaultAmount)
  }, [defaultAmount])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showChainDropdown && !(event.target as Element).closest('.chain-selector')) {
        setShowChainDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showChainDropdown])

  const handleChainSelect = async (chainId: number) => {
    setSelectedChain(chainId)
    setShowChainDropdown(false)
    if (chain?.id !== chainId) {
      await switchChain({ chainId })
    }
  }

  const handleSubmit = async () => {
    if (!selectedChain) return

    // Switch chain if needed
    if (chain?.id !== selectedChain) {
      await switchChain({ chainId: selectedChain })
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    await onBridge(bridgeAmount, selectedChain)
  }

  const currentChain = SUPPORTED_CHAINS.find(c => c.id === selectedChain)

  return (
    <div className="space-y-4">
      {/* From Section */}
      <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">From</span>
          <div className="flex items-center gap-1 text-zinc-400">
            <Wallet className="w-3 h-3" />
            <span>{usdcBalance} USDC</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Chain Selector */}
          <div className="relative chain-selector">
            <button
              onClick={() => setShowChainDropdown(!showChainDropdown)}
              className="flex items-center gap-2 bg-black/40 hover:bg-black/60 border border-white/10 rounded-xl px-3 py-2 transition-all min-w-[140px]"
            >
              {currentChain ? (
                <>
                  <ChainIcon name={currentChain.iconName} size={24} />
                  <span className="font-medium text-sm text-white truncate flex-1 text-left">
                    {currentChain.name}
                  </span>
                </>
              ) : (
                <span className="text-sm text-zinc-400">Select Chain</span>
              )}
              <ChevronDown className={cn("w-4 h-4 text-zinc-500 transition-transform", showChainDropdown && "rotate-180")} />
            </button>

            {/* Dropdown */}
            {showChainDropdown && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-[#111] border border-white/10 rounded-xl shadow-xl overflow-hidden z-20 py-1">
                {SUPPORTED_CHAINS.filter(c => !c.isDestination).map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => handleChainSelect(chain.id)}
                    className={cn(
                      "w-full px-3 py-2.5 flex items-center gap-3 hover:bg-white/5 transition-colors text-left",
                      selectedChain === chain.id && "bg-primary/10 text-primary"
                    )}
                  >
                    <ChainIcon name={chain.iconName} size={20} />
                    <span className="text-sm font-medium">{chain.name}</span>
                    {selectedChain === chain.id && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Amount Input */}
          <input
            type="number"
            value={bridgeAmount}
            onChange={(e) => setBridgeAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 bg-transparent text-right text-2xl font-bold text-white placeholder-zinc-600 outline-none min-w-0"
          />
        </div>
      </div>

      {/* Arrow Divider */}
      <div className="flex justify-center -my-3 relative z-10">
        <div className="bg-[#09090b] p-1.5 rounded-full border border-white/10">
          <ArrowDown className="w-4 h-4 text-zinc-500" />
        </div>
      </div>

      {/* To Section */}
      <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/5">
        <div className="flex justify-between text-sm mb-3">
          <span className="text-zinc-400">To</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2">
            <ChainIcon name={ARC_TESTNET.iconName} size={24} />
            <span className="font-medium text-sm text-white">{ARC_TESTNET.name}</span>
          </div>
          <span className="text-2xl font-bold text-zinc-500">
            {bridgeAmount || '0.00'}
          </span>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex gap-3">
        <AlertCircle className="w-5 h-5 text-primary shrink-0" />
        <p className="text-xs text-primary/80 leading-relaxed">
          Bridge usually takes 1-2 minutes. You will receive USDC on Arc Testnet automatically.
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={handleSubmit}
        disabled={!currentChain || !bridgeAmount || parseFloat(bridgeAmount) <= 0}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
      >
        {!currentChain ? 'Select Source Chain' :
         !bridgeAmount ? 'Enter Amount' :
         'Bridge Funds'}
      </button>
    </div>
  )
}
