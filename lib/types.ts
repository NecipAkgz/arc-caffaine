/**
 * Shared type definitions for the ArcCaffeine application.
 */

/**
 * Memo interface representing a donation message from the smart contract.
 */
export interface Memo {
  from: `0x${string}`;
  timestamp: bigint;
  name: string;
  message: string;
  amount: bigint;
}

/**
 * User profile data from the smart contract.
 */
export interface UserProfile {
  address: `0x${string}`;
  username: string;
  bio: string;
}
