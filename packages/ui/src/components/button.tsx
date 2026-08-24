import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-sans text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Gold is reserved for the primary call to action.
        primary:
          "bg-gold text-gold-foreground shadow-sm hover:brightness-105 active:brightness-95",
        navy: "bg-primary text-primary-foreground hover:bg-primary/90",
        // Apple-style liquid glass; sits over colored/photo backgrounds. White text on the
        // navy hero (light mode); navy text on the gold hero (dark mode) to stay readable.
        glass:
          "liquid-glass text-white hover:text-white dark:text-primary-foreground dark:hover:text-primary-foreground",
        outline:
          "border border-primary/25 bg-transparent text-foreground hover:bg-surface",
        ghost: "bg-transparent hover:bg-surface text-foreground",
        link: "text-foreground underline-offset-4 hover:underline p-0 h-auto rounded-none",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-6",
        lg: "h-14 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
