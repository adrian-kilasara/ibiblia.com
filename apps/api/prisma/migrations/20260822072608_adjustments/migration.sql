-- AlterTable
ALTER TABLE "MissionArea" ADD COLUMN     "links" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "body" TEXT;
