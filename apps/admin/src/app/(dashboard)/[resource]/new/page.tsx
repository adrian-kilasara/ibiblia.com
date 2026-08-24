"use client";

import { useParams } from "next/navigation";
import { findResource } from "@/lib/resources";
import { ResourceForm } from "@/components/resource-form";

export default function NewResourcePage() {
  const params = useParams<{ resource: string }>();
  const resource = findResource(params.resource);
  if (!resource) return <p className="text-destructive">Unknown resource.</p>;

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold">New {singular(resource.label)}</h1>
      <div className="mt-8 max-w-2xl">
        <ResourceForm resource={resource} />
      </div>
    </div>
  );
}

function singular(label: string): string {
  if (label.endsWith("ies")) return `${label.slice(0, -3)}y`;
  if (label.endsWith("s")) return label.slice(0, -1);
  return label;
}
