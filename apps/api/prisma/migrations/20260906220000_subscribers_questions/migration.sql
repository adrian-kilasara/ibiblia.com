-- AlterTable: track when a news post's subscribers were emailed.
ALTER TABLE "NewsPost" ADD COLUMN "notifiedAt" TIMESTAMP(3);

-- CreateTable: subscribers.
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");

-- CreateTable: questions / comments.
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "answer" TEXT,
    "answeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Question_createdAt_idx" ON "Question"("createdAt");
