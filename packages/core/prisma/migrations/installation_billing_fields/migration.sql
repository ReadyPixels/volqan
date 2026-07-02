-- Add Stripe billing fields to installations
ALTER TABLE "installations" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "installations" ADD COLUMN "stripeSubscriptionId" TEXT;
ALTER TABLE "installations" ADD COLUMN "planId" TEXT;
ALTER TABLE "installations" ADD COLUMN "licenseStatus" TEXT;
