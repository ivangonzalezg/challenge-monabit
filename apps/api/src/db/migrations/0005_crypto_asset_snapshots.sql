CREATE TABLE "crypto_asset_snapshots" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid(),
	"sync_run_id" varchar(36) NOT NULL,
	"provider" varchar(32) DEFAULT 'coingecko' NOT NULL,
	"provider_asset_id" varchar(64) NOT NULL,
	"symbol" varchar(16) NOT NULL,
	"name" varchar(128) NOT NULL,
	"market_cap_rank" integer,
	"current_price_usd" numeric(24, 8) NOT NULL,
	"market_cap_usd" numeric(30, 2),
	"total_volume_usd" numeric(30, 2),
	"high_24h_usd" numeric(24, 8),
	"low_24h_usd" numeric(24, 8),
	"price_change_24h_usd" numeric(24, 8),
	"price_change_pct_1h" numeric(20, 4),
	"price_change_pct_24h" numeric(20, 4),
	"price_change_pct_7d" numeric(20, 4),
	"circulating_supply" numeric(30, 4),
	"total_supply" numeric(30, 4),
	"max_supply" numeric(30, 4),
	"ath_usd" numeric(24, 8),
	"ath_change_pct" numeric(20, 4),
	"ath_date" timestamp,
	"atl_usd" numeric(24, 8),
	"atl_change_pct" numeric(20, 4),
	"atl_date" timestamp,
	"sparkline_7d" jsonb,
	"provider_updated_at" timestamp,
	"snapshot_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "crypto_asset_snapshots" ADD CONSTRAINT "crypto_asset_snapshots_sync_run_id_crypto_sync_runs_id_fk" FOREIGN KEY ("sync_run_id") REFERENCES "public"."crypto_sync_runs"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "idx_crypto_asset_snapshots_asset_time" ON "crypto_asset_snapshots" USING btree ("provider_asset_id","snapshot_at");
