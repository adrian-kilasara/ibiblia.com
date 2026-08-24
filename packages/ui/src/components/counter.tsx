"use client";

import * as React from "react";
import {
  animate,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  motion,
} from "framer-motion";
import { cn } from "../lib/cn";

interface CounterProps {
  /** Target value to count up to. */
  value: number;
  /** Fixed decimal places (e.g. 1 for 62.5). */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
}

/**
 * Counts from 0 to `value` when scrolled into view. Respects reduced-motion
 * (renders the final value immediately). Used for the homepage impact numbers.
 */
function Counter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  durationMs = 1800,
  className,
}: CounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduceMotion = useReducedMotion();

  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) =>
    prefix +
    latest.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) +
    suffix
  );

  React.useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, {
      duration: durationMs / 1000,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [inView, reduceMotion, value, durationMs, count]);

  return (
    <motion.span ref={ref} className={cn("tabular-nums", className)}>
      {rounded}
    </motion.span>
  );
}

export { Counter };
