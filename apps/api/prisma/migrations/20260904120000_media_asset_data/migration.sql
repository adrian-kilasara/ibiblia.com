-- AlterTable: store raw image bytes when no external object storage is configured.
ALTER TABLE "MediaAsset" ADD COLUMN "data" BYTEA;
