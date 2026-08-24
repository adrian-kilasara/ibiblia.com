import Link from "next/link";
import { NewsletterForm } from "./newsletter-form";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/about", label: "About" },
      { href: "/mission", label: "Mission" },
      { href: "/projects", label: "Projects" },
      { href: "/publications", label: "Publications" },
    ],
  },
  {
    title: "Engage",
    links: [
      { href: "/media", label: "Media" },
      { href: "/news", label: "News" },
      { href: "/get-involved", label: "Get Involved" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-navy text-navy-foreground">
      <div className="container grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="font-heading text-2xl font-bold">iBiblia</p>
          <p className="mt-3 max-w-xs text-sm text-navy-foreground/70">
            Translating, publishing, and distributing the Word of God so every person can encounter
            Scripture in their own language.
          </p>
          <div className="mt-6 max-w-sm">
            <p className="mb-2 text-sm font-semibold">Get mission updates</p>
            <NewsletterForm />
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-navy-foreground/60">
              {col.title}
            </p>
            <ul className="space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-navy-foreground/80 hover:text-gold">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-xs text-navy-foreground/50 sm:flex-row">
          <p>© {new Date().getFullYear()} iBiblia. Every Language. Every Nation. Every Soul.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-navy-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-navy-foreground">Terms</Link>
            <Link href="/donate" className="hover:text-gold">Donate</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
