import { and, eq } from "drizzle-orm";
import { db } from "../../../db/client";
import { userFavoriteCryptos } from "../../../db/schema";

export type FavoriteCrypto = {
  providerAssetId: string;
  symbol: string;
  name: string;
  createdAt: Date;
};

export async function listFavorites(userId: string): Promise<FavoriteCrypto[]> {
  const rows = await db
    .select({
      providerAssetId: userFavoriteCryptos.providerAssetId,
      symbol: userFavoriteCryptos.symbol,
      name: userFavoriteCryptos.name,
      createdAt: userFavoriteCryptos.createdAt,
    })
    .from(userFavoriteCryptos)
    .where(eq(userFavoriteCryptos.userId, userId))
    .orderBy(userFavoriteCryptos.createdAt);

  return rows;
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
