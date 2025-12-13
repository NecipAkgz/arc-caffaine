'use client'

import { ChainIcon } from '@/components/ChainIcon'
import { BridgeStepItem } from './BridgeStepItem'

interface BridgeProgressProps {
  currentStep: string
}

/**
 * Bridge Progress Component
 *
 * Displays the current progress of a bridge transaction with step-by-step status.
 */
export function BridgeProgress({ currentStep }: BridgeProgressProps) {
  return (
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
        <BridgeStepItem
          step="preparing"
          currentStep={currentStep}
          label="Initiate Bridge"
          description="Preparing connection..."
        />
        <BridgeStepItem
          step="approving"
          currentStep={currentStep}
          label="Approve USDC"
          description="Please sign the approval request"
        />
        <BridgeStepItem
          step="burning"
          currentStep={currentStep}
          label="Bridge Transaction"
          description="Burning tokens on source chain"
        />
        <BridgeStepItem
          step="attesting"
          currentStep={currentStep}
          label="Attestation"
          description="Verifying cross-chain message"
        />
        <BridgeStepItem
          step="minting"
          currentStep={currentStep}
          label="Minting"
          description="Finalizing on Arc Network"
          isLast
        />
      </div>
    </div>
  )
}
