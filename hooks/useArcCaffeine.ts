import {
  useAccount,
  usePublicClient,
  useWalletClient,
  useSwitchChain,
} from "wagmi";
import { ARC_CAFFEINE_ABI, CONTRACT_ADDRESS } from "@/lib/abi";
import { useState, useEffect, useCallback, useMemo } from "react";
import { parseEther, createPublicClient, http, zeroAddress } from "viem";
import { arcTestnet } from "@/lib/chain";
import { logger } from "@/lib/logger";

/**
 * Custom hook for interacting with the ArcCaffeine smart contract.
 * Provides functions for user registration, buying coffee, withdrawing funds, and updating bio.
 */
export function useArcCaffeine() {
  const { address, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();

  // PublicClient specific to Arc Testnet - always checks the Arc network.
  const arcPublicClient = useMemo(
    () =>
      createPublicClient({
        chain: arcTestnet,
        transport: http(),
      }),
    []
  );

  const [username, setUsername] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [checkedAddress, setCheckedAddress] = useState<string | null>(null);

  /**
   * Checks if the current connected address is registered in the contract.
   * Updates the `username` and `isRegistered` state.
   */
  const checkRegistration = useCallback(async () => {
    setCheckingRegistration(true);
    if (!address) {
      setIsRegistered(false);
      setUsername(null);
      setCheckingRegistration(false);
      setCheckedAddress(null);
      return;
    }
    try {
      // Check using a client specific to the Arc Testnet.
      const name = await arcPublicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ARC_CAFFEINE_ABI,
        functionName: "usernames",
        args: [address],
      });
      if (name) {
        setUsername(name);
        setIsRegistered(true);
      } else {
        setIsRegistered(false);
        setUsername(null);
      }
    } catch (error) {
      logger.error("Error checking registration", error);
      // In case of error (e.g. contract not deployed on placeholder address), we might want to handle it gracefully
    } finally {
      setCheckingRegistration(false);
      if (address) setCheckedAddress(address);
    }
  }, [address, arcPublicClient]);

  useEffect(() => {
    checkRegistration();
  }, [checkRegistration]);

  const ensureNetwork = useCallback(async () => {
    if (chainId !== arcTestnet.id) {
      await switchChainAsync({ chainId: arcTestnet.id });
    }
  }, [chainId, switchChainAsync]);

  /**
   * Registers a new user with a username and an optional bio.
   *
   * @param newUsername - The unique username to register.
   * @param bio - Optional bio text.
   */
  const register = useCallback(
    async (newUsername: string, bio: string = "") => {
      if (!walletClient || !address) return;
      setLoading(true);
      try {
        await ensureNetwork();
        const hash = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: ARC_CAFFEINE_ABI,
          functionName: "registerUser",
          args: [newUsername, bio],
          account: address,
          chain: arcTestnet,
        });
        await publicClient?.waitForTransactionReceipt({ hash });
        await checkRegistration();
      } catch (error) {
        logger.error("Registration failed", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [walletClient, address, ensureNetwork, publicClient, checkRegistration]
  );

  /**
   * Sends a donation (buys coffee) to a registered user.
   *
   * @param recipientUsername - The username of the recipient.
   * @param name - The name of the donor.
   * @param message - A message from the donor.
   * @param amount - The amount of USDC to send.
   */
  const buyCoffee = useCallback(
    async (
      recipientUsername: string,
      name: string,
      message: string,
      amount: string
    ) => {
      if (!walletClient || !address) return;
      setLoading(true);
      try {
        await ensureNetwork();

        // Try to find user with case-insensitive lookup
        // For backward compatibility, try lowercase first (new users), then original (old users)
        const lowercaseUsername = recipientUsername.toLowerCase();
        let usernameToUse = lowercaseUsername;

        // Check if lowercase version exists
        const lowercaseAddress = await arcPublicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: ARC_CAFFEINE_ABI,
          functionName: "addresses",
          args: [lowercaseUsername],
        });

        // If lowercase doesn't exist, try original (for backward compatibility)
        if (!lowercaseAddress || lowercaseAddress === zeroAddress) {
          const originalAddress = await arcPublicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: ARC_CAFFEINE_ABI,
            functionName: "addresses",
            args: [recipientUsername],
          });

          if (originalAddress && originalAddress !== zeroAddress) {
            usernameToUse = recipientUsername;
          }
        }

        const hash = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: ARC_CAFFEINE_ABI,
          functionName: "buyCoffee",
          args: [usernameToUse, name, message],
          value: parseEther(amount),
          account: address,
          chain: arcTestnet,
        });
        await publicClient?.waitForTransactionReceipt({ hash });
      } catch (error) {
        logger.error("Buy Coffee failed", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [walletClient, address, ensureNetwork, publicClient, arcPublicClient]
  );

  /**
   * Withdraws all accumulated funds from the contract to the user's wallet.
   */
  const withdraw = useCallback(async () => {
    if (!walletClient || !address) return;
    setLoading(true);
    try {
      await ensureNetwork();
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: ARC_CAFFEINE_ABI,
        functionName: "withdraw",
        account: address,
        chain: arcTestnet,
      });
      await publicClient?.waitForTransactionReceipt({ hash });
    } catch (error) {
      logger.error("Withdraw failed", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [walletClient, address, ensureNetwork, publicClient]);

  /**
   * Updates the user's bio.
   *
   * @param bio - The new bio text.
   */
  const updateBio = useCallback(
    async (bio: string) => {
      if (!walletClient || !address) return;
      setLoading(true);
      try {
        await ensureNetwork();
        const hash = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: ARC_CAFFEINE_ABI,
          functionName: "updateBio",
          args: [bio],
          account: address,
          chain: arcTestnet,
        });
        await publicClient?.waitForTransactionReceipt({ hash });
      } catch (error) {
        logger.error("Update Bio failed", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [walletClient, address, ensureNetwork, publicClient]
  );

  /**
   * Fetches the current balance of the user stored in the contract.
   *
   * @returns The balance as a BigInt.
   */
  const getBalance = useCallback(async () => {
    if (!address) return BigInt(0);
    return await arcPublicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ARC_CAFFEINE_ABI,
      functionName: "balances",
      args: [address],
    });
  }, [address, arcPublicClient]);

  return {
    username,
    isRegistered,
    checkingRegistration,
    checkedAddress,
    loading,
    register,
    buyCoffee,
    withdraw,
    updateBio,
    getBalance,
  };
}
