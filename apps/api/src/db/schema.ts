import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Better Auth tables
// ---------------------------------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  role: text("role"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ---------------------------------------------------------------------------
// MonaBit domain tables
// ---------------------------------------------------------------------------

export const userFavoriteCryptos = pgTable(
  "user_favorite_cryptos",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    providerAssetId: varchar("provider_asset_id", { length: 64 }).notNull(),
    symbol: varchar("symbol", { length: 16 }).notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [unique("uq_user_favorites").on(t.userId, t.providerAssetId)],
);

export const cryptoAssets = pgTable("crypto_assets", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  provider: varchar("provider", { length: 32 }).notNull().default("coingecko"),
  providerAssetId: varchar("provider_asset_id", { length: 64 })
    .notNull()
    .unique(),
  symbol: varchar("symbol", { length: 16 }).notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  marketCapRank: integer("market_cap_rank"),
  isActive: boolean("is_active").notNull().default(true),
  currentPriceUsd: numeric("current_price_usd", {
    precision: 24,
    scale: 8,
  }).notNull(),
  marketCapUsd: numeric("market_cap_usd", { precision: 30, scale: 2 }),
  totalVolumeUsd: numeric("total_volume_usd", { precision: 30, scale: 2 }),
  high24hUsd: numeric("high_24h_usd", { precision: 24, scale: 8 }),
  low24hUsd: numeric("low_24h_usd", { precision: 24, scale: 8 }),
  priceChange24hUsd: numeric("price_change_24h_usd", {
    precision: 24,
    scale: 8,
  }),
  priceChangePct1h: numeric("price_change_pct_1h", { precision: 20, scale: 4 }),
  priceChangePct24h: numeric("price_change_pct_24h", {
    precision: 20,
    scale: 4,
  }),
  priceChangePct7d: numeric("price_change_pct_7d", { precision: 20, scale: 4 }),
  circulatingSupply: numeric("circulating_supply", { precision: 30, scale: 4 }),
  totalSupply: numeric("total_supply", { precision: 30, scale: 4 }),
  maxSupply: numeric("max_supply", { precision: 30, scale: 4 }),
  athUsd: numeric("ath_usd", { precision: 24, scale: 8 }),
  athChangePct: numeric("ath_change_pct", { precision: 20, scale: 4 }),
  athDate: timestamp("ath_date"),
  atlUsd: numeric("atl_usd", { precision: 24, scale: 8 }),
  atlChangePct: numeric("atl_change_pct", { precision: 20, scale: 4 }),
  atlDate: timestamp("atl_date"),
  sparkline7d: jsonb("sparkline_7d"),
  providerUpdatedAt: timestamp("provider_updated_at"),
  lastSyncedAt: timestamp("last_synced_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const cryptoMarketKpis = pgTable("crypto_market_kpis", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  provider: varchar("provider", { length: 32 }).notNull().default("coingecko"),
  activeCryptocurrencies: integer("active_cryptocurrencies"),
  markets: integer("markets"),
  totalMarketCapUsd: numeric("total_market_cap_usd", {
    precision: 36,
    scale: 2,
  }),
  totalVolumeUsd: numeric("total_volume_usd", { precision: 36, scale: 2 }),
  btcDominancePct: numeric("btc_dominance_pct", { precision: 8, scale: 4 }),
  ethDominancePct: numeric("eth_dominance_pct", { precision: 8, scale: 4 }),
  usdtDominancePct: numeric("usdt_dominance_pct", { precision: 8, scale: 4 }),
  marketCapChangePct24h: numeric("market_cap_change_pct_24h", {
    precision: 10,
    scale: 4,
  }),
  volumeChangePct24h: numeric("volume_change_pct_24h", {
    precision: 10,
    scale: 4,
  }),
  providerUpdatedAt: timestamp("provider_updated_at"),
  lastSyncedAt: timestamp("last_synced_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const cryptoSyncRuns = pgTable("crypto_sync_runs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  provider: varchar("provider", { length: 32 }).notNull().default("coingecko"),
  trigger: varchar("trigger", { length: 16 }).notNull(),
  status: varchar("status", { length: 32 }).notNull(),
  startedAt: timestamp("started_at").notNull(),
  finishedAt: timestamp("finished_at"),
  assetsRequested: integer("assets_requested"),
  assetsUpdated: integer("assets_updated"),
  kpisUpdated: boolean("kpis_updated"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  actorUserId: text("actor_user_id").references(() => user.id, {
    onDelete: "set null",
  }),
  targetUserId: text("target_user_id").references(() => user.id, {
    onDelete: "set null",
  }),
  action: varchar("action", { length: 64 }).notNull(),
  metadata: jsonb("metadata"),
  ipAddress: varchar("ip_address", { length: 64 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
