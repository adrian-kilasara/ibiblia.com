import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, Section } from "@ibiblia/ui";
import { site } from "@/lib/api";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "News",
  description: "Translation updates, publishing announcements, and stories from the field.",
};

export default async function NewsPage() {
  const posts = await site.news();

  return (
    <main>
      <PageHeader
        eyebrow="News & Updates"
        title="Stories from the field"
        description="Translation milestones, publishing announcements, and glimpses of the mission at work."
      />
      <Section>
        {posts.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">No articles yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.id} href={`/news/${post.slug}`} className="group">
                <Card className="h-full group-hover:shadow-md">
                  <div className="flex aspect-[16/9] items-center justify-center rounded-t-lg bg-surface text-xs text-muted-foreground">
                    {post.category ?? "News"}
                  </div>
                  <CardContent className="pt-5">
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.publishedAt).toLocaleDateString()}
                      {post.category ? ` · ${post.category}` : ""}
                    </p>
                    <h3 className="mt-1 font-heading text-lg font-semibold">{post.title}</h3>
                    {post.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </main>
  );
}
