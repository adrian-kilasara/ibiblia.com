import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Section } from "@ibiblia/ui";
import { site } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { VideoBlock, GalleryBlock, LinksBlock } from "@/components/media-blocks";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await site.newsPost(slug);
  return { title: post?.title ?? "News", description: post?.excerpt ?? undefined };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await site.newsPost(slug);
  if (!post) notFound();

  return (
    <main>
      <PageHeader
        eyebrow={`${new Date(post.publishedAt).toLocaleDateString()}${post.category ? ` · ${post.category}` : ""}`}
        title={post.title}
      />
      <Section>
        <Link href="/news" className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> All news
        </Link>
        {post.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="mb-8 aspect-[16/9] w-full rounded-lg object-cover"
          />
        )}
        <VideoBlock url={post.videoUrl} title={post.title} className="mb-8" />
        <article className="prose prose-neutral max-w-prose dark:prose-invert">
          <p className="whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
            {post.body}
          </p>
        </article>
        <GalleryBlock images={post.gallery} alt={post.title} className="mt-8 max-w-prose" />
        <LinksBlock links={post.links} className="mt-10 max-w-prose" />
      </Section>
    </main>
  );
}
