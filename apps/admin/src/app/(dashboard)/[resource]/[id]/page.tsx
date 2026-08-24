"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { findResource } from "@/lib/resources";
import { ResourceForm } from "@/components/resource-form";

type Row = Record<string, unknown>;

export default function EditResourcePage() {
  const params = useParams<{ resource: string; id: string }>();
  const resource = findResource(params.resource);
  const [row, setRow] = React.useState<Row | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!resource) return;
    api
      .get(resource.slug, params.id)
      .then((r) => setRow(r as Row))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [resource, params.id]);

  if (!resource) return <p className="text-destructive">Unknown resource.</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!row) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold">Edit {resource.label}</h1>
      <div className="mt-8 max-w-2xl">
        <ResourceForm resource={resource} initial={row} id={params.id} />
      </div>
    </div>
  );
}
