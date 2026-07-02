import { describe, it, expect, vi, beforeEach } from "vitest";

const selectMock = vi.fn();
const insertMock = vi.fn();
const deleteMock = vi.fn();
const onConflictDoNothingMock = vi.fn();
const valuesMock = vi.fn();
const whereDeleteMock = vi.fn();

function chainable(finalValue: unknown) {
  const chain: Record<string, unknown> = {};
  const methods = ["from", "innerJoin", "where", "orderBy"];
  methods.forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain);
  });
  chain.then = (resolve: (v: unknown) => void) => resolve(finalValue);
  return chain;
}

let favoriteRows: unknown[] = [];

vi.mock("../../../db/client", () => ({
  db: {
    select: (...args: unknown[]) => {
      selectMock(...args);
      return chainable(favoriteRows);
    },
    insert: (...args: unknown[]) => {
      insertMock(...args);
      valuesMock.mockReturnValue({ onConflictDoNothing: onConflictDoNothingMock });
      onConflictDoNothingMock.mockResolvedValue(undefined);
      return { values: valuesMock };
    },
    delete: (...args: unknown[]) => {
      deleteMock(...args);
      whereDeleteMock.mockResolvedValue(undefined);
      return { where: whereDeleteMock };
    },
  },
}));

import { listFavorites, addFavorite, removeFavorite } from "./crypto-favorites.service";

beforeEach(() => {
  vi.resetAllMocks();
  favoriteRows = [];
});

describe("listFavorites", () => {
  it("returns favorited assets joined with current asset data", async () => {
    favoriteRows = [
      {
        providerAssetId: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        currentPriceUsd: "64230.50",
        priceChangePct24h: "2.45",
        marketCapUsd: "1260000000000.00",
        totalVolumeUsd: "32100000000.00",
      },
    ];

    const result = await listFavorites("user-1");

    expect(result).toEqual([
      {
        providerAssetId: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        currentPriceUsd: 64230.5,
        priceChangePct24h: 2.45,
        marketCapUsd: 1260000000000,
        totalVolumeUsd: 32100000000,
        isFavorite: true,
      },
    ]);
  });

  it("maps null market data to null", async () => {
    favoriteRows = [
      {
        providerAssetId: "new-coin",
        symbol: "new",
        name: "New Coin",
        currentPriceUsd: "0.001",
        priceChangePct24h: null,
        marketCapUsd: null,
        totalVolumeUsd: null,
      },
    ];

    const result = await listFavorites("user-1");

    expect(result[0].priceChangePct24h).toBeNull();
    expect(result[0].marketCapUsd).toBeNull();
    expect(result[0].totalVolumeUsd).toBeNull();
    expect(result[0].isFavorite).toBe(true);
  });

  it("returns an empty array when the user has no favorites", async () => {
    favoriteRows = [];

    const result = await listFavorites("user-1");

    expect(result).toEqual([]);
  });
});

describe("addFavorite", () => {
  it("inserts a favorite row with onConflictDoNothing", async () => {
    await addFavorite({
      userId: "user-1",
      providerAssetId: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
    });

    expect(insertMock).toHaveBeenCalled();
    expect(valuesMock).toHaveBeenCalledWith({
      userId: "user-1",
      providerAssetId: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
    });
    expect(onConflictDoNothingMock).toHaveBeenCalled();
  });
});

describe("removeFavorite", () => {
  it("deletes the matching favorite row", async () => {
    await removeFavorite({ userId: "user-1", providerAssetId: "bitcoin" });

    expect(deleteMock).toHaveBeenCalled();
    expect(whereDeleteMock).toHaveBeenCalled();
  });
});
