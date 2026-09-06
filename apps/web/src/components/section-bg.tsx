import * as React from "react";
import { Section } from "@ibiblia/ui";
import { site } from "@/lib/api";

type SectionProps = React.ComponentProps<typeof Section>;

/**
 * Server wrapper around <Section> that looks up its background image by key and passes it in,
 * so any page section can carry an editable, blended background without extra data plumbing.
 */
export async function SectionBg({ bgKey, ...props }: { bgKey: string } & SectionProps) {
  const backgrounds = await site.sectionBackgrounds();
  const image = backgrounds.find((b) => b.key === bgKey)?.imageUrl ?? undefined;
  return <Section image={image} {...props} />;
}
