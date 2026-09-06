import type { Metadata } from "next";
import { HeartHandshake } from "lucide-react";
import { SectionBg } from "@/components/section-bg";
import { site } from "@/lib/api";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Donate",
  description: "Partner with iBiblia to put Scripture into every language. Give via bank transfer.",
};

export default async function DonatePage() {
  const page = await site.page("donate");

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
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <span className="liquid-glass-dark mb-5 inline-flex size-12 items-center justify-center rounded-full text-gold">
              <HeartHandshake className="size-6" />
            </span>
            <h2 className="font-heading text-2xl font-semibold">Give by bank transfer</h2>
            <p className="mt-2 text-muted-foreground">
              Use the account details below to make your gift. For questions or to arrange another
              method, please reach us via the Contact page.
            </p>

            <div className="mt-6 rounded-lg bg-surface p-6">
              {page?.body ? (
                <div className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                  {page.body}
                </div>
              ) : (
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {`Bank transfer details will appear here.\n\nAn administrator can add the account name, account number, bank, branch, and SWIFT/reference details in the CMS under Pages → "donate" (the Body field).`}
                </p>
              )}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            iBiblia is a non-profit, faith-based organization. Thank you for your partnership.
          </p>
        </div>
      </SectionBg>
    </main>
  );
}
