"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Upload, Loader2, ChevronUp, ChevronDown, Type, Image as ImageIcon, Video, Link2 } from "lucide-react";
import { Button } from "@ibiblia/ui";
import { api } from "@/lib/api";
import { findResource, type FieldConfig, type ResourceUi } from "@/lib/resources";
import { Input, Select, Textarea } from "./input";
import { ImageField, MultiImageField } from "./image-field";

type Row = Record<string, unknown>;
type LinkRow = { label: string; url: string };
type Block =
  | { type: "text"; text: string }
  | { type: "image"; url: string; caption?: string }
  | { type: "video"; url: string }
  | { type: "links"; items: LinkRow[] };

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
    case "links":
      return (
        <LinksField value={(value as LinkRow[]) ?? []} onChange={(rows) => set(f.name, rows)} />
      );
    case "file":
      return (
        <FileField
          value={(value as string) ?? ""}
          accept={f.accept}
          onChange={(url) => set(f.name, url)}
        />
      );
    case "blocks":
      return <BlocksField value={(value as Block[]) ?? []} onChange={(b) => set(f.name, b)} />;
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

/** A URL field with an "upload from computer" button (video, PDF, …). */
function FileField({
  value,
  accept,
  onChange,
}: {
  value: string;
  accept?: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const asset = await api.uploadFile(file);
      onChange(asset.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept={accept} hidden onChange={onFile} />
      <div className="flex gap-2">
        <Input
          className="flex-1"
          placeholder="https://…  (or upload a file)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {uploading ? "Uploading…" : "Upload"}
        </Button>
        {value && (
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange("")} aria-label="Clear">
            <X className="size-4" />
          </Button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}

/** Editable list of { label, url } rows (resources, PDFs, articles). */
function LinksField({
  value,
  onChange,
}: {
  value: LinkRow[];
  onChange: (rows: LinkRow[]) => void;
}) {
  const rows = value.length ? value : [];
  const [uploading, setUploading] = React.useState<number | null>(null);
  const fileRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  function update(i: number, patch: Partial<LinkRow>) {
    const next = rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    onChange(next);
  }
  function add() {
    onChange([...rows, { label: "", url: "" }]);
  }
  function remove(i: number) {
    onChange(rows.filter((_, idx) => idx !== i));
  }
  async function onFile(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(i);
    try {
      const asset = await api.uploadFile(file);
      const niceName = file.name.replace(/\.[^.]+$/, "");
      update(i, { url: asset.url, label: rows[i]?.label?.trim() ? rows[i].label : niceName });
    } catch {
      /* leave the row as-is on failure */
    } finally {
      setUploading(null);
      if (fileRefs.current[i]) fileRefs.current[i]!.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2">
          <input
            ref={(el) => {
              fileRefs.current[i] = el;
            }}
            type="file"
            accept="application/pdf,.pdf,image/*,video/*"
            hidden
            onChange={(e) => onFile(i, e)}
          />
          <Input
            className="w-2/5"
            placeholder="Label (e.g. Project brief PDF)"
            value={row.label}
            onChange={(e) => update(i, { label: e.target.value })}
          />
          <Input
            className="flex-1"
            placeholder="https://…  (or upload)"
            value={row.url}
            onChange={(e) => update(i, { url: e.target.value })}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={uploading === i}
            onClick={() => fileRefs.current[i]?.click()}
            aria-label="Upload file for this link"
          >
            {uploading === i ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => remove(i)} aria-label="Remove link">
            <X className="size-4" />
          </Button>
        </div>
      ))}
      <Button type="button" size="sm" variant="outline" onClick={add}>
        <Plus className="size-4" /> Add link
      </Button>
      <p className="text-xs text-muted-foreground">Paste a link, or upload a PDF/file from your computer.</p>
    </div>
  );
}

/** Story builder: an ordered list of text / image / video / links blocks. */
function BlocksField({ value, onChange }: { value: Block[]; onChange: (blocks: Block[]) => void }) {
  const blocks = value ?? [];

  function setAt(i: number, block: Block) {
    onChange(blocks.map((b, idx) => (idx === i ? block : b)));
  }
  function addBlock(block: Block) {
    onChange([...blocks, block]);
  }
  function removeAt(i: number) {
    onChange(blocks.filter((_, idx) => idx !== i));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    const a = next[i]!;
    next[i] = next[j]!;
    next[j] = a;
    onChange(next);
  }

  const LABEL: Record<Block["type"], string> = {
    text: "Paragraph",
    image: "Image",
    video: "Video",
    links: "Links",
  };

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => (
        <div key={i} className="rounded-lg border border-border bg-surface/40 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {LABEL[block.type]}
            </span>
            <div className="flex gap-1">
              <Button type="button" size="sm" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                <ChevronUp className="size-4" />
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => move(i, 1)} disabled={i === blocks.length - 1} aria-label="Move down">
                <ChevronDown className="size-4" />
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => removeAt(i)} aria-label="Delete block">
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {block.type === "text" && (
            <Textarea
              value={block.text}
              placeholder="Write a paragraph…"
              onChange={(e) => setAt(i, { type: "text", text: e.target.value })}
            />
          )}
          {block.type === "image" && (
            <div className="space-y-2">
              <ImageField value={block.url} onChange={(url) => setAt(i, { ...block, type: "image", url })} />
              <Input
                placeholder="Caption (optional)"
                value={block.caption ?? ""}
                onChange={(e) => setAt(i, { ...block, type: "image", caption: e.target.value })}
              />
            </div>
          )}
          {block.type === "video" && (
            <FileField
              value={block.url}
              accept="video/*"
              onChange={(url) => setAt(i, { type: "video", url })}
            />
          )}
          {block.type === "links" && (
            <LinksField value={block.items} onChange={(items) => setAt(i, { type: "links", items })} />
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => addBlock({ type: "text", text: "" })}>
          <Type className="size-4" /> Paragraph
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => addBlock({ type: "image", url: "", caption: "" })}>
          <ImageIcon className="size-4" /> Image
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => addBlock({ type: "video", url: "" })}>
          <Video className="size-4" /> Video
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => addBlock({ type: "links", items: [] })}>
          <Link2 className="size-4" /> Links
        </Button>
      </div>
    </div>
  );
}

