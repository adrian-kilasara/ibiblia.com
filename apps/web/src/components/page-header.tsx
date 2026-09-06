import type { ReactNode } from "react";
import { site } from "@/lib/api";

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Optional section-background key; when set to an uploaded image, it blends over the banner. */
  bgKey?: string;
}

const MASK =
  "radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.28) 55%, rgba(0,0,0,0.1) 100%)";

/** Consistent navy hero band used at the top of interior pages. */
export async function PageHeader({ eyebrow, title, description, bgKey }: PageHeaderProps) {
  let image: string | undefined;
  if (bgKey) {
    const backgrounds = await site.sectionBackgrounds();
    image = backgrounds.find((b) => b.key === bgKey)?.imageUrl ?? undefined;
  }

  return (
    <section className="section-bold relative overflow-hidden bg-primary text-primary-foreground">
      {image && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${image}")`, WebkitMaskImage: MASK, maskImage: MASK }}
        />
      )}
      <div className="container relative z-10 py-16 md:py-24">
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
