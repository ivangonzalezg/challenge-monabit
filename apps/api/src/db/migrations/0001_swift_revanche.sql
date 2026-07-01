ALTER TABLE "audit_logs" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "crypto_assets" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "crypto_market_kpis" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "crypto_sync_runs" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "user_favorite_cryptos" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "user_profiles" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();