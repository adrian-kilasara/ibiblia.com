import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Globe,
  Headphones,
  HeartHandshake,
  Package,
  Sparkles,
} from "lucide-react";
import type { MissionAreaKey } from "@ibiblia/types";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Counter,
  Progress,
  Reveal,
  Section,
  SectionHeading,
} from "@ibiblia/ui";
import { site } from "@/lib/api";
import { TestimonySlider } from "@/components/testimony-slider";

const MISSION_ICON: Record<MissionAreaKey, typeof Globe> = {
  TRANSLATION: Globe,
  PUBLISHING: BookOpen,
  DIGITAL: Headphones,
  DISTRIBUTION: Package,
  INNOVATION: Sparkles,
};

const STATUS_LABEL: Record<string, string> = {
  UPCOMING: "Upcoming",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  NEEDS_FUNDING: "Needs Funding",
};

export default async function HomePage() {
  const data = await site.home();

  // Assign an alternating gold ↔ dark-blue rhythm across the sections that actually render
  // (empty sections are skipped, so the alternation is never broken). The hero is band 0 (gold).
  const sectionOrder = [
    "impact",
    "mission",
    "preamble",
    "projects",
    "publications",
    "testimonies",
    "getInvolved",
    "news",
  ] as const;
  const visible: Record<(typeof sectionOrder)[number], boolean> = {
    impact: data.impactStats.length > 0,
    mission: data.missionAreas.length > 0,
    preamble: true,
    projects: data.featuredProjects.length > 0,
    publications: data.publications.length > 0,
    testimonies: data.testimonies.length > 0,
    getInvolved: true,
    news: data.latestNews.length > 0,
  };
  const tone = {} as Record<(typeof sectionOrder)[number], "gold" | "blue">;
  let band = 1;
  for (const key of sectionOrder) {
    if (!visible[key]) continue;
    tone[key] = band % 2 === 0 ? "gold" : "blue";
    band++;
  }
  const bandProps = (key: (typeof sectionOrder)[number]) =>
    tone[key] === "gold" ? { navy: true } : { surface: true };

  return (
    <main>
      {/* Hero */}
      <section className="section-bold relative overflow-hidden bg-primary text-primary-foreground">
        <div className="container relative z-10 flex min-h-[88vh] flex-col justify-center py-24">
          <Reveal>
            <Badge variant="gold" className="mb-6 w-fit">
              Bible Translation · Publishing · Distribution
            </Badge>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="max-w-4xl font-heading text-5xl font-bold leading-[1.05] md:text-7xl">
              Every Language.
              <br />
              Every Nation.
              <br />
              <span className="hero-outline">Every Soul.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-primary-foreground/80 md:text-xl">
              Translating, publishing, and distributing the Word of God so every person can
              encounter Scripture in their own language.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" variant="glass">
                <Link href="/about">
                  Read Our Mission <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="glass">
                <Link href="/donate">Support the Mission</Link>
              </Button>
            </div>
          </Reveal>
        </div>
        {/* Decorative ambient glows — slow "breathe", reduced-motion safe (no strobe). */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-1/4 h-[36rem] w-[36rem] animate-breathe rounded-full bg-gold/25 blur-3xl motion-reduce:animate-none"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 bottom-0 h-96 w-96 animate-breathe rounded-full bg-white/10 blur-3xl [animation-delay:3s] motion-reduce:animate-none"
        />
      </section>

      {/* Impact numbers */}
      {data.impactStats.length > 0 && (
        <Section {...bandProps("impact")}>
          <SectionHeading
            align="center"
            eyebrow="Our Impact"
            title="The mission, in numbers"
            description="Every figure represents a community one step closer to Scripture in the language of their heart."
            className="mb-14"
          />
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            {data.impactStats.map((stat) => (
              <Reveal key={stat.id} className="text-center">
                <div className="font-heading text-4xl font-bold text-primary md:text-5xl">
                  <Counter value={stat.value} suffix={stat.suffix ?? undefined} />
                </div>
                <p className="mt-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </p>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* Mission areas */}
      {data.missionAreas.length > 0 && (
        <Section {...bandProps("mission")}>
          <SectionHeading
            eyebrow="What We Do"
            title="Our mission areas"
            description="Connected efforts that carry Scripture from the translator's desk to a reader's hands."
            className="mb-12"
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {data.missionAreas.map((area, i) => {
              const Icon = MISSION_ICON[area.key] ?? Globe;
              return (
                <Reveal key={area.id} delay={i * 0.06}>
                  <Link href={`/mission/${area.slug}`}>
                    <Card className="h-full hover:shadow-md">
                      <CardContent className="pt-6">
                        <span className="liquid-glass-dark mb-5 inline-flex size-12 items-center justify-center rounded-full text-gold">
                          <Icon className="size-6" />
                        </span>
                        <h3 className="font-heading text-lg font-semibold">{area.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {area.summary}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </Section>
      )}

      {/* Preamble */}
      <Section {...bandProps("preamble")}>
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 font-sans text-sm font-semibold uppercase tracking-[0.18em] text-eyebrow">
            Our Preamble
          </p>
          <div className="space-y-6 text-lg leading-relaxed opacity-90 md:text-xl">
            <p>
              Acknowledging the sovereign call of God and the transformative power of the Holy
              Scriptures, we, the founding members of iBiblia: The Word for All, do hereby establish
              this organization as a non-profit, faith-based institution committed to the global
              advancement of the Word of God through translation, production, publication, and
              distribution of Christian literature. Motivated by the Great Commission of our Lord
              Jesus Christ (Matthew 28:19–20) and the enduring command to make His Word known among
              all nations, we affirm the centrality of Scripture in the life of the Church, the
              growth of believers, and the renewal of societies. We recognize that access to the
              Bible and doctrinally sound Christian resources in one&apos;s heart language is a
              foundational right and a vital tool for discipleship, education, and mission.
            </p>
            <p>
              In response to the spiritual, linguistic, and cultural diversity of the world, we are
              committed to producing Christ-centered content that is biblically faithful,
              theologically rich, culturally relevant, and globally accessible. We seek to serve
              churches, individuals, and institutions through both traditional print and innovative
              digital platforms, ensuring that no community remains unreached by the written Word.
              This Constitution is therefore established as the governing framework of iBiblia,
              reflecting our shared vision, guiding principles, and strategic purpose. With humility,
              conviction, and dependence on God&apos;s enabling grace, we dedicate this work to the
              glory of God and the expansion of His Kingdom across every language, culture, and
              generation.
            </p>
          </div>
        </div>
      </Section>

      {/* Featured projects */}
      {data.featuredProjects.length > 0 && (
        <Section {...bandProps("projects")}>
          <SectionHeading
            eyebrow="Featured Translation Projects"
            title="Where Scripture is on the move"
            className="mb-12"
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.featuredProjects.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.06}>
                <Card className="flex h-full flex-col overflow-hidden">
                  <div className="relative flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-navy to-navy/70 text-xs text-white/50">
                    Project photography
                    <span className="liquid-glass absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white">
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                  </div>
                  <CardContent className="flex flex-1 flex-col pt-5">
                    {p.language && (
                      <span className="mb-1 text-xs text-muted-foreground">{p.language.name}</span>
                    )}
                    <h3 className="font-heading text-lg font-semibold">{p.title}</h3>
                    <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                      {p.summary}
                    </p>
                    <div className="mt-4">
                      <Progress value={p.progressPct} label="Progress" />
                    </div>
                    <Link
                      href={`/projects/${p.slug}`}
                      className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-eyebrow hover:underline"
                    >
                      View project <ArrowRight className="size-4" />
                    </Link>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* Publications */}
      {data.publications.length > 0 && (
        <Section {...bandProps("publications")}>
          <SectionHeading
            eyebrow="Publications"
            title="Scripture and Christ-centered resources"
            description="Bibles, devotionals, study guides, and children's books — in print and digital."
            className="mb-12"
          />
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            {data.publications.map((pub) => (
              <Link key={pub.id} href={`/publications/${pub.slug}`} className="group">
                <div className="flex aspect-[3/4] items-center justify-center rounded-lg bg-surface text-center text-xs text-muted-foreground ring-1 ring-border transition-shadow group-hover:shadow-md">
                  {pub.title}
                </div>
                <p className="mt-2 line-clamp-1 text-sm font-medium">{pub.title}</p>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Testimonies */}
      {data.testimonies.length > 0 && (
        <Section {...bandProps("testimonies")}>
          <TestimonySlider testimonies={data.testimonies} />
        </Section>
      )}

      {/* Get involved */}
      <Section {...bandProps("getInvolved")}>
        <SectionHeading
          align="center"
          eyebrow="Become Part of the Mission"
          title="Three ways to move Scripture forward"
          className="mb-12"
        />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: HeartHandshake, title: "Volunteer", body: "Give your skills — translation, editing, design, and more.", href: "/get-involved" },
            { icon: Sparkles, title: "Donate", body: "Fund translation, publishing, distribution, and technology.", href: "/donate" },
            { icon: Globe, title: "Partner", body: "Churches and organizations joining the mission together.", href: "/get-involved" },
          ].map((c) => (
            <Reveal key={c.title}>
              <div className="flex h-full flex-col rounded-lg border border-border bg-card p-8 text-card-foreground shadow-sm">
                <span className="liquid-glass-dark inline-flex size-12 items-center justify-center rounded-full text-gold">
                  <c.icon className="size-6" />
                </span>
                <h3 className="mt-5 font-heading text-xl font-semibold">{c.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{c.body}</p>
                <Link href={c.href} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-eyebrow hover:underline">
                  Learn more <ArrowRight className="size-4" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Latest news */}
      {data.latestNews.length > 0 && (
        <Section {...bandProps("news")}>
          <SectionHeading eyebrow="Latest News" title="Updates from the field" className="mb-12" />
          <div className="grid gap-6 md:grid-cols-3">
            {data.latestNews.map((post) => (
              <Link key={post.id} href={`/news/${post.slug}`} className="group">
                <Card className="h-full group-hover:shadow-md">
                  <div className="flex aspect-[16/9] items-center justify-center rounded-t-lg bg-surface text-xs text-muted-foreground">
                    {post.category ?? "News"}
                  </div>
                  <CardContent className="pt-5">
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </p>
                    <h3 className="mt-1 font-heading text-lg font-semibold">{post.title}</h3>
                    {post.excerpt && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </Section>
      )}
    </main>
  );
}
