"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ArrowUpDown,
  AlertCircle,
  Wallet,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useAccount, useSwitchChain, useReadContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  SUPPORTED_CHAINS,
  ARC_TESTNET,
  ARC_TESTNET_ID,
} from "@/lib/bridge-kit/chains";
import { formatUnits } from "viem";
import { ChainIcon } from "@/components/ChainIcon";
import { cn } from "@/lib/utils";

// ERC20 ABI for balanceOf function
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
] as const;

type BridgeDirection = "toArc" | "fromArc";

interface BridgeFormProps {
  defaultAmount: string;
  onBridge: (
    amount: string,
    fromChainId: number,
    toChainId: number
  ) => Promise<void>;
}

/**
 * Bridge Form Component
 *
 * Handles the input form for selecting source/destination chain and amount to bridge.
 * Supports bi-directional bridging with a switch button.
 */
export function BridgeForm({ defaultAmount, onBridge }: BridgeFormProps) {
  const { chain, address, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  // Direction state - toArc: Other → Arc, fromArc: Arc → Other
  const [direction, setDirection] = useState<BridgeDirection>("toArc");

  // Get available chains excluding Arc (for the "other" chain selection)
  const otherChains = useMemo(
    () => SUPPORTED_CHAINS.filter((c) => c.id !== ARC_TESTNET_ID),
    []
  );

  // Initialize selected "other" chain
  const getInitialOtherChain = () => {
    if (chain && otherChains.some((c) => c.id === chain.id)) {
      return chain.id;
    }
    return otherChains[0]?.id;
  };

  const [selectedOtherChain, setSelectedOtherChain] =
    useState(getInitialOtherChain);
  const [bridgeAmount, setBridgeAmount] = useState(defaultAmount);
  const [showChainDropdown, setShowChainDropdown] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Determine from/to chains based on direction
  const fromChainId =
    direction === "toArc" ? selectedOtherChain : ARC_TESTNET_ID;
  const toChainId = direction === "toArc" ? ARC_TESTNET_ID : selectedOtherChain;

  const fromChain = SUPPORTED_CHAINS.find((c) => c.id === fromChainId);
  const toChain = SUPPORTED_CHAINS.find((c) => c.id === toChainId);

  // Fetch USDC balance for the FROM chain
  const { data: balanceData } = useReadContract({
    address: fromChain?.usdcAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: fromChainId,
    query: {
      enabled: !!address && !!fromChain?.usdcAddress && !!fromChainId,
    },
  });

  const usdcBalance = balanceData
    ? formatUnits(balanceData as bigint, 6)
    : "0.00";

  // Sync bridge amount when default amount changes
  useEffect(() => {
    setBridgeAmount(defaultAmount);
  }, [defaultAmount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showChainDropdown &&
        !(event.target as Element).closest(".chain-selector")
      ) {
        setShowChainDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showChainDropdown]);

  const handleChainSelect = async (chainId: number) => {
    setSelectedOtherChain(chainId);
    setShowChainDropdown(false);
    // Switch wallet to the from chain if needed
    const targetFromChain = direction === "toArc" ? chainId : ARC_TESTNET_ID;
    if (chain?.id !== targetFromChain) {
      await switchChain({ chainId: targetFromChain });
    }
  };

  const handleSwitch = () => {
    setDirection((prev) => (prev === "toArc" ? "fromArc" : "toArc"));
    setShowChainDropdown(false);
  };

  const handleSubmit = async () => {
    if (!fromChainId || !toChainId) return;

    // Switch chain to source if needed
    if (chain?.id !== fromChainId) {
      await switchChain({ chainId: fromChainId });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    await onBridge(bridgeAmount, fromChainId, toChainId);
  };

  // Render the chain selector dropdown (for non-Arc chain)
  const renderChainSelector = () => (
    <div className="relative chain-selector">
      <button
        onClick={() => setShowChainDropdown(!showChainDropdown)}
        className={cn(
          "flex items-center gap-2 bg-black/40 border rounded-xl px-3 py-2.5 transition-all w-[180px] hover-glow",
          showChainDropdown
            ? "border-primary/50 bg-black/60"
            : "border-white/10 hover:border-white/20"
        )}
      >
        {otherChains.find((c) => c.id === selectedOtherChain) ? (
          <>
            <ChainIcon
              name={
                otherChains.find((c) => c.id === selectedOtherChain)!.iconName
              }
              size={24}
            />
            <span className="font-medium text-sm text-white truncate flex-1 text-left">
              {otherChains.find((c) => c.id === selectedOtherChain)!.name}
            </span>
          </>
        ) : (
          <span className="text-sm text-zinc-400">Select Chain</span>
        )}
        <ChevronDown
          className={cn(
            "w-4 h-4 text-zinc-500 transition-transform duration-200",
            showChainDropdown && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {showChainDropdown && (
        <div className="absolute top-full left-0 mt-2 w-60 bg-[#111] border border-white/10 rounded-xl shadow-xl overflow-hidden z-20 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {otherChains.map((chainItem) => (
            <button
              key={chainItem.id}
              onClick={() => handleChainSelect(chainItem.id)}
              className={cn(
                "w-full px-3 py-2.5 flex items-center gap-3 transition-all text-left",
                selectedOtherChain === chainItem.id
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-white/5 text-zinc-300"
              )}
            >
              <ChainIcon name={chainItem.iconName} size={20} />
              <span className="text-sm font-medium">{chainItem.name}</span>
              {selectedOtherChain === chainItem.id && (
                <CheckCircle2 className="w-4 h-4 ml-auto" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Render Arc Testnet display (non-selectable)
  const renderArcChain = () => (
    <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-3 py-2.5 w-[180px]">
      <ChainIcon name={ARC_TESTNET.iconName} size={24} />
      <span className="font-medium text-sm text-white">{ARC_TESTNET.name}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* From/To Container with Switch Button */}
      <div className="relative">
        {/* From Section */}
        <div
          className={cn(
            "bg-zinc-900/50 rounded-2xl p-4 border transition-all duration-300",
            isInputFocused
              ? "border-primary/30 shadow-lg shadow-primary/5"
              : "border-white/5"
          )}
        >
          <div className="flex justify-between text-sm mb-3">
            <span className="text-zinc-400">From</span>
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Wallet className="w-3.5 h-3.5" />
              <span className="font-medium">
                {parseFloat(usdcBalance).toFixed(2)} USDC
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Chain Display - Arc or Selector depending on direction */}
            {direction === "toArc" ? renderChainSelector() : renderArcChain()}

            {/* Amount Input */}
            <input
              type="number"
              value={bridgeAmount}
              onChange={(e) => setBridgeAmount(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-right text-2xl font-bold text-white placeholder-zinc-600 outline-none min-w-0 transition-all"
            />
          </div>
        </div>

        {/* Gap between From and To */}
        <div className="h-16" />

        {/* To Section */}
        <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/5">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-zinc-400">To</span>
            <span className="text-xs text-primary/60">
              {direction === "toArc" ? "Arc Testnet" : "Other Chain"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            {/* Chain Display - Selector or Arc depending on direction */}
            {direction === "toArc" ? renderArcChain() : renderChainSelector()}

            <span
              className={cn(
                "text-2xl font-bold transition-colors",
                bridgeAmount && parseFloat(bridgeAmount) > 0
                  ? "text-white"
                  : "text-zinc-500"
              )}
            >
              {bridgeAmount || "0.00"}
            </span>
          </div>
        </div>

        {/* Switch Button - Absolute positioned in center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <button
            onClick={handleSwitch}
            className="bg-[#09090b] p-2.5 rounded-full border border-white/10 shadow-lg hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 cursor-pointer"
            aria-label="Switch direction"
          >
            <ArrowUpDown
              className={cn(
                "w-5 h-5 text-primary transition-transform duration-300",
                direction === "fromArc" && "rotate-180"
              )}
            />
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex gap-3">
        <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-primary/80 leading-relaxed">
          {direction === "toArc"
            ? "Bridge usually takes 1-2 minutes. You will receive USDC on Arc Testnet automatically."
            : "Bridge from Arc Testnet usually takes 1-2 minutes. You will receive USDC on the destination chain."}
        </p>
      </div>

      <a
        href="https://faucet.circle.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 text-sm text-zinc-400 hover:text-primary transition-colors py-2"
      >
        <span>Need test USDC? Get from Circle Faucet</span>
        <ExternalLink className="w-4 h-4" />
      </a>

      {/* Action Button */}
      {!isConnected ? (
        <ConnectButton.Custom>
          {({ openConnectModal, mounted }) => (
            <button
              type="button"
              onClick={openConnectModal}
              disabled={!mounted}
              className={cn(
                "w-full py-4 rounded-xl font-bold transition-all duration-300",
                "bg-linear-to-r from-primary to-amber-500 text-primary-foreground",
                "hover:from-primary/90 hover:to-amber-500/90",
                "cursor-pointer",
                "shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02]",
                "flex items-center justify-center gap-2"
              )}
            >
              <Wallet className="w-5 h-5" />
              Connect Wallet
            </button>
          )}
        </ConnectButton.Custom>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={
            !fromChain ||
            !toChain ||
            !bridgeAmount ||
            parseFloat(bridgeAmount) <= 0
          }
          className={cn(
            "w-full py-4 rounded-xl font-bold transition-all duration-300",
            "bg-linear-to-r from-primary to-amber-500 text-primary-foreground",
            "hover:from-primary/90 hover:to-amber-500/90",
            "cursor-pointer",
            "shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100",
            "disabled:from-zinc-700 disabled:to-zinc-600"
          )}
        >
          {!fromChain
            ? "Select Source Chain"
            : !bridgeAmount || parseFloat(bridgeAmount) <= 0
            ? "Enter Amount"
            : direction === "toArc"
            ? "Bridge to Arc"
            : "Bridge from Arc"}
        </button>
      )}
    </div>
  );
}
