import { Router } from "express";
import { z } from "zod";
import { validate } from "../../lib/validate";
import { requireRole } from "../../lib/middleware";
import { db } from "../../db/client";
import { userProfiles } from "../../db/schema";
import { eq } from "drizzle-orm";
import type { Session } from "../../lib/auth";

const router = Router();

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  country: z.string().length(2).optional(),
  timezone: z
    .string()
    .refine((tz) => Intl.supportedValuesOf("timeZone").includes(tz), {
      message: "Invalid IANA timezone",
    })
    .optional(),
});

/**
 * @openapi
 * /api/me:
 *   get:
 *     tags:
 *       - Me
 *     summary: Get current authenticated user, session and profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       "200":
 *         description: Current user, session and profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: "#/components/schemas/UserObject"
 *                 session:
 *                   $ref: "#/components/schemas/SessionObject"
 *                 profile:
 *                   $ref: "#/components/schemas/UserProfile"
 *       "401":
 *         $ref: "#/components/responses/Unauthorized"
 */
router.get("/", requireRole(), async (_req, res) => {
  const session = res.locals.session as Session;
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id));
  res.json({
    user: session.user,
    session: session.session,
    profile: profile ?? null,
  });
});

/**
 * @openapi
 * /api/me/profile:
 *   put:
 *     tags:
 *       - Me
 *     summary: Create or update the authenticated user's profile
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: John Doe
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *                 example: Crypto enthusiast
 *               country:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 2
 *                 example: US
 *               timezone:
 *                 type: string
 *                 example: America/New_York
 *     responses:
 *       "200":
 *         description: Updated profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UserProfile"
 *       "201":
 *         description: Created profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UserProfile"
 *       "400":
 *         $ref: "#/components/responses/BadRequest"
 *       "401":
 *         $ref: "#/components/responses/Unauthorized"
 */
router.put(
  "/profile",
  requireRole(),
  validate(updateProfileSchema),
  async (req, res) => {
    const session = res.locals.session as Session;
    const { displayName, bio, country, timezone } = req.body as z.infer<
      typeof updateProfileSchema
    >;

    const [existing] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, session.user.id));

    if (existing) {
      const [updated] = await db
        .update(userProfiles)
        .set({ displayName, bio, country, timezone, updatedAt: new Date() })
        .where(eq(userProfiles.userId, session.user.id))
        .returning();
      res.json(updated);
    } else {
      const [created] = await db
        .insert(userProfiles)
        .values({ userId: session.user.id, displayName, bio, country, timezone })
        .returning();
      res.status(201).json(created);
    }
  },
);

export default router;
