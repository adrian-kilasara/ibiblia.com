import type { Metadata } from "next";
import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { Button, Section } from "@ibiblia/ui";

export const metadata: Metadata = {
  title: "Thank You",
  description: "Thank you for your gift to iBiblia.",
};

export default function ThankYouPage() {
  return (
    <main>
      <Section className="py-28 text-center">
        <span className="mx-auto mb-6 inline-flex size-16 items-center justify-center rounded-full bg-gold/15 text-gold">
          <HeartHandshake className="size-8" />
        </span>
        <h1 className="font-heading text-4xl font-bold">Thank you for your gift</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Your generosity puts Scripture into the hands of people still waiting to read it in their
          own language. A receipt is on its way to your inbox.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild variant="navy">
            <Link href="/">Return home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/projects">See the projects you&apos;re supporting</Link>
          </Button>
        </div>
      </Section>
    </main>
  );
}
