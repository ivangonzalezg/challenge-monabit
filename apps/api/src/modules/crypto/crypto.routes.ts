import { Router } from "express";
import { z } from "zod";
import { requireRole } from "../../lib/middleware";
import { validate } from "../../lib/validate";
import { runSync, SyncInProgressError } from "./sync/crypto-sync.service";
import { getDashboard, NoDashboardDataError } from "./dashboard/crypto-dashboard.service";
import { getAssets, ASSET_SORT_VALUES, type AssetSortBy } from "./assets/crypto-assets.service";
import { listFavorites, addFavorite, removeFavorite } from "./favorites/crypto-favorites.service";

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

/**
 * @openapi
 * /api/crypto/dashboard:
 *   get:
 *     summary: Get dashboard KPIs, top assets, and market trend
 *     description: Any authenticated, non-banned user. Reads from crypto_market_kpis and crypto_assets — never calls CoinGecko directly.
 *     tags: [Crypto]
 *     responses:
 *       200:
 *         description: Dashboard data
 *       503:
 *         description: No crypto data available yet
 *       500:
 *         description: Failed to load dashboard
 */
cryptoRouter.get("/dashboard", requireRole(), async (_req, res) => {
  try {
    const dashboard = await getDashboard();
    res.status(200).json(dashboard);
  } catch (error) {
    if (error instanceof NoDashboardDataError) {
      res.status(503).json({ error: "No crypto data available yet" });
      return;
    }

    res.status(500).json({
      error: "Failed to load dashboard",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * @openapi
 * /api/crypto/assets:
 *   get:
 *     summary: Get a paginated, searchable, sortable list of crypto assets
 *     description: Any authenticated, non-banned user. Each item includes isFavorite for the current user.
 *     tags: [Crypto]
 *     responses:
 *       200:
 *         description: Paginated assets
 *       400:
 *         description: Invalid sortBy value
 *       500:
 *         description: Failed to load assets
 */
cryptoRouter.get("/assets", requireRole(), async (req, res) => {
  const sortBy = (req.query.sortBy as string | undefined) ?? "marketCap";

  if (!ASSET_SORT_VALUES.includes(sortBy as AssetSortBy)) {
    res.status(400).json({ error: "Invalid sortBy value" });
    return;
  }

  const page = Number(req.query.page ?? "1") || 1;
  const pageSize = Number(req.query.pageSize ?? "20") || 20;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;

  try {
    const userId = (res.locals.session as { user: { id: string } }).user.id;
    const result = await getAssets({
      userId,
      page,
      pageSize,
      search,
      sortBy: sortBy as AssetSortBy,
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      error: "Failed to load assets",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * @openapi
 * /api/crypto/favorites:
 *   get:
 *     summary: List the current user's favorited cryptos
 *     tags: [Crypto]
 *     responses:
 *       200:
 *         description: Favorites list
 */
cryptoRouter.get("/favorites", requireRole(), async (_req, res) => {
  const userId = (res.locals.session as { user: { id: string } }).user.id;
  const items = await listFavorites(userId);
  res.status(200).json({ items });
});

const addFavoriteSchema = z.object({
  providerAssetId: z.string().min(1),
  symbol: z.string().min(1),
  name: z.string().min(1),
});

/**
 * @openapi
 * /api/crypto/favorites:
 *   post:
 *     summary: Mark a crypto asset as a favorite
 *     tags: [Crypto]
 *     responses:
 *       201:
 *         description: Favorited (idempotent if already favorited)
 *       400:
 *         description: Invalid body
 */
cryptoRouter.post("/favorites", requireRole(), validate(addFavoriteSchema), async (req, res) => {
  const userId = (res.locals.session as { user: { id: string } }).user.id;
  const { providerAssetId, symbol, name } = req.body as z.infer<typeof addFavoriteSchema>;
  await addFavorite({ userId, providerAssetId, symbol, name });
  res.status(201).json({ success: true });
});

/**
 * @openapi
 * /api/crypto/favorites/{providerAssetId}:
 *   delete:
 *     summary: Remove a crypto asset from favorites
 *     tags: [Crypto]
 *     responses:
 *       204:
 *         description: Removed (idempotent if not favorited)
 */
cryptoRouter.delete("/favorites/:providerAssetId", requireRole(), async (req, res) => {
  const userId = (res.locals.session as { user: { id: string } }).user.id;
  await removeFavorite({ userId, providerAssetId: req.params.providerAssetId as string });
  res.status(204).send();
});
