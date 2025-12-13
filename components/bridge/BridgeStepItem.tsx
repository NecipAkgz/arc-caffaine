'use client'

import { CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type StepState = 'waiting' | 'current' | 'completed'

interface BridgeStepItemProps {
  step: string
  label: string
  description: string
  currentStep: string
  isLast?: boolean
}

const STEPS = ['preparing', 'approving', 'burning', 'attesting', 'minting', 'complete']

/**
 * Bridge Step Item Component
 *
 * Displays a single step in the bridge progress stepper with visual state indicators.
 */
export function BridgeStepItem({
  step,
  label,
  description,
  currentStep,
  isLast = false
}: BridgeStepItemProps) {
  const currentIndex = STEPS.indexOf(currentStep)
  const stepIndex = STEPS.indexOf(step)

  let state: StepState = 'waiting'
  if (currentStep === 'complete') state = 'completed'
  else if (stepIndex < currentIndex) state = 'completed'
  else if (stepIndex === currentIndex) state = 'current'

  return (
    <div className={cn("flex gap-4 relative", !isLast && "pb-8")}>
      <div className={cn(
        "relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-[#09090b] shrink-0",
        state === 'completed' && "border-green-500 text-green-500 bg-green-500/10",
        state === 'current' && "border-primary text-primary animate-pulse",
        state === 'waiting' && "border-white/10 text-zinc-600"
      )}>
        {state === 'completed' ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : state === 'current' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-current" />
        )}
      </div>

      {/* Connector Line */}
      {!isLast && (
        <div className={cn(
          "absolute left-4 top-8 bottom-0 w-0.5 -translate-x-1/2 transition-colors duration-300",
          state === 'completed' ? "bg-green-500/50" : "bg-white/5"
        )} />
      )}

      <div className="pt-1">
        <p className={cn(
          "font-medium text-sm transition-colors",
          state === 'waiting' ? "text-zinc-500" : "text-zinc-200"
        )}>
          {label}
        </p>
        <p className="text-xs text-zinc-500 mt-0.5">
          {description}
        </p>
      </div>
    </div>
  )
}
