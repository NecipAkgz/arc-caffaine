import { useState, useCallback, useMemo } from "react";
import { createPublicClient, http } from "viem";
import { arcTestnet } from "@/lib/chain";
import { ARC_CAFFEINE_ABI, CONTRACT_ADDRESS } from "@/lib/abi";
import { logger } from "@/lib/logger";

interface SearchResult {
  username: string;
  address: string;
  found: boolean;
}

/**
 * Custom hook for searching creators by username.
 * Performs on-chain lookup using the contract's addresses mapping.
 */
export function useCreatorSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);

  // PublicClient specific to Arc Testnet
  const arcPublicClient = useMemo(
    () =>
      createPublicClient({
        chain: arcTestnet,
        transport: http(),
      }),
    []
  );

  /**
   * Search for a creator by username.
   * Tries multiple case variations to find the user.
   * Returns the wallet address if found, null otherwise.
   */
  const searchCreator = useCallback(
    async (username: string): Promise<SearchResult | null> => {
      const trimmedUsername = username.trim();

      if (!trimmedUsername) {
        setError("Please enter a username");
        return null;
      }

      setLoading(true);
      setError(null);
      setResult(null);

      // Generate case variations to try
      const variations = [
        trimmedUsername, // Original
        trimmedUsername.toLowerCase(), // lowercase
        trimmedUsername.toUpperCase(), // UPPERCASE
        trimmedUsername.charAt(0).toUpperCase() +
          trimmedUsername.slice(1).toLowerCase(), // Capitalize
      ];

      // Remove duplicates
      const uniqueVariations = [...new Set(variations)];

      try {
        // Try each variation until we find a match
        for (const variant of uniqueVariations) {
          const address = await arcPublicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: ARC_CAFFEINE_ABI,
            functionName: "addresses",
            args: [variant],
          });

          // Found a valid address
          if (
            address &&
            address !== "0x0000000000000000000000000000000000000000"
          ) {
            const searchResult: SearchResult = {
              username: variant, // Use the matched variant
              address: address as string,
              found: true,
            };
            setResult(searchResult);
            return searchResult;
          }
        }

        // No match found after trying all variations
        setError("User not found");
        const notFoundResult: SearchResult = {
          username: trimmedUsername,
          address: "0x0000000000000000000000000000000000000000",
          found: false,
        };
        setResult(notFoundResult);
        return notFoundResult;
      } catch (err) {
        logger.error("Creator search failed", err);
        setError("An error occurred while searching");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [arcPublicClient]
  );

  /**
   * Clear search state
   */
  const clearSearch = useCallback(() => {
    setError(null);
    setResult(null);
  }, []);

  return {
    searchCreator,
    clearSearch,
    loading,
    error,
    result,
  };
}
