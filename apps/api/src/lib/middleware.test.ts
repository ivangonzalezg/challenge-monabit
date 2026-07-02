import { describe, it, expect, vi, beforeEach } from "vitest";
import { requireRole } from "./middleware";
import type { Request, Response, NextFunction } from "express";

vi.mock("./auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

import { auth } from "./auth";

function mockRes() {
  const res = {
    status: (code: number) => { res._status = code; return res; },
    json: (body: unknown) => { res._body = body; return res; },
    locals: {} as Record<string, unknown>,
    _status: 200,
    _body: undefined as unknown,
  };
  return res as unknown as Response & { _status: number; _body: unknown; locals: Record<string, unknown> };
}

const activeUser = { id: "1", role: "user", banned: false };
const adminUser  = { id: "2", role: "admin", banned: false };
const bannedUser = { id: "3", role: "user", banned: true };

beforeEach(() => vi.resetAllMocks());

describe("requireRole", () => {
  it("calls next() for an authenticated active user with no role requirement", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: activeUser, session: { id: "s1" } } as never);
    const req = { headers: {} } as Request;
    const res = mockRes();
    let called = false;

    await requireRole()(req, res, () => { called = true; });

    expect(called).toBe(true);
  });

  it("stores session in res.locals", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: activeUser, session: { id: "s1" } } as never);
    const req = { headers: {} } as Request;
    const res = mockRes();

    await requireRole()(req, res, () => {});

    expect(res.locals.session).toBeDefined();
  });

  it("returns 401 when there is no session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    const req = { headers: {} } as Request;
    const res = mockRes();

    await requireRole()(req, res, () => {});

    expect(res._status).toBe(401);
    expect(res._body).toMatchObject({ error: "Unauthorized" });
  });

  it("returns 403 when user is banned", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: bannedUser, session: { id: "s1" } } as never);
    const req = { headers: {} } as Request;
    const res = mockRes();

    await requireRole()(req, res, () => {});

    expect(res._status).toBe(403);
    expect(res._body).toMatchObject({ error: "Account is banned" });
  });

  it("calls next() when user role matches the required role", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: adminUser, session: { id: "s1" } } as never);
    const req = { headers: {} } as Request;
    const res = mockRes();
    let called = false;

    await requireRole("admin")(req, res, () => { called = true; });

    expect(called).toBe(true);
  });

  it("returns 403 when user role does not match the required role", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: activeUser, session: { id: "s1" } } as never);
    const req = { headers: {} } as Request;
    const res = mockRes();

    await requireRole("admin")(req, res, () => {});

    expect(res._status).toBe(403);
    expect(res._body).toMatchObject({ error: "Forbidden" });
  });

  it("returns 403 for a banned admin even when role matches", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "4", role: "admin", banned: true }, session: { id: "s1" } } as never);
    const req = { headers: {} } as Request;
    const res = mockRes();

    await requireRole("admin")(req, res, () => {});

    expect(res._status).toBe(403);
    expect(res._body).toMatchObject({ error: "Account is banned" });
  });
});
