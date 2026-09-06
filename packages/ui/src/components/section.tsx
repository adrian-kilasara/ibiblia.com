import * as React from "react";
import { cn } from "../lib/cn";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Alternate surface background for rhythm between sections. */
  surface?: boolean;
  /** Navy background for high-contrast feature sections. */
  navy?: boolean;
  /** Optional background image blended over the section colour (subtle corners → stronger centre). */
  image?: string | null;
}

/**
 * Radial mask: the background image shows at ~40% in the centre and fades to ~10% at the corners,
 * blended over the section's colour with mix-blend "overlay".
 */
const OVERLAY_MASK =
  "radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.28) 55%, rgba(0,0,0,0.1) 100%)";

/** Full-width section wrapper with a centered container and vertical rhythm. */
const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, surface, navy, image, children, ...props }, ref) => (
    <section
      ref={ref}
      className={cn(
        "relative w-full overflow-hidden py-16 md:py-24",
        surface && "bg-surface",
        navy && "section-bold bg-primary text-primary-foreground",
        className
      )}
      {...props}
    >
      {image && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-center mix-blend-overlay"
          style={{
            backgroundImage: `url("${image}")`,
            WebkitMaskImage: OVERLAY_MASK,
            maskImage: OVERLAY_MASK,
          }}
        />
      )}
      <div className="container relative z-10">{children}</div>
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
