import { BridgeKit } from "@circle-fin/bridge-kit";
import { createAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { createPublicClient, http } from "viem";
import {
  getBridgeKitChainName,
  ARC_TESTNET,
  SUPPORTED_CHAINS,
  getBestRpcUrl,
} from "@/lib/bridge-kit/chains";
import { logger } from "@/lib/logger";

type BridgeStatus = "idle" | "bridging" | "complete" | "error";

export type BridgeStep =
  | "idle"
  | "preparing"
  | "approving"
  | "burning"
  | "attesting"
  | "minting"
  | "complete";

// The Singleton BridgeKit instance – the same instance is used for all hook usages.
let bridgeKitInstance: BridgeKit | null = null;

const getBridgeKitInstance = () => {
  if (!bridgeKitInstance) {
    bridgeKitInstance = new BridgeKit();
  }
  return bridgeKitInstance;
};

/**
 * Custom hook for bridging assets using Circle's BridgeKit.
 * Manages the bridging state, steps, and errors.
 */
export function useBridgeKit() {
  const publicClient = usePublicClient();
  const { chain, connector, address } = useAccount();
  const [status, setStatus] = useState<BridgeStatus>("idle");
  const [bridgeStep, setBridgeStep] = useState<BridgeStep>("idle");
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [sourceChainId, setSourceChainId] = useState<number | null>(null);
  const [destinationChainId, setDestinationChainId] = useState<number | null>(
    null
  );

  const kit = useMemo(() => getBridgeKitInstance(), []);

  // Store event handlers in refs for cleanup
  const eventHandlersRef = useRef<{
    approve?: (payload: unknown) => void;
    burn?: (payload: unknown) => void;
    fetchAttestation?: (payload: unknown) => void;
    mint?: (payload: unknown) => void;
  }>({});

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      const handlers = eventHandlersRef.current;
      if (handlers.approve) kit.off("approve", handlers.approve);
      if (handlers.burn) kit.off("burn", handlers.burn);
      if (handlers.fetchAttestation)
        kit.off("fetchAttestation", handlers.fetchAttestation);
      if (handlers.mint) kit.off("mint", handlers.mint);
    };
  }, [kit]);

  /**
   * Initiates the bridging process between any two supported chains.
   *
   * @param amount - The amount of USDC to bridge.
   * @param fromChainId - The ID of the source chain.
   * @param toChainId - The ID of the destination chain.
   */
  const bridge = useCallback(
    async (amount: string, fromChainId: number, toChainId: number) => {
      if (!connector || !address || !publicClient) {
        throw new Error("Wallet not connected");
      }

      try {
        setStatus("bridging");
        setBridgeStep("preparing");
        setError(null);
        setTxHash(null);
        setSourceChainId(fromChainId);
        setDestinationChainId(toChainId);

        // Get chain data for both chains
        const fromChainData = SUPPORTED_CHAINS.find(
          (c) => c.id === fromChainId
        );
        const toChainData = SUPPORTED_CHAINS.find((c) => c.id === toChainId);
        if (!fromChainData?.usdcAddress || !toChainData?.usdcAddress) {
          throw new Error("Chain configuration missing");
        }

        // Setup Event Listeners (store refs for cleanup)
        // Clean up previous handlers before adding new ones to prevent memory leaks
        const prevHandlers = eventHandlersRef.current;
        if (prevHandlers.approve) kit.off("approve", prevHandlers.approve);
        if (prevHandlers.burn) kit.off("burn", prevHandlers.burn);
        if (prevHandlers.fetchAttestation)
          kit.off("fetchAttestation", prevHandlers.fetchAttestation);
        if (prevHandlers.mint) kit.off("mint", prevHandlers.mint);

        const approveHandler = (payload: unknown) => {
          logger.debug("Approval completed:", payload);
          setBridgeStep("burning");
        };

        const burnHandler = (payload: unknown) => {
          logger.debug("Burn completed:", payload);
          setBridgeStep("attesting");
          // Extract txHash from burn event if available
          if ((payload as any)?.values?.txHash) {
            setTxHash((payload as any).values.txHash);
          }
        };

        const attestationHandler = (payload: unknown) => {
          logger.debug("Attestation completed:", payload);
          setBridgeStep("minting");
        };

        const mintHandler = (payload: unknown) => {
          logger.debug("Mint completed:", payload);
          // Extract txHash from mint event if available (Arc Mint Tx)
          if ((payload as any)?.values?.txHash) {
            setTxHash((payload as any).values.txHash);
          }
          setBridgeStep("complete");
          setStatus("complete");
        };

        // Store handlers for cleanup
        eventHandlersRef.current = {
          approve: approveHandler,
          burn: burnHandler,
          fetchAttestation: attestationHandler,
          mint: mintHandler,
        };

        kit.on("approve", approveHandler);
        kit.on("burn", burnHandler);
        kit.on("fetchAttestation", attestationHandler);
        kit.on("mint", mintHandler);

        // Step 1: Prepare Adapter
        setBridgeStep("preparing");

        // Get the EIP-1193 provider from connector
        let eip1193Provider = null;

        if (connector?.getProvider) {
          try {
            eip1193Provider = await connector.getProvider();
          } catch (err) {
            logger.error("Failed to get provider from connector:", err);
          }
        }

        // Fallback to window.ethereum
        if (
          !eip1193Provider &&
          typeof window !== "undefined" &&
          window.ethereum
        ) {
          eip1193Provider = window.ethereum;
        }

        if (!eip1193Provider) {
          throw new Error(
            "No EIP-1193 provider found. Please ensure your wallet is connected."
          );
        }

        // Create adapter with provider object and optimized RPC support
        const adapter = await createAdapterFromProvider({
          provider: eip1193Provider,
          getPublicClient: ({ chain }) => {
            const rpcUrl = getBestRpcUrl(chain.id);
            return createPublicClient({
              chain,
              transport: http(rpcUrl, {
                retryCount: 5, // More retries for public RPCs
                timeout: 10000, // Faster failure/retry
              }),
              pollingInterval: 2000,
              batch: {
                multicall: true,
              },
            });
          },
        });

        const fromChainName = getBridgeKitChainName(fromChainId);
        const toChainName = getBridgeKitChainName(toChainId);

        if (!fromChainName || !toChainName) {
          throw new Error("Unsupported chain");
        }

        // 4. Bridge
        setBridgeStep("approving");

        // Bridge USDC between chains
        const result = await kit.bridge({
          from: {
            adapter,
            chain: fromChainName as any,
          },
          to: {
            adapter,
            chain: toChainName as any,
          },
          amount: amount,
          config: {
            transferSpeed: "FAST",
          },
        });

        // Extract transaction hash if available
        if (result && typeof result === "object" && "txHash" in result) {
          setTxHash((result as any).txHash);
        }

        // Check for soft errors (BridgeResult.state === 'error')
        if (result && (result as any).state === "error") {
          const steps = (result as any).steps || [];
          const errorStep = steps.find((s: any) => s.state === "error");
          const errorMessage = errorStep?.error || "Bridge transfer failed";
          throw new Error(errorMessage);
        }

        // Handle pending state
        if (result && (result as any).state === "pending") {
          throw new Error(
            "Bridge transfer is pending. Please check transaction status."
          );
        }

        // Only mark as complete if explicitly successful
        if (result && (result as any).state === "success") {
          setBridgeStep("complete");
          setStatus("complete");
        }

        return result;
      } catch (err) {
        logger.error("Bridge error:", err);
        setStatus("error");
        setBridgeStep("idle");
        setError(err as Error);
        throw err;
      }
    },
    [chain, kit, connector, address, publicClient]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setBridgeStep("idle");
    setError(null);
    setTxHash(null);
    setSourceChainId(null);
    setDestinationChainId(null);
  }, []);

  // Convenience wrapper for bridging TO Arc (backward compatible)
  const bridgeToArc = useCallback(
    async (amount: string, fromChainId: number) => {
      return bridge(amount, fromChainId, ARC_TESTNET.id);
    },
    [bridge]
  );

  // Convenience wrapper for bridging FROM Arc
  const bridgeFromArc = useCallback(
    async (amount: string, toChainId: number) => {
      return bridge(amount, ARC_TESTNET.id, toChainId);
    },
    [bridge]
  );

  return {
    bridge,
    bridgeToArc,
    bridgeFromArc,
    reset,
    status,
    bridgeStep,
    error,
    txHash,
    sourceChainId,
    destinationChainId,
    isIdle: status === "idle",
    isBridging: status === "bridging",
    isComplete: status === "complete",
    hasError: status === "error",
  };
}
