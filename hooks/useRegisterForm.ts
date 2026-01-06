import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useArcCaffeine } from "./useArcCaffeine";
import { createPublicClient, http, zeroAddress } from "viem";
import { arcTestnet } from "@/lib/chain";
import { ARC_CAFFEINE_ABI, CONTRACT_ADDRESS } from "@/lib/abi";

/**
 * Custom hook for handling user registration form logic
 *
 * TODO: [PRODUCTION] Remove frontend username validation and move to smart contract.
 * Currently we check case variations in frontend which can be bypassed.
 * For mainnet, add toLowerCase() helper in ArcCaffeine.sol and use it in registerUser().
 * See: hardhat-project/contracts/ArcCaffeine.sol
 */
export function useRegisterForm() {
  const { register, loading } = useArcCaffeine();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || loading || checking) return;

    const normalizedUsername = username.trim().toLowerCase();

    // Clear previous errors
    setError(null);

    // Pre-validation: Check if username is available BEFORE opening wallet
    setChecking(true);
    try {
      const publicClient = createPublicClient({
        chain: arcTestnet,
        transport: http(),
      });

      // Generate case variations to check (for backward compatibility)
      const variations = [
        normalizedUsername, // lowercase (new registrations)
        username.trim(), // original case
        username.trim().charAt(0).toUpperCase() +
          username.trim().slice(1).toLowerCase(), // Capitalized
        username.trim().toUpperCase(), // UPPERCASE
      ];

      // Remove duplicates
      const uniqueVariations = [...new Set(variations)];

      // Check each variation to see if username is taken
      for (const variant of uniqueVariations) {
        const existingAddress = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: ARC_CAFFEINE_ABI,
          functionName: "addresses",
          args: [variant],
        });

        // If address is not zero address, username is taken
        if (existingAddress && existingAddress !== zeroAddress) {
          setError(
            `Username "${normalizedUsername}" is already taken (found as "${variant}"). Please choose another one.`
          );
          setChecking(false);
          return;
        }
      }

      // Username is available in all variations, proceed with registration
      await register(normalizedUsername, bio);
      router.push("/dashboard");
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed. Check console.");
      setError("Registration failed. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const resetForm = () => {
    setUsername("");
    setBio("");
    setError(null);
  };

  return {
    username,
    setUsername,
    bio,
    setBio,
    loading: loading || checking,
    error,
    handleSubmit,
    resetForm,
  };
}
