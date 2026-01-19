"use client";

import { useRef, useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface TypewriterProps {
  phrases: string[];
  className?: string;
}

/**
 * Premium Typewriter Animation Component
 *
 * Word-by-word reveal with gradient text and smooth GSAP animations.
 * Each word fades in and slides up for a premium effect.
 */
export function Typewriter({ phrases, className = "" }: TypewriterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Build all words with special styling for key terms
  const allWords = phrases.flatMap((phrase) => {
    const words = phrase.trim().split(" ");
    return words.map((word) => ({
      text: word,
      isKeyword: ["Create", "Share", "Earn"].some((kw) => word.includes(kw)),
    }));
  });

  useEffect(() => {
    setIsReady(true);
  }, []);

  useGSAP(
    () => {
      if (!isReady || !containerRef.current) return;

      const words = wordsRef.current.filter(Boolean) as HTMLSpanElement[];

      // Set initial state
      gsap.set(words, {
        opacity: 0,
        y: 30,
        scale: 0.9,
      });

      // Staggered reveal animation with spring-like ease
      gsap.to(words, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.32,
        stagger: 0.19,
        delay: 0.4,
        ease: "back.out(1.7)",
        onComplete: () => {
          // Add subtle breathing glow to keywords
          const keywords = words.filter((_, i) => allWords[i]?.isKeyword);
          gsap.to(keywords, {
            textShadow: "0 0 40px rgba(245, 158, 11, 0.6)",
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        },
      });
    },
    { dependencies: [isReady], scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className={`text-center ${className}`}
      aria-label={phrases.join(" ")}
    >
      <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight leading-relaxed">
        {allWords.map((word, index) => (
          <span
            key={index}
            ref={(el) => {
              wordsRef.current[index] = el;
            }}
            style={{
              opacity: 0,
              transform: "translateY(20px) scale(0.95)",
              willChange: "opacity, transform",
            }}
            className={`inline-block mr-[0.35em] ${
              word.isKeyword
                ? "bg-linear-to-r from-primary via-amber-300 to-orange-400 bg-clip-text text-transparent font-bold drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                : "text-foreground/90"
            }`}
          >
            {word.text}
          </span>
        ))}
      </p>
    </div>
  );
}
