import type { Metadata } from "next";
import { HeartHandshake } from "lucide-react";
import { SectionBg } from "@/components/section-bg";
import { site } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { GivingList } from "@/components/giving-list";

export const metadata: Metadata = {
  title: "Donate",
  description: "Partner with iBiblia to put Scripture into every language.",
};

export default async function DonatePage() {
  const [page, options] = await Promise.all([site.page("donate"), site.givingOptions()]);

  const invitation =
    page?.seoDescription ??
    "Your generosity helps translate, publish, and distribute the Word of God so that no community remains unreached. Every gift moves Scripture closer to a language still waiting.";

  return (
    <main>
      <PageHeader
        bgKey="donate:header"
        eyebrow="Support the Mission"
        title={page?.title ?? "Partner with us in reaching every language"}
        description={invitation}
      />

      <SectionBg bgKey="donate:body">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="liquid-glass-dark inline-flex size-12 items-center justify-center rounded-full text-gold">
              <HeartHandshake className="size-6" />
            </span>
            <div>
              <h2 className="font-heading text-2xl font-semibold">Ways to give</h2>
              <p className="text-sm text-muted-foreground">Tap any number to copy it.</p>
            </div>
          </div>

          <GivingList options={options} />

          <p className="mt-8 text-center text-sm text-muted-foreground">
            iBiblia is a non-profit, faith-based organization. For questions or another way to give,
            please reach us via the Contact page. Thank you for your partnership.
          </p>
        </div>
      </SectionBg>
    </main>
  );
}
