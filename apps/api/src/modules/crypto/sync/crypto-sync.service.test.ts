import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CryptoMarketItem, MarketKpis } from "@monabit/shared";

const { insertMock, updateMock, releaseMock, queryMock, deleteMock } = vi.hoisted(() => ({
  insertMock: vi.fn(),
  updateMock: vi.fn(),
  releaseMock: vi.fn(),
  queryMock: vi.fn(),
  deleteMock: vi.fn(),
}));

let lockGranted = true;

function chainable(finalValue: unknown) {
  const chain: Record<string, unknown> = {};
  const methods = ["values", "onConflictDoUpdate", "set", "where", "returning", "from"];
  methods.forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain);
  });
  chain.then = (resolve: (v: unknown) => void) => resolve(finalValue);
  return chain;
}

vi.mock("../../../db/client", () => ({
  pool: {
    connect: async () => ({
      query: queryMock,
      release: releaseMock,
    }),
  },
}));

vi.mock("drizzle-orm/node-postgres", () => ({
  drizzle: () => ({
    insert: (...args: unknown[]) => {
      insertMock(...args);
      return chainable([{ id: "run-1" }]);
    },
    update: (...args: unknown[]) => {
      updateMock(...args);
      return chainable([{ id: "run-1", status: "success" }]);
    },
    delete: (...args: unknown[]) => {
      deleteMock(...args);
      return chainable(undefined);
    },
  }),
}));

const getMarketItems = vi.fn();
const getMarketKpis = vi.fn();

vi.mock("../crypto.gateway", () => ({
  createCryptoGateway: () => ({ getMarketItems, getMarketKpis }),
}));

import { runSync, SyncInProgressError } from "./crypto-sync.service";

const sampleItem: CryptoMarketItem = {
  id: "bitcoin",
  symbol: "btc",
  name: "Bitcoin",
  currentPriceUsd: 58534,
};

const sampleKpis: MarketKpis = {
  totalMarketCapUsd: 2120712066192.48,
  provider: "coingecko",
};

beforeEach(() => {
  vi.resetAllMocks();
  lockGranted = true;
  queryMock.mockImplementation(async (sqlText: string) => {
    if (sqlText.includes("pg_try_advisory_lock")) {
      return { rows: [{ locked: lockGranted }] };
    }
    return { rows: [] };
  });
});

describe("runSync", () => {
  it("fetches items and kpis, and logs a successful run", async () => {
    getMarketItems.mockResolvedValue([sampleItem]);
    getMarketKpis.mockResolvedValue(sampleKpis);

    const result = await runSync("manual");

    expect(getMarketItems).toHaveBeenCalledWith(250);
    expect(getMarketKpis).toHaveBeenCalled();
    expect(insertMock).toHaveBeenCalled();
    expect(result.status).toBe("success");
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("pg_advisory_unlock"),
      expect.anything(),
    );
    expect(releaseMock).toHaveBeenCalled();
  });

  it("writes one snapshot row per fetched asset, tagged with the sync run id", async () => {
    getMarketItems.mockResolvedValue([sampleItem]);
    getMarketKpis.mockResolvedValue(sampleKpis);

    await runSync("manual");

    const drizzleNameSymbol = Symbol.for("drizzle:Name");
    const snapshotCall = insertMock.mock.calls.find(
      ([table]) => (table as Record<symbol, unknown>)[drizzleNameSymbol] === "crypto_asset_snapshots",
    );
    expect(snapshotCall).toBeDefined();
  });

  it("prunes snapshot rows older than CRYPTO_SNAPSHOT_RETENTION_DAYS", async () => {
    process.env.CRYPTO_SNAPSHOT_RETENTION_DAYS = "30";
    getMarketItems.mockResolvedValue([sampleItem]);
    getMarketKpis.mockResolvedValue(sampleKpis);

    await runSync("manual");

    expect(deleteMock).toHaveBeenCalled();
    delete process.env.CRYPTO_SNAPSHOT_RETENTION_DAYS;
  });

  it("logs a failed run and rethrows when the provider throws", async () => {
    getMarketItems.mockRejectedValue(new Error("CoinGecko down"));
    getMarketKpis.mockResolvedValue(sampleKpis);

    await expect(runSync("scheduled")).rejects.toThrow("CoinGecko down");
    expect(updateMock).toHaveBeenCalled();
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("pg_advisory_unlock"),
      expect.anything(),
    );
    expect(releaseMock).toHaveBeenCalled();
  });

  it("handles provider fields that are null (not just undefined) without throwing", async () => {
    const itemWithNulls: CryptoMarketItem = {
      id: "ethereum",
      symbol: "eth",
      name: "Ethereum",
      currentPriceUsd: 3000,
      maxSupply: null,
      athDate: null,
      sparkline7d: null,
    };
    getMarketItems.mockResolvedValue([itemWithNulls]);
    getMarketKpis.mockResolvedValue(sampleKpis);

    const result = await runSync("manual");

    expect(result.status).toBe("success");
  });

  it("rejects with SyncInProgressError when the advisory lock is already held", async () => {
    lockGranted = false;
    getMarketItems.mockResolvedValue([sampleItem]);
    getMarketKpis.mockResolvedValue(sampleKpis);

    await expect(runSync("manual")).rejects.toThrow(SyncInProgressError);
    expect(getMarketItems).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
    expect(releaseMock).toHaveBeenCalled();
  });
});
