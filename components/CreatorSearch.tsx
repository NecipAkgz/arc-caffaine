"use client";

import { useState, useRef, useEffect, KeyboardEvent, useId } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, X, AlertCircle } from "lucide-react";
import { useCreatorSearch } from "@/hooks/useCreatorSearch";

interface CreatorSearchProps {
  /** Variant: 'hero' for landing page, 'navbar' for navigation bar */
  variant?: "hero" | "navbar";
  /** Placeholder text */
  placeholder?: string;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Callback when navigation happens */
  onNavigate?: () => void;
}

/**
 * Creator Search Component
 *
 * Premium glassmorphism search bar for finding creators by username.
 * Features animated states and smooth transitions.
 */
export function CreatorSearch({
  variant = "hero",
  placeholder = "Search for a creator...",
  autoFocus = false,
  onNavigate,
}: CreatorSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [showError, setShowError] = useState(false);
  const { searchCreator, loading, error, clearSearch } = useCreatorSearch();
  const errorId = useId();

  // Handle search
  const handleSearch = async () => {
    if (!query.trim() || loading) return;

    const result = await searchCreator(query);

    if (result?.found) {
      // Navigate to creator's profile
      router.push(`/${result.username}`);
      setQuery("");
      clearSearch();
      onNavigate?.();
    } else {
      setShowError(true);
    }
  };

  // Handle key press
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
    if (e.key === "Escape") {
      setQuery("");
      clearSearch();
      setShowError(false);
      inputRef.current?.blur();
    }
  };

  // Clear error when query changes
  useEffect(() => {
    if (showError) {
      setShowError(false);
      clearSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Style variants
  const isHero = variant === "hero";

  return (
    <div role="search" className={`relative ${isHero ? "w-full max-w-lg" : "w-64"}`}>
      {/* Search Input Container */}
      <div
        className={`
          relative flex items-center gap-2
          ${
            isHero
              ? "bg-background/50 backdrop-blur-lg border border-border/50 rounded-xl px-4 py-3 shadow-lg shadow-black/5"
              : "bg-secondary/40 backdrop-blur-sm border border-border/40 rounded-lg px-3 py-2 hover:border-border/60 hover:bg-secondary/50"
          }
          transition-all duration-300
          focus-within:border-primary/50 focus-within:bg-secondary/40
          ${showError && error ? "border-red-500/50" : ""}
        `}
      >
        {/* Search Icon / Loader */}
        <div className="shrink-0">
          {loading ? (
            <Loader2
              className={`animate-spin text-primary ${
                isHero ? "w-5 h-5" : "w-4 h-4"
              }`}
            />
          ) : (
            <Search
              className={`text-muted-foreground ${
                isHero ? "w-5 h-5" : "w-4 h-4"
              }`}
            />
          )}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={loading}
          aria-label="Search creators"
          aria-invalid={showError && error ? "true" : "false"}
          aria-describedby={showError && error ? errorId : undefined}
          className={`
            flex-1 bg-transparent border-none outline-none
            text-foreground placeholder:text-muted-foreground/60
            ${isHero ? "text-base" : "text-sm"}
            disabled:opacity-50
          `}
        />

        {/* Clear Button */}
        {query && !loading && (
          <button
            onClick={() => {
              setQuery("");
              clearSearch();
              setShowError(false);
              inputRef.current?.focus();
            }}
            className="shrink-0 p-1 rounded-full hover:bg-border/50 transition-colors"
            type="button"
            aria-label="Clear"
          >
            <X
              className={`text-muted-foreground ${
                isHero ? "w-4 h-4" : "w-3 h-3"
              }`}
            />
          </button>
        )}

        {/* Search Button (Hero only) */}
        {isHero && (
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="
              shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground
              px-4 py-2 rounded-xl font-medium text-sm
              transition-all duration-200
              hover:scale-105 hover:shadow-lg hover:shadow-primary/25
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
            "
            type="button"
          >
            Search
          </button>
        )}
      </div>

      {/* Error Message */}
      {showError && error && (
        <div
          id={errorId}
          role="alert"
          className={`
            absolute top-full mt-2 left-0 right-0
            flex items-center gap-2 px-4 py-3
            bg-red-500/10 border border-red-500/30 rounded-xl
            text-red-400 text-sm
            animate-in fade-in slide-in-from-top-2 duration-200
          `}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
