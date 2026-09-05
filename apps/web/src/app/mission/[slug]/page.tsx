import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Section } from "@ibiblia/ui";
import { site } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { ContentBlocks } from "@/components/media-blocks";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const area = await site.missionArea(slug);
  return { title: area?.title ?? "Mission" };
}

export default async function MissionAreaPage({ params }: Props) {
  const { slug } = await params;
  const area = await site.missionArea(slug);
  if (!area) notFound();

  return (
    <main>
      <PageHeader eyebrow="Mission Area" title={area.title} description={area.summary} />
      <Section>
        <Link href="/mission" className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> All mission areas
        </Link>
        {area.content && area.content.length > 0 ? (
          <ContentBlocks blocks={area.content} title={area.title} />
        ) : (
          <>
        {area.images && area.images.length > 0 && (
          <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {area.images.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt={area.title}
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
            ))}
          </div>
        )}
        <div className="grid gap-10 lg:grid-cols-2">
          {area.process && (
            <div>
              <h2 className="font-heading text-2xl font-semibold">Our process</h2>
              <p className="mt-4 whitespace-pre-line text-muted-foreground">{area.process}</p>
            </div>
          )}
          {area.impact && (
            <div>
              <h2 className="font-heading text-2xl font-semibold">The impact</h2>
              <p className="mt-4 whitespace-pre-line text-muted-foreground">{area.impact}</p>
            </div>
          )}
        </div>

        {area.links && area.links.length > 0 && (
          <div className="mt-12">
            <h2 className="font-heading text-2xl font-semibold">Learn more</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {area.links.map((l) => (
                <a
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
                >
                  {l.label} <ExternalLink className="size-4 text-gold" />
                </a>
              ))}
            </div>
          </div>
        )}
          </>
        )}
      </Section>
    </main>
  );
}
