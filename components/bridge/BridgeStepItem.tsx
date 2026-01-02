"use client";

import { CheckCircle2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type StepState = "waiting" | "current" | "completed";

interface BridgeStepItemProps {
  step: string;
  label: string;
  description: string;
  currentStep: string;
  isLast?: boolean;
}

const STEPS = [
  "preparing",
  "approving",
  "burning",
  "attesting",
  "minting",
  "complete",
];

/**
 * Bridge Step Item Component
 *
 * Displays a single step in the bridge progress stepper with enhanced visual state indicators.
 */
export function BridgeStepItem({
  step,
  label,
  description,
  currentStep,
  isLast = false,
}: BridgeStepItemProps) {
  const currentIndex = STEPS.indexOf(currentStep);
  const stepIndex = STEPS.indexOf(step);

  let state: StepState = "waiting";
  if (currentStep === "complete") state = "completed";
  else if (stepIndex < currentIndex) state = "completed";
  else if (stepIndex === currentIndex) state = "current";

  return (
    <div className={cn("flex gap-4 relative", !isLast && "pb-6")}>
      {/* Step indicator */}
      <div
        className={cn(
          "relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 bg-[#09090b] shrink-0",
          state === "completed" &&
            "border-green-500 text-green-500 bg-green-500/10 shadow-sm shadow-green-500/20",
          state === "current" &&
            "border-primary text-primary bg-primary/10 shadow-md shadow-primary/30",
          state === "waiting" && "border-white/10 text-zinc-600"
        )}
      >
        {/* Outer glow for current step */}
        {state === "current" && (
          <div className="absolute -inset-1 rounded-full bg-primary/20 animate-portal-pulse" />
        )}

        {state === "completed" ? (
          <CheckCircle2 className="w-5 h-5 relative z-10" />
        ) : state === "current" ? (
          <div className="relative z-10">
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
        ) : (
          <div className="w-2 h-2 rounded-full bg-current" />
        )}
      </div>

      {/* Connector Line with energy effect */}
      {!isLast && (
        <div
          className={cn(
            "absolute left-4 top-8 bottom-0 w-0.5 -translate-x-1/2 transition-all duration-500 overflow-hidden",
            state === "completed"
              ? "bg-linear-to-b from-green-500/80 to-green-500/30"
              : "bg-white/5"
          )}
        >
          {state === "current" && (
            <div className="absolute top-0 left-0 w-full h-4 bg-linear-to-b from-primary to-transparent animate-pulse" />
          )}
        </div>
      )}

      {/* Content */}
      <div className="pt-1 flex-1">
        <p
          className={cn(
            "font-medium text-sm transition-colors duration-300",
            state === "completed" && "text-green-400",
            state === "current" && "text-white",
            state === "waiting" && "text-zinc-500"
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "text-xs mt-0.5 transition-colors duration-300",
            state === "current" ? "text-zinc-400" : "text-zinc-600"
          )}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
