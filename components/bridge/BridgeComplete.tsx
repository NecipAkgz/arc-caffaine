"use client";

import { CheckCircle2, ExternalLink, Sparkles } from "lucide-react";
import { getChainByWagmiId } from "@/lib/bridge-kit/chains";

interface BridgeCompleteProps {
  txHash?: string;
  sourceChainId?: number;
  onClose: () => void;
}

/**
 * Bridge Complete Component
 *
 * Displays success message with elegant animation and transaction details.
 */
export function BridgeComplete({
  txHash,
  sourceChainId,
  onClose,
}: BridgeCompleteProps) {
  // Get the source chain's explorer URL
  const sourceChain = sourceChainId ? getChainByWagmiId(sourceChainId) : null;
  const explorerUrl = sourceChain?.explorerUrl || "https://testnet.arcscan.app";

  return (
    <div className="text-center py-6 relative">
      {/* Subtle celebration background glow */}
      <div className="absolute inset-0 bg-linear-to-b from-green-500/5 via-transparent to-transparent rounded-2xl" />

      <div className="relative z-10">
        {/* Success Icon with elegant glow */}
        <div className="relative inline-block mb-6">
          {/* Pulsing outer glow */}
          <div className="absolute -inset-4 bg-green-500/20 rounded-full blur-xl animate-pulse" />

          {/* Icon container */}
          <div className="relative w-20 h-20 bg-linear-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>

          {/* Subtle sparkle accent */}
          <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-green-400 animate-pulse" />
        </div>

        {/* Success text */}
        <h3 className="text-2xl font-bold text-white mb-2">Bridge Complete!</h3>
        <p className="text-zinc-400 mb-8">
          Your funds have been successfully bridged to Arc Testnet.
        </p>

        {/* Action buttons */}
        <div className="space-y-3">
          {txHash && (
            <a
              href={`${explorerUrl}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-zinc-800/80 hover:bg-zinc-700 text-white py-3.5 rounded-xl transition-all font-medium hover-glow border border-white/5"
            >
              View on Explorer <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={onClose}
            className="w-full bg-linear-to-r from-green-500 to-green-600 hover:from-green-500/90 hover:to-green-600/90 text-white py-3.5 rounded-xl transition-all font-bold shadow-lg shadow-green-500/20"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
