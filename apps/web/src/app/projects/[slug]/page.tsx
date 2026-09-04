import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import { Button, Progress, Section } from "@ibiblia/ui";
import { site, formatMoney } from "@/lib/api";
import { PageHeader } from "@/components/page-header";

interface Props {
  params: Promise<{ slug: string }>;
}

const STATUS_LABEL: Record<string, string> = {
  UPCOMING: "Upcoming",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  NEEDS_FUNDING: "Needs Funding",
};

/** Convert a YouTube/Vimeo URL to its embeddable player URL, or null if not recognised. */
function videoEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (host === "youtube.com") {
      if (u.pathname === "/watch") {
        const v = u.searchParams.get("v");
        return v ? `https://www.youtube.com/embed/${v}` : null;
      }
      if (u.pathname.startsWith("/embed/")) return url;
      if (u.pathname.startsWith("/shorts/")) return `https://www.youtube.com/embed/${u.pathname.split("/")[2]}`;
    }
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    if (host === "player.vimeo.com") return url;
    return null;
  } catch {
    return null;
  }
}

const isVideoFile = (url: string): boolean => /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await site.project(slug);
  return { title: project?.title ?? "Project", description: project?.summary };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const p = await site.project(slug);
  if (!p) notFound();

  const raised = p.fundingRaised ?? 0;
  const needed = p.fundingNeeded ?? 0;
  const fundingPct = needed > 0 ? Math.round((raised / needed) * 100) : 0;

  const videoEmbed = p.videoUrl ? videoEmbedUrl(p.videoUrl) : null;
  const videoFile = p.videoUrl && !videoEmbed && isVideoFile(p.videoUrl) ? p.videoUrl : null;

  return (
    <main>
      <PageHeader eyebrow={p.language ? `${p.language.name} · ${p.region ?? ""}` : "Project"} title={p.title} description={p.summary} />
      <Section>
        <Link href="/projects" className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> All projects
        </Link>

        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex aspect-[16/9] items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-primary/70 text-sm text-primary-foreground/50">
              {p.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.coverImageUrl} alt={p.title} className="size-full object-cover" />
              ) : (
                "Project photography"
              )}
            </div>
            {videoEmbed && (
              <div className="mt-4 aspect-video overflow-hidden rounded-lg bg-black">
                <iframe
                  src={videoEmbed}
                  title={`${p.title} video`}
                  className="size-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            {videoFile && (
              <video controls className="mt-4 w-full rounded-lg bg-black">
                <source src={videoFile} />
              </video>
            )}
            {p.gallery && p.gallery.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {p.gallery.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt={p.title}
                    className="aspect-square w-full rounded-md object-cover"
                  />
                ))}
              </div>
            )}
            {p.body && <p className="mt-8 whitespace-pre-line text-muted-foreground">{p.body}</p>}

            {p.links && p.links.length > 0 && (
              <div className="mt-10">
                <h2 className="font-heading text-xl font-semibold">Resources &amp; links</h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {p.links.map((l) => {
                    const isPdf = /\.pdf(\?.*)?$/i.test(l.url);
                    const Icon = isPdf ? FileText : ExternalLink;
                    return (
                      <a
                        key={l.url}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
                      >
                        <Icon className="size-4 text-gold" /> {l.label || l.url}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="rounded-lg border border-border bg-card p-6">
              <span className="liquid-glass-dark inline-block rounded-full px-3 py-1 text-xs font-semibold">
                {STATUS_LABEL[p.status] ?? p.status}
              </span>
              <div className="mt-5">
                <Progress value={p.progressPct} label="Translation progress" />
              </div>

              {needed > 0 && (
                <div className="mt-6">
                  <Progress value={fundingPct} label="Funding" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {formatMoney(raised)} raised of {formatMoney(needed)}
                  </p>
                </div>
              )}

              <dl className="mt-6 space-y-2 text-sm">
                {p.language && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Language</dt>
                    <dd className="font-medium">{p.language.name}</dd>
                  </div>
                )}
                {p.country && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Country</dt>
                    <dd className="font-medium">{p.country.name}</dd>
                  </div>
                )}
                {p.team && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Team</dt>
                    <dd className="font-medium">{p.team}</dd>
                  </div>
                )}
              </dl>

              <Button asChild variant="primary" className="mt-6 w-full">
                <Link href={`/donate?designation=TRANSLATION`}>Support this project</Link>
              </Button>
            </div>
          </aside>
        </div>
      </Section>
    </main>
  );
}
