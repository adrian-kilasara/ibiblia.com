-- CreateTable: giving/payment entries shown on the Donate page.
CREATE TABLE "GivingOption" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "name" TEXT,
    "value" TEXT NOT NULL,
    "note" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GivingOption_pkey" PRIMARY KEY ("id")
);
