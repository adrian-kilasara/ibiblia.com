import { ExternalLink, FileText } from "lucide-react";
import type { LinkItem, ContentBlock } from "@ibiblia/types";
import { videoEmbedUrl, isVideoFile } from "@/lib/media";

/** Embedded YouTube/Vimeo player, or an inline <video> for a direct file URL. */
export function VideoBlock({ url, title, className }: { url?: string | null; title: string; className?: string }) {
  if (!url) return null;
  const embed = videoEmbedUrl(url);
  if (embed) {
    return (
      <div className={`aspect-video overflow-hidden rounded-lg bg-black ${className ?? ""}`}>
        <iframe
          src={embed}
          title={`${title} video`}
          className="size-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  // A direct video file, or an uploaded file served from our API (extensionless URL; the
  // server sends the right Content-Type so the browser can play it).
  if (isVideoFile(url) || url.includes("/api/uploads/")) {
    return (
      <video controls className={`w-full rounded-lg bg-black ${className ?? ""}`}>
        <source src={url} />
      </video>
    );
  }
  return null;
}

/** Grid of explanatory images. */
export function GalleryBlock({ images, alt, className }: { images?: string[] | null; alt: string; className?: string }) {
  if (!images || images.length === 0) return null;
  return (
    <div className={`grid grid-cols-3 gap-3 ${className ?? ""}`}>
      {images.map((src) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt={alt} className="aspect-square w-full rounded-md object-cover" />
      ))}
    </div>
  );
}

/** Renders composable story blocks in order, with media inline between paragraphs. */
export function ContentBlocks({ blocks, title, className }: { blocks?: ContentBlock[] | null; title: string; className?: string }) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <div className={`space-y-6 ${className ?? ""}`}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "text":
            return block.text ? (
              <p key={i} className="whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
                {block.text}
              </p>
            ) : null;
          case "image":
            return block.url ? (
              <figure key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.url} alt={block.caption || title} className="w-full rounded-lg object-cover" />
                {block.caption ? (
                  <figcaption className="mt-2 text-center text-sm text-muted-foreground">{block.caption}</figcaption>
                ) : null}
              </figure>
            ) : null;
          case "video":
            return <VideoBlock key={i} url={block.url} title={title} />;
          case "links":
            return <LinksBlock key={i} links={block.items} heading="" />;
          default:
            return null;
        }
      })}
    </div>
  );
}

/** Row of resource buttons (PDFs, articles, related links). */
export function LinksBlock({ links, heading = "Resources & links", className }: { links?: LinkItem[] | null; heading?: string; className?: string }) {
  if (!links || links.length === 0) return null;
  return (
    <div className={className}>
      {heading ? <h2 className="font-heading text-xl font-semibold">{heading}</h2> : null}
      <div className={`flex flex-wrap gap-3 ${heading ? "mt-4" : ""}`}>
        {links.map((l) => {
          const isPdf = /\.pdf(\?.*)?$/i.test(l.url);
          const Icon = isPdf ? FileText : ExternalLink;
          return (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
            >
              <Icon className="size-4 text-gold" /> {l.label || l.url}
            </a>
          );
        })}
      </div>
    </div>
  );
}
