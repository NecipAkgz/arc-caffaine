import { NextRequest, NextResponse } from "next/server";
import {
  generateInsightsPrompt,
  generateInsights,
  parseInsightsResponse,
} from "@/lib/gemini";
import { createRateLimiter, getClientIP } from "@/lib/rateLimit";

export const runtime = "nodejs";

// Rate limiter: 5 min cooldown, 100/week
const limiter = createRateLimiter({
  namespace: "insights",
  cooldownMs: 5 * 60 * 1000,
  weeklyLimit: 100,
});

/**
 * POST /api/insights
 * Generate AI-powered donation insights using OpenRouter.
 * Rate limited: 5 minutes between requests, 100 per week per IP.
 */
export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const clientIP = getClientIP(request);
    const rateLimit = limiter.check(clientIP);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: rateLimit.reason,
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    const body = await request.json();
    const {
      totalDonations,
      uniqueSupporters,
      averageDonation,
      totalEarnings,
      topSupporter,
      recentActivity,
    } = body;

    // Validate required fields
    if (totalDonations === undefined || uniqueSupporters === undefined) {
      return NextResponse.json(
        { error: "Missing required donation data" },
        { status: 400 },
      );
    }

    // Generate prompt
    const prompt = generateInsightsPrompt({
      totalDonations,
      uniqueSupporters,
      averageDonation: averageDonation || 0,
      totalEarnings: totalEarnings || 0,
      topSupporter,
      recentActivity: recentActivity || [],
    });

    // Call OpenRouter API
    const text = await generateInsights(prompt);

    if (!text) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 },
      );
    }

    // Parse response
    const insights = parseInsightsResponse(text);

    if (!insights) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ...insights,
      remainingWeekly: rateLimit.remainingWeekly,
    });
  } catch (error) {
    console.error("Insights API error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate insights";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
