ALTER TABLE "crypto_sync_runs" ADD COLUMN "trigger" varchar(16) NOT NULL DEFAULT 'manual';--> statement-breakpoint
ALTER TABLE "crypto_sync_runs" ALTER COLUMN "trigger" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "crypto_sync_runs" DROP COLUMN "sync_type";--> statement-breakpoint
ALTER TABLE "crypto_sync_runs" DROP COLUMN "duration_ms";--> statement-breakpoint
ALTER TABLE "crypto_sync_runs" DROP COLUMN "endpoints_used";--> statement-breakpoint
ALTER TABLE "crypto_sync_runs" DROP COLUMN "calls_used";
