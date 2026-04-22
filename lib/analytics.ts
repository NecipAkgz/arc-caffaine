import { formatEther } from "viem";
import { Memo } from "./types";

/**
 * Analytics helper functions for processing blockchain memo data.
 * All calculations are derived directly from on-chain events.
 */

/**
 * Gets the count of unique supporters from memos.
 * @param memos - Array of Memo objects from the blockchain.
 * @returns Number of unique wallet addresses that have donated.
 */
export function getUniqueSupporterCount(memos: Memo[]): number {
  // Using a standard for loop instead of map to avoid intermediate array
  // allocation, which is significantly faster for populating Sets in this environment.
  const uniqueAddresses = new Set<string>();
  for (let i = 0; i < memos.length; i++) {
    uniqueAddresses.add(memos[i].from.toLowerCase());
  }
  return uniqueAddresses.size;
}

/**
 * Calculates the average donation amount in USDC.
 * @param memos - Array of Memo objects from the blockchain.
 * @returns Average donation as a number (in USDC), or 0 if no memos.
 */
export function getAverageDonation(memos: Memo[]): number {
  if (memos.length === 0) return 0;
  // Optimize: sum bigints natively to avoid O(N) string allocations and float parsing
  const totalBigInt = memos.reduce((sum, memo) => sum + memo.amount, BigInt(0));
  const total = parseFloat(formatEther(totalBigInt));
  return total / memos.length;
}

/**
 * Gets the top supporters by total donation amount.
 * @param memos - Array of Memo objects from the blockchain.
 * @param limit - Number of top supporters to return (default: 5).
 * @returns Array of { address, totalAmount, count } sorted by totalAmount desc.
 */
export function getTopSupporters(
  memos: Memo[],
  limit: number = 5,
): { address: string; totalAmount: number; count: number; name?: string }[] {
  // Optimize: map holds totalAmount as bigint to avoid O(N) string allocations inside the loop
  const supporterMap = new Map<
    string,
    { totalAmount: bigint; count: number; name?: string }
  >();

  for (const memo of memos) {
    const address = memo.from.toLowerCase();
    const existing = supporterMap.get(address) || { totalAmount: BigInt(0), count: 0 };
    supporterMap.set(address, {
      totalAmount: existing.totalAmount + memo.amount,
      count: existing.count + 1,
      name: memo.name || existing.name, // Keep the last known name
    });
  }

  return Array.from(supporterMap.entries())
    .map(([address, data]) => ({
      address,
      totalAmount: parseFloat(formatEther(data.totalAmount)),
      count: data.count,
      name: data.name,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, limit);
}

/**
 * Aggregates supporter count over time for chart visualization.
 * Groups memos by date and calculates cumulative unique supporters.
 * @param memos - Array of Memo objects (should be sorted by timestamp asc for accuracy).
 * @returns Array of { date: string (YYYY-MM-DD), cumulativeSupporters: number }
 */
export function getSupportersOverTime(
  memos: Memo[],
): { date: string; cumulativeSupporters: number }[] {
  if (memos.length === 0) return [];

  // Sort by timestamp ascending
  const sorted = [...memos].sort(
    (a, b) => Number(a.timestamp) - Number(b.timestamp),
  );

  const seenAddresses = new Set<string>();
  const dateMap = new Map<string, number>();

  for (const memo of sorted) {
    const date = new Date(Number(memo.timestamp) * 1000)
      .toISOString()
      .split("T")[0];
    seenAddresses.add(memo.from.toLowerCase());
    dateMap.set(date, seenAddresses.size);
  }

  return Array.from(dateMap.entries()).map(([date, cumulativeSupporters]) => ({
    date,
    cumulativeSupporters,
  }));
}

/**
 * Gets total earnings from all memos.
 * @param memos - Array of Memo objects from the blockchain.
 * @returns Total earnings in USDC.
 */
export function getTotalEarnings(memos: Memo[]): number {
  // Optimize: sum bigints natively to avoid O(N) string allocations and float parsing
  const totalBigInt = memos.reduce((sum, memo) => sum + memo.amount, BigInt(0));
  return parseFloat(formatEther(totalBigInt));
}
