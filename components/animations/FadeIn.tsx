"use client";

import { useRef, ReactNode, HTMLAttributes } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface FadeInProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
}

/**
 * FadeIn Animation Wrapper
 *
 * Wraps children with a smooth fade-in and optional slide animation.
 * Uses GSAP for high-performance animations.
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 0.8,
  direction = "up",
  className = "",
  ...props
}: FadeInProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!elementRef.current) return;

    const directionMap = {
      up: { y: 30 },
      down: { y: -30 },
      left: { x: 30 },
      right: { x: -30 },
      none: {},
    };

    gsap.fromTo(
      elementRef.current,
      {
        opacity: 0,
        ...directionMap[direction],
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration,
        delay,
        ease: "power3.out",
      },
    );
  }, [delay, duration, direction]);

  return (
    <div
      ref={elementRef}
      className={className}
      style={{ opacity: 0 }}
      {...props}
    >
      {children}
    </div>
  );
}
