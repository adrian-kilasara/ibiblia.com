-- AlterTable: richer project storytelling — explainer video + related resource links.
ALTER TABLE "Project" ADD COLUMN "videoUrl" TEXT;
ALTER TABLE "Project" ADD COLUMN "links" JSONB NOT NULL DEFAULT '[]';
