"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import type { Testimony } from "@ibiblia/types";

export function TestimonySlider({ testimonies }: { testimonies: Testimony[] }) {
  const [i, setI] = React.useState(0);
  if (testimonies.length === 0) return null;
  const t = testimonies[i]!;
  const go = (d: number) => setI((prev) => (prev + d + testimonies.length) % testimonies.length);

  return (
    <div className="relative mx-auto max-w-3xl text-center">
      <Quote className="mx-auto size-10 text-gold" />
      <blockquote className="mt-6 font-heading text-2xl font-medium leading-snug md:text-3xl">
        “{t.quote}”
      </blockquote>
      <p className="mt-6 text-sm font-semibold">{t.name}</p>
      <p className="text-sm text-muted-foreground">
        {t.role.charAt(0) + t.role.slice(1).toLowerCase()}
        {t.location ? ` · ${t.location}` : ""}
      </p>

      {testimonies.length > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => go(-1)}
            aria-label="Previous"
            className="inline-flex size-10 items-center justify-center rounded-full border border-border hover:bg-surface"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="flex gap-1.5">
            {testimonies.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Go to testimony ${idx + 1}`}
                onClick={() => setI(idx)}
                className={`size-2 rounded-full bg-current transition-opacity ${
                  idx === i ? "opacity-100" : "opacity-30"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => go(1)}
            aria-label="Next"
            className="inline-flex size-10 items-center justify-center rounded-full border border-border hover:bg-surface"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}
    </div>
  );
}
