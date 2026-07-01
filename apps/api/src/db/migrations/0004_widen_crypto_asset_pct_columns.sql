ALTER TABLE "crypto_assets" ALTER COLUMN "price_change_pct_1h" SET DATA TYPE numeric(20, 4);--> statement-breakpoint
ALTER TABLE "crypto_assets" ALTER COLUMN "price_change_pct_24h" SET DATA TYPE numeric(20, 4);--> statement-breakpoint
ALTER TABLE "crypto_assets" ALTER COLUMN "price_change_pct_7d" SET DATA TYPE numeric(20, 4);--> statement-breakpoint
ALTER TABLE "crypto_assets" ALTER COLUMN "ath_change_pct" SET DATA TYPE numeric(20, 4);--> statement-breakpoint
ALTER TABLE "crypto_assets" ALTER COLUMN "atl_change_pct" SET DATA TYPE numeric(20, 4);
