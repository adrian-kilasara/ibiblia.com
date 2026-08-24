-- CreateTable
CREATE TABLE "ContactInfo" (
    "id" TEXT NOT NULL,
    "address" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "hours" TEXT,
    "mapQuery" TEXT,
    "mapEmbedUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactInfo_pkey" PRIMARY KEY ("id")
);
