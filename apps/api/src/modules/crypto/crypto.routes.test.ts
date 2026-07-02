import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

const {
  requireRoleMock,
  runSyncMock,
  SyncInProgressError,
  getDashboardMock,
  NoDashboardDataError,
  getAssetsMock,
  listFavoritesMock,
  addFavoriteMock,
  removeFavoriteMock,
  getSyncStatsMock,
} = vi.hoisted(() => {
  class SyncInProgressError extends Error {}
  class NoDashboardDataError extends Error {}
  const requireRoleMock = vi.fn(
    (_role?: string) => (_req: unknown, res: { locals: Record<string, unknown> }, next: () => void) => {
      res.locals.session = { user: { id: "user-1" } };
      next();
    },
  );
  return {
    requireRoleMock,
    runSyncMock: vi.fn(),
    SyncInProgressError,
    getDashboardMock: vi.fn(),
    NoDashboardDataError,
    getAssetsMock: vi.fn(),
    listFavoritesMock: vi.fn(),
    addFavoriteMock: vi.fn(),
    removeFavoriteMock: vi.fn(),
    getSyncStatsMock: vi.fn(),
  };
});

vi.mock("../../lib/middleware", () => ({
  requireRole: (role?: string) => requireRoleMock(role),
}));

vi.mock("./sync/crypto-sync.service", () => ({
  runSync: runSyncMock,
  SyncInProgressError,
}));

vi.mock("./sync/crypto-sync-stats.service", () => ({
  getSyncStats: getSyncStatsMock,
}));

vi.mock("./dashboard/crypto-dashboard.service", () => ({
  getDashboard: getDashboardMock,
  NoDashboardDataError,
}));

vi.mock("./assets/crypto-assets.service", () => ({
  getAssets: getAssetsMock,
  ASSET_SORT_VALUES: ["marketCap", "price", "change24h", "volume24h"],
}));

vi.mock("./favorites/crypto-favorites.service", () => ({
  listFavorites: listFavoritesMock,
  addFavorite: addFavoriteMock,
  removeFavorite: removeFavoriteMock,
}));

import { cryptoRouter } from "./crypto.routes";

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/crypto", cryptoRouter);
  return app;
}

beforeEach(() => {
  runSyncMock.mockReset();
  getDashboardMock.mockReset();
  getAssetsMock.mockReset();
  listFavoritesMock.mockReset();
  addFavoriteMock.mockReset();
  removeFavoriteMock.mockReset();
  getSyncStatsMock.mockReset();
  requireRoleMock.mockClear();
});

describe("POST /api/crypto/sync", () => {
  it("returns 200 with the finished run on success", async () => {
    runSyncMock.mockResolvedValue({ id: "run-1", status: "success" });

    const res = await request(buildApp()).post("/api/crypto/sync");

    expect(res.status).toBe(200);
    expect(res.body.run).toEqual({ id: "run-1", status: "success" });
    expect(runSyncMock).toHaveBeenCalledWith("manual");
  });

  it("returns 409 when a sync is already in progress", async () => {
    runSyncMock.mockRejectedValue(new SyncInProgressError());

    const res = await request(buildApp()).post("/api/crypto/sync");

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: "Sync already in progress" });
  });

  it("returns 500 with error details on other failures", async () => {
    runSyncMock.mockRejectedValue(new Error("CoinGecko down"));

    const res = await request(buildApp()).post("/api/crypto/sync");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Sync failed");
  });
});

describe("GET /api/crypto/dashboard", () => {
  it("returns 200 with the dashboard payload", async () => {
    const payload = {
      source: "coingecko",
      lastUpdatedAt: "2026-07-01T12:00:00.000Z",
      kpis: {
        totalMarketCapUsd: { value: 2120712066192.48, changePct24h: -0.54 },
        totalVolumeUsd: { value: 81193576085.39, changePct24h: 1.49 },
        btcDominancePct: { value: 55.37 },
        ethDominancePct: { value: 8.93 },
        usdtDominancePct: { value: 8.69 },
        activeCryptocurrencies: { value: 17410 },
      },
      topAssets: [],
      marketTrend: [],
    };
    getDashboardMock.mockResolvedValue(payload);

    const res = await request(buildApp()).get("/api/crypto/dashboard");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(payload);
  });

  it("returns 503 when there is no crypto data yet", async () => {
    getDashboardMock.mockRejectedValue(new NoDashboardDataError());

    const res = await request(buildApp()).get("/api/crypto/dashboard");

    expect(res.status).toBe(503);
    expect(res.body).toEqual({ error: "No crypto data available yet" });
  });

  it("returns 500 on unexpected errors", async () => {
    getDashboardMock.mockRejectedValue(new Error("DB down"));

    const res = await request(buildApp()).get("/api/crypto/dashboard");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Failed to load dashboard");
  });
});

