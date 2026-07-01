import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "../../../db/client";
import { cryptoAssets, userFavoriteCryptos } from "../../../db/schema";

function toNumberOrNull(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return typeof value === "number" ? value : Number(value);
}

export type AssetSortBy = "marketCap" | "price" | "change24h" | "volume24h";

export const ASSET_SORT_VALUES: AssetSortBy[] = [
  "marketCap",
  "price",
  "change24h",
  "volume24h",
];

export type PaginatedAsset = {
  providerAssetId: string;
  symbol: string;
  name: string;
  currentPriceUsd: number;
  priceChangePct24h: number | null;
  marketCapUsd: number | null;
  totalVolumeUsd: number | null;
  isFavorite: boolean;
};

export type PaginatedAssetsResponse = {
  items: PaginatedAsset[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const sortColumn = {
  marketCap: cryptoAssets.marketCapUsd,
  price: cryptoAssets.currentPriceUsd,
  change24h: cryptoAssets.priceChangePct24h,
  volume24h: cryptoAssets.totalVolumeUsd,
};

export async function getAssets(params: {
  userId: string;
  page: number;
  pageSize: number;
  search?: string;
  sortBy: AssetSortBy;
}): Promise<PaginatedAssetsResponse> {
  const page = Math.max(1, Math.floor(params.page));
  const pageSize = Math.min(100, Math.max(1, Math.floor(params.pageSize)));

  const searchTerm = params.search?.trim();
  const whereClause = searchTerm
    ? and(
        eq(cryptoAssets.isActive, true),
        or(ilike(cryptoAssets.name, `%${searchTerm}%`), ilike(cryptoAssets.symbol, `%${searchTerm}%`)),
      )
    : eq(cryptoAssets.isActive, true);

  const column = sortColumn[params.sortBy];

  const rows = await db
    .select({
      providerAssetId: cryptoAssets.providerAssetId,
      symbol: cryptoAssets.symbol,
      name: cryptoAssets.name,
      currentPriceUsd: cryptoAssets.currentPriceUsd,
      priceChangePct24h: cryptoAssets.priceChangePct24h,
      marketCapUsd: cryptoAssets.marketCapUsd,
      totalVolumeUsd: cryptoAssets.totalVolumeUsd,
      favoriteId: userFavoriteCryptos.id,
    })
    .from(cryptoAssets)
    .leftJoin(
      userFavoriteCryptos,
      and(
        eq(userFavoriteCryptos.providerAssetId, cryptoAssets.providerAssetId),
        eq(userFavoriteCryptos.userId, params.userId),
      ),
    )
    .where(whereClause)
    .orderBy(desc(column), asc(cryptoAssets.providerAssetId))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const [countRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(cryptoAssets)
    .where(whereClause);

  const total = Number(countRow?.count ?? 0);

  return {
    items: rows.map((row) => ({
      providerAssetId: row.providerAssetId,
      symbol: row.symbol,
      name: row.name,
      currentPriceUsd: Number(row.currentPriceUsd),
      priceChangePct24h: toNumberOrNull(row.priceChangePct24h),
      marketCapUsd: toNumberOrNull(row.marketCapUsd),
      totalVolumeUsd: toNumberOrNull(row.totalVolumeUsd),
      isFavorite: row.favoriteId !== null,
    })),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
