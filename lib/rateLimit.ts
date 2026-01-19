/**
 * Configurable in-memory rate limiter for API routes.
 * Supports per-key rate limiting with customizable cooldown and weekly limits.
 */

interface RateLimitEntry {
  lastRequest: number;
  weeklyCount: number;
  weekStart: number;
}

interface RateLimitConfig {
  /** Cooldown between requests in milliseconds */
  cooldownMs: number;
  /** Maximum requests per week */
  weeklyLimit: number;
  /** Unique identifier for this limiter (e.g., "insights", "generate-message") */
  namespace: string;
}

interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  retryAfterSeconds?: number;
  remainingWeekly?: number;
}

// Store rate limit entries per namespace
const rateLimitStores = new Map<string, Map<string, RateLimitEntry>>();

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Gets the rate limit store for a namespace, creating if needed.
 */
function getStore(namespace: string): Map<string, RateLimitEntry> {
  let store = rateLimitStores.get(namespace);
  if (!store) {
    store = new Map();
    rateLimitStores.set(namespace, store);
  }
  return store;
}

/**
 * Creates a rate limiter with the given configuration.
 *
 * @example
 * const limiter = createRateLimiter({
 *   namespace: "insights",
 *   cooldownMs: 5 * 60 * 1000, // 5 minutes
 *   weeklyLimit: 100,
 * });
 *
 * const result = limiter.check(clientIP);
 * if (!result.allowed) {
 *   return Response.json({ error: result.reason }, { status: 429 });
 * }
 */
export function createRateLimiter(config: RateLimitConfig) {
  const { cooldownMs, weeklyLimit, namespace } = config;

  return {
    /**
     * Checks if the key (usually IP) is rate limited.
     */
    check(key: string): RateLimitResult {
      const store = getStore(namespace);
      const now = Date.now();
      const entry = store.get(key);

      // First request from this key
      if (!entry) {
        store.set(key, {
          lastRequest: now,
          weeklyCount: 1,
          weekStart: now,
        });
        return { allowed: true, remainingWeekly: weeklyLimit - 1 };
      }

      // Reset weekly count if a week has passed
      if (now - entry.weekStart > ONE_WEEK_MS) {
        entry.weekStart = now;
        entry.weeklyCount = 0;
      }

      // Check weekly limit
      if (entry.weeklyCount >= weeklyLimit) {
        const weekEnd = entry.weekStart + ONE_WEEK_MS;
        const retryAfterSeconds = Math.ceil((weekEnd - now) / 1000);
        return {
          allowed: false,
          reason: `Weekly limit reached (${weeklyLimit}/week). Try again next week.`,
          retryAfterSeconds,
          remainingWeekly: 0,
        };
      }

      // Check cooldown
      const timeSinceLastRequest = now - entry.lastRequest;
      if (timeSinceLastRequest < cooldownMs) {
        const retryAfterSeconds = Math.ceil(
          (cooldownMs - timeSinceLastRequest) / 1000,
        );
        const timeText =
          retryAfterSeconds >= 60
            ? `${Math.ceil(retryAfterSeconds / 60)} minute(s)`
            : `${retryAfterSeconds} second(s)`;
        return {
          allowed: false,
          reason: `Please wait ${timeText}.`,
          retryAfterSeconds,
          remainingWeekly: weeklyLimit - entry.weeklyCount,
        };
      }

      // Update entry
      entry.lastRequest = now;
      entry.weeklyCount++;
      store.set(key, entry);

      return {
        allowed: true,
        remainingWeekly: weeklyLimit - entry.weeklyCount,
      };
    },

    /**
     * Resets the rate limit for a specific key.
     */
    reset(key: string): void {
      const store = getStore(namespace);
      store.delete(key);
    },
  };
}

/**
 * Gets the client IP from request headers.
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}
