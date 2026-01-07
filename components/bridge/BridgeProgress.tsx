"use client";

import { BridgeStepItem } from "./BridgeStepItem";
import { PortalAnimation } from "./PortalAnimation";
import { getChainByWagmiId, ARC_TESTNET } from "@/lib/bridge-kit/chains";

interface BridgeProgressProps {
  currentStep: string;
  sourceChainId?: number;
  destinationChainId?: number;
}

type BridgeStep =
  | "preparing"
  | "approving"
  | "burning"
  | "attesting"
  | "minting"
  | "complete";

/**
 * Bridge Progress Component
 *
 * Displays the current progress of a bridge transaction with step-by-step status
 * and an animated portal visualization.
 */
export function BridgeProgress({
  currentStep,
  sourceChainId,
  destinationChainId,
}: BridgeProgressProps) {
  const destChain = destinationChainId
    ? getChainByWagmiId(destinationChainId)
    : ARC_TESTNET;
  const destChainName = destChain?.name || "destination chain";

  return (
    <div className="py-2 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm font-medium text-primary">
            Transaction in Progress
          </span>
        </div>
        <h3 className="text-xl font-bold text-white">
          Bridging to {destChainName}
        </h3>
        <p className="text-sm text-zinc-500 mt-1">
          Please keep this window open
        </p>
      </div>

      {/* Portal Animation */}
      <PortalAnimation
        currentStep={currentStep as BridgeStep}
        sourceChainId={sourceChainId}
        destinationChainId={destinationChainId}
        className="my-6"
      />

      {/* Step List */}
      <div className="space-y-0 pl-4 pt-2">
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
          label="Attestation (It can take 15 seconds)"
          description="Verifying cross-chain message"
        />
        <BridgeStepItem
          step="minting"
          currentStep={currentStep}
          label="Minting"
          description={`Finalizing on ${destChainName}`}
          isLast
        />
      </div>
    </div>
  );
}
