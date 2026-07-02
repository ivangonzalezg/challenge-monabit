import { describe, it, expect, vi, beforeEach } from "vitest";

const { selectMock } = vi.hoisted(() => ({
  selectMock: vi.fn(),
}));

vi.mock("../../../db/client", () => ({
  db: { select: selectMock },
}));

import { getSyncStats } from "./crypto-sync-stats.service";

function mockChain(result: unknown) {
  const chain = {
    from: vi.fn(() => chain),
    where: vi.fn(() => chain),
    orderBy: vi.fn(() => chain),
    limit: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (value: unknown) => void) => Promise.resolve(result).then(resolve),
  };
  return chain;
}

beforeEach(() => {
  selectMock.mockReset();
});

describe("getSyncStats", () => {
  it("returns counts and recent runs with lastRun set to the most recent", async () => {
    selectMock
      .mockReturnValueOnce(mockChain([{ count: 42 }]))
      .mockReturnValueOnce(mockChain([{ count: 40 }]))
      .mockReturnValueOnce(
        mockChain([
          { id: "run-2", status: "success", startedAt: new Date("2026-07-01T12:00:00Z") },
          { id: "run-1", status: "failed", startedAt: new Date("2026-07-01T11:00:00Z") },
        ]),
      );

    const result = await getSyncStats();

    expect(result.totalRegisters).toBe(42);
    expect(result.activeCount).toBe(40);
    expect(result.recentRuns).toHaveLength(2);
    expect(result.lastRun).toEqual(result.recentRuns[0]);
    expect(result.lastRun?.id).toBe("run-2");
  });

  it("returns lastRun null when there are no sync runs", async () => {
    selectMock
      .mockReturnValueOnce(mockChain([{ count: 0 }]))
      .mockReturnValueOnce(mockChain([{ count: 0 }]))
      .mockReturnValueOnce(mockChain([]));

    const result = await getSyncStats();

    expect(result.lastRun).toBeNull();
    expect(result.recentRuns).toEqual([]);
  });
});
