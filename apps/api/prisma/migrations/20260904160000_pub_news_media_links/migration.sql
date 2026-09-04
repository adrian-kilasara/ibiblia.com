-- AlterTable: richer storytelling for publications and news — gallery, video, links.
ALTER TABLE "Publication" ADD COLUMN "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Publication" ADD COLUMN "videoUrl" TEXT;
ALTER TABLE "Publication" ADD COLUMN "links" JSONB NOT NULL DEFAULT '[]';

ALTER TABLE "NewsPost" ADD COLUMN "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "NewsPost" ADD COLUMN "videoUrl" TEXT;
ALTER TABLE "NewsPost" ADD COLUMN "links" JSONB NOT NULL DEFAULT '[]';
