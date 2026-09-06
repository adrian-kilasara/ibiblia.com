import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading, Card, CardContent } from "@ibiblia/ui";
import { SectionBg } from "@/components/section-bg";
import { site } from "@/lib/api";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "About",
  description: "Who we are and why we exist — iBiblia's story, mission, core activities, and objectives.",
};

const CORE_ACTIVITIES = [
  {
    title: "Content Development",
    body: "Creating biblically sound and contextually relevant Christian literature.",
    items: ["Bible Translation", "Christian Literature Development", "Faith-Based Content Creation"],
  },
  {
    title: "Publishing Services",
    body: "Managing editorial, design, and publication of Christian resources.",
    items: ["Faith-Based Publishing", "Theological Editorial & Publishing", "Christian Book Publishing"],
  },
  {
    title: "Distribution & Outreach",
    body: "Ensuring wide access to Christian literature in print and digital formats across communities.",
    items: ["Christian Literature Logistics", "Scripture Resource Distribution", "Faith-Based Media Outreach"],
  },
];

const OBJECTIVES = [
  {
    title: "Translate the Scriptures into Unreached and Under-Resourced Languages",
    body: "Bridge the language gap by translating the Bible and key Christian texts into languages lacking accessible Scripture, ensuring people can engage with God's Word in their mother tongue.",
  },
  {
    title: "Create Original, Culturally Relevant Christian Content for All Ages",
    body: "Develop Christ-centered literature, devotionals, study guides, children's books, and discipleship resources that speak to the spiritual, educational, and cultural needs of diverse audiences.",
  },
  {
    title: "Establish a World-Class Publishing Infrastructure for Christian Literature",
    body: "Implement editorial and production systems that meet global publishing standards, ensuring theological accuracy, aesthetic quality, and excellence in Christian communication.",
  },
  {
    title: "Build Scalable Print and Digital Distribution Networks",
    body: "Design and operate integrated systems that deliver Christian literature through print, mobile apps, eBooks, podcasts, and online platforms, ensuring broad and equitable access worldwide.",
  },
  {
    title: "Foster Strategic Partnerships for Scripture Access and Resource Sharing",
    body: "Collaborate with churches, mission agencies, schools, and networks in expanding the reach and impact of Christian literature, especially in marginalized and hard-to-reach regions.",
  },
  {
    title: "Promote Biblical Literacy and Transformational Engagement with Scripture",
    body: "Empower individuals and communities to not only read but deeply understand and apply God's Word through structured study programs, training, and contextual theological education.",
  },
  {
    title: "Champion Innovation in Faith-Based Media and Communication",
    body: "Lead in developing creative, multilingual, and multimedia approaches for sharing the gospel, leveraging technology to speak to current and future generations effectively.",
  },
];

export default async function AboutPage() {
  const team = await site.team();

  return (
    <main>
      <PageHeader
        bgKey="about:header"
        eyebrow="About iBiblia"
        title="Scripture for every language, every nation, every soul"
        description="iBiblia translates, produces, publishes, and distributes Scripture and Christ-centered literature globally — especially in underserved languages."
      />

      {/* Our Story — meaning of the name */}
      <SectionBg bgKey="about:body">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading eyebrow="Our Story" title="Why iBiblia exists" />
          <div className="space-y-4 leading-relaxed text-muted-foreground">
            <p>
              The term <strong className="text-foreground">iBiblia</strong> is a linguistically rich
              and culturally resonant name that merges African grammatical heritage with modern
              digital identity. Rooted in the Bantu language group—spoken by communities such as the
              Bena, Hehe, Zulu, Xhosa, Ndebele, Tswana, and many others. The prefix{" "}
              <em>“i-”</em> functions as a noun class marker commonly used to denote objects,
              including books or instruments. This structure is particularly significant in African
              linguistics, where noun class systems shape the way meaning is constructed. The word{" "}
              <em>“Biblia”</em> is etymologically derived from the Greek <em>biblia</em> (books),
              transmitted through Swahili <em>biblia</em>, and widely used in Christian traditions to
              refer to the Holy Scriptures.
            </p>
            <p>
              What makes iBiblia especially compelling is its symbolic convergence: it fuses the deep
              linguistic roots of African Bantu languages with the modern digital resonance of the{" "}
              <em>“i-”</em> prefix, familiar globally through terms like iPad or iPhone. Thus,
              iBiblia becomes not only a name but a statement, grounded in African identity while
              engaging the contemporary, connected world.
            </p>
          </div>
        </div>
      </SectionBg>

      {/* Vision & Mission */}
      <SectionBg bgKey="about:body" surface>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Vision" title="Where we are headed" />
            <p className="mt-4 text-muted-foreground">
              A world where every person can encounter God&apos;s Word in the language of their heart.
            </p>
          </div>
          <div>
            <SectionHeading eyebrow="Mission" title="What we are called to do" />
            <p className="mt-4 text-muted-foreground">
              To translate, publish, and distribute Scripture and Christ-centered resources to the
              nations.
            </p>
          </div>
        </div>
      </SectionBg>

      {/* Core Activities */}
      <SectionBg bgKey="about:body">
        <SectionHeading
          align="center"
          eyebrow="Core Activities"
          title="What we do"
          className="mb-12"
        />
        <div className="grid gap-6 md:grid-cols-3">
          {CORE_ACTIVITIES.map((a, i) => (
            <Card key={a.title} className="liquid-glass-dark h-full">
              <CardContent className="pt-6">
                <span className="liquid-glass-dark inline-flex size-9 items-center justify-center rounded-full font-heading text-sm font-bold text-eyebrow">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-heading text-lg font-semibold">{a.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.body}</p>
                <ul className="mt-4 space-y-1.5">
                  {a.items.map((it) => (
                    <li key={it} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                      {it}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionBg>

      {/* Objectives */}
      <SectionBg bgKey="about:body" surface>
        <SectionHeading eyebrow="Objectives" title="Our strategic objectives" className="mb-12" />
        <div className="grid gap-6 md:grid-cols-2">
          {OBJECTIVES.map((o, i) => (
            <div key={o.title} className="flex gap-4 border-l-2 border-gold pl-5">
              <div>
                <p className="font-heading text-sm font-bold text-eyebrow">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-1 font-heading font-semibold">{o.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{o.body}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionBg>

      {/* Leadership */}
      {team.length > 0 && (
        <SectionBg bgKey="about:body">
          <SectionHeading align="center" eyebrow="Leadership" title="The people behind the mission" className="mb-12" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <Link key={member.id} href={`/about/team/${member.id}`} className="group text-center">
                <div className="mx-auto flex size-28 items-center justify-center overflow-hidden rounded-full bg-surface text-2xl font-semibold text-muted-foreground ring-1 ring-border transition-shadow group-hover:shadow-md">
                  {member.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.photoUrl} alt={member.name} className="size-full object-cover" />
                  ) : (
                    member.name.charAt(0)
                  )}
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold dark:text-white">{member.name}</h3>
                <p className="text-sm text-eyebrow">{member.role}</p>
              </Link>
            ))}
          </div>
        </SectionBg>
      )}
    </main>
  );
}
