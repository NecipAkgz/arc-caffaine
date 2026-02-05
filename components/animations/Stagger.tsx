"use client";

import { useRef, ReactNode, Children } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface StaggerProps {
  children: ReactNode;
  staggerDelay?: number;
  initialDelay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
}

/**
 * Stagger Animation Wrapper
 *
 * Animates children elements with a staggered delay for a cascading effect.
 * Perfect for lists, grids, or any collection of elements.
 */
export function Stagger({
  children,
  staggerDelay = 0.1,
  initialDelay = 0,
  duration = 0.6,
  direction = "up",
  className = "",
}: StaggerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    const childElements = containerRef.current.children;

    const directionMap = {
      up: { y: 20 },
      down: { y: -20 },
      left: { x: 20 },
      right: { x: -20 },
      none: {},
    };

    // Set container to visible first
    gsap.set(containerRef.current, { opacity: 1 });

    // Set will-change for better GPU acceleration
    gsap.set(childElements, { willChange: "transform, opacity" });

    gsap.fromTo(
      childElements,
      {
        opacity: 0,
        ...directionMap[direction],
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration,
        delay: initialDelay,
        stagger: staggerDelay,
        ease: "power3.out",
        onComplete: () => {
          // Clean up will-change after animation
          gsap.set(childElements, { willChange: "auto" });
        },
      },
    );
  }, [staggerDelay, initialDelay, duration, direction]);

  return (
    <div ref={containerRef} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
