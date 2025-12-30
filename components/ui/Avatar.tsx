"use client";

import * as React from "react";
import { useAvatar, getGradientPlaceholder } from "@/hooks/useAvatar";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

/**
 * Avatar size variants.
 */
const sizeClasses = {
  sm: "w-6 h-6 text-[10px]",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-20 h-20 text-xl",
} as const;

/**
 * Avatar component props.
 */
interface AvatarProps {
  /** Wallet address to display avatar for */
  address: string | undefined;
  /** Size variant */
  size?: keyof typeof sizeClasses;
  /** Additional CSS classes */
  className?: string;
  /** Show loading spinner while resolving */
  showLoader?: boolean;
  /** Fallback initial letter (used when no address) */
  fallbackLetter?: string;
}

/**
 * Web3 Avatar Component
 *
 * Displays a user's avatar with automatic fallback chain:
 * 1. ENS Avatar (if available on mainnet)
 * 2. Effigy.im blockie-style SVG
 * 3. Gradient placeholder generated from address
 *
 * @example
 * ```tsx
 * <Avatar address="0x..." size="md" />
 * <Avatar address={memo.from} size="sm" />
 * ```
 */
export function Avatar({
  address,
  size = "md",
  className,
  showLoader = false,
  fallbackLetter,
}: AvatarProps) {
  const { avatarUrl, source, isLoading } = useAvatar(address);
  const [imageError, setImageError] = React.useState(false);

  // Reset error state when address changes
  React.useEffect(() => {
    setImageError(false);
  }, [address]);

  // Generate gradient for placeholder/fallback
  const gradientStyle = address
    ? { background: getGradientPlaceholder(address) }
    : {
        background:
          "linear-gradient(135deg, hsl(30, 60%, 50%), hsl(45, 50%, 40%))",
      };

  // Show loading state
  if (isLoading && showLoader) {
    return (
      <div
        className={cn(
          "rounded-full flex items-center justify-center bg-secondary/50 border border-border/50",
          sizeClasses[size],
          className
        )}
      >
        <Loader2 className="w-1/2 h-1/2 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show avatar image if available and not errored
  if (avatarUrl && !imageError) {
    return (
      <div
        className={cn(
          "rounded-full overflow-hidden border border-border/50 shrink-0",
          sizeClasses[size],
          className
        )}
      >
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Gradient fallback with optional letter
  const letter =
    fallbackLetter || (address ? address.slice(2, 4).toUpperCase() : "?");

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white/90 border border-white/10 shrink-0",
        sizeClasses[size],
        className
      )}
      style={gradientStyle}
    >
      {letter.slice(0, 2)}
    </div>
  );
}
