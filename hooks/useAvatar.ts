"use client";

import { useQuery } from "@tanstack/react-query";
import { createPublicClient, http } from "viem";
import { normalize } from "viem/ens";
import { mainnet } from "viem/chains";

/**
 * Avatar source types for the fallback chain.
 */
export type AvatarSource = "ens" | "farcaster" | "effigy" | "gradient";

/**
 * Return type for the useAvatar hook.
 */
interface UseAvatarResult {
  avatarUrl: string;
  source: AvatarSource;
  isLoading: boolean;
  isError: boolean;
}

// Mainnet client for ENS resolution (ENS only exists on mainnet)
const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

// LocalStorage cache key prefix
const AVATAR_CACHE_KEY = "arc_avatar_cache_";
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Generates a deterministic gradient based on wallet address.
 *
 * @param address - The wallet address to generate gradient from.
 * @returns CSS gradient string.
 */
function generateGradient(address: string): string {
  // Use address bytes to generate colors
  const hash = address.toLowerCase().slice(2, 14);
  const h1 = parseInt(hash.slice(0, 4), 16) % 360;
  const h2 = (h1 + 40 + (parseInt(hash.slice(4, 8), 16) % 60)) % 360;
  const s1 = 60 + (parseInt(hash.slice(8, 10), 16) % 30);
  const s2 = 50 + (parseInt(hash.slice(10, 12), 16) % 40);

  return `linear-gradient(135deg, hsl(${h1}, ${s1}%, 50%) 0%, hsl(${h2}, ${s2}%, 40%) 100%)`;
}

/**
 * Effigy.im avatar URL generator.
 *
 * @param address - The wallet address.
 * @returns Effigy.im SVG URL.
 */
function getEffigyUrl(address: string): string {
  return `https://effigy.im/a/${address}.svg`;
}

/**
 * Fetches Farcaster avatar by verified Ethereum address.
 * Uses Neynar's public API endpoint.
 *
 * @param address - The wallet address.
 * @returns Farcaster profile picture URL or null.
 */
async function getFarcasterAvatar(address: string): Promise<string | null> {
  try {
    // Use Neynar's bulk lookup endpoint (works without API key for small requests)
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}`,
      {
        headers: {
          accept: "application/json",
          // Public demo key - rate limited but works for basic usage
          api_key: "NEYNAR_API_DOCS",
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const users = data[address.toLowerCase()];

    if (users && users.length > 0 && users[0].pfp_url) {
      return users[0].pfp_url;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Retrieves cached avatar data from localStorage.
 *
 * @param address - The wallet address.
 * @returns Cached avatar data or null if not found/expired.
 */
function getCachedAvatar(
  address: string
): { url: string; source: AvatarSource } | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(
      AVATAR_CACHE_KEY + address.toLowerCase()
    );
    if (!cached) return null;

    const { url, source, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_EXPIRY_MS) {
      localStorage.removeItem(AVATAR_CACHE_KEY + address.toLowerCase());
      return null;
    }

    return { url, source };
  } catch {
    return null;
  }
}

/**
 * Stores avatar data in localStorage.
 *
 * @param address - The wallet address.
 * @param url - The resolved avatar URL.
 * @param source - The avatar source type.
 */
function setCachedAvatar(
  address: string,
  url: string,
  source: AvatarSource
): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      AVATAR_CACHE_KEY + address.toLowerCase(),
      JSON.stringify({ url, source, timestamp: Date.now() })
    );
  } catch {
    // Silently fail if localStorage is full or unavailable
  }
}

/**
 * Resolves avatar URL with fallback chain: ENS → Farcaster → Effigy → Gradient.
 *
 * @param address - The wallet address.
 * @returns Avatar URL and source.
 */
async function resolveAvatar(
  address: string
): Promise<{ url: string; source: AvatarSource }> {
  // Check cache first
  const cached = getCachedAvatar(address);
  if (cached) return cached;

  // Try ENS avatar (mainnet)
  try {
    const ensName = await mainnetClient.getEnsName({
      address: address as `0x${string}`,
    });

    if (ensName) {
      const ensAvatar = await mainnetClient.getEnsAvatar({
        name: normalize(ensName),
      });

      if (ensAvatar) {
        setCachedAvatar(address, ensAvatar, "ens");
        return { url: ensAvatar, source: "ens" };
      }
    }
  } catch {
    // ENS resolution failed, continue to fallback
  }

  // Try Farcaster avatar
  const farcasterAvatar = await getFarcasterAvatar(address);
  if (farcasterAvatar) {
    setCachedAvatar(address, farcasterAvatar, "farcaster");
    return { url: farcasterAvatar, source: "farcaster" };
  }

  // Fallback to Effigy (blockie-style SVG)
  const effigyUrl = getEffigyUrl(address);
  setCachedAvatar(address, effigyUrl, "effigy");
  return { url: effigyUrl, source: "effigy" };
}

/**
 * Custom hook to resolve and cache Web3 avatars.
 *
 * Fallback chain: ENS Avatar → Farcaster → Effigy.im → Gradient Placeholder
 *
 * @param address - The wallet address to resolve avatar for.
 * @returns Avatar URL, source type, loading state, and error state.
 *
 * @example
 * ```tsx
 * const { avatarUrl, source, isLoading } = useAvatar("0x...");
 * ```
 */
export function useAvatar(address: string | undefined): UseAvatarResult {
  const normalizedAddress = address?.toLowerCase() || "";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["avatar", normalizedAddress],
    queryFn: () => resolveAvatar(normalizedAddress),
    enabled: !!address && address.length === 42,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours (previously cacheTime)
  });

  // Generate gradient as ultimate fallback
  const gradient = address ? generateGradient(address) : "";

  return {
    avatarUrl: data?.url || "",
    source: data?.source || "gradient",
    isLoading: isLoading && !!address,
    isError,
  };
}

/**
 * Generates a gradient placeholder for use when avatar is loading or unavailable.
 *
 * @param address - The wallet address.
 * @returns CSS gradient string.
 */
export function getGradientPlaceholder(address: string): string {
  return generateGradient(address);
}
