-- AlterTable: rich block-based content (media inline between paragraphs).
ALTER TABLE "Project" ADD COLUMN "content" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "Publication" ADD COLUMN "content" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "NewsPost" ADD COLUMN "content" JSONB NOT NULL DEFAULT '[]';

-- News body becomes optional now that the Story Builder can hold the article.
ALTER TABLE "NewsPost" ALTER COLUMN "body" DROP NOT NULL;
