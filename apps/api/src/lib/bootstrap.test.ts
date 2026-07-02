import { describe, it, expect, vi, beforeEach } from "vitest";
import { bootstrapFirstAdmin } from "./bootstrap";

vi.mock("./auth", () => ({
  auth: {
    api: {
      createUser: vi.fn(),
    },
  },
}));

vi.mock("../db/client", () => ({
  db: {
    select: vi.fn(),
  },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return { ...actual, eq: vi.fn() };
});

import { auth } from "./auth";
import { db } from "../db/client";

const selectChain = (rows: unknown[]) => {
  const where = vi.fn().mockResolvedValue(rows);
  const from = vi.fn().mockReturnValue({ where });
  return { from };
};

beforeEach(() => vi.resetAllMocks());

describe("bootstrapFirstAdmin", () => {
  it("does nothing when env vars are not set", async () => {
    await bootstrapFirstAdmin({});
    expect(auth.api.createUser).not.toHaveBeenCalled();
  });

  it("does nothing when FIRST_ADMIN_EMAIL is missing", async () => {
    await bootstrapFirstAdmin({ FIRST_ADMIN_PASSWORD: "secret123", FIRST_ADMIN_NAME: "Admin" });
    expect(auth.api.createUser).not.toHaveBeenCalled();
  });

  it("does nothing when FIRST_ADMIN_PASSWORD is missing", async () => {
    await bootstrapFirstAdmin({ FIRST_ADMIN_EMAIL: "admin@example.com", FIRST_ADMIN_NAME: "Admin" });
    expect(auth.api.createUser).not.toHaveBeenCalled();
  });

  it("does nothing when an admin already exists", async () => {
    vi.mocked(db.select).mockReturnValue(selectChain([{ id: "1" }]) as never);
    await bootstrapFirstAdmin({
      FIRST_ADMIN_EMAIL: "admin@example.com",
      FIRST_ADMIN_PASSWORD: "secret123",
      FIRST_ADMIN_NAME: "Admin",
    });
    expect(auth.api.createUser).not.toHaveBeenCalled();
  });

  it("creates admin user when no admin exists", async () => {
    vi.mocked(db.select).mockReturnValue(selectChain([]) as never);
    vi.mocked(auth.api.createUser).mockResolvedValue({ user: { id: "new-id" } } as never);

    await bootstrapFirstAdmin({
      FIRST_ADMIN_EMAIL: "admin@example.com",
      FIRST_ADMIN_PASSWORD: "secret123",
      FIRST_ADMIN_NAME: "Admin",
    });

    expect(auth.api.createUser).toHaveBeenCalledWith({
      body: {
        email: "admin@example.com",
        password: "secret123",
        name: "Admin",
        role: "admin",
        data: { emailVerified: true },
      },
    });
  });

  it("uses 'Admin' as default name when FIRST_ADMIN_NAME is not set", async () => {
    vi.mocked(db.select).mockReturnValue(selectChain([]) as never);
    vi.mocked(auth.api.createUser).mockResolvedValue({ user: { id: "new-id" } } as never);

    await bootstrapFirstAdmin({
      FIRST_ADMIN_EMAIL: "admin@example.com",
      FIRST_ADMIN_PASSWORD: "secret123",
    });

    expect(auth.api.createUser).toHaveBeenCalledWith({
      body: expect.objectContaining({ name: "Admin" }),
    });
  });
});
