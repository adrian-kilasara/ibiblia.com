import type { Metadata } from "next";
import { Section } from "@ibiblia/ui";
import { PageHeader } from "@/components/page-header";
import { GetInvolvedTabs } from "@/components/get-involved-tabs";

export const metadata: Metadata = {
  title: "Get Involved",
  description: "Volunteer, partner, or pray — become part of the mission to reach every language.",
};

export default function GetInvolvedPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Become Part of the Mission"
        title="There's a place for you"
        description="Whether you translate, edit, design, give, or pray — your part moves Scripture toward the nations."
      />
      <Section>
        <GetInvolvedTabs />
      </Section>
    </main>
  );
}
