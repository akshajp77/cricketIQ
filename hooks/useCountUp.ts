"use client";

import { useEffect, useRef, useState } from "react";

export function useCountUp(end: number, duration = 1500, decimals = 0) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }

    // Honor reduced-motion: skip the animation and show the final value.
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setCount(end);
      return;
    }

    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((eased * end).toFixed(decimals)));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      startRef.current = null;
    };
  }, [end, duration, decimals]);

  return count;
}
