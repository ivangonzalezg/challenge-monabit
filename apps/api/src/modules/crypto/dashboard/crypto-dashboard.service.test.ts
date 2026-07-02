import { describe, it, expect, vi, beforeEach } from "vitest";

const selectMock = vi.fn();
const executeMock = vi.fn();

function chainable(finalValue: unknown) {
  const chain: Record<string, unknown> = {};
  const methods = ["from", "where", "orderBy", "limit", "groupBy"];
  methods.forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain);
  });
  chain.then = (resolve: (v: unknown) => void) => resolve(finalValue);
  return chain;
}

let latestKpiRows: unknown[] = [];
let topAssetRows: unknown[] = [];

vi.mock("../../../db/client", () => ({
  db: {
    select: (...args: unknown[]) => {
      selectMock(...args);
      const callNumber = selectMock.mock.calls.length;
      if (callNumber === 1) return chainable(latestKpiRows);
      return chainable(topAssetRows);
    },
    execute: (...args: unknown[]) => executeMock(...args),
  },
}));

import {
  getCurrentKpis,
  getTopAssets,
  getMarketTrend,
  getDashboard,
  NoDashboardDataError,
} from "./crypto-dashboard.service";

beforeEach(() => {
  vi.resetAllMocks();
  latestKpiRows = [];
  topAssetRows = [];
});

describe("getCurrentKpis", () => {
  it("returns the latest crypto_market_kpis row", async () => {
    latestKpiRows = [
      {
        provider: "coingecko",
        activeCryptocurrencies: 17410,
        totalMarketCapUsd: "2120712066192.48",
        totalVolumeUsd: "81193576085.39",
        btcDominancePct: "55.37",
        ethDominancePct: "8.93",
        usdtDominancePct: "8.69",
        marketCapChangePct24h: "-0.54",
        volumeChangePct24h: "1.49",
        providerUpdatedAt: new Date("2026-07-01T12:00:00.000Z"),
      },
    ];

    const result = await getCurrentKpis();

    expect(result?.totalMarketCapUsd).toBe(2120712066192.48);
    expect(result?.marketCapChangePct24h).toBe(-0.54);
    expect(result?.volumeChangePct24h).toBe(1.49);
  });

  it("returns null when no kpis row exists", async () => {
    latestKpiRows = [];

    const result = await getCurrentKpis();

    expect(result).toBeNull();
  });
});

describe("getTopAssets", () => {
  it("returns the top 10 active assets ordered by market cap rank", async () => {
    latestKpiRows = [
      {
        providerAssetId: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        marketCapRank: 1,
        currentPriceUsd: "58534",
        priceChangePct24h: "-1.05",
        marketCapUsd: "1150000000000.00",
        totalVolumeUsd: "32000000000.00",
        sparkline7d: [58000, 58200, 58534],
      },
    ];

    const result = await getTopAssets();

    expect(result).toEqual([
      {
        providerAssetId: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        marketCapRank: 1,
        currentPriceUsd: 58534,
        priceChangePct24h: -1.05,
        marketCapUsd: 1150000000000,
        totalVolumeUsd: 32000000000,
        sparkline7d: [58000, 58200, 58534],
      },
    ]);
  });

  it("maps null market cap and volume to null", async () => {
    latestKpiRows = [
      {
        providerAssetId: "new-coin",
        symbol: "new",
        name: "New Coin",
        marketCapRank: null,
        currentPriceUsd: "0.001",
        priceChangePct24h: null,
        marketCapUsd: null,
        totalVolumeUsd: null,
        sparkline7d: null,
      },
    ];

    const result = await getTopAssets();

    expect(result[0].marketCapUsd).toBeNull();
    expect(result[0].totalVolumeUsd).toBeNull();
  });
});

describe("getMarketTrend", () => {
  it("maps aggregated daily rows into the trend shape", async () => {
    executeMock.mockResolvedValue({
      rows: [
        {
          day: "2026-06-01T00:00:00.000Z",
          total_market_cap_usd: "2100000000000.00",
          total_volume_usd: "80000000000.00",
          btc_dominance_pct: "55.00",
          eth_dominance_pct: "9.00",
          usdt_dominance_pct: "8.50",
        },
      ],
    });

    const result = await getMarketTrend();

    expect(result).toEqual([
      {
        date: "2026-06-01",
        totalMarketCapUsd: 2100000000000,
        totalVolumeUsd: 80000000000,
        btcDominancePct: 55,
        ethDominancePct: 9,
        usdtDominancePct: 8.5,
      },
    ]);
  });

  it("returns an empty array when there are no rows in the window", async () => {
    executeMock.mockResolvedValue({ rows: [] });

    const result = await getMarketTrend();

    expect(result).toEqual([]);
  });
});

describe("getDashboard", () => {
  it("throws NoDashboardDataError when there are no kpis rows at all", async () => {
    latestKpiRows = [];
    executeMock.mockResolvedValue({ rows: [] });

    await expect(getDashboard()).rejects.toThrow(NoDashboardDataError);
  });

  it("composes current kpis, top assets, and trend into one shape", async () => {
    latestKpiRows = [
      {
        provider: "coingecko",
        activeCryptocurrencies: 17410,
        totalMarketCapUsd: "2120712066192.48",
        totalVolumeUsd: "81193576085.39",
        btcDominancePct: "55.37",
        ethDominancePct: "8.93",
        usdtDominancePct: "8.69",
        marketCapChangePct24h: "-0.54",
        volumeChangePct24h: "1.49",
        providerUpdatedAt: new Date("2026-07-01T12:00:00.000Z"),
      },
    ];
    topAssetRows = [];
    executeMock.mockResolvedValue({ rows: [] });

    const result = await getDashboard();

    expect(result.source).toBe("coingecko");
    expect(result.lastUpdatedAt).toBe("2026-07-01T12:00:00.000Z");
    expect(result.kpis.totalMarketCapUsd).toEqual({
      value: 2120712066192.48,
      changePct24h: -0.54,
    });
    expect(result.kpis.totalVolumeUsd).toEqual({
      value: 81193576085.39,
      changePct24h: 1.49,
    });
    expect(result.kpis.btcDominancePct).toEqual({ value: 55.37 });
    expect(result.kpis.ethDominancePct).toEqual({ value: 8.93 });
    expect(result.kpis.usdtDominancePct).toEqual({ value: 8.69 });
    expect(result.kpis.activeCryptocurrencies).toEqual({ value: 17410 });
    expect(result.topAssets).toEqual([]);
    expect(result.marketTrend).toEqual([]);
  });
});
