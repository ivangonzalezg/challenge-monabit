import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

const { requireRoleMock, getAuditLogsMock } = vi.hoisted(() => {
  const requireRoleMock = vi.fn(
    (_role?: string) => (_req: unknown, res: { locals: Record<string, unknown> }, next: () => void) => {
      res.locals.session = { user: { id: "user-1" } };
      next();
    },
  );
  return {
    requireRoleMock,
    getAuditLogsMock: vi.fn(),
  };
});

vi.mock("../../lib/middleware", () => ({
  requireRole: (role?: string) => requireRoleMock(role),
}));

vi.mock("./admin-audit-logs.service", () => ({
  getAuditLogs: getAuditLogsMock,
  AUDIT_LOG_ACTION_VALUES: ["USER_CREATED", "USER_UPDATED", "USER_DELETED"],
}));

import { adminAuditLogsRouter } from "./admin-audit-logs.routes";

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/admin", adminAuditLogsRouter);
  return app;
}

beforeEach(() => {
  getAuditLogsMock.mockReset();
  requireRoleMock.mockClear();
});

describe("GET /api/admin/audit-logs", () => {
  it("returns 200 with the paginated payload", async () => {
    const payload = {
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 1,
    };
    getAuditLogsMock.mockResolvedValue(payload);

    const res = await request(buildApp()).get("/api/admin/audit-logs");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(payload);
    expect(getAuditLogsMock).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      action: undefined,
    });
  });

  it("passes through page, pageSize, and action query params", async () => {
    getAuditLogsMock.mockResolvedValue({ items: [], page: 2, pageSize: 10, total: 0, totalPages: 1 });

    const res = await request(buildApp()).get(
      "/api/admin/audit-logs?page=2&pageSize=10&action=USER_DELETED",
    );

    expect(res.status).toBe(200);
    expect(getAuditLogsMock).toHaveBeenCalledWith({
      page: 2,
      pageSize: 10,
      action: "USER_DELETED",
    });
  });

  it("returns 400 for an invalid action value", async () => {
    const res = await request(buildApp()).get("/api/admin/audit-logs?action=BOGUS");

    expect(res.status).toBe(400);
    expect(getAuditLogsMock).not.toHaveBeenCalled();
  });

  it("returns 500 on unexpected errors", async () => {
    getAuditLogsMock.mockRejectedValue(new Error("DB down"));

    const res = await request(buildApp()).get("/api/admin/audit-logs");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Failed to load audit logs");
  });
});
