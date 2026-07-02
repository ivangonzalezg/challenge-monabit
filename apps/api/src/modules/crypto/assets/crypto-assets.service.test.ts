import { describe, it, expect, vi, beforeEach } from "vitest";

const selectMock = vi.fn();

function chainable(finalValue: unknown) {
  const chain: Record<string, unknown> = {};
  const methods = [
    "from",
    "leftJoin",
    "where",
    "orderBy",
    "limit",
    "offset",
    "groupBy",
  ];
  methods.forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain);
  });
  chain.then = (resolve: (v: unknown) => void) => resolve(finalValue);
  return chain;
}

let assetRows: unknown[] = [];
let countRows: unknown[] = [];

vi.mock("../../../db/client", () => ({
  db: {
    select: (...args: unknown[]) => {
      selectMock(...args);
      const callNumber = selectMock.mock.calls.length;
      if (callNumber === 1) return chainable(assetRows);
      return chainable(countRows);
    },
  },
}));

import { getAssets } from "./crypto-assets.service";

beforeEach(() => {
  vi.resetAllMocks();
  assetRows = [];
  countRows = [];
});

describe("getAssets", () => {
  it("maps rows into the paginated response shape", async () => {
    assetRows = [
      {
        providerAssetId: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        currentPriceUsd: "64230.50",
        priceChangePct24h: "2.45",
        marketCapUsd: "1260000000000.00",
        totalVolumeUsd: "32100000000.00",
        favoriteId: "fav-1",
      },
    ];
    countRows = [{ count: 1 }];

    const result = await getAssets({
      userId: "user-1",
      page: 1,
      pageSize: 20,
      sortBy: "marketCap",
    });

    expect(result).toEqual({
      items: [
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
      ],
      page: 1,
      pageSize: 20,
      total: 1,
      totalPages: 1,
    });
  });

  it("marks isFavorite false when there is no matching favorite row", async () => {
    assetRows = [
      {
        providerAssetId: "ethereum",
        symbol: "eth",
        name: "Ethereum",
        currentPriceUsd: "3450.20",
        priceChangePct24h: "1.80",
        marketCapUsd: "415000000000.00",
        totalVolumeUsd: "10400000000.00",
        favoriteId: null,
      },
    ];
    countRows = [{ count: 1 }];

    const result = await getAssets({
      userId: "user-1",
      page: 1,
      pageSize: 20,
      sortBy: "marketCap",
    });

    expect(result.items[0].isFavorite).toBe(false);
  });

  it("computes totalPages from total and pageSize", async () => {
    assetRows = [];
    countRows = [{ count: 45 }];

    const result = await getAssets({
      userId: "user-1",
      page: 1,
      pageSize: 20,
      sortBy: "marketCap",
    });

    expect(result.total).toBe(45);
    expect(result.totalPages).toBe(3);
  });

  it("clamps page to a minimum of 1", async () => {
    assetRows = [];
    countRows = [{ count: 0 }];

    const result = await getAssets({
      userId: "user-1",
      page: 0,
      pageSize: 20,
      sortBy: "marketCap",
    });

    expect(result.page).toBe(1);
  });

  it("clamps pageSize to a maximum of 100", async () => {
    assetRows = [];
    countRows = [{ count: 0 }];

    const result = await getAssets({
      userId: "user-1",
      page: 1,
      pageSize: 500,
      sortBy: "marketCap",
    });

    expect(result.pageSize).toBe(100);
  });
});
