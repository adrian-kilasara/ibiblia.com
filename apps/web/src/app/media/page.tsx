import type { Metadata } from "next";
import { Play, Headphones, Video } from "lucide-react";
import { Section, SectionHeading } from "@ibiblia/ui";
import { site } from "@/lib/api";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Media",
  description: "Watch and listen — videos, podcasts, sermons, and Bible studies.",
};

const ICON: Record<string, typeof Play> = {
  VIDEO: Video,
  PODCAST: Headphones,
  AUDIO: Play,
};

export default async function MediaPage() {
  const media = await site.media();

  return (
    <main>
      <PageHeader
        eyebrow="Watch & Listen"
        title="Media library"
        description="Videos, podcasts, sermons, and Bible studies from across the mission."
      />
      <Section>
        {media.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">No media yet.</p>
        ) : (
          <>
            <SectionHeading eyebrow="Latest" title="Recent uploads" className="mb-10" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {media.map((item) => {
                const Icon = ICON[item.type] ?? Play;
                return (
                  <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="group">
                    <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                      {item.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.thumbnailUrl} alt={item.title} className="absolute inset-0 size-full object-cover" />
                      ) : null}
                      <Icon className="relative size-10 opacity-80 transition-transform group-hover:scale-110" />
                    </div>
                    <p className="mt-3 font-medium">{item.title}</p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.type}</p>
                  </a>
                );
              })}
            </div>
          </>
        )}
      </Section>
    </main>
  );
}
