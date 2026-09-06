-- AlterTable: Story Builder (inline media blocks) for testimonies.
ALTER TABLE "Testimony" ADD COLUMN "content" JSONB NOT NULL DEFAULT '[]';
