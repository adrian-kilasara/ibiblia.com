import * as React from "react";
import { cn } from "../lib/cn";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–100 completion percentage. */
  value: number;
  label?: string;
}

/** Slim progress bar used for translation-project completion. */
function Progress({ value, label, className, ...props }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("w-full", className)} {...props}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-semibold tabular-nums">{clamped}%</span>
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-gold transition-[width] duration-700 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export { Progress };
