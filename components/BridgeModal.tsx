'use client'

import { useState, useEffect } from 'react'
import { X, ArrowDown, Loader2, CheckCircle, XCircle, ExternalLink, HelpCircle } from 'lucide-react'
import { useBridgeKit } from '@/hooks/useBridgeKit'
import { useAccount, useSwitchChain, useReadContract } from 'wagmi'
import { SUPPORTED_CHAINS, ARC_TESTNET } from '@/lib/bridge-kit/chains'
import { formatUnits } from 'viem'
import { ChainIcon } from '@/components/ChainIcon'

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
  onBridgeComplete: () => void
}

export default function BridgeModal({ isOpen, onClose, amount: defaultAmount, onBridgeComplete }: BridgeModalProps) {
  const { chain, address } = useAccount()
  const { switchChain } = useSwitchChain()
  const { bridgeToArc, status, bridgeStep, error, txHash, reset } = useBridgeKit()
  const [selectedChain, setSelectedChain] = useState(chain?.id)
  const [bridgeAmount, setBridgeAmount] = useState(defaultAmount)
  const [showChainDropdown, setShowChainDropdown] = useState(false)
  const [autoDonate, setAutoDonate] = useState(true)
  const [showTooltip, setShowTooltip] = useState(false)

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

  if (!isOpen) return null

  const handleBridge = async () => {
    try {
      // Ensure wallet is on the selected chain
      if (selectedChain && chain?.id !== selectedChain) {
        await switchChain({ chainId: selectedChain })
        // Wait a bit for the switch to complete
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      if (!selectedChain) {
        throw new Error('Please select a source chain')
      }

      // Pass selectedChain explicitly to avoid using stale chain state
      await bridgeToArc(bridgeAmount, selectedChain)

      // Bridge başarılı, auto-donate açıksa donation yap
      if (autoDonate) {
        setTimeout(() => {
          onBridgeComplete()
          handleClose()
        }, 2000)
      } else {
        // Auto-donate kapalıysa sadece modal'ı kapat
        setTimeout(() => {
          handleClose()
        }, 2000)
      }
    } catch (err) {
      console.error('Bridge failed:', err)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleChainSelect = async (chainId: number) => {
    setSelectedChain(chainId)
    if (chain?.id !== chainId) {
      await switchChain({ chainId })
    }
  }

  const currentChain = SUPPORTED_CHAINS.find(c => c.id === selectedChain)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">Bridge to Arc Network</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-secondary rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Display */}
          {status === 'idle' && (
            <>
              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Amount (USDC)
                </label>
                <input
                  type="number"
                  value={bridgeAmount}
                  onChange={(e) => setBridgeAmount(e.target.value)}
                  className="w-full bg-background border border-input rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Enter amount"
                  min="0.1"
                  step="0.1"
                />
              </div>

              {/* Auto-Donate Toggle */}
              <div className="bg-secondary/20 border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label htmlFor="auto-donate" className="text-sm font-medium cursor-pointer">
                      Auto-donate after bridge
                    </label>
                    <div className="relative">
                      <button
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                        className="text-muted-foreground hover:text-foreground transition"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                      {showTooltip && (
                        <div className="absolute left-0 top-6 w-64 bg-popover border border-border rounded-lg p-3 shadow-xl z-10">
                          <p className="text-xs text-muted-foreground">
                            When enabled, your bridged USDC will automatically be donated after the bridge completes.
                            If disabled, you'll need to manually confirm the donation.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    id="auto-donate"
                    onClick={() => setAutoDonate(!autoDonate)}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${autoDonate ? 'bg-primary' : 'bg-secondary'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${autoDonate ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>
              </div>

              {/* Bridge Route */}
              <div className="space-y-4">
                {/* From - Clickable Dropdown */}
                <div className="relative">
                  <p className="text-xs text-muted-foreground mb-2">From</p>
                  <button
                    type="button"
                    onClick={() => setShowChainDropdown(!showChainDropdown)}
                    className="w-full bg-secondary/30 hover:bg-secondary/50 border border-border rounded-lg p-4 flex items-center justify-between transition group"
                  >
                    {currentChain ? (
                      <div className="flex items-center gap-3">
                        <ChainIcon name={currentChain.iconName} size={40} />
                        <div className="text-left">
                          <p className="font-bold text-lg">{currentChain.name}</p>
                          {isLoadingBalance ? (
                            <p className="text-sm text-muted-foreground mt-1">Loading balance...</p>
                          ) : usdcBalance && parseFloat(usdcBalance) > 0 ? (
                            <p className="text-sm font-medium text-primary mt-1">
                              {parseFloat(usdcBalance).toFixed(2)} USDC
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground mt-1">0.00 USDC</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Select source network...</span>
                    )}
                    <svg
                      className={`w-5 h-5 text-muted-foreground transition-transform ${showChainDropdown ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showChainDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-background border border-border rounded-lg shadow-xl overflow-hidden">
                      {SUPPORTED_CHAINS.filter(c => !c.isDestination).map((supportedChain) => {
                        const isSelected = selectedChain === supportedChain.id
                        const showBalance = isSelected && usdcBalance && parseFloat(usdcBalance) > 0
                        const balance = showBalance
                          ? parseFloat(usdcBalance).toFixed(2)
                          : '0.00'

                        return (
                          <button
                            key={supportedChain.id}
                            type="button"
                            onClick={() => {
                              handleChainSelect(supportedChain.id)
                              setShowChainDropdown(false)
                            }}
                            className={`
                              w-full px-4 py-3 flex items-center gap-3 transition
                              ${isSelected
                                ? 'bg-primary/10 border-l-4 border-primary'
                                : 'hover:bg-secondary/50 border-l-4 border-transparent'}
                            `}
                          >
                            <ChainIcon name={supportedChain.iconName} size={32} />
                            <div className="text-left flex-1">
                              <p className="font-medium">{supportedChain.name}</p>
                              {showBalance && (
                                <p className="text-xs font-medium text-primary mt-1">
                                  {balance} USDC
                                </p>
                              )}
                            </div>
                            {isSelected && (
                              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <div className="bg-primary/20 p-2 rounded-full">
                    <ArrowDown className="w-5 h-5 text-primary" />
                  </div>
                </div>

                {/* To */}
                <div className="bg-secondary/30 rounded-lg p-4 border border-border">
                  <p className="text-xs text-muted-foreground mb-2">To</p>
                  <div className="flex items-center gap-3">
                    <ChainIcon name={ARC_TESTNET.iconName} size={40} />
                    <div>
                      <p className="font-bold text-lg">{ARC_TESTNET.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{bridgeAmount} USDC</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-xs text-blue-400">
                  ℹ️ Bridge will take 1-2 minutes. Please don't close this window.
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={handleBridge}
                disabled={!currentChain}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentChain ? 'Start Bridge' : 'Select a network first'}
              </button>
            </>
          )}

          {/* Bridging Progress Stepper */}
          {status === 'bridging' && (
            <div className="py-6 space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold">Bridging in Progress</h3>
                <p className="text-sm text-muted-foreground mt-1">Please follow the steps below</p>
              </div>

              <div className="space-y-6 px-4">
                {/* Step 1: Initiate */}
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors z-10 relative bg-background
                      ${bridgeStep !== 'preparing' ? 'border-green-500 text-green-500' : 'border-primary text-primary'}
                    `}>
                      {bridgeStep !== 'preparing' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      )}
                    </div>
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-border z-0" />
                  </div>
                  <div className="pt-1">
                    <p className={`font-medium ${bridgeStep === 'preparing' ? 'text-foreground' : 'text-muted-foreground'}`}>
                      Initiate Bridge
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Preparing bridge adapter...
                    </p>
                  </div>
                </div>

                {/* Step 2: Approve */}
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors z-10 relative bg-background
                      ${bridgeStep === 'approving' ? 'border-primary text-primary' :
                        ['burning', 'attesting', 'minting', 'complete'].includes(bridgeStep) ? 'border-green-500 text-green-500' : 'border-border text-muted-foreground'}
                    `}>
                      {bridgeStep === 'approving' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : ['burning', 'attesting', 'minting', 'complete'].includes(bridgeStep) ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-xs font-bold">2</span>
                      )}
                    </div>
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-border z-0" />
                  </div>
                  <div className="pt-1">
                    <p className={`font-medium ${bridgeStep === 'approving' ? 'text-foreground' : 'text-muted-foreground'}`}>
                      Approve USDC
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Allow bridge to spend your USDC
                    </p>
                  </div>
                </div>

                {/* Step 3: Burn / Bridge */}
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors z-10 relative bg-background
                      ${bridgeStep === 'burning' ? 'border-primary text-primary' :
                        ['attesting', 'minting', 'complete'].includes(bridgeStep) ? 'border-green-500 text-green-500' : 'border-border text-muted-foreground'}
                    `}>
                      {bridgeStep === 'burning' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : ['attesting', 'minting', 'complete'].includes(bridgeStep) ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-xs font-bold">3</span>
                      )}
                    </div>
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-border z-0" />
                  </div>
                  <div className="pt-1">
                    <p className={`font-medium ${bridgeStep === 'burning' ? 'text-foreground' : 'text-muted-foreground'}`}>
                      Bridge Transaction
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Sign the bridge transaction
                    </p>
                  </div>
                </div>

                {/* Step 4: Attestation */}
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors z-10 relative bg-background
                      ${bridgeStep === 'attesting' ? 'border-primary text-primary' :
                        ['minting', 'complete'].includes(bridgeStep) ? 'border-green-500 text-green-500' : 'border-border text-muted-foreground'}
                    `}>
                      {bridgeStep === 'attesting' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : ['minting', 'complete'].includes(bridgeStep) ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-xs font-bold">4</span>
                      )}
                    </div>
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-border z-0" />
                  </div>
                  <div className="pt-1">
                    <p className={`font-medium ${bridgeStep === 'attesting' ? 'text-foreground' : 'text-muted-foreground'}`}>
                      Awaiting Attestation
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Waiting for Circle confirmation...
                    </p>
                  </div>
                </div>

                {/* Step 5: Mint / Complete */}
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors z-10 relative bg-background
                    ${['minting', 'complete'].includes(bridgeStep) ? 'border-green-500 text-green-500' : 'border-border text-muted-foreground'}
                  `}>
                    {bridgeStep === 'complete' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : bridgeStep === 'minting' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <span className="text-xs font-bold">5</span>
                    )}
                  </div>
                  <div className="pt-1">
                    <p className={`font-medium ${['minting', 'complete'].includes(bridgeStep) ? 'text-foreground' : 'text-muted-foreground'}`}>
                      Mint & Complete
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Finalizing transfer on Arc Network
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Complete */}
          {status === 'complete' && (
            <div className="space-y-4 text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <div>
                <p className="font-bold text-lg text-green-500">Bridge Complete! 🎉</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Your USDC is now on Arc Network
                </p>
                {txHash && (
                  <a
                    href={`https://testnet.arcscan.com/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                  >
                    View Transaction <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="space-y-4 text-center py-8">
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
              <div>
                <p className="font-bold text-lg text-red-500">Bridge Failed</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {error?.message || 'Unknown error occurred'}
                </p>
                <button
                  onClick={reset}
                  className="mt-4 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
