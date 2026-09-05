-- AlterTable: Story Builder (inline media blocks) for mission areas.
ALTER TABLE "MissionArea" ADD COLUMN "content" JSONB NOT NULL DEFAULT '[]';
