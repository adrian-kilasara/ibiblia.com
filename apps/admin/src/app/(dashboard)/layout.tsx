"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, KeyRound } from "lucide-react";
import { cn } from "@ibiblia/ui";
import { useAuth } from "@/lib/auth";
import { RESOURCES, RESOURCE_GROUPS } from "@/lib/resources";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-border bg-card">
        <div className="border-b border-border px-6 py-5">
          <Link href="/" className="font-heading text-lg font-bold text-primary">
            iBiblia
          </Link>
          <p className="text-xs text-muted-foreground">Admin</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {RESOURCE_GROUPS.map((group) => {
            const items = RESOURCES.filter((r) => r.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group} className="mb-4">
                <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group}
                </p>
                {items.map((r) => {
                  const href = `/${r.slug}`;
                  const active = pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <Link
                      key={r.slug}
                      href={href}
                      className={cn(
                        "block rounded-md px-3 py-1.5 text-sm transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-surface"
                      )}
                    >
                      {r.label}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-border px-3 py-3">
          <p className="px-3 text-xs text-muted-foreground">{user.email}</p>
          <Link
            href="/account"
            className={cn(
              "mt-1 flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
              pathname === "/account" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-surface"
            )}
          >
            <KeyRound className="size-4" /> Change password
          </Link>
          <button
            onClick={logout}
            className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-foreground hover:bg-surface"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-5xl px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
