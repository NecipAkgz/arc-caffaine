"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  Lightbulb,
  Target,
  Loader2,
} from "lucide-react";
import { DonationInsights } from "@/lib/gemini";

interface StoredInsights {
  data: DonationInsights;
  timestamp: number;
}

interface AIInsightsProps {
  userAddress: string;
  memoData: {
    totalDonations: number;
    uniqueSupporters: number;
    averageDonation: number;
    totalEarnings: number;
    topSupporter?: { name: string; amount: number };
    recentActivity: { date: string; count: number }[];
  };
}

/**
 * AI-powered insights card for the Dashboard.
 * Uses Gemini to analyze donation patterns and provide recommendations.
 * Persists insights to localStorage.
 */
export function AIInsights({ userAddress, memoData }: AIInsightsProps) {
  const [insights, setInsights] = useState<DonationInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Unique storage key per wallet address
  const storageKey = `arccaffeine_ai_insights_${userAddress.toLowerCase()}`;

  // Load insights from localStorage on mount or address change
  useEffect(() => {
    setInsights(null);
    setLastUpdated(null);
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed: StoredInsights = JSON.parse(stored);
        setInsights(parsed.data);
        setLastUpdated(new Date(parsed.timestamp));
      }
    } catch {
      // Ignore parse errors
    }
  }, [storageKey]);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memoData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch insights");
      }

      const data = await response.json();
      setInsights(data);
      setLastUpdated(new Date());

      // Save to localStorage
      const toStore: StoredInsights = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(toStore));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [memoData]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "needs_attention":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      default:
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    }
  };

  return (
    <div className="bg-secondary/30 border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-muted-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Insights
        </h3>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="p-2 hover:bg-background rounded-lg transition text-muted-foreground hover:text-foreground disabled:opacity-50 cursor-pointer"
          title="Generate Insights"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </button>
      </div>

      {!insights && !loading && !error && (
        <div className="text-center py-8">
          <Sparkles className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            Click the refresh button to generate AI-powered insights
          </p>
          <button
            onClick={fetchInsights}
            className="mt-4 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-sm font-medium transition cursor-pointer"
          >
            Generate Insights
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="relative inline-flex">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Sparkles className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-muted-foreground text-sm mt-4">
            Analyzing your donation data
            <span className="inline-flex ml-1">
              <span
                className="animate-bounce"
                style={{ animationDelay: "0ms" }}
              >
                .
              </span>
              <span
                className="animate-bounce"
                style={{ animationDelay: "150ms" }}
              >
                .
              </span>
              <span
                className="animate-bounce"
                style={{ animationDelay: "300ms" }}
              >
                .
              </span>
            </span>
          </p>
          <p className="text-muted-foreground/50 text-xs mt-2">
            This may take a few seconds
          </p>
        </div>
      )}

      {error && (
        <div className="text-center py-6 text-red-500">
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchInsights}
            className="mt-3 text-xs underline hover:no-underline cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}

      {insights && !loading && (
        <div className="space-y-4">
          {/* Sentiment Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getSentimentColor(insights.sentiment)}`}
          >
            {insights.sentiment === "positive" && "📈 Growing"}
            {insights.sentiment === "neutral" && "📊 Steady"}
            {insights.sentiment === "needs_attention" && "⚠️ Needs Attention"}
          </div>

          {/* Trend */}
          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Trend</p>
                <p className="text-sm text-foreground">{insights.trend}</p>
              </div>
            </div>
          </div>

          {/* Insight */}
          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Key Insight
                </p>
                <p className="text-sm text-foreground">{insights.insight}</p>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Recommendation
                </p>
                <p className="text-sm text-foreground">
                  {insights.recommendation}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
