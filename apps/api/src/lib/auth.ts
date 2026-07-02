import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "../db/client";
import * as schema from "../db/schema";
import { auditLogs } from "../db/schema";
import { sendEmail, isEmailDeliveryEnabled } from "./email";
import { withDefaultCallbackURL } from "./redirect-url";

const emailDeliveryEnabled = isEmailDeliveryEnabled();
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:5173";

export const auth = betterAuth({
  appName: "MarketMint",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: emailDeliveryEnabled,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your MarketMint password",
        template: "password-reset",
        variables: {
          url: withDefaultCallbackURL(url, `${webOrigin}/reset-password`),
        },
      });
    },
  },
  emailVerification: {
    sendOnSignUp: emailDeliveryEnabled,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your MarketMint email",
        template: "email-verification",
        variables: {
          url: withDefaultCallbackURL(url, `${webOrigin}/email-confirmed`),
        },
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  plugins: [
    admin({
      defaultRole: "user",
    }),
  ],
  trustedOrigins: [process.env.CORS_ORIGIN ?? "http://localhost:5173"],
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user, ctx) => {
          const actorUserId = ctx?.context?.session?.session?.userId ?? null;
          if (actorUserId && actorUserId !== user.id) {
            await db.insert(auditLogs).values({
              actorUserId,
              targetUserId: user.id,
              action: "USER_CREATED",
              metadata: {
                email: user.email,
                role: (user as Record<string, unknown>).role ?? "user",
              },
              ipAddress:
                ctx?.request?.headers?.get("x-forwarded-for") ??
                ctx?.request?.headers?.get("x-real-ip") ??
                null,
              userAgent: ctx?.request?.headers?.get("user-agent") ?? null,
            });
          }
        },
      },
      update: {
        after: async (user, ctx) => {
          const actorUserId = ctx?.context?.session?.session?.userId ?? null;
          if (!actorUserId) return;
          await db.insert(auditLogs).values({
            actorUserId,
            targetUserId: user.id,
            action: "USER_UPDATED",
            metadata: user,
            ipAddress:
              ctx?.request?.headers?.get("x-forwarded-for") ??
              ctx?.request?.headers?.get("x-real-ip") ??
              null,
            userAgent: ctx?.request?.headers?.get("user-agent") ?? null,
          });
        },
      },
      delete: {
        after: async (user, ctx) => {
          const actorUserId = ctx?.context?.session?.session?.userId ?? null;
          if (!actorUserId) return;
          await db.insert(auditLogs).values({
            actorUserId,
            targetUserId: null,
            action: "USER_DELETED",
            metadata: { userId: user.id, email: user.email },
            ipAddress:
              ctx?.request?.headers?.get("x-forwarded-for") ??
              ctx?.request?.headers?.get("x-real-ip") ??
              null,
            userAgent: ctx?.request?.headers?.get("user-agent") ?? null,
          });
        },
      },
    },
  },
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
