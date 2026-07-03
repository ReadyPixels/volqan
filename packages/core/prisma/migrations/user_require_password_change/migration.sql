-- Add requirePasswordChange flag to users
ALTER TABLE "users" ADD COLUMN "requirePasswordChange" BOOLEAN NOT NULL DEFAULT false;
