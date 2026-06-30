import { Router } from "express";
import { z } from "zod";
import { validate } from "../../lib/validate";
import { requireRole } from "../../lib/middleware";
import { auth } from "../../lib/auth";
import { db } from "../../db/client";
import { user, auditLogs } from "../../db/schema";
import { eq } from "drizzle-orm";
import type { Session } from "../../lib/auth";

const router = Router();

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
  role: z.enum(["user", "admin"]).optional().default("user"),
});

const patchUserSchema = z
  .object({
    name: z.string().min(1).optional(),
    role: z.enum(["user", "admin"]).optional(),
  })
  .refine((d) => d.name !== undefined || d.role !== undefined, {
    message: "At least one of name or role must be provided",
  });

const banUserSchema = z.object({
  banned: z.boolean(),
  banReason: z.string().min(1).optional(),
  banExpiresIn: z.number().int().positive().optional(),
});

router.get("/", requireRole("admin"), async (_req, res) => {
  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      banned: user.banned,
      banReason: user.banReason,
      banExpires: user.banExpires,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    })
    .from(user);
  res.json(users);
});

router.get("/:id", requireRole("admin"), async (req, res) => {
  const id = req.params.id as string;
  const [found] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      banned: user.banned,
      banReason: user.banReason,
      banExpires: user.banExpires,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.id, id));

  if (!found) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(found);
});

router.post(
  "/",
  requireRole("admin"),
  validate(createUserSchema),
  async (req, res) => {
    const session = res.locals.session as Session;
    const {
      name,
      email,
      password,
      role: assignedRole,
    } = req.body as z.infer<typeof createUserSchema>;

    try {
      const result = await auth.api.signUpEmail({
        body: { name, email, password },
      });

      if (assignedRole === "admin") {
        await db
          .update(user)
          .set({ role: "admin" })
          .where(eq(user.id, result.user.id));
      }

      await db.insert(auditLogs).values({
        actorUserId: session.user.id,
        targetUserId: result.user.id,
        action: "USER_CREATED",
        metadata: { email, role: assignedRole },
      });

      res.status(201).json({ ...result.user, role: assignedRole });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create user";
      res.status(400).json({ error: message });
    }
  },
);

router.patch(
  "/:id",
  requireRole("admin"),
  validate(patchUserSchema),
  async (req, res) => {
    const session = res.locals.session as Session;
    const id = req.params.id as string;
    const { name, role } = req.body as z.infer<typeof patchUserSchema>;

    const [existing] = await db.select().from(user).where(eq(user.id, id));

    if (!existing) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const updates: { name?: string; role?: string; updatedAt: Date } = {
      updatedAt: new Date(),
    };
    if (name) updates.name = name;
    if (role) updates.role = role;

    const [updated] = await db
      .update(user)
      .set(updates)
      .where(eq(user.id, id))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        banned: user.banned,
      });

    await db.insert(auditLogs).values({
      actorUserId: session.user.id,
      targetUserId: id,
      action: role ? "USER_ROLE_UPDATED" : "USER_UPDATED",
      metadata: updates,
    });

    res.json(updated);
  },
);

router.patch(
  "/:id/ban",
  requireRole("admin"),
  validate(banUserSchema),
  async (req, res) => {
    const session = res.locals.session as Session;
    const id = req.params.id as string;
    const { banned, banReason, banExpiresIn } = req.body as z.infer<
      typeof banUserSchema
    >;

    const [existing] = await db.select().from(user).where(eq(user.id, id));

    if (!existing) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (banned) {
      await auth.api.banUser({
        body: { userId: id, banReason, banExpiresIn },
      });

      await db.insert(auditLogs).values({
        actorUserId: session.user.id,
        targetUserId: id,
        action: "USER_BANNED",
        metadata: { banReason, banExpiresIn },
      });
    } else {
      await auth.api.unbanUser({
        body: { userId: id },
      });

      await db.insert(auditLogs).values({
        actorUserId: session.user.id,
        targetUserId: id,
        action: "USER_UNBANNED",
        metadata: {},
      });
    }

    const [updated] = await db
      .select({
        id: user.id,
        banned: user.banned,
        banReason: user.banReason,
        banExpires: user.banExpires,
      })
      .from(user)
      .where(eq(user.id, id));

    res.json(updated);
  },
);

export default router;
