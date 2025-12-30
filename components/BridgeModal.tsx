"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useBridgeKit } from "@/hooks/useBridgeKit";
import { BridgeForm } from "./bridge/BridgeForm";
import { BridgeProgress } from "./bridge/BridgeProgress";
import { BridgeComplete } from "./bridge/BridgeComplete";
import { BridgeError } from "./bridge/BridgeError";

interface BridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
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
export default function BridgeModal({
  isOpen,
  onClose,
  amount,
}: BridgeModalProps) {
  const {
    bridgeToArc,
    status,
    bridgeStep,
    error,
    txHash,
    sourceChainId,
    reset,
  } = useBridgeKit();

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && status !== "bridging") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, status]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (status === "bridging") return; // Prevent closing while bridging
    reset();
    onClose();
  };

  const handleBridge = async (bridgeAmount: string, selectedChain: number) => {
    try {
      await bridgeToArc(bridgeAmount, selectedChain);
    } catch (err) {
      console.error("Bridge failed:", err);
    }
  };

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
            disabled={status === "bridging"}
            className="p-2 hover:bg-white/5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-zinc-400 hover:text-white"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {status === "idle" && (
            <BridgeForm defaultAmount={amount} onBridge={handleBridge} />
          )}

          {status === "bridging" && <BridgeProgress currentStep={bridgeStep} />}

          {status === "complete" && (
            <BridgeComplete
              txHash={txHash ?? undefined}
              sourceChainId={sourceChainId ?? undefined}
              onClose={handleClose}
            />
          )}

          {status === "error" && <BridgeError error={error} onRetry={reset} />}
        </div>
      </div>
    </div>
  );
}