function seed(resource: ResourceUi, initial?: Row): Row {
  if (initial) return { ...initial };
  const base: Row = {};
  for (const f of resource.fields) {
    if (f.type === "boolean") base[f.name] = false;
    else if (f.type === "multiselect") base[f.name] = [];
    else if (f.type === "links" || f.type === "blocks") base[f.name] = [];
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
    if (f.type === "links") {
      // Keep only complete rows, trimmed; always send an array.
      const rows = Array.isArray(v) ? (v as LinkRow[]) : [];
      v = rows
        .map((r) => ({ label: (r.label ?? "").trim(), url: (r.url ?? "").trim() }))
        .filter((r) => r.url);
    }
    if (f.type === "blocks") {
      const arr = Array.isArray(v) ? (v as Block[]) : [];
      v = arr
        .map((b): Block => {
          if (b.type === "image") {
            const caption = (b.caption ?? "").trim();
            return { type: "image", url: (b.url ?? "").trim(), ...(caption ? { caption } : {}) };
          }
          if (b.type === "video") return { type: "video", url: (b.url ?? "").trim() };
          if (b.type === "links") {
            const items = (b.items ?? [])
              .map((r) => ({ label: (r.label ?? "").trim(), url: (r.url ?? "").trim() }))
              .filter((r) => r.url);
            return { type: "links", items };
          }
          return { type: "text", text: b.text ?? "" };
        })
        .filter((b) => {
          if (b.type === "text") return b.text.trim().length > 0;
          if (b.type === "links") return b.items.length > 0;
          return b.url.length > 0;
        });
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
