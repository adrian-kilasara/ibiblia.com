import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 font-sans text-xs font-semibold tracking-wide transition-colors",
  {
    variants: {
      variant: {
        gold: "bg-gold/15 text-gold-foreground ring-1 ring-inset ring-gold/30",
        navy: "bg-primary text-primary-foreground",
        outline: "ring-1 ring-inset ring-border text-foreground",
        muted: "bg-muted text-muted-foreground",
        success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
      },
    },
    defaultVariants: { variant: "gold" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
