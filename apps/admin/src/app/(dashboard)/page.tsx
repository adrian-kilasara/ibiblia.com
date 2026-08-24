"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@ibiblia/ui";
import { api } from "@/lib/api";
import { RESOURCES } from "@/lib/resources";

export default function DashboardPage() {
  const [counts, setCounts] = React.useState<Record<string, number>>({});
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    api
      .counts()
      .then(setCounts)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Manage all iBiblia content from one place.</p>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {RESOURCES.map((r) => (
          <Link key={r.slug} href={`/${r.slug}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="pt-6">
                <p className="font-heading text-3xl font-bold text-primary">
                  {counts[r.slug] ?? "—"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{r.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
