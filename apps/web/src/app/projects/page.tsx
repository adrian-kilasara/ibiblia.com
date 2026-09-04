import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, Progress, Section } from "@ibiblia/ui";
import { site } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { ProjectFilters } from "@/components/project-filters";

export const metadata: Metadata = {
  title: "Projects",
  description: "Translation projects in progress across languages and nations.",
};

const STATUS_LABEL: Record<string, string> = {
  UPCOMING: "Upcoming",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  NEEDS_FUNDING: "Needs Funding",
};

interface Props {
  searchParams: Promise<{ status?: string; languageId?: string; countryId?: string }>;
}

export default async function ProjectsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  if (sp.status) qs.set("status", sp.status);
  if (sp.languageId) qs.set("languageId", sp.languageId);
  if (sp.countryId) qs.set("countryId", sp.countryId);
  const query = qs.toString() ? `?${qs.toString()}` : "";

  const [projects, languages, countries] = await Promise.all([
    site.projects(query),
    site.languages(),
    site.countries(),
  ]);

  return (
    <main>
      <PageHeader
        eyebrow="Translation Projects"
        title="Scripture on the move"
        description="Follow the languages, regions, and communities receiving God's Word — and see where support is needed most."
      />
      <Section>
        <ProjectFilters languages={languages} countries={countries} />

        {projects.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">No projects match these filters.</p>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Link key={p.id} href={`/projects/${p.slug}`} className="group">
                <Card className="flex h-full flex-col overflow-hidden group-hover:shadow-md">
                  <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-gradient-to-br from-primary to-primary/70 text-xs text-primary-foreground/50">
                    {p.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.coverImageUrl} alt={p.title} className="absolute inset-0 size-full object-cover" />
                    ) : (
                      "Project photography"
                    )}
                    <span className="liquid-glass absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white">
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                  </div>
                  <CardContent className="flex flex-1 flex-col pt-5">
                    {p.language && (
                      <span className="mb-1 text-xs text-muted-foreground">{p.language.name}</span>
                    )}
                    <h3 className="font-heading text-lg font-semibold">{p.title}</h3>
                    <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{p.summary}</p>
                    <div className="mt-4">
                      <Progress value={p.progressPct} label="Progress" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </main>
  );
}
