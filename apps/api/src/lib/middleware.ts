import type { Request, Response, NextFunction } from "express";
import { auth } from "./auth";
import { fromNodeHeaders } from "better-auth/node";

export function requireRole(role?: "admin" | "user") {
  return async (req: Request, res: Response, next: NextFunction) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });

    if (!session) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (session.user.banned) {
      res.status(403).json({ error: "Account is banned" });
      return;
    }

    if (role && session.user.role !== role) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    res.locals.session = session;
    next();
  };
}
