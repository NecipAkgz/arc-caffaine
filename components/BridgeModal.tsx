'use client'

import { useState, useEffect } from 'react'
import { X, ArrowDown, Loader2, CheckCircle2, AlertCircle, ExternalLink, ChevronDown, Wallet } from 'lucide-react'
import { useBridgeKit } from '@/hooks/useBridgeKit'
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

interface BridgeModalProps {
  isOpen: boolean
  onClose: () => void
  amount: string
}

/**
 * Bridge Modal Component
 *
 * Provides a UI for bridging USDC from other supported chains to the Arc Testnet.
 * Handles the bridging process, status display, and error handling.
 *
 * @param isOpen - Whether the modal is open.
 * @param onClose - Function to close the modal.
 * @param amount - Default amount to bridge.
 */
export default function BridgeModal({ isOpen, onClose, amount: defaultAmount }: BridgeModalProps) {
  const { chain, address } = useAccount()
  const { switchChain } = useSwitchChain()
  const { bridgeToArc, status, bridgeStep, error, txHash, reset } = useBridgeKit()
  const [selectedChain, setSelectedChain] = useState(chain?.id)
  const [bridgeAmount, setBridgeAmount] = useState(defaultAmount)
  const [showChainDropdown, setShowChainDropdown] = useState(false)

  // Fetch USDC balance for selected chain using contract read
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

  // Format balance (USDC has 6 decimals)
  const usdcBalance = balanceData ? formatUnits(balanceData as bigint, 6) : '0.00'

  // Sync bridge amount when modal opens or default amount changes
  useEffect(() => {
    if (isOpen) {
      setBridgeAmount(defaultAmount)
    }
  }, [isOpen, defaultAmount])

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

  if (!isOpen) return null

  /**
   * Initiates the bridge transfer.
   *
   * 1. Switches network if necessary.
   * 2. Validates inputs.
   * 3. Calls the bridgeToArc function from the hook.
   */
  const handleBridge = async () => {
    try {
      if (selectedChain && chain?.id !== selectedChain) {
        await switchChain({ chainId: selectedChain })
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      if (!selectedChain) throw new Error('Please select a source chain')

      await bridgeToArc(bridgeAmount, selectedChain)
    } catch (err) {
      console.error('Bridge failed:', err)
    }
  }

  const handleClose = () => {
    if (status === 'bridging') return // Prevent closing while bridging
    reset()
    onClose()
  }

  const handleChainSelect = async (chainId: number) => {
    setSelectedChain(chainId)
    setShowChainDropdown(false)
    if (chain?.id !== chainId) {
      await switchChain({ chainId })
    }
  }

  const currentChain = SUPPORTED_CHAINS.find(c => c.id === selectedChain)

  const formatError = (message: string) => {
    if (!message) return 'Unknown error occurred'
    let cleanMessage = message.split('Request Arguments:')[0]
    cleanMessage = cleanMessage.split('Details:')[0]
    return cleanMessage.replace(/^Error:\s*/, '').trim()
  }

  /**
   * Helper component to render a single step in the bridging progress stepper.
   */
  const StepItem = ({
    step,
    label,
    description,
    currentStep,
    isLast
  }: {
    step: string,
    label: string,
    description: string,
    currentStep: string,
    isLast?: boolean
  }) => {
    const steps = ['preparing', 'approving', 'burning', 'attesting', 'minting', 'complete']
    const currentIndex = steps.indexOf(currentStep)
    const stepIndex = steps.indexOf(step)

    let state: 'waiting' | 'current' | 'completed' = 'waiting'
    if (currentStep === 'complete') state = 'completed'
    else if (stepIndex < currentIndex) state = 'completed'
    else if (stepIndex === currentIndex) state = 'current'

    return (
      <div className={cn("flex gap-4 relative", !isLast && "pb-8")}>
        <div className={cn(
          "relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-[#09090b] shrink-0",
          state === 'completed' && "border-green-500 text-green-500 bg-green-500/10",
          state === 'current' && "border-primary text-primary animate-pulse",
          state === 'waiting' && "border-white/10 text-zinc-600"
        )}>
          {state === 'completed' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : state === 'current' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-current" />
          )}
        </div>

        {/* Connector Line */}
        {!isLast && (
          <div className={cn(
            "absolute left-4 top-8 bottom-0 w-0.5 -translate-x-1/2 transition-colors duration-300",
            state === 'completed' ? "bg-green-500/50" : "bg-white/5"
          )} />
        )}

        <div className="pt-1">
          <p className={cn(
            "font-medium text-sm transition-colors",
            state === 'waiting' ? "text-zinc-500" : "text-zinc-200"
          )}>
            {label}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {description}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-[#09090b] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-white">Bridge to Arc</h2>
            <p className="text-xs text-zinc-500 mt-1">Transfer USDC securely</p>
          </div>
          <button
            onClick={handleClose}
            disabled={status === 'bridging'}
            className="p-2 hover:bg-white/5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {status === 'idle' && (
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
                onClick={handleBridge}
                disabled={!currentChain || !bridgeAmount || parseFloat(bridgeAmount) <= 0}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {!currentChain ? 'Select Source Chain' :
                 !bridgeAmount ? 'Enter Amount' :
                 'Bridge Funds'}
              </button>
            </div>
          )}

          {status === 'bridging' && (
            <div className="py-2">
               <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                  <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
                  <ChainIcon name="arc" size={32} />
                </div>
                <h3 className="text-lg font-bold text-white">Bridging in Progress</h3>
                <p className="text-sm text-zinc-500 mt-1">Please keep this window open</p>
              </div>

              <div className="space-y-0 pl-4">
                <StepItem
                  step="preparing"
                  currentStep={bridgeStep}
                  label="Initiate Bridge"
                  description="Preparing connection..."
                />
                <StepItem
                  step="approving"
                  currentStep={bridgeStep}
                  label="Approve USDC"
                  description="Please sign the approval request"
                />
                <StepItem
                  step="burning"
                  currentStep={bridgeStep}
                  label="Bridge Transaction"
                  description="Burning tokens on source chain"
                />
                <StepItem
                  step="attesting"
                  currentStep={bridgeStep}
                  label="Attestation"
                  description="Verifying cross-chain message"
                />
                <StepItem
                  step="minting"
                  currentStep={bridgeStep}
                  label="Minting"
                  description="Finalizing on Arc Network"
                  isLast
                />
              </div>
            </div>
          )}

          {status === 'complete' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Bridge Complete!</h3>
              <p className="text-zinc-400 mb-8">
                Your funds have been successfully bridged to Arc Testnet.
              </p>

              <div className="space-y-3">
                {txHash && (
                  <a
                    href={`https://testnet.arcscan.app/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl transition-colors font-medium"
                  >
                    View on Explorer <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={handleClose}
                  className="w-full bg-white text-black hover:bg-zinc-200 py-3 rounded-xl transition-colors font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Bridge Failed</h3>
              <p className="text-zinc-400 mb-8 text-sm px-4">
                {formatError(error?.message || 'An unexpected error occurred')}
              </p>

              <button
                onClick={reset}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
