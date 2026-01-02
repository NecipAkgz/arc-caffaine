"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

interface BridgeErrorProps {
  error?: Error | null;
  onRetry: () => void;
}

/**
 * Bridge Error Component
 *
 * Displays error message and retry option when bridge fails.
 * Enhanced with better visual feedback.
 */
export function BridgeError({ error, onRetry }: BridgeErrorProps) {
  const formatError = (message: string) => {
    if (!message) return "Unknown error occurred";
    let cleanMessage = message.split("Request Arguments:")[0];
    cleanMessage = cleanMessage.split("Details:")[0];
    return cleanMessage.replace(/^Error:\s*/, "").trim();
  };

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
