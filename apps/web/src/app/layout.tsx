import type { Metadata } from "next";
import { Fraunces, Newsreader, Inter } from "next/font/google";
import "./globals.css";
import "@ibiblia/ui/styles.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeScript } from "@/components/theme-toggle";

// Display serif for headings — warm, crafted, editorial.
const heading = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-heading",
  display: "swap",
});

// Literary serif for long-form reading — gives paragraphs a published-book feel.
const serif = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

// Clean sans for UI controls (nav, buttons, labels, badges).
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ibiblia.com"),
  title: {
    default: "iBiblia — Every Language. Every Nation. Every Soul.",
    template: "%s · iBiblia",
  },
  description:
    "Translating, publishing, and distributing the Word of God so every person can encounter Scripture in their own language.",
  openGraph: {
    title: "iBiblia",
    description: "Every Language. Every Nation. Every Soul.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${heading.variable} ${serif.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-background font-serif antialiased">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
