import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
}

/** Consistent navy hero band used at the top of interior pages. */
export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="section-bold bg-primary text-primary-foreground">
      <div className="container py-16 md:py-24">
        {eyebrow && (
          <p className="mb-3 font-sans text-sm font-semibold uppercase tracking-[0.18em] text-eyebrow">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-3xl font-heading text-4xl font-bold md:text-5xl">{title}</h1>
        {description && (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-primary-foreground/80">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
