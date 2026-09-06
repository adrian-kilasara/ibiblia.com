import * as React from "react";

/**
 * Section background image blended over the section colour with `luminosity` (keeps the section's
 * hue, shows the image's light/dark detail). Two stacked layers create a radial effect:
 *  - a sharp centre layer (opacity ~30% at the centre, fading out by the edges)
 *  - a gaussian-blurred corner layer (opacity ~20% at the corners), so corners are soft.
 */
const SHARP_MASK =
  "radial-gradient(ellipse at center, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.30) 30%, rgba(0,0,0,0.06) 68%, rgba(0,0,0,0) 100%)";
const BLUR_MASK =
  "radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(0,0,0,0.08) 55%, rgba(0,0,0,0.20) 100%)";
const CORNER_BLUR = "blur(5px)";

export function SectionOverlay({ image }: { image?: string | null }) {
  if (!image) return null;
  const bg: React.CSSProperties = { backgroundImage: `url("${image}")` };
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cover bg-center mix-blend-luminosity"
        style={{ ...bg, WebkitMaskImage: SHARP_MASK, maskImage: SHARP_MASK }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cover bg-center mix-blend-luminosity"
        style={{ ...bg, WebkitMaskImage: BLUR_MASK, maskImage: BLUR_MASK, filter: CORNER_BLUR }}
      />
    </>
  );
}
