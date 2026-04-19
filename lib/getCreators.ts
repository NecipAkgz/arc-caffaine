interface CreatorsResponse {
  creators: string[];
  fromBlockchain: boolean;
  timestamp: number;
}

export interface DiscoverCreatorsResult {
  creators: string[];
  usedFallback: boolean;
}

const FALLBACK_CREATORS = [
  "Neco",
  "Croky",
  "Jane",
  "emma",
  "john",
  "ArcMuse",
  "PixelPilot",
  "tony",
];

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function shuffleCreators(creators: string[]) {
  const shuffled = [...creators];

  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function buildDiscoverCreators(
  primaryCreators: string[],
  count: number,
  exclude: string[],
): DiscoverCreatorsResult {
  const excluded = new Set(exclude.map(normalizeUsername));
  const seen = new Set<string>();
  const creators: string[] = [];

  for (const creator of primaryCreators) {
    const normalized = normalizeUsername(creator);

    if (!normalized || excluded.has(normalized) || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    creators.push(creator);

    if (creators.length === count) {
      return { creators, usedFallback: false };
    }
  }

  let usedFallback = false;

  for (const creator of FALLBACK_CREATORS) {
    const normalized = normalizeUsername(creator);

    if (!normalized || excluded.has(normalized) || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    creators.push(creator);
    usedFallback = true;

    if (creators.length === count) {
      break;
    }
  }

  return { creators, usedFallback };
}

export function getFallbackCreators(
  count: number = 3,
  exclude: string[] = [],
): string[] {
  return buildDiscoverCreators([], count, exclude).creators;
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
 * Returns N discoverable creators.
 * Prefers on-chain creators, then fills remaining slots with curated fallbacks
 * so the landing section never renders empty.
 * @param count - Number of creators to return
 */
export async function getRandomCreators(
  count: number = 3,
  exclude: string[] = [],
): Promise<DiscoverCreatorsResult> {
  try {
    const allCreators = await getAllCreators();
    const shuffledCreators = shuffleCreators(allCreators);

    return buildDiscoverCreators(shuffledCreators, count, exclude);
  } catch {
    return buildDiscoverCreators([], count, exclude);
  }
}
