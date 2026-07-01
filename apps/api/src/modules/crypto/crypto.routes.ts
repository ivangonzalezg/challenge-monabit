import { Router } from "express";
import { requireRole } from "../../lib/middleware";
import { runSync, SyncInProgressError } from "./sync/crypto-sync.service";

export const cryptoRouter = Router();

/**
 * @openapi
 * /api/crypto/sync:
 *   post:
 *     summary: Manually trigger a CoinGecko sync
 *     description: Admin-only. Fetches the latest market data and KPIs from CoinGecko and upserts them into the database synchronously.
 *     tags: [Crypto]
 *     responses:
 *       200:
 *         description: Sync completed
 *       409:
 *         description: A sync is already in progress
 *       500:
 *         description: Sync failed
 */
cryptoRouter.post("/sync", requireRole("admin"), async (_req, res) => {
  try {
    const run = await runSync("manual");
    res.status(200).json({ run });
  } catch (error) {
    if (error instanceof SyncInProgressError) {
      res.status(409).json({ error: "Sync already in progress" });
      return;
    }

    res.status(500).json({
      error: "Sync failed",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});
