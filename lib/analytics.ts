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
  // Optimization: standard indexed `for` loop significantly outperforms Array.prototype.map()
  // for populating a `Set` from large arrays in Bun environments.
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
  let total = 0;
  // Optimization: standard indexed `for` loop is faster than reduce
  for (let i = 0; i < memos.length; i++) {
    total += parseFloat(formatEther(memos[i].amount));
  }
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
  const supporterMap = new Map<
    string,
    { totalAmount: number; count: number; name?: string }
  >();

  // Optimization: standard indexed `for` loop is faster than for...of
  for (let i = 0; i < memos.length; i++) {
    const memo = memos[i];
    const address = memo.from.toLowerCase();
    const amount = parseFloat(formatEther(memo.amount));
    const existing = supporterMap.get(address) || { totalAmount: 0, count: 0 };
    supporterMap.set(address, {
      totalAmount: existing.totalAmount + amount,
      count: existing.count + 1,
      name: memo.name || existing.name, // Keep the last known name
    });
  }

  return Array.from(supporterMap.entries())
    .map(([address, data]) => ({ address, ...data }))
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

  // Optimization: standard indexed `for` loop is faster than for...of
  for (let i = 0; i < sorted.length; i++) {
    const memo = sorted[i];
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
  let sum = 0;
  // Optimization: standard indexed `for` loop is faster than reduce
  for (let i = 0; i < memos.length; i++) {
    sum += parseFloat(formatEther(memos[i].amount));
  }
  return sum;
}
