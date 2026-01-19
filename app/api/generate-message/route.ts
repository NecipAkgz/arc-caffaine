import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter, getClientIP } from "@/lib/rateLimit";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

// Rate limiter: 30 sec cooldown, 200/week
const limiter = createRateLimiter({
  namespace: "generate-message",
  cooldownMs: 30 * 1000,
  weeklyLimit: 200,
});

/**
 * POST /api/generate-message
 * Generate a supportive message for donation using AI.
 * Rate limited: 30 seconds cooldown, 100 per week.
 */
export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const clientIP = getClientIP(request);
    const rateLimit = limiter.check(clientIP);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.reason },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        },
      );
    }

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 },
      );
    }

    const body = await request.json();
    const { creatorName, amount } = body;

    // Random styles for variety
    const styles = [
      "casual and friendly",
      "excited and enthusiastic",
      "warm and sincere",
      "playful with humor",
      "short and punchy",
      "poetic and creative",
      "motivational",
      "simple and genuine",
    ];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];

    const prompt = `Generate a unique supportive message from a donor to a creator on ArcCaffeine.

    Creator: ${creatorName || "this creator"}
    Style: ${randomStyle}

    Rules:
    - You don't always have to use the name "Creator." Use it if necessary.
    - Max 100 characters
    - 0-1 emoji
    - Be ${randomStyle}
    - No amounts
    - Write as the donor
    - Be creative and different each time

    Message only, no quotes:`;

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://arccaffeine.xyz",
        "X-Title": "ArcCaffeine",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "AI API error");
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content?.trim() || "";

    // Clean up the message (remove quotes if present)
    const cleanMessage = message.replace(/^["']|["']$/g, "");

    return NextResponse.json({ message: cleanMessage });
  } catch (error) {
    console.error("Generate message error:", error);
    return NextResponse.json(
      { error: "Failed to generate message" },
      { status: 500 },
    );
  }
}
