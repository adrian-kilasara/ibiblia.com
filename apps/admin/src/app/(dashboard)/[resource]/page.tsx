"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@ibiblia/ui";
import { api } from "@/lib/api";
import { findResource, type FieldConfig } from "@/lib/resources";

type Row = Record<string, unknown>;

export default function ResourceListPage() {
  const params = useParams<{ resource: string }>();
  const router = useRouter();
  const resource = findResource(params.resource);
  const [rows, setRows] = React.useState<Row[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(() => {
    if (!resource) return;
    setLoading(true);
    api
      .list(resource.slug)
      .then((r) => setRows(r as Row[]))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [resource]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (!resource) return <p className="text-destructive">Unknown resource.</p>;

  const columns = resource.fields.filter((f) => !f.hideInTable).slice(0, 5);

  async function onDelete(id: string) {
    if (!resource) return;
    if (!window.confirm("Delete this item? This cannot be undone.")) return;
    try {
      await api.remove(resource.slug, id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">{resource.label}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{rows.length} items</p>
        </div>
        {!resource.readOnly && !resource.noCreate && (
          <Button variant="navy" onClick={() => router.push(`/${resource.slug}/new`)}>
            <Plus /> New
          </Button>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              {columns.map((c) => (
                <th key={c.name} className="px-4 py-3 font-medium">
                  {c.label}
                </th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-muted-foreground">
                  No items yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={String(row.id)}
                  onClick={() => !resource.readOnly && router.push(`/${resource.slug}/${String(row.id)}`)}
                  className={`border-b border-border last:border-0 hover:bg-surface ${
                    resource.readOnly ? "" : "cursor-pointer"
                  }`}
                >
                  {columns.map((c) => (
                    <td key={c.name} className="px-4 py-3">
                      {formatCell(c, row[c.name])}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {!resource.readOnly && (
                        <Link
                          href={`/${resource.slug}/${String(row.id)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded p-1.5 hover:bg-muted"
                          aria-label="Edit"
                        >
                          <Pencil className="size-4" />
                        </Link>
                      )}
                      {!resource.readOnly && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(String(row.id));
                          }}
                          className="rounded p-1.5 text-destructive hover:bg-muted"
                          aria-label="Delete"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatCell(field: FieldConfig, value: unknown): React.ReactNode {
  // Image fields: show a small thumbnail so each row is identifiable at a glance.
  if (field.type === "image") {
    return value ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={String(value)} alt="" className="size-10 rounded-full object-cover ring-1 ring-border" />
    ) : (
      <span className="flex size-10 items-center justify-center rounded-full bg-surface text-xs text-muted-foreground ring-1 ring-border">—</span>
    );
  }
  if (field.type === "image-multi") {
    const arr = Array.isArray(value) ? (value as string[]) : [];
    return arr.length ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={arr[0]} alt="" className="size-10 rounded-md object-cover ring-1 ring-border" />
    ) : (
      <span className="text-muted-foreground">—</span>
    );
  }
  if (value === null || value === undefined || value === "") return <span className="text-muted-foreground">—</span>;
  if (field.type === "boolean") return value ? "Yes" : "No";
  if (field.type === "money") return `$${(Number(value) / 100).toFixed(2)}`;
  if (field.type === "multiselect" && Array.isArray(value)) return value.join(", ");
  if (field.type === "date") return new Date(value as string).toLocaleDateString();
  const s = String(value);
  return s.length > 60 ? `${s.slice(0, 60)}…` : s;
}
