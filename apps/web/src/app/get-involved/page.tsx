import type { Metadata } from "next";
import { SectionBg } from "@/components/section-bg";
import { PageHeader } from "@/components/page-header";
import { SubscribeSection } from "@/components/subscribe-section";

export const metadata: Metadata = {
  title: "Get Involved",
  description: "Subscribe to iBiblia — get news updates and stay connected to the mission.",
};

export default function GetInvolvedPage() {
  return (
    <main>
      <PageHeader
        bgKey="getinvolved:header"
        eyebrow="Get Involved"
        title="Become part of the mission"
        description="Add your name and email to subscribe — receive news from the field and stay connected as Scripture reaches every language."
      />
      <SectionBg bgKey="getinvolved:body">
        <SubscribeSection />
      </SectionBg>
    </main>
  );
}
