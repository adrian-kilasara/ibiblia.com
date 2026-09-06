import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Globe, Headphones, Package, Sparkles } from "lucide-react";
import type { MissionAreaKey } from "@ibiblia/types";
import { Card, CardContent } from "@ibiblia/ui";
import { SectionBg } from "@/components/section-bg";
import { site } from "@/lib/api";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Mission",
  description: "How iBiblia carries Scripture to the nations — translation, publishing, digital, and distribution.",
};

const ICON: Record<MissionAreaKey, typeof Globe> = {
  TRANSLATION: Globe,
  PUBLISHING: BookOpen,
  DIGITAL: Headphones,
  DISTRIBUTION: Package,
  INNOVATION: Sparkles,
};

export default async function MissionPage() {
  const areas = await site.missionAreas();

  return (
    <main>
      <PageHeader
        bgKey="mission:header"
        eyebrow="Our Mission"
        title="From the translator's desk to a reader's hands"
        description="Connected efforts that together carry the Word of God to every language and nation."
      />
      <SectionBg bgKey="mission:body">
        <div className="grid gap-6 md:grid-cols-2">
          {areas.map((area) => {
            const Icon = ICON[area.key] ?? Globe;
            return (
              <Link key={area.id} href={`/mission/${area.slug}`}>
                <Card className="h-full hover:shadow-md">
                  <CardContent className="flex gap-5 pt-6">
                    <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                      <Icon className="size-6" />
                    </span>
                    <div>
                      <h3 className="font-heading text-xl font-semibold">{area.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{area.summary}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-eyebrow">
                        Explore <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </SectionBg>
    </main>
  );
}
