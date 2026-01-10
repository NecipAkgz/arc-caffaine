/**
 * Bridge Kit Error Utilities
 *
 * smart error classification, user-friendly messages, and retry logic.
 */

import {
  isKitError,
  isBalanceError,
  isOnchainError,
  isRpcError,
  isNetworkError,
  isRetryableError,
  isFatalError,
  getErrorCode,
  getErrorMessage,
} from "@circle-fin/bridge-kit";

export type ErrorSeverity = "warning" | "error" | "fatal";

export interface SmartErrorInfo {
  title: string;
  message: string;
  severity: ErrorSeverity;
  isRetryable: boolean;
  icon: "balance" | "network" | "chain" | "warning" | "error";
}

/**
 * Analyzes an error and returns smart, user-friendly error information.
 */
export function getSmartErrorInfo(error: unknown): SmartErrorInfo {
  // Default fallback
  const fallback: SmartErrorInfo = {
    title: "Bridge Failed",
    message: "An unexpected error occurred. Please try again.",
    severity: "error",
    isRetryable: true,
    icon: "error",
  };

  if (!error) return fallback;

  // Use Bridge Kit's error utilities
  if (isKitError(error)) {
    const code = getErrorCode(error);
    const rawMessage = getErrorMessage(error);

    // Balance Error - Insufficient funds
    if (isBalanceError(error)) {
      return {
        title: "Insufficient Balance",
        message: "You don't have enough USDC to complete this transfer.",
        severity: "warning",
        isRetryable: false,
        icon: "balance",
      };
    }

    // Network Error - Connection issues
    if (isNetworkError(error)) {
      return {
        title: "Connection Problem",
        message: "Please check your internet connection and try again.",
        severity: "error",
        isRetryable: true,
        icon: "network",
      };
    }

    // RPC Error - Node/blockchain issues
    if (isRpcError(error)) {
      return {
        title: "Network Congestion",
        message: "The blockchain network is busy. Please wait and retry.",
        severity: "error",
        isRetryable: true,
        icon: "chain",
      };
    }

    // Onchain Error - Transaction reverted
    if (isOnchainError(error)) {
      return {
        title: "Transaction Failed",
        message:
          cleanErrorMessage(rawMessage) ||
          "The transaction was rejected by the network.",
        severity: "error",
        isRetryable: true,
        icon: "chain",
      };
    }

    // Fatal Error - Unrecoverable (include error code for support)
    if (isFatalError(error)) {
      const codeInfo = code ? ` (Code: ${code})` : "";
      return {
        title: "Critical Error",
        message: `A critical error occurred. Please contact support if this persists.${codeInfo}`,
        severity: "fatal",
        isRetryable: false,
        icon: "error",
      };
    }

    // Generic retryable check
    if (isRetryableError(error)) {
      return {
        title: "Temporary Issue",
        message:
          cleanErrorMessage(rawMessage) ||
          "A temporary issue occurred. Please retry.",
        severity: "warning",
        isRetryable: true,
        icon: "warning",
      };
    }

    // Kit error but no specific type match
    return {
      ...fallback,
      message: cleanErrorMessage(rawMessage) || fallback.message,
    };
  }

  // Standard Error object
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    // User rejection
    if (
      msg.includes("rejected") ||
      msg.includes("denied") ||
      msg.includes("cancelled")
    ) {
      return {
        title: "Transaction Cancelled",
        message: "You cancelled the transaction.",
        severity: "warning",
        isRetryable: true,
        icon: "warning",
      };
    }

    // Timeout
    if (msg.includes("timed out") || msg.includes("timeout")) {
      return {
        title: "Request Timeout",
        message:
          "The request took too long. Please check explorer and retry if needed.",
        severity: "warning",
        isRetryable: true,
        icon: "network",
      };
    }

    return {
      ...fallback,
      message: cleanErrorMessage(error.message) || fallback.message,
    };
  }

  return fallback;
}

/**
 * Cleans raw error messages for user display.
 */
function cleanErrorMessage(message: string | undefined): string {
  if (!message) return "";

  let clean = message;

  // Remove technical details
  clean = clean.split("Request Arguments:")[0];
  clean = clean.split("Details:")[0];
  clean = clean.split("Contract Call:")[0];

  // Remove "Error:" prefix
  clean = clean.replace(/^Error:\s*/i, "");

  // Trim and limit length
  clean = clean.trim();
  if (clean.length > 150) {
    clean = clean.substring(0, 147) + "...";
  }

  return clean;
}

/**
 * Quick check if retry should be recommended.
 */
export function shouldRecommendRetry(error: unknown): boolean {
  return getSmartErrorInfo(error).isRetryable;
}

/**
 * Gets the error severity level.
 */
export function getErrorSeverity(error: unknown): ErrorSeverity {
  return getSmartErrorInfo(error).severity;
}
