import * as React from "react";
import { cn } from "../lib/cn";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Alternate surface background for rhythm between sections. */
  surface?: boolean;
  /** Navy background for high-contrast feature sections. */
  navy?: boolean;
}

/** Full-width section wrapper with a centered container and vertical rhythm. */
const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, surface, navy, children, ...props }, ref) => (
    <section
      ref={ref}
      className={cn(
        "w-full py-16 md:py-24",
        surface && "bg-surface",
        navy && "section-bold bg-primary text-primary-foreground",
        className
      )}
      {...props}
    >
      <div className="container">{children}</div>
    </section>
  )
);
Section.displayName = "Section";

interface SectionHeadingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
}

/** Eyebrow + title + description block used above most sections. */
function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
      {...props}
    >
      {eyebrow && (
        <p className="mb-3 font-sans text-sm font-semibold uppercase tracking-[0.18em] text-eyebrow">
          {eyebrow}
        </p>
      )}
      <h2 className="font-heading text-3xl font-semibold md:text-4xl">{title}</h2>
      {description && (
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export { Section, SectionHeading };
