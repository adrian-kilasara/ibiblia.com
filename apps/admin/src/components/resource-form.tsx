"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@ibiblia/ui";
import { api } from "@/lib/api";
import { findResource, type FieldConfig, type ResourceUi } from "@/lib/resources";
import { Input, Select, Textarea } from "./input";
import { ImageField, MultiImageField } from "./image-field";

type Row = Record<string, unknown>;

interface Props {
  resource: ResourceUi;
  initial?: Row;
  id?: string;
}

/** Field-config-driven create/edit form used for every resource. */
export function ResourceForm({ resource, initial, id }: Props) {
  const router = useRouter();
  const [values, setValues] = React.useState<Row>(() => seed(resource, initial));
  const [relations, setRelations] = React.useState<Record<string, Row[]>>({});
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  // Load option lists for relation fields.
  React.useEffect(() => {
    const rels = resource.fields.filter((f) => f.type === "relation" && f.relation);
    rels.forEach((f) => {
      api
        .list(f.relation as string)
        .then((rows) => setRelations((r) => ({ ...r, [f.relation as string]: rows as Row[] })))
        .catch(() => undefined);
    });
  }, [resource]);

  function set(name: string, value: unknown) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = serialize(resource, values);
      if (id) await api.update(resource.slug, id, payload);
      else await api.create(resource.slug, payload);
      router.push(`/${resource.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {resource.fields.map((f) => (
        <div key={f.name}>
          <label className="mb-1 block text-sm font-medium">
            {f.label}
            {f.required && <span className="text-destructive"> *</span>}
          </label>
          {renderField(f, values[f.name], set, relations)}
          {f.help && <p className="mt-1 text-xs text-muted-foreground">{f.help}</p>}
        </div>
      ))}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="navy" disabled={saving}>
          {saving ? "Saving…" : id ? "Save changes" : "Create"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push(`/${resource.slug}`)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function renderField(
  f: FieldConfig,
  value: unknown,
  set: (n: string, v: unknown) => void,
  relations: Record<string, Row[]>
): React.ReactNode {
  switch (f.type) {
    case "textarea":
      return (
        <Textarea
          value={(value as string) ?? ""}
          onChange={(e) => set(f.name, e.target.value)}
          required={f.required}
        />
      );
    case "boolean":
      return (
        <input
          type="checkbox"
          className="size-5 rounded border-input accent-[hsl(var(--primary))]"
          checked={Boolean(value)}
          onChange={(e) => set(f.name, e.target.checked)}
        />
      );
    case "number":
      return (
        <Input
          type="number"
          value={value === undefined || value === null ? "" : String(value)}
          onChange={(e) => set(f.name, e.target.value === "" ? null : Number(e.target.value))}
          required={f.required}
        />
      );
    case "money":
      return (
        <Input
          type="number"
          step="0.01"
          value={value === undefined || value === null ? "" : String(Number(value) / 100)}
          onChange={(e) =>
            set(f.name, e.target.value === "" ? null : Math.round(Number(e.target.value) * 100))
          }
        />
      );
    case "date":
      return (
        <Input
          type="datetime-local"
          value={toLocalInput(value)}
          onChange={(e) => set(f.name, e.target.value ? new Date(e.target.value).toISOString() : null)}
        />
      );
    case "select":
      return (
        <Select
          value={(value as string) ?? ""}
          onChange={(e) => set(f.name, e.target.value || null)}
          required={f.required}
        >
          <option value="">—</option>
          {f.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </Select>
      );
    case "relation": {
      const rows = relations[f.relation as string] ?? [];
      const target = findResource(f.relation as string);
      const labelField = target?.titleField ?? "name";
      return (
        <Select value={(value as string) ?? ""} onChange={(e) => set(f.name, e.target.value || null)}>
          <option value="">—</option>
          {rows.map((r) => (
            <option key={String(r.id)} value={String(r.id)}>
              {String(r[labelField] ?? r.id)}
            </option>
          ))}
        </Select>
      );
    }
    case "multiselect":
      if (f.options) {
        const selected = new Set((value as string[]) ?? []);
        return (
          <div className="flex flex-wrap gap-3">
            {f.options.map((o) => (
              <label key={o} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-[hsl(var(--primary))]"
                  checked={selected.has(o)}
                  onChange={(e) => {
                    const next = new Set(selected);
                    if (e.target.checked) next.add(o);
                    else next.delete(o);
                    set(f.name, Array.from(next));
                  }}
                />
                {o}
              </label>
            ))}
          </div>
        );
      }
      // Free-form list (e.g. image URLs), one per line.
      return (
        <Textarea
          value={((value as string[]) ?? []).join("\n")}
          onChange={(e) =>
            set(
              f.name,
              e.target.value.split("\n").map((s) => s.trim()).filter(Boolean)
            )
          }
        />
      );
    case "json":
      return (
        <Textarea
          className="font-mono text-xs"
          value={typeof value === "string" ? value : JSON.stringify(value ?? [], null, 2)}
          onChange={(e) => set(f.name, e.target.value)}
        />
      );
    case "image":
      return <ImageField value={(value as string) ?? ""} onChange={(url) => set(f.name, url)} />;
    case "image-multi":
      return (
        <MultiImageField
          value={(value as string[]) ?? []}
          onChange={(urls) => set(f.name, urls)}
        />
      );
    default:
      return (
        <Input
          value={(value as string) ?? ""}
          onChange={(e) => set(f.name, e.target.value)}
          required={f.required}
        />
      );
  }
}

function seed(resource: ResourceUi, initial?: Row): Row {
  if (initial) return { ...initial };
  const base: Row = {};
  for (const f of resource.fields) {
    if (f.type === "boolean") base[f.name] = false;
    else if (f.type === "multiselect") base[f.name] = [];
  }
  return base;
}

/** Convert form values to an API payload with correct types. */
function serialize(resource: ResourceUi, values: Row): Row {
  const out: Row = {};
  for (const f of resource.fields) {
    let v = values[f.name];
    if (v === "" ) v = null;
    if (f.type === "json" && typeof v === "string") {
      try {
        v = JSON.parse(v);
      } catch {
        throw new Error(`${f.label} is not valid JSON`);
      }
    }
    if (v !== undefined) out[f.name] = v;
  }
  return out;
}

function toLocalInput(value: unknown): string {
  if (!value) return "";
  const d = new Date(value as string);
  if (Number.isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}
