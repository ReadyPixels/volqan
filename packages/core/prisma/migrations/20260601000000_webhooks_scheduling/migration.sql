-- AlterTable: Add scheduling fields to content_entries
ALTER TABLE "content_entries" ADD COLUMN "scheduledAt" TIMESTAMP(3);
ALTER TABLE "content_entries" ADD COLUMN "unpublishAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "content_entries_scheduledAt_idx" ON "content_entries"("scheduledAt");

-- CreateTable: Outbound webhooks
CREATE TABLE "webhooks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" JSONB NOT NULL DEFAULT '[]',
    "secret" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastStatus" TEXT,
    "lastFiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "webhooks_enabled_idx" ON "webhooks"("enabled");
