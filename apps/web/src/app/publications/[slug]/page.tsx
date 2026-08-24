import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, BookOpen } from "lucide-react";
import { Badge, Button, Section } from "@ibiblia/ui";
import { site, formatMoney } from "@/lib/api";
import { PageHeader } from "@/components/page-header";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pub = await site.publication(slug);
  return { title: pub?.title ?? "Publication", description: pub?.description ?? undefined };
}

export default async function PublicationDetailPage({ params }: Props) {
  const { slug } = await params;
  const pub = await site.publication(slug);
  if (!pub) notFound();

  return (
    <main>
      <PageHeader eyebrow={pub.category.replace("_", " ")} title={pub.title} />
      <Section>
        <Link href="/publications" className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> All publications
        </Link>

        <div className="grid gap-12 md:grid-cols-[280px_1fr]">
          <div className="flex aspect-[3/4] items-center justify-center rounded-lg bg-surface p-6 text-center text-sm text-muted-foreground ring-1 ring-border">
            {pub.title}
          </div>

          <div>
            {pub.author && <p className="text-muted-foreground">by {pub.author}</p>}
            {pub.language && <p className="mt-1 text-sm text-muted-foreground">Language: {pub.language.name}</p>}

            <div className="mt-4 flex flex-wrap gap-1.5">
              {pub.formats.map((f) => (
                <Badge key={f} variant="muted">{f}</Badge>
              ))}
            </div>

            {pub.description && <p className="mt-6 whitespace-pre-line text-muted-foreground">{pub.description}</p>}

            <div className="mt-8 flex flex-wrap gap-3">
              {pub.previewUrl && (
                <Button asChild variant="outline">
                  <a href={pub.previewUrl} target="_blank" rel="noopener noreferrer">
                    <BookOpen /> Read preview
                  </a>
                </Button>
              )}
              {pub.downloadUrl && (
                <Button asChild variant="navy">
                  <a href={pub.downloadUrl} target="_blank" rel="noopener noreferrer">
                    <Download /> Download
                  </a>
                </Button>
              )}
              {pub.price ? (
                <Button variant="primary" disabled>
                  Buy · {formatMoney(pub.price)} (coming soon)
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
