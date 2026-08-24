import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { Badge, Button, Section } from "@ibiblia/ui";
import { site } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { PublicationFilters } from "@/components/publication-filters";

export const metadata: Metadata = {
  title: "Publications",
  description: "Bibles, devotionals, study guides, and children's books in print and digital.",
};

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function PublicationsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const query = sp.category ? `?category=${sp.category}` : "";
  const publications = await site.publications(query);

  return (
    <main>
      <PageHeader
        eyebrow="Publications"
        title="Scripture and Christ-centered resources"
        description="Explore our catalog of Bibles, devotionals, study guides, and children's books — many available to read, download, or listen for free."
      />
      <Section>
        <PublicationFilters />

        {publications.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">No publications in this category yet.</p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {publications.map((pub) => (
              <div key={pub.id} className="group flex flex-col">
                <Link href={`/publications/${pub.slug}`}>
                  <div className="flex aspect-[3/4] items-center justify-center rounded-lg bg-surface p-4 text-center text-sm text-muted-foreground ring-1 ring-border transition-shadow group-hover:shadow-md">
                    {pub.title}
                  </div>
                </Link>
                <div className="mt-3 flex flex-1 flex-col">
                  <Link href={`/publications/${pub.slug}`} className="line-clamp-1 font-medium hover:text-gold">
                    {pub.title}
                  </Link>
                  {pub.author && <p className="text-sm text-muted-foreground">{pub.author}</p>}
                  <div className="mb-3 mt-1.5 flex flex-wrap gap-1">
                    {pub.formats.map((f) => (
                      <Badge key={f} variant="muted" className="text-[10px]">{f}</Badge>
                    ))}
                  </div>
                  <div className="mt-auto">
                    {pub.downloadUrl ? (
                      <Button asChild size="sm" variant="outline" className="w-full">
                        <a href={pub.downloadUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="size-4" /> Download
                        </a>
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="outline" className="w-full">
                        <Link href={`/publications/${pub.slug}`}>View</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </main>
  );
}