describe("GET /api/crypto/assets", () => {
  it("returns 200 with the paginated response", async () => {
    const payload = {
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 1,
    };
    getAssetsMock.mockResolvedValue(payload);

    const res = await request(buildApp()).get("/api/crypto/assets");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(payload);
    expect(getAssetsMock).toHaveBeenCalledWith({
      userId: "user-1",
      page: 1,
      pageSize: 20,
      search: undefined,
      sortBy: "marketCap",
    });
  });

  it("passes through query params", async () => {
    getAssetsMock.mockResolvedValue({ items: [], page: 2, pageSize: 10, total: 0, totalPages: 1 });

    const res = await request(buildApp()).get(
      "/api/crypto/assets?page=2&pageSize=10&search=bit&sortBy=price",
    );

    expect(res.status).toBe(200);
    expect(getAssetsMock).toHaveBeenCalledWith({
      userId: "user-1",
      page: 2,
      pageSize: 10,
      search: "bit",
      sortBy: "price",
    });
  });

  it("returns 400 for an invalid sortBy", async () => {
    const res = await request(buildApp()).get("/api/crypto/assets?sortBy=bogus");

    expect(res.status).toBe(400);
    expect(getAssetsMock).not.toHaveBeenCalled();
  });
});

describe("GET /api/crypto/favorites", () => {
  it("returns 200 with the user's favorites", async () => {
    const favorites = [
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
    ];
    listFavoritesMock.mockResolvedValue(favorites);

    const res = await request(buildApp()).get("/api/crypto/favorites");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ items: favorites });
    expect(listFavoritesMock).toHaveBeenCalledWith("user-1");
  });
});

describe("POST /api/crypto/favorites", () => {
  it("returns 201 on success", async () => {
    addFavoriteMock.mockResolvedValue(undefined);

    const res = await request(buildApp())
      .post("/api/crypto/favorites")
      .send({ providerAssetId: "bitcoin", symbol: "btc", name: "Bitcoin" });

    expect(res.status).toBe(201);
    expect(addFavoriteMock).toHaveBeenCalledWith({
      userId: "user-1",
      providerAssetId: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
    });
  });

  it("returns 400 when the body is invalid", async () => {
    const res = await request(buildApp()).post("/api/crypto/favorites").send({});

    expect(res.status).toBe(400);
    expect(addFavoriteMock).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/crypto/favorites/:providerAssetId", () => {
  it("returns 204 on success", async () => {
    removeFavoriteMock.mockResolvedValue(undefined);

    const res = await request(buildApp()).delete("/api/crypto/favorites/bitcoin");

    expect(res.status).toBe(204);
    expect(removeFavoriteMock).toHaveBeenCalledWith({ userId: "user-1", providerAssetId: "bitcoin" });
  });
});

describe("GET /api/crypto/sync/stats", () => {
  it("returns 200 with the stats payload", async () => {
    const payload = {
      totalRegisters: 250,
      activeCount: 248,
      lastRun: { id: "run-1", status: "success" },
      recentRuns: [{ id: "run-1", status: "success" }],
    };
    getSyncStatsMock.mockResolvedValue(payload);

    const res = await request(buildApp()).get("/api/crypto/sync/stats");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(payload);
  });

  it("returns 500 on unexpected errors", async () => {
    getSyncStatsMock.mockRejectedValue(new Error("DB down"));

    const res = await request(buildApp()).get("/api/crypto/sync/stats");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Failed to load sync stats");
  });
});
