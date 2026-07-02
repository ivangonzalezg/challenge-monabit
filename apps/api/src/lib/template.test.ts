import { describe, it, expect } from "vitest";
import { renderTemplate } from "./template";

describe("renderTemplate", () => {
  it("replaces a single placeholder with the given value", () => {
    const result = renderTemplate("password-reset", { url: "https://example.com/reset" });
    expect(result).toContain("https://example.com/reset");
    expect(result).not.toContain("{{url}}");
  });

  it("throws when the template file does not exist", () => {
    expect(() => renderTemplate("does-not-exist", {})).toThrow();
  });

  it("HTML-escapes double-stash variable values (Handlebars default behavior)", () => {
    const result = renderTemplate("__test-fixture", { message: "<script>alert(1)</script>" });
    expect(result).not.toContain("<script>alert(1)</script>");
    expect(result).toContain("&lt;script&gt;");
  });
});
