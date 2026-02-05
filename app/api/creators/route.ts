import { createPublicClient, http, parseAbiItem } from "viem";
import { arcTestnet } from "@/lib/chain";
import { CONTRACT_ADDRESS } from "@/lib/abi";
import { NextResponse } from "next/server";

// Revalidate cache every hour
export const revalidate = 3600;

export async function GET() {
  const client = createPublicClient({
    chain: arcTestnet,
    transport: http(),
  });

  try {
    const currentBlock = await client.getBlockNumber();
    const CHUNK_SIZE = BigInt(9000);
    const allUsernames: string[] = [];

    // Paginate through blocks in chunks of 9,000
    let toBlock = currentBlock;
    let fromBlock = toBlock > CHUNK_SIZE ? toBlock - CHUNK_SIZE : BigInt(0);

    // Limit to max 10 iterations (90,000 blocks)
    const MAX_ITERATIONS = 10;
    let iterations = 0;

    while (iterations < MAX_ITERATIONS && toBlock > BigInt(0)) {
      const logs = await client.getLogs({
        address: CONTRACT_ADDRESS,
        event: parseAbiItem(
          "event UserRegistered(address indexed user, string username)",
        ),
        fromBlock,
        toBlock,
      });

      const usernames = logs
        .map((log) => {
          const args = log.args as { user?: `0x${string}`; username?: string };
          return args?.username;
        })
        .filter((username): username is string => Boolean(username));

      allUsernames.push(...usernames);

      // Stop early if we found enough creators
      if (allUsernames.length >= 10) break;

      // Move to previous chunk
      if (fromBlock === BigInt(0)) break;
      toBlock = fromBlock - BigInt(1);
      fromBlock = toBlock > CHUNK_SIZE ? toBlock - CHUNK_SIZE : BigInt(0);
      iterations++;
    }

    // Remove duplicates
    const uniqueUsernames = [...new Set(allUsernames)];

    // Return creators (empty array if none found)

    return NextResponse.json({
      creators: uniqueUsernames,
      fromBlockchain: true,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("[API/creators] Failed to fetch:", error);
    return NextResponse.json({
      creators: [],
      fromBlockchain: false,
      timestamp: Date.now(),
      error: "Failed to fetch from blockchain",
    });
  }
}
