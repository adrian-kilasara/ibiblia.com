"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button, cn } from "@ibiblia/ui";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/about", label: "About" },
  { href: "/mission", label: "Mission" },
  { href: "/projects", label: "Projects" },
  { href: "/publications", label: "Publications" },
  { href: "/media", label: "Media" },
  { href: "/news", label: "News" },
  { href: "/get-involved", label: "Get Involved" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b font-sans transition-colors",
        scrolled
          ? "border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70"
          : "border-transparent bg-background"
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-heading text-xl font-bold text-primary dark:text-gold">
          iBiblia
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-eyebrow" : "text-foreground/80 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm" variant="primary" className="hidden sm:inline-flex">
            <Link href="/donate">Donate</Link>
          </Button>
          <button
            className="inline-flex size-9 items-center justify-center rounded-full hover:bg-foreground/10 dark:text-gold lg:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="container flex flex-col py-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground/90 hover:bg-surface"
              >
                {item.label}
              </Link>
            ))}
            <Button asChild variant="primary" className="mt-2">
              <Link href="/donate">Donate</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
