/**
 * Simple in-memory rate limiter for AI insights.
 * Limits: 10 minutes between requests, 50 requests per week per IP.
 */

interface RateLimitEntry {
  lastRequest: number;
  weeklyCount: number;
  weekStart: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Constants
const FIVE_MINUTES_MS = 5 * 60 * 1000;
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const WEEKLY_LIMIT = 100;

/**
 * Checks if the IP is rate limited.
 * Returns { allowed: true } or { allowed: false, reason, retryAfter }
 */
export function checkRateLimit(ip: string): {
  allowed: boolean;
  reason?: string;
  retryAfterSeconds?: number;
  remainingWeekly?: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  // First request from this IP
  if (!entry) {
    rateLimitStore.set(ip, {
      lastRequest: now,
      weeklyCount: 1,
      weekStart: now,
    });
    return { allowed: true, remainingWeekly: WEEKLY_LIMIT - 1 };
  }

  // Reset weekly count if a week has passed
  if (now - entry.weekStart > ONE_WEEK_MS) {
    entry.weekStart = now;
    entry.weeklyCount = 0;
  }

  // Check weekly limit
  if (entry.weeklyCount >= WEEKLY_LIMIT) {
    const weekEnd = entry.weekStart + ONE_WEEK_MS;
    const retryAfterSeconds = Math.ceil((weekEnd - now) / 1000);
    return {
      allowed: false,
      reason: `Weekly limit reached (${WEEKLY_LIMIT}/week). Try again next week.`,
      retryAfterSeconds,
      remainingWeekly: 0,
    };
  }

  // Check 5-minute cooldown
  const timeSinceLastRequest = now - entry.lastRequest;
  if (timeSinceLastRequest < FIVE_MINUTES_MS) {
    const retryAfterSeconds = Math.ceil(
      (FIVE_MINUTES_MS - timeSinceLastRequest) / 1000,
    );
    const retryMinutes = Math.ceil(retryAfterSeconds / 60);
    return {
      allowed: false,
      reason: `Please wait ${retryMinutes} minute(s) before generating new insights.`,
      retryAfterSeconds,
      remainingWeekly: WEEKLY_LIMIT - entry.weeklyCount,
    };
  }

  // Update entry
  entry.lastRequest = now;
  entry.weeklyCount++;
  rateLimitStore.set(ip, entry);

  return { allowed: true, remainingWeekly: WEEKLY_LIMIT - entry.weeklyCount };
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
