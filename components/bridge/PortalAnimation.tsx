"use client";

import { cn } from "@/lib/utils";
import { ChainIcon } from "@/components/ChainIcon";
import { getChainByWagmiId } from "@/lib/bridge-kit/chains";

type BridgeStep =
  | "preparing"
  | "approving"
  | "burning"
  | "attesting"
  | "minting"
  | "complete";

interface PortalAnimationProps {
  currentStep: BridgeStep;
  sourceChainId?: number;
  className?: string;
}

const STEP_ORDER: BridgeStep[] = [
  "preparing",
  "approving",
  "burning",
  "attesting",
  "minting",
  "complete",
];

type PortalState = "idle" | "active" | "complete";

/**
 * Portal Animation Component - "Galactic Bridge" Edition
 *
 * A high-end, cinematic visualization of the cross-chain bridge.
 */
export function PortalAnimation({
  currentStep,
  sourceChainId,
  className,
}: PortalAnimationProps) {
  const stepIndex = STEP_ORDER.indexOf(currentStep);
  const isComplete = currentStep === "complete";
  const isFlowing = stepIndex >= 2 && !isComplete;

  // Get source chain info
  const sourceChain = sourceChainId ? getChainByWagmiId(sourceChainId) : null;
  const sourceIconName = sourceChain?.iconName || "ethereum";
  const sourceName = sourceChain?.name?.split(" ")[0] || "Source";

  // Determine states
  const sourceState: PortalState = isComplete
    ? "complete"
    : stepIndex >= 0
    ? "active"
    : "idle";
  const destState: PortalState = isComplete
    ? "complete"
    : stepIndex >= 4
    ? "active"
    : "idle";

  return (
    <div
      className={cn("relative w-full py-12 px-4 overflow-visible", className)}
    >
      {/* Ambient background glow for the whole scene */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-24 bg-primary/5 blur-3xl rounded-full pointer-events-none" />

      {/* Main Connection Layer */}
      <div className="absolute top-1/2 left-0 w-full h-20 -translate-y-1/2 pointer-events-none">
        <ConnectionBeam isFlowing={isFlowing} isComplete={isComplete} />
      </div>

      {/* Nodes Container */}
      <div className="relative flex items-center justify-between z-10 mx-auto max-w-sm">
        <PortalNode
          iconName={sourceIconName}
          name={sourceName}
          state={sourceState}
          align="left"
        />
        <PortalNode iconName="arc" name="Arc" state={destState} align="right" />
      </div>
    </div>
  );
}

function ConnectionBeam({
  isFlowing,
  isComplete,
}: {
  isFlowing: boolean;
  isComplete: boolean;
}) {
  return (
    <div className="absolute top-1/2 left-20 right-20 h-[2px] -translate-y-1/2 z-0">
      {/* 1. Base Track (Inactive) */}
      <div className="absolute inset-0 bg-zinc-800 rounded-full" />

      {/* 2. Active Beam Container */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-700",
          isFlowing || isComplete ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Outer Glow Aura */}
        <div
          className={cn(
            "absolute inset-y-[-4px] inset-x-0 rounded-full blur-md transition-colors duration-500",
            isComplete ? "bg-green-500/40" : "bg-primary/30"
          )}
        />

        {/* Inner Core Glow */}
        <div
          className={cn(
            "absolute -inset-y-px inset-x-0 rounded-full blur-[1px] transition-colors duration-500",
            isComplete ? "bg-green-400/60" : "bg-primary/50"
          )}
        />

        {/* The Beam Itself */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          {isComplete ? (
            /* Complete State: Solid Green Beam */
            <div className="absolute inset-0 bg-linear-to-r from-green-600 via-green-400 to-green-600 animate-pulse" />
          ) : (
            /* Flowing State: Moving Light Beam */
            <div
              className="absolute inset-0 w-full h-full animate-beam-flow"
              style={{
                background:
                  "linear-linear(90deg, transparent 0%, transparent 20%, rgba(245, 158, 11, 0.2) 30%, #fff 45%, rgba(245, 158, 11, 0.8) 50%, rgba(245, 158, 11, 0.2) 70%, transparent 80%, transparent 100%)",
                backgroundSize: "200% 100%",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface PortalNodeProps {
  iconName: string;
  name: string;
  state: PortalState;
  align: "left" | "right";
}

function PortalNode({ iconName, name, state, align }: PortalNodeProps) {
  const isActive = state === "active";
  const isComplete = state === "complete";

  return (
    <div className="relative group">
      {/* 1. Background Aura (Large Blur) */}
      <div
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-3xl transition-opacity duration-1000",
          isActive ? "bg-primary/20 opacity-100" : "opacity-0",
          isComplete && "bg-green-500/20 opacity-100"
        )}
      />

      {/* 2. Rotating Rings (The 'Stargate' effect) */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer Static Ring */}
        <div
          className={cn(
            "absolute inset-0 rounded-full border border-white/5 transition-all duration-500",
            isActive && "border-primary/20 scale-100",
            isComplete && "border-green-500/20 scale-100",
            !isActive && !isComplete && "scale-90 opacity-50"
          )}
        />

        {/* Dynamic Rotating Ring */}
        {(isActive || isComplete) && (
          <div
            className={cn(
              "absolute inset-1 rounded-full border-t border-r border-transparent transition-all duration-700",
              isActive &&
                "border-primary/60 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-spin-slow",
              isComplete &&
                "border-green-500/60 shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-spin-slow"
            )}
            style={{ animationDuration: "8s" }}
          />
        )}

        {/* Counter-Rotating Ring */}
        {(isActive || isComplete) && (
          <div
            className={cn(
              "absolute inset-3 rounded-full border-b border-l border-transparent transition-all duration-700",
              isActive && "border-primary/40",
              isComplete && "border-green-500/40"
            )}
            style={{ animation: "spin 6s linear infinite reverse" }}
          />
        )}

        {/* 3. Core Container */}
        <div
          className={cn(
            "relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 z-10",
            "bg-[#09090b] shadow-2xl",
            isActive && "shadow-[0_0_30px_-5px_rgba(245,158,11,0.4)]",
            isComplete && "shadow-[0_0_30px_-5px_rgba(34,197,94,0.4)]",
            !isActive && !isComplete && "border border-white/5 bg-zinc-900"
          )}
        >
          {/* Core Glow Pulse */}
          {(isActive || isComplete) && (
            <div
              className={cn(
                "absolute inset-0 rounded-full opacity-50 animate-pulse",
                isActive ? "bg-primary/20" : "bg-green-500/20"
              )}
            />
          )}

          {/* Icon */}
          <div className="relative z-20">
            <ChainIcon name={iconName} size={32} />
          </div>
        </div>

        {/* 4. Particle Emitters (Small dots orbiting) */}
        {isActive && !isComplete && (
          <div
            className="absolute inset-0 animate-spin-slow"
            style={{ animationDuration: "12s" }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_var(--primary)]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-1.5 h-1.5 bg-amber-200 rounded-full shadow-[0_0_10px_var(--primary)]" />
          </div>
        )}
      </div>

      {/* Label */}
      <div
        className={cn(
          "absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-center transition-all duration-500",
          isActive ? "translate-y-0 opacity-100" : "translate-y--1 opacity-70"
        )}
      >
        <span
          className={cn(
            "text-sm font-bold tracking-widest uppercase",
            isComplete
              ? "text-green-400"
              : isActive
              ? "text-primary"
              : "text-zinc-600"
          )}
        >
          {name}
        </span>
      </div>
    </div>
  );
}
