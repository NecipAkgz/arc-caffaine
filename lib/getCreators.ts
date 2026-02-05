interface CreatorsResponse {
  creators: string[];
  fromBlockchain: boolean;
  timestamp: number;
}

/**
 * Fetches all registered creators from server-side cached API.
 * Server refreshes blockchain data every hour.
 */
export async function getAllCreators(): Promise<string[]> {
  try {
    const response = await fetch("/api/creators");
    if (!response.ok) throw new Error("API request failed");

    const data: CreatorsResponse = await response.json();
    return data.creators;
  } catch {
    return [];
  }
}

/**
 * Returns N random creators from all registered creators.
 * Shuffles the array and picks the first N.
 * @param count - Number of random creators to return
 */
export async function getRandomCreators(count: number = 3): Promise<string[]> {
  const allCreators = await getAllCreators();

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
