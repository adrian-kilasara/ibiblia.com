import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Section } from "@ibiblia/ui";
import { site } from "@/lib/api";

interface Props {
  params: Promise<{ id: string }>;
}

async function getMember(id: string) {
  const team = await site.team();
  return team.find((m) => m.id === id) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const member = await getMember(id);
  return { title: member ? `${member.name} — ${member.role}` : "Team" };
}

export default async function TeamMemberPage({ params }: Props) {
  const { id } = await params;
  const member = await getMember(id);
  if (!member) notFound();

  return (
    <main>
      <Section className="py-16 md:py-24">
        <Link
          href="/about"
          className="mb-10 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to leadership
        </Link>

        <div className="grid items-start gap-10 md:grid-cols-[minmax(0,380px)_1fr] md:gap-14">
          <div className="aspect-square w-full overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
            {member.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={member.photoUrl} alt={member.name} className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center text-7xl font-bold text-muted-foreground">
                {member.name.charAt(0)}
              </div>
            )}
          </div>

          <div>
            <p className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-eyebrow">
              {member.role}
            </p>
            <h1 className="mt-2 font-heading text-4xl font-bold dark:text-white md:text-5xl">
              {member.name}
            </h1>
            <div className="mt-6 max-w-prose whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
              {member.bio ?? "A short introduction will appear here once added in the admin CMS."}
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
