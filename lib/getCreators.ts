import { createPublicClient, http, parseAbiItem } from "viem";
import { arcTestnet } from "@/lib/chain";
import { CONTRACT_ADDRESS } from "@/lib/abi";

// Cache configuration
const CACHE_KEY = "arccaffeine_creators_cache";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CreatorsCache {
  data: string[];
  timestamp: number;
}

/**
 * Gets cached creators from localStorage (SSR-safe)
 */
function getCache(): CreatorsCache | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    return JSON.parse(cached) as CreatorsCache;
  } catch {
    return null;
  }
}

/**
 * Saves creators to localStorage cache (SSR-safe)
 */
function setCache(data: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const cache: CreatorsCache = { data, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

/**
 * Fetches all registered creators from the blockchain by reading UserRegistered events.
 * Uses localStorage caching to reduce RPC calls (5-minute TTL).
 * @param forceRefresh - If true, bypasses cache and fetches fresh data
 */
export async function getAllCreators(forceRefresh = false): Promise<string[]> {
  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cache = getCache();
    if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
      console.log("[getCreators] Returning cached creators from localStorage");
      return cache.data;
    }
  }

  const client = createPublicClient({
    chain: arcTestnet,
    transport: http(),
  });

  try {
    // Get current block number
    const currentBlock = await client.getBlockNumber();

    // Query only the last 9,000 blocks to stay under RPC limit (10,000)
    const fromBlock =
      currentBlock > BigInt(9000) ? currentBlock - BigInt(9000) : BigInt(0);

    const logs = await client.getLogs({
      address: CONTRACT_ADDRESS,
      event: parseAbiItem(
        "event UserRegistered(address indexed user, string username)",
      ),
      fromBlock,
      toBlock: "latest",
    });

    // Extract usernames from logs
    const usernames = logs
      .map((log) => {
        const args = log.args as { user?: `0x${string}`; username?: string };
        return args?.username;
      })
      .filter((username): username is string => Boolean(username));

    // Update localStorage cache
    setCache(usernames);
    console.log(
      `[getCreators] Fetched ${usernames.length} creators from blockchain`,
    );

    return usernames;
  } catch (error) {
    console.error("Failed to fetch creators:", error);
    // Return cached data if available, even if expired
    const staleCache = getCache();
    if (staleCache) {
      console.log("[getCreators] Returning stale cache due to error");
      return staleCache.data;
    }
    return [];
  }
}

/**
 * Returns N random creators from all registered creators.
 * Shuffles the array and picks the first N.
 * @param count - Number of random creators to return
 * @param forceRefresh - If true, bypasses cache and fetches fresh data
 */
export async function getRandomCreators(
  count: number = 3,
  forceRefresh = false,
): Promise<string[]> {
  const allCreators = await getAllCreators(forceRefresh);

  if (allCreators.length === 0) return [];
  if (allCreators.length <= count) return allCreators;

  // Fisher-Yates shuffle
  const shuffled = [...allCreators];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}
