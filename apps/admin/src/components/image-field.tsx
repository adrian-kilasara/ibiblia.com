"use client";

import * as React from "react";
import { Upload, Images, X, Loader2 } from "lucide-react";
import { Button } from "@ibiblia/ui";
import { api, type MediaAsset } from "@/lib/api";

interface ImageFieldProps {
  value?: string;
  onChange: (url: string) => void;
}

/** Single image: upload from local storage or pick from the gallery. Replaces raw URL input. */
export function ImageField({ value, onChange }: ImageFieldProps) {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [galleryOpen, setGalleryOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const asset = await api.uploadImage(file);
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
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFile} />

      <div className="flex items-start gap-4">
        <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-surface">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-xs text-muted-foreground">No image</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="navy"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {uploading ? "Uploading…" : "Upload"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setGalleryOpen(true)}>
              <Images className="size-4" /> Gallery
            </Button>
            {value && (
              <Button type="button" size="sm" variant="ghost" onClick={() => onChange("")}>
                <X className="size-4" /> Clear
              </Button>
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <p className="text-xs text-muted-foreground">PNG, JPG, WEBP, GIF or SVG · up to 10MB</p>
        </div>
      </div>

      {galleryOpen && (
        <GalleryPicker
          onPick={(url) => {
            onChange(url);
            setGalleryOpen(false);
          }}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </div>
  );
}

/** Multiple images (e.g. a gallery/images array). */
export function MultiImageField({
  value,
  onChange,
}: {
  value?: string[];
  onChange: (urls: string[]) => void;
}) {
  const urls = value ?? [];
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3">
        {urls.map((u) => (
          <div key={u} className="relative size-20 overflow-hidden rounded-md border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(urls.filter((x) => x !== u))}
              className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
              aria-label="Remove"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
      <ImageField value="" onChange={(url) => url && onChange([...urls, url])} />
    </div>
  );
}

function GalleryPicker({
  onPick,
  onClose,
}: {
  onPick: (url: string) => void;
  onClose: () => void;
}) {
  const [assets, setAssets] = React.useState<MediaAsset[] | null>(null);

  React.useEffect(() => {
    api.gallery().then(setAssets).catch(() => setAssets([]));
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold">Choose from gallery</h3>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 hover:bg-surface">
            <X className="size-5" />
          </button>
        </div>
        {assets === null ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
        ) : assets.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No images yet — upload one to start your gallery.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {assets.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => onPick(a.url)}
                className="aspect-square overflow-hidden rounded-md border border-border transition-shadow hover:shadow-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.url} alt={a.alt ?? ""} className="size-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
