"use client";

import {
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Clock,
  Wallet,
  Wifi,
  Link2,
} from "lucide-react";
import { getChainByWagmiId, ARC_TESTNET } from "@/lib/bridge-kit/chains";
import {
  getSmartErrorInfo,
  type SmartErrorInfo,
} from "@/lib/bridge-kit/bridge-errors";

interface BridgeErrorProps {
  error?: Error | null;
  txHash?: string | null;
  destinationChainId?: number | null;
  onRetry: () => void;
}

/**
 * Bridge Error Component
 *
 * Displays smart, context-aware error messages using Bridge Kit
 * error type guards for better user experience.
 */
export function BridgeError({
  error,
  txHash,
  destinationChainId,
  onRetry,
}: BridgeErrorProps) {
  const errorInfo = getSmartErrorInfo(error);
  const isTimeout = error?.message?.toLowerCase().includes("timed out");
  const hasTxHash = !!txHash;

  // Get destination chain info for explorer link
  const destChain = destinationChainId
    ? getChainByWagmiId(destinationChainId)
    : ARC_TESTNET;
  const explorerUrl = destChain?.explorerUrl || ARC_TESTNET.explorerUrl;

  // Render icon based on error type
  const renderIcon = (info: SmartErrorInfo) => {
    const iconClass = "w-10 h-10";

    switch (info.icon) {
      case "balance":
        return <Wallet className={`${iconClass} text-amber-500`} />;
      case "network":
        return <Wifi className={`${iconClass} text-orange-500`} />;
      case "chain":
        return <Link2 className={`${iconClass} text-blue-500`} />;
      case "warning":
        return <Clock className={`${iconClass} text-amber-500`} />;
      default:
        return <AlertCircle className={`${iconClass} text-red-500`} />;
    }
  };

  // Get color theme based on severity
  const getColorTheme = (severity: SmartErrorInfo["severity"]) => {
    switch (severity) {
      case "warning":
        return {
          bg: "from-amber-500/5",
          iconBg: "from-amber-400/20 to-amber-600/20",
          iconBorder: "border-amber-500/30",
          glow: "bg-amber-500/10",
        };
      case "fatal":
        return {
          bg: "from-violet-500/5",
          iconBg: "from-violet-400/20 to-violet-600/20",
          iconBorder: "border-violet-500/30",
          glow: "bg-violet-500/10",
        };
      default:
        return {
          bg: "from-red-500/5",
          iconBg: "from-red-400/20 to-red-600/20",
          iconBorder: "border-red-500/30",
          glow: "bg-red-500/10",
        };
    }
  };

  const theme = getColorTheme(errorInfo.severity);

  // Special handling: Timeout with tx hash - likely successful
  if (isTimeout && hasTxHash) {
    return (
      <div className="text-center py-6 relative">
        <div className="absolute inset-0 bg-linear-to-b from-amber-500/5 to-transparent rounded-2xl" />

        <div className="relative z-10">
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

  // Smart error handling with context-aware UI
  return (
    <div className="text-center py-6 relative">
      {/* Background glow */}
      <div
        className={`absolute inset-0 bg-linear-to-b ${theme.bg} to-transparent rounded-2xl`}
      />

      <div className="relative z-10">
        {/* Icon */}
        <div className="relative inline-block mb-6">
          <div
            className={`absolute -inset-3 ${theme.glow} rounded-full blur-lg`}
          />
          <div
            className={`relative w-20 h-20 bg-linear-to-br ${theme.iconBg} border ${theme.iconBorder} rounded-full flex items-center justify-center`}
          >
            {renderIcon(errorInfo)}
          </div>
        </div>

        {/* Title & Message */}
        <h3 className="text-xl font-bold text-white mb-2">{errorInfo.title}</h3>
        <p className="text-zinc-400 mb-8 text-sm px-4 leading-relaxed">
          {errorInfo.message}
        </p>

        {/* Actions */}
        <div className="space-y-3">
          {errorInfo.isRetryable && (
            <button
              onClick={onRetry}
              className="w-full flex items-center justify-center gap-2 bg-zinc-800/80 hover:bg-zinc-700 text-white py-3.5 rounded-xl transition-all font-medium hover-glow border border-white/5"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
          {!errorInfo.isRetryable && (
            <button
              onClick={onRetry}
              className="w-full flex items-center justify-center gap-2 bg-zinc-800/80 hover:bg-zinc-700 text-white py-3.5 rounded-xl transition-all font-medium hover-glow border border-white/5"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
