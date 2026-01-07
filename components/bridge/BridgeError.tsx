"use client";

import { AlertCircle, RefreshCw, ExternalLink, Clock } from "lucide-react";
import { getChainByWagmiId, ARC_TESTNET } from "@/lib/bridge-kit/chains";

interface BridgeErrorProps {
  error?: Error | null;
  txHash?: string | null;
  destinationChainId?: number | null;
  onRetry: () => void;
}

/**
 * Bridge Error Component
 *
 * Displays error message and retry option when bridge fails.
 * Shows special handling for timeout errors when tx hash exists.
 */
export function BridgeError({
  error,
  txHash,
  destinationChainId,
  onRetry,
}: BridgeErrorProps) {
  const isTimeout = error?.message?.toLowerCase().includes("timed out");
  const hasTxHash = !!txHash;

  // Get destination chain info for explorer link
  const destChain = destinationChainId
    ? getChainByWagmiId(destinationChainId)
    : ARC_TESTNET;
  const explorerUrl = destChain?.explorerUrl || ARC_TESTNET.explorerUrl;

  const formatError = (message: string) => {
    if (!message) return "Unknown error occurred";
    let cleanMessage = message.split("Request Arguments:")[0];
    cleanMessage = cleanMessage.split("Details:")[0];
    return cleanMessage.replace(/^Error:\s*/, "").trim();
  };

  // Special handling: Timeout with tx hash - likely successful
  if (isTimeout && hasTxHash) {
    return (
      <div className="text-center py-6 relative">
        {/* Warning background glow */}
        <div className="absolute inset-0 bg-linear-to-b from-amber-500/5 to-transparent rounded-2xl" />

        <div className="relative z-10">
          {/* Warning Icon */}
          <div className="relative inline-block mb-6">
            <div className="absolute -inset-3 bg-amber-500/10 rounded-full blur-lg" />
            <div className="relative w-20 h-20 bg-linear-to-br from-amber-400/20 to-amber-600/20 border border-amber-500/30 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-amber-500" />
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">
            Transaction Sent
          </h3>
          <p className="text-zinc-400 mb-6 text-sm px-4 leading-relaxed">
            Your bridge transaction was submitted but confirmation timed out.
            The transfer is likely successful - please check the explorer.
          </p>

          <div className="space-y-3">
            <a
              href={`${explorerUrl}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 py-3.5 rounded-xl transition-all font-medium border border-amber-500/30"
            >
              <ExternalLink className="w-4 h-4" />
              View on Explorer
            </a>
            <button
              onClick={onRetry}
              className="w-full flex items-center justify-center gap-2 bg-zinc-800/80 hover:bg-zinc-700 text-white py-3.5 rounded-xl transition-all font-medium hover-glow border border-white/5"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Regular error handling
  return (
    <div className="text-center py-6 relative">
      {/* Error background glow */}
      <div className="absolute inset-0 bg-linear-to-b from-red-500/5 to-transparent rounded-2xl" />

      <div className="relative z-10">
        {/* Error Icon */}
        <div className="relative inline-block mb-6">
          <div className="absolute -inset-3 bg-red-500/10 rounded-full blur-lg" />
          <div className="relative w-20 h-20 bg-linear-to-br from-red-400/20 to-red-600/20 border border-red-500/30 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">Bridge Failed</h3>
        <p className="text-zinc-400 mb-8 text-sm px-4 leading-relaxed">
          {formatError(error?.message || "An unexpected error occurred")}
        </p>

        <button
          onClick={onRetry}
          className="w-full flex items-center justify-center gap-2 bg-zinc-800/80 hover:bg-zinc-700 text-white py-3.5 rounded-xl transition-all font-medium hover-glow border border-white/5"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
