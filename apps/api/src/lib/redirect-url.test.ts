import { describe, it, expect } from "vitest";
import { withDefaultCallbackURL } from "./redirect-url";

describe("withDefaultCallbackURL", () => {
  it("adds the fallback callbackURL when the url has none", () => {
    const result = withDefaultCallbackURL(
      "http://localhost:8080/api/auth/reset-password/abc123",
      "http://localhost:5173/reset-password",
    );
    expect(new URL(result).searchParams.get("callbackURL")).toBe("http://localhost:5173/reset-password");
  });

  it("adds the fallback callbackURL when callbackURL is an empty string", () => {
    const result = withDefaultCallbackURL(
      "http://localhost:8080/api/auth/reset-password/abc123?callbackURL=",
      "http://localhost:5173/reset-password",
    );
    expect(new URL(result).searchParams.get("callbackURL")).toBe("http://localhost:5173/reset-password");
  });

  it("adds the fallback callbackURL when callbackURL is the default root path", () => {
    const result = withDefaultCallbackURL(
      "http://localhost:8080/api/auth/verify-email?token=abc123&callbackURL=%2F",
      "http://localhost:5173/verify-email",
    );
    expect(new URL(result).searchParams.get("callbackURL")).toBe("http://localhost:5173/verify-email");
  });

  it("keeps the existing callbackURL when the caller already provided one", () => {
    const result = withDefaultCallbackURL(
      "http://localhost:8080/api/auth/verify-email?token=abc123&callbackURL=https%3A%2F%2Fapp.monabit.dev%2Fwelcome",
      "http://localhost:5173/verify-email",
    );
    expect(new URL(result).searchParams.get("callbackURL")).toBe("https://app.monabit.dev/welcome");
  });

  it("preserves the token query param", () => {
    const result = withDefaultCallbackURL(
      "http://localhost:8080/api/auth/verify-email?token=abc123&callbackURL=%2F",
      "http://localhost:5173/verify-email",
    );
    expect(new URL(result).searchParams.get("token")).toBe("abc123");
  });
});
