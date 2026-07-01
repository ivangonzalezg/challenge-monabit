import { and, eq } from "drizzle-orm";
import { db } from "../../../db/client";
import { cryptoAssets, userFavoriteCryptos } from "../../../db/schema";

function toNumberOrNull(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return typeof value === "number" ? value : Number(value);
}

export type FavoriteAsset = {
  providerAssetId: string;
  symbol: string;
  name: string;
  currentPriceUsd: number;
  priceChangePct24h: number | null;
  marketCapUsd: number | null;
  totalVolumeUsd: number | null;
  isFavorite: true;
};

export async function listFavorites(userId: string): Promise<FavoriteAsset[]> {
  const rows = await db
    .select({
      providerAssetId: cryptoAssets.providerAssetId,
      symbol: cryptoAssets.symbol,
      name: cryptoAssets.name,
      currentPriceUsd: cryptoAssets.currentPriceUsd,
      priceChangePct24h: cryptoAssets.priceChangePct24h,
      marketCapUsd: cryptoAssets.marketCapUsd,
      totalVolumeUsd: cryptoAssets.totalVolumeUsd,
    })
    .from(userFavoriteCryptos)
    .innerJoin(cryptoAssets, eq(cryptoAssets.providerAssetId, userFavoriteCryptos.providerAssetId))
    .where(eq(userFavoriteCryptos.userId, userId))
    .orderBy(userFavoriteCryptos.createdAt);

  return rows.map((row) => ({
    providerAssetId: row.providerAssetId,
    symbol: row.symbol,
    name: row.name,
    currentPriceUsd: Number(row.currentPriceUsd),
    priceChangePct24h: toNumberOrNull(row.priceChangePct24h),
    marketCapUsd: toNumberOrNull(row.marketCapUsd),
    totalVolumeUsd: toNumberOrNull(row.totalVolumeUsd),
    isFavorite: true,
  }));
}

export async function addFavorite(params: {
  userId: string;
  providerAssetId: string;
  symbol: string;
  name: string;
}): Promise<void> {
  await db
    .insert(userFavoriteCryptos)
    .values({
      userId: params.userId,
      providerAssetId: params.providerAssetId,
      symbol: params.symbol,
      name: params.name,
    })
    .onConflictDoNothing();
}

export async function removeFavorite(params: {
  userId: string;
  providerAssetId: string;
}): Promise<void> {
  await db
    .delete(userFavoriteCryptos)
    .where(
      and(
        eq(userFavoriteCryptos.userId, params.userId),
        eq(userFavoriteCryptos.providerAssetId, params.providerAssetId),
      ),
    );
}
