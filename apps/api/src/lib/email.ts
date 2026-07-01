import { Resend } from "resend";
import { renderTemplate } from "./template";

type SendEmailInput = {
  to: string;
  subject: string;
  template: string;
  variables: Record<string, string>;
};

export function isEmailDeliveryEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail({
  to,
  subject,
  template,
  variables,
}: SendEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      `[email] RESEND_API_KEY is not set — skipping email send. Subject: "${subject}". Variables: ${JSON.stringify(variables)}`,
    );
    return;
  }

  const from =
    process.env.RESEND_FROM_EMAIL ?? "MarketMint <onboarding@resend.dev>";
  const resend = new Resend(apiKey);

  await resend.emails.send({
    from,
    to,
    subject,
    html: renderTemplate(template, variables),
  });
}
