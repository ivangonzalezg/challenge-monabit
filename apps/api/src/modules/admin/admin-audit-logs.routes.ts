import { Router } from "express";
import { requireRole } from "../../lib/middleware";
import {
  getAuditLogs,
  AUDIT_LOG_ACTION_VALUES,
  type AuditLogAction,
} from "./admin-audit-logs.service";

export const adminAuditLogsRouter = Router();

/**
 * @openapi
 * /api/admin/audit-logs:
 *   get:
 *     summary: Get a paginated, filterable list of audit log entries
 *     description: Admin-only. Each entry includes the resolved actor and target user (name/email), or null if the user was deleted or the action was system-initiated.
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Paginated audit logs
 *       400:
 *         description: Invalid action value
 *       500:
 *         description: Failed to load audit logs
 */
adminAuditLogsRouter.get("/audit-logs", requireRole("admin"), async (req, res) => {
  const actionParam = req.query.action as string | undefined;

  if (actionParam && !AUDIT_LOG_ACTION_VALUES.includes(actionParam as AuditLogAction)) {
    res.status(400).json({ error: "Invalid action value" });
    return;
  }

  const page = Number(req.query.page ?? "1") || 1;
  const pageSize = Number(req.query.pageSize ?? "20") || 20;

  try {
    const result = await getAuditLogs({
      page,
      pageSize,
      action: actionParam as AuditLogAction | undefined,
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      error: "Failed to load audit logs",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});
