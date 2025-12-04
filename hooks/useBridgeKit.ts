import { BridgeKit } from "@circle-fin/bridge-kit";
import { createAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { useState, useCallback, useMemo } from "react";
import {
  getBridgeKitChainName,
  ARC_TESTNET,
  SUPPORTED_CHAINS,
} from "@/lib/bridge-kit/chains";

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

  const kit = useMemo(() => getBridgeKitInstance(), []);

  /**
   * Initiates the bridging process to the Arc Network.
   *
   * @param amount - The amount of USDC to bridge.
   * @param sourceChainId - The ID of the source chain.
   */
  const bridgeToArc = useCallback(
    async (amount: string, sourceChainId: number) => {
      if (!connector || !address || !publicClient) {
        throw new Error("Wallet not connected");
      }

      try {
        setStatus("bridging");
        setBridgeStep("preparing");
        setError(null);
        setTxHash(null);

        // Get chain data
        const sourceChainData = SUPPORTED_CHAINS.find(
          (c) => c.id === sourceChainId
        );
        if (!sourceChainData?.usdcAddress) {
          throw new Error("Chain configuration missing");
        }

        // Setup Event Listeners
        kit.on("approve", (payload) => {
          console.log("Approval completed:", payload);
          setBridgeStep("burning");
        });

        kit.on("burn", (payload) => {
          console.log("Burn completed:", payload);
          setBridgeStep("attesting");
          // Extract txHash from burn event if available
          if (payload?.values?.txHash) {
            setTxHash(payload.values.txHash);
          }
        });

        kit.on("fetchAttestation", (payload) => {
          console.log("Attestation completed:", payload);
          setBridgeStep("minting");
        });

        kit.on("mint", (payload) => {
          console.log("Mint completed:", payload);
          setBridgeStep("complete");
          setStatus("complete");
        });

        // Step 1: Prepare Adapter
        setBridgeStep("preparing");

        // Get the EIP-1193 provider from connector
        let eip1193Provider = null;

        if (connector?.getProvider) {
          try {
            eip1193Provider = await connector.getProvider();
          } catch (err) {
            console.error("Failed to get provider from connector:", err);
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

        // Create adapter with provider object
        const adapter = await createAdapterFromProvider({
          provider: eip1193Provider,
        });

        const sourceChain = getBridgeKitChainName(sourceChainId);

        if (!sourceChain) {
          throw new Error("Unsupported chain");
        }

        // 4. Bridge
        setBridgeStep("approving");

        // Bridge USDC to Arc Network
        const result = await kit.bridge({
          from: {
            adapter,
            chain: sourceChain as any,
          },
          to: {
            adapter,
            chain: ARC_TESTNET.bridgeKitName as any,
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
        console.error("Bridge error:", err);
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
  }, []);

  return {
    bridgeToArc,
    reset,
    status,
    bridgeStep,
    error,
    txHash,
    isIdle: status === "idle",
    isBridging: status === "bridging",
    isComplete: status === "complete",
    hasError: status === "error",
  };
}
