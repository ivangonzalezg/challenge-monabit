import { auth } from "./auth";
import { db } from "../db/client";
import { user } from "../db/schema";
import { eq } from "drizzle-orm";

type Env = Record<string, string | undefined>;

export async function bootstrapFirstAdmin(env: Env): Promise<void> {
  const email = env.FIRST_ADMIN_EMAIL;
  const password = env.FIRST_ADMIN_PASSWORD;

  if (!email || !password) {
    return;
  }

  const name = env.FIRST_ADMIN_NAME ?? "Admin";

  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.role, "admin"));

  if (existing.length > 0) {
    return;
  }

  const result = await auth.api.signUpEmail({
    body: { email, password, name },
  });

  await db
    .update(user)
    .set({ role: "admin" })
    .where(eq(user.id, result.user.id));

  console.log(
    `[bootstrap] First admin created successfully: ${email} (id: ${result.user.id})`,
  );
}
