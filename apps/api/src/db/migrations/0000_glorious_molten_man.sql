CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" varchar(36) PRIMARY KEY DEFAULT 'gen_random_uuid()' NOT NULL,
	"actor_user_id" text,
	"target_user_id" text,
	"action" varchar(64) NOT NULL,
	"metadata" jsonb,
	"ip_address" varchar(64),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crypto_assets" (
	"id" varchar(36) PRIMARY KEY DEFAULT 'gen_random_uuid()' NOT NULL,
	"provider" varchar(32) DEFAULT 'coingecko' NOT NULL,
	"provider_asset_id" varchar(64) NOT NULL,
	"symbol" varchar(16) NOT NULL,
	"name" varchar(128) NOT NULL,
	"market_cap_rank" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"current_price_usd" numeric(24, 8) NOT NULL,
	"market_cap_usd" numeric(30, 2),
	"total_volume_usd" numeric(30, 2),
	"high_24h_usd" numeric(24, 8),
	"low_24h_usd" numeric(24, 8),
	"price_change_24h_usd" numeric(24, 8),
	"price_change_pct_1h" numeric(10, 4),
	"price_change_pct_24h" numeric(10, 4),
	"price_change_pct_7d" numeric(10, 4),
	"circulating_supply" numeric(30, 4),
	"total_supply" numeric(30, 4),
	"max_supply" numeric(30, 4),
	"ath_usd" numeric(24, 8),
	"ath_change_pct" numeric(10, 4),
	"ath_date" timestamp,
	"atl_usd" numeric(24, 8),
	"atl_change_pct" numeric(10, 4),
	"atl_date" timestamp,
	"sparkline_7d" jsonb,
	"provider_updated_at" timestamp,
	"last_synced_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "crypto_assets_provider_asset_id_unique" UNIQUE("provider_asset_id")
);
--> statement-breakpoint
CREATE TABLE "crypto_market_kpis" (
	"id" varchar(36) PRIMARY KEY DEFAULT 'gen_random_uuid()' NOT NULL,
	"provider" varchar(32) DEFAULT 'coingecko' NOT NULL,
	"active_cryptocurrencies" integer,
	"markets" integer,
	"total_market_cap_usd" numeric(36, 2),
	"total_volume_usd" numeric(36, 2),
	"btc_dominance_pct" numeric(8, 4),
	"eth_dominance_pct" numeric(8, 4),
	"usdt_dominance_pct" numeric(8, 4),
	"market_cap_change_pct_24h" numeric(10, 4),
	"volume_change_pct_24h" numeric(10, 4),
	"provider_updated_at" timestamp,
	"last_synced_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crypto_sync_runs" (
	"id" varchar(36) PRIMARY KEY DEFAULT 'gen_random_uuid()' NOT NULL,
	"provider" varchar(32) DEFAULT 'coingecko' NOT NULL,
	"sync_type" varchar(64) DEFAULT 'market_dashboard' NOT NULL,
	"status" varchar(32) NOT NULL,
	"started_at" timestamp NOT NULL,
	"finished_at" timestamp,
	"duration_ms" integer,
	"endpoints_used" jsonb,
	"calls_used" integer,
	"assets_requested" integer,
	"assets_updated" integer,
	"kpis_updated" boolean,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_favorite_cryptos" (
	"id" varchar(36) PRIMARY KEY DEFAULT 'gen_random_uuid()' NOT NULL,
	"user_id" text NOT NULL,
	"provider_asset_id" varchar(64) NOT NULL,
	"symbol" varchar(16) NOT NULL,
	"name" varchar(128) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_user_favorites" UNIQUE("user_id","provider_asset_id")
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" varchar(36) PRIMARY KEY DEFAULT 'gen_random_uuid()' NOT NULL,
	"user_id" text NOT NULL,
	"display_name" varchar(100),
	"bio" varchar(500),
	"country" varchar(2),
	"timezone" varchar(64),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_target_user_id_user_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_favorite_cryptos" ADD CONSTRAINT "user_favorite_cryptos_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;