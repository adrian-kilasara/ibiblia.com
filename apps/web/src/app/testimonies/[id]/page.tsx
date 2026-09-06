import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Section } from "@ibiblia/ui";
import { site } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { ContentBlocks } from "@/components/media-blocks";

interface Props {
  params: Promise<{ id: string }>;
}

const roleLabel = (r: string) => r.charAt(0) + r.slice(1).toLowerCase();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const t = await site.testimony(id);
  return {
    title: t ? `${t.name} · Testimony` : "Testimony",
    description: t?.quote ?? undefined,
  };
}

export default async function TestimonyDetailPage({ params }: Props) {
  const { id } = await params;
  const t = await site.testimony(id);
  if (!t) notFound();

  return (
    <main>
      <PageHeader
        eyebrow="Testimony"
        title={t.name}
        description={`${roleLabel(t.role)}${t.location ? ` · ${t.location}` : ""}`}
      />
      <Section>
        <Link href="/" className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back home
        </Link>

        <div className="mx-auto max-w-prose">
          {t.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={t.photoUrl}
              alt={t.name}
              className="mx-auto mb-8 size-32 rounded-full object-cover ring-1 ring-border"
            />
          )}
          <blockquote className="border-l-2 border-gold pl-5 font-heading text-2xl font-medium leading-snug">
            &ldquo;{t.quote}&rdquo;
          </blockquote>
          <ContentBlocks blocks={t.content} title={t.name} className="mt-10" />
        </div>
      </Section>
    </main>
  );
}
