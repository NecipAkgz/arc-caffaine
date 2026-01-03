"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface CountUpProps {
  end: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUp({
  end,
  duration = 2,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: CountUpProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const valueRef = useRef({ val: 0 });

  useGSAP(
    () => {
      gsap.to(valueRef.current, {
        val: end,
        duration: duration,
        ease: "power2.out",
        onUpdate: () => {
          setValue(valueRef.current.val);
        },
      });
    },
    { dependencies: [end], scope: ref }
  );

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}
