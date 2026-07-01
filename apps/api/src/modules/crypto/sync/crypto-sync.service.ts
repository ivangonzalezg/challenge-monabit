import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq, sql } from "drizzle-orm";
import { pool } from "../../../db/client";
import {
  cryptoAssets,
  cryptoMarketKpis,
  cryptoSyncRuns,
} from "../../../db/schema";
import { createCryptoGateway } from "../crypto.gateway";
import type { CryptoMarketItem } from "@monabit/shared";

export class SyncInProgressError extends Error {
  constructor() {
    super("A crypto sync is already in progress");
    this.name = "SyncInProgressError";
  }
}

type SyncTrigger = "scheduled" | "manual";

type SyncRunRow = typeof cryptoSyncRuns.$inferSelect;

const ASSET_LIMIT = 250;

// Arbitrary fixed key for the crypto-sync advisory lock.
const SYNC_LOCK_KEY = 84_217_001;

function toDecimalString(value: number | null | undefined): string | null {
  return value === undefined || value === null ? null : value.toString();
}

function toDate(value: string | null | undefined): Date | null {
  return value ? new Date(value) : null;
}

function mapItemToAssetRow(item: CryptoMarketItem, syncedAt: Date) {
  return {
    provider: "coingecko" as const,
    providerAssetId: item.id,
    symbol: item.symbol,
    name: item.name,
    marketCapRank: item.marketCapRank ?? null,
    isActive: true,
    currentPriceUsd: toDecimalString(item.currentPriceUsd) ?? "0",
    marketCapUsd: toDecimalString(item.marketCapUsd),
    totalVolumeUsd: toDecimalString(item.totalVolumeUsd),
    high24hUsd: toDecimalString(item.high24hUsd),
    low24hUsd: toDecimalString(item.low24hUsd),
    priceChange24hUsd: toDecimalString(item.priceChange24hUsd),
    priceChangePct1h: toDecimalString(item.priceChangePct1h),
    priceChangePct24h: toDecimalString(item.priceChangePct24h),
    priceChangePct7d: toDecimalString(item.priceChangePct7d),
    circulatingSupply: toDecimalString(item.circulatingSupply),
    totalSupply: toDecimalString(item.totalSupply),
    maxSupply: toDecimalString(item.maxSupply),
    athUsd: toDecimalString(item.athUsd),
    athChangePct: toDecimalString(item.athChangePct),
    athDate: toDate(item.athDate),
    atlUsd: toDecimalString(item.atlUsd),
    atlChangePct: toDecimalString(item.atlChangePct),
    atlDate: toDate(item.atlDate),
    sparkline7d: item.sparkline7d ?? null,
    providerUpdatedAt: toDate(item.providerUpdatedAt),
    lastSyncedAt: syncedAt,
  };
}

export async function runSync(trigger: SyncTrigger): Promise<SyncRunRow> {
  const client = await pool.connect();
  const db = drizzle(client);

  try {
    const lockResult = await client.query<{ locked: boolean }>(
      "SELECT pg_try_advisory_lock($1) AS locked",
      [SYNC_LOCK_KEY],
    );

    if (!lockResult.rows[0].locked) {
      throw new SyncInProgressError();
    }

    try {
      const startedAt = new Date();

      const [run] = await db
        .insert(cryptoSyncRuns)
        .values({
          provider: "coingecko",
          trigger,
          status: "running",
          startedAt,
        })
        .returning();

      try {
        const gateway = createCryptoGateway();
        const [items, kpis] = await Promise.all([
          gateway.getMarketItems(ASSET_LIMIT),
          gateway.getMarketKpis(),
        ]);

        const syncedAt = new Date();

        for (const item of items) {
          const row = mapItemToAssetRow(item, syncedAt);
          await db.insert(cryptoAssets).values(row).onConflictDoUpdate({
            target: cryptoAssets.providerAssetId,
            set: row,
          });
        }

        const fetchedIds = items.map((item) => item.id);
        if (fetchedIds.length > 0) {
          await db
            .update(cryptoAssets)
            .set({ isActive: false, updatedAt: syncedAt })
            .where(
              and(
                eq(cryptoAssets.provider, "coingecko"),
                sql`${cryptoAssets.providerAssetId} NOT IN ${fetchedIds}`,
              ),
            );
        }

        await db.insert(cryptoMarketKpis).values({
          provider: "coingecko",
          activeCryptocurrencies: kpis.activeCryptocurrencies ?? null,
          markets: kpis.markets ?? null,
          totalMarketCapUsd: toDecimalString(kpis.totalMarketCapUsd),
          totalVolumeUsd: toDecimalString(kpis.totalVolumeUsd),
          btcDominancePct: toDecimalString(kpis.btcDominancePct),
          ethDominancePct: toDecimalString(kpis.ethDominancePct),
          usdtDominancePct: toDecimalString(kpis.usdtDominancePct),
          marketCapChangePct24h: toDecimalString(kpis.marketCapChangePct24h),
          providerUpdatedAt: toDate(kpis.providerUpdatedAt),
          lastSyncedAt: syncedAt,
        });

        const [finished] = await db
          .update(cryptoSyncRuns)
          .set({
            status: "success",
            finishedAt: new Date(),
            assetsRequested: ASSET_LIMIT,
            assetsUpdated: items.length,
            kpisUpdated: true,
          })
          .where(sql`${cryptoSyncRuns.id} = ${run.id}`)
          .returning();

        return finished;
      } catch (error) {
        await db
          .update(cryptoSyncRuns)
          .set({
            status: "failed",
            finishedAt: new Date(),
            errorMessage:
              error instanceof Error ? error.message : String(error),
          })
          .where(sql`${cryptoSyncRuns.id} = ${run.id}`);

        throw error;
      }
    } finally {
      await client.query("SELECT pg_advisory_unlock($1)", [SYNC_LOCK_KEY]);
    }
  } finally {
    client.release();
  }
}
