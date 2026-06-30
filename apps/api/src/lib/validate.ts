import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export function validate(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const first = result.error.issues[0];
      const field = first.path.join(".");
      res.status(400).json({ error: first.message, field });
      return;
    }
    req.body = result.data;
    next();
  };
}
