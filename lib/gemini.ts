/**
 * OpenRouter AI client configuration for donation insights.
 * Uses OpenAI-compatible API for various AI models.
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

// Default model - can be changed to any OpenRouter-supported model
const DEFAULT_MODEL = "google/gemini-2.0-flash-001";

export interface DonationInsights {
  trend: string;
  insight: string;
  recommendation: string;
  sentiment: "positive" | "neutral" | "needs_attention";
}

/**
 * Generates a prompt for analyzing donation data.
 */
export function generateInsightsPrompt(data: {
  totalDonations: number;
  uniqueSupporters: number;
  averageDonation: number;
  totalEarnings: number;
  topSupporter?: { name: string; amount: number };
  recentActivity: { date: string; count: number }[];
}): string {
  return `You are an analytics assistant for ArcCaffeine, a Web3 creator support platform on Arc blockchain using USDC.

Analyze this creator's donation data and provide insights:

📊 Statistics:
- Total donations received: ${data.totalDonations}
- Unique supporters: ${data.uniqueSupporters}
- Average donation: ${data.averageDonation.toFixed(2)} USDC
- Total earnings: ${data.totalEarnings.toFixed(2)} USDC
${data.topSupporter ? `- Top supporter: ${data.topSupporter.name} (${data.topSupporter.amount.toFixed(2)} USDC)` : ""}

📈 Recent activity (last 7 data points):
${data.recentActivity.map((d) => `- ${d.date}: ${d.count} donations`).join("\n")}

Respond in this exact JSON format:
{
  "trend": "Brief 1-sentence summary of the overall trend",
  "insight": "One key insight about the supporter base",
  "recommendation": "One actionable recommendation to grow support",
  "sentiment": "positive" | "neutral" | "needs_attention"
}

Keep responses concise and actionable. Use emojis sparingly.`;
}

/**
 * Calls OpenRouter API to generate donation insights.
 */
export async function generateInsights(prompt: string): Promise<string | null> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://arccaffeine.xyz",
      "X-Title": "ArcCaffeine",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "OpenRouter API error");
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || null;
}

/**
 * Parses the AI response into structured insights.
 */
export function parseInsightsResponse(text: string): DonationInsights | null {
  try {
    // Extract JSON from the response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      trend: parsed.trend || "",
      insight: parsed.insight || "",
      recommendation: parsed.recommendation || "",
      sentiment: parsed.sentiment || "neutral",
    };
  } catch {
    console.error("Failed to parse AI response:", text);
    return null;
  }
}
