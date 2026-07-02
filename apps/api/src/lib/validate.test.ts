import { describe, it, expect } from "vitest";
import { z } from "zod";
import { validate } from "./validate";
import type { Request, Response, NextFunction } from "express";

function mockRes() {
  const res = {
    status: (code: number) => { res._status = code; return res; },
    json: (body: unknown) => { res._body = body; return res; },
    _status: 200,
    _body: undefined as unknown,
  };
  return res as unknown as Response & { _status: number; _body: unknown };
}

const schema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
  role: z.enum(["user", "admin"]).optional(),
});

describe("validate middleware", () => {
  it("calls next() when body is valid", () => {
    const req = { body: { name: "Alice", email: "alice@example.com", password: "secret123" } } as Request;
    const res = mockRes();
    let called = false;
    const next: NextFunction = () => { called = true; };

    validate(schema)(req, res, next);

    expect(called).toBe(true);
  });

  it("returns 400 with the first field error only", () => {
    const req = { body: { name: "", email: "not-an-email", password: "short" } } as Request;
    const res = mockRes();
    const next: NextFunction = () => {};

    validate(schema)(req, res, next);

    expect(res._status).toBe(400);
    expect(res._body).toMatchObject({
      error: expect.any(String),
      field: expect.any(String),
    });
    expect((res._body as Record<string, unknown>).fields).toBeUndefined();
  });

  it("error message identifies which field failed", () => {
    const req = { body: { name: "Alice", email: "not-an-email", password: "secret123" } } as Request;
    const res = mockRes();
    const next: NextFunction = () => {};

    validate(schema)(req, res, next);

    expect((res._body as Record<string, unknown>).field).toBe("email");
  });

  it("does not call next() when body is invalid", () => {
    const req = { body: {} } as Request;
    const res = mockRes();
    let called = false;
    const next: NextFunction = () => { called = true; };

    validate(schema)(req, res, next);

    expect(called).toBe(false);
  });

  it("strips unknown fields from req.body", () => {
    const req = { body: { name: "Alice", email: "alice@example.com", password: "secret123", hack: "x" } } as Request;
    const res = mockRes();
    const next: NextFunction = () => {};

    validate(schema)(req, res, next);

    expect((req.body as Record<string, unknown>).hack).toBeUndefined();
  });
});
