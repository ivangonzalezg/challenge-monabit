import { describe, it, expect, vi, beforeEach } from "vitest";

const { selectMock } = vi.hoisted(() => ({
  selectMock: vi.fn(),
}));

vi.mock("../../db/client", () => ({
  db: { select: selectMock },
}));

import { getAuditLogs, AUDIT_LOG_ACTION_VALUES } from "./admin-audit-logs.service";

function mockChain(result: unknown) {
  const chain = {
    from: vi.fn(() => chain),
    leftJoin: vi.fn(() => chain),
    where: vi.fn(() => chain),
    orderBy: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    offset: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (value: unknown) => void) => Promise.resolve(result).then(resolve),
  };
  return chain;
}

beforeEach(() => {
  selectMock.mockReset();
});

describe("AUDIT_LOG_ACTION_VALUES", () => {
  it("lists the three known action values", () => {
    expect(AUDIT_LOG_ACTION_VALUES).toEqual([
      "USER_CREATED",
      "USER_UPDATED",
      "USER_DELETED",
    ]);
  });
});

describe("getAuditLogs", () => {
  it("returns joined rows with actor/target resolved and pagination math", async () => {
    selectMock
      .mockReturnValueOnce(
        mockChain([
          {
            id: "log-1",
            action: "USER_UPDATED",
            createdAt: new Date("2026-07-02T10:00:00Z"),
            metadata: { role: "admin" },
            ipAddress: "127.0.0.1",
            userAgent: "test-agent",
            actorId: "actor-1",
            actorName: "Ivan",
            actorEmail: "ivan@admin.com",
            targetId: "target-1",
            targetName: "Juan",
            targetEmail: "juan@perez.co",
          },
        ]),
      )
      .mockReturnValueOnce(mockChain([{ count: 1 }]));

    const result = await getAuditLogs({ page: 1, pageSize: 20 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].actor).toEqual({
      id: "actor-1",
      name: "Ivan",
      email: "ivan@admin.com",
    });
    expect(result.items[0].target).toEqual({
      id: "target-1",
      name: "Juan",
      email: "juan@perez.co",
    });
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it("returns null actor/target when the joined user row is missing (deleted user)", async () => {
    selectMock
      .mockReturnValueOnce(
        mockChain([
          {
            id: "log-2",
            action: "USER_DELETED",
            createdAt: new Date("2026-07-02T11:00:00Z"),
            metadata: { userId: "deleted-1", email: "gone@example.com" },
            ipAddress: null,
            userAgent: null,
            actorId: "actor-1",
            actorName: "Ivan",
            actorEmail: "ivan@admin.com",
            targetId: null,
            targetName: null,
            targetEmail: null,
          },
        ]),
      )
      .mockReturnValueOnce(mockChain([{ count: 1 }]));

    const result = await getAuditLogs({ page: 1, pageSize: 20 });

    expect(result.items[0].target).toBeNull();
  });

  it("clamps pageSize to a maximum of 100", async () => {
    selectMock
      .mockReturnValueOnce(mockChain([]))
      .mockReturnValueOnce(mockChain([{ count: 0 }]));

    const result = await getAuditLogs({ page: 1, pageSize: 500 });

    expect(result.pageSize).toBe(100);
  });
});
