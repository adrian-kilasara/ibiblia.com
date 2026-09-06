import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone, ExternalLink } from "lucide-react";
import { SectionBg } from "@/components/section-bg";
import { site } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { InquiryForm } from "@/components/inquiry-form";
import { SocialLinks } from "@/components/social-links";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with iBiblia — general inquiries, partnerships, and prayer requests.",
};

/** Build the embedded map src: prefer an explicit embed URL, else a query-based embed. */
function mapEmbedSrc(info: { mapEmbedUrl?: string | null; mapQuery?: string | null }): string | null {
  const url = info.mapEmbedUrl?.trim();
  if (url && url.startsWith("http")) return url;
  const q = info.mapQuery?.trim();
  if (q) return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
  return null;
}

export default async function ContactPage() {
  const info = (await site.contactInfo()) ?? {};
  const embed = mapEmbedSrc(info);
  const mapsLink = info.mapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.mapQuery)}`
    : null;

  return (
    <main>
      <PageHeader
        bgKey="contact:header"
        eyebrow="Contact"
        title="We'd love to hear from you"
        description="Questions, partnership ideas, or prayer requests — send us a message and we'll respond soon."
      />
      <SectionBg bgKey="contact:body">
        <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
          <div>
            <h2 className="font-heading text-2xl font-semibold">Send a message</h2>
            <div className="mt-6">
              <InquiryForm type="CONTACT" withSubject submitLabel="Send message" />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6 text-card-foreground">
              <h3 className="font-heading text-lg font-semibold">Reach us</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {info.email && (
                  <li className="flex items-center gap-3">
                    <Mail className="size-4 shrink-0 text-gold" />
                    <a href={`mailto:${info.email}`} className="hover:text-eyebrow">
                      {info.email}
                    </a>
                  </li>
                )}
                {info.phone && (
                  <li className="flex items-center gap-3">
                    <Phone className="size-4 shrink-0 text-gold" />
                    <a href={`tel:${info.phone.replace(/\s+/g, "")}`} className="hover:text-eyebrow">
                      {info.phone}
                    </a>
                  </li>
                )}
                {info.address && (
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
                    <span className="whitespace-pre-line">{info.address}</span>
                  </li>
                )}
                {info.hours && (
                  <li className="flex items-center gap-3">
                    <Clock className="size-4 shrink-0 text-gold" /> {info.hours}
                  </li>
                )}
              </ul>
              <SocialLinks info={info} className="mt-5" />
            </div>

            {/* Embedded live map */}
            <div className="overflow-hidden rounded-lg border border-border">
              {embed ? (
                <iframe
                  title="Our location"
                  src={embed}
                  className="aspect-square w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : (
                <div className="flex aspect-square items-center justify-center bg-surface text-sm text-muted-foreground">
                  Map location not set yet.
                </div>
              )}
            </div>

            {mapsLink && (
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-eyebrow hover:underline"
              >
                Open in Google Maps <ExternalLink className="size-4" />
              </a>
            )}
          </aside>
        </div>
      </SectionBg>
    </main>
  );
}
