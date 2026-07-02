import { describe, it, expect, vi, beforeEach } from "vitest";

const { scheduleMock, runSyncMock } = vi.hoisted(() => ({
  scheduleMock: vi.fn(),
  runSyncMock: vi.fn(),
}));

vi.mock("node-cron", () => ({
  default: { schedule: scheduleMock },
  schedule: scheduleMock,
}));

vi.mock("./crypto-sync.service", () => ({
  runSync: runSyncMock,
}));

import { startCryptoSyncScheduler } from "./crypto-sync.scheduler";

beforeEach(() => {
  vi.resetAllMocks();
  delete process.env.CRYPTO_SYNC_INTERVAL_MINUTES;
});

describe("startCryptoSyncScheduler", () => {
  it("schedules a cron job using CRYPTO_SYNC_INTERVAL_MINUTES", () => {
    process.env.CRYPTO_SYNC_INTERVAL_MINUTES = "10";

    startCryptoSyncScheduler();

    expect(scheduleMock).toHaveBeenCalledWith("*/10 * * * *", expect.any(Function));
  });

  it("defaults to 5 minutes when the env var is unset", () => {
    startCryptoSyncScheduler();

    expect(scheduleMock).toHaveBeenCalledWith("*/5 * * * *", expect.any(Function));
  });

  it("calls runSync('scheduled') on tick and swallows rejections", async () => {
    runSyncMock.mockRejectedValue(new Error("boom"));
    startCryptoSyncScheduler();

    const tickFn = scheduleMock.mock.calls[0][1] as () => Promise<void>;
    await expect(tickFn()).resolves.toBeUndefined();
    expect(runSyncMock).toHaveBeenCalledWith("scheduled");
  });
});
