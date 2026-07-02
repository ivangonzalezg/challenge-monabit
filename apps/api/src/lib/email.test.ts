import { describe, it, expect, vi, beforeEach } from "vitest";

const sendMock = vi.fn();

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function (this: { emails: { send: typeof sendMock } }) {
    this.emails = { send: sendMock };
  }),
}));

import { sendEmail, isEmailDeliveryEnabled } from "./email";

beforeEach(() => {
  sendMock.mockReset();
  process.env.RESEND_API_KEY = "test-key";
  process.env.RESEND_FROM_EMAIL = "MonaBit <noreply@monabit.dev>";
});

describe("sendEmail", () => {
  it("sends an email using the given template, subject and recipient", async () => {
    await sendEmail({
      to: "alice@example.com",
      subject: "Reset your MonaBit password",
      template: "password-reset",
      variables: { url: "https://app.monabit.dev/reset-password?token=abc123" },
    });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "alice@example.com",
        from: "MonaBit <noreply@monabit.dev>",
        subject: "Reset your MonaBit password",
      }),
    );
  });

  it("renders the template with the given variables into the email body", async () => {
    await sendEmail({
      to: "alice@example.com",
      subject: "Reset your MonaBit password",
      template: "password-reset",
      variables: { url: "https://app.monabit.dev/reset-password?token=abc123" },
    });

    const call = sendMock.mock.calls[0][0];
    expect(call.html).toContain("https://app.monabit.dev/reset-password?token=abc123");
  });

  it("does not throw when RESEND_API_KEY is not set", async () => {
    delete process.env.RESEND_API_KEY;

    await expect(
      sendEmail({
        to: "alice@example.com",
        subject: "Reset your MonaBit password",
        template: "password-reset",
        variables: { url: "https://app.monabit.dev/reset" },
      }),
    ).resolves.toBeUndefined();
  });

  it("does not call Resend when RESEND_API_KEY is not set", async () => {
    delete process.env.RESEND_API_KEY;

    await sendEmail({
      to: "alice@example.com",
      subject: "Reset your MonaBit password",
      template: "password-reset",
      variables: { url: "https://app.monabit.dev/reset" },
    });

    expect(sendMock).not.toHaveBeenCalled();
  });

  it("logs the subject and variables (not the html body) when RESEND_API_KEY is not set", async () => {
    delete process.env.RESEND_API_KEY;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await sendEmail({
      to: "alice@example.com",
      subject: "Reset your MonaBit password",
      template: "password-reset",
      variables: { url: "https://app.monabit.dev/reset" },
    });

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("RESEND_API_KEY"));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Reset your MonaBit password"));
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("https://app.monabit.dev/reset"),
    );
    warnSpy.mockRestore();
  });

  it("does not log the recipient address when RESEND_API_KEY is not set", async () => {
    delete process.env.RESEND_API_KEY;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await sendEmail({
      to: "alice@example.com",
      subject: "Reset your MonaBit password",
      template: "password-reset",
      variables: { url: "https://app.monabit.dev/reset" },
    });

    const loggedText = warnSpy.mock.calls.map((call) => call.join(" ")).join("\n");
    expect(loggedText).not.toContain("alice@example.com");
    warnSpy.mockRestore();
  });
});

describe("isEmailDeliveryEnabled", () => {
  it("returns true when RESEND_API_KEY is set", () => {
    process.env.RESEND_API_KEY = "re_abc123";
    expect(isEmailDeliveryEnabled()).toBe(true);
  });

  it("returns false when RESEND_API_KEY is not set", () => {
    delete process.env.RESEND_API_KEY;
    expect(isEmailDeliveryEnabled()).toBe(false);
  });

  it("returns false when RESEND_API_KEY is an empty string", () => {
    process.env.RESEND_API_KEY = "";
    expect(isEmailDeliveryEnabled()).toBe(false);
  });
});
