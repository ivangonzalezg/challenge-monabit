import { desc, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "../../db/client";
import { auditLogs, user } from "../../db/schema";

export type AuditLogAction = "USER_CREATED" | "USER_UPDATED" | "USER_DELETED";

export const AUDIT_LOG_ACTION_VALUES: AuditLogAction[] = [
  "USER_CREATED",
  "USER_UPDATED",
  "USER_DELETED",
];

export type AuditLogActorOrTarget = {
  id: string;
  name: string;
  email: string;
} | null;

export type AuditLogEntry = {
  id: string;
  action: string;
  createdAt: Date;
  metadata: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  actor: AuditLogActorOrTarget;
  target: AuditLogActorOrTarget;
};

export type AuditLogsPage = {
  items: AuditLogEntry[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const actorUser = alias(user, "actor_user");
const targetUser = alias(user, "target_user");

export async function getAuditLogs(params: {
  page: number;
  pageSize: number;
  action?: AuditLogAction;
}): Promise<AuditLogsPage> {
  const page = Math.max(1, Math.floor(params.page));
  const pageSize = Math.min(100, Math.max(1, Math.floor(params.pageSize)));

  const whereClause = params.action
    ? eq(auditLogs.action, params.action)
    : undefined;

  const rows = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      createdAt: auditLogs.createdAt,
      metadata: auditLogs.metadata,
      ipAddress: auditLogs.ipAddress,
      userAgent: auditLogs.userAgent,
      actorId: actorUser.id,
      actorName: actorUser.name,
      actorEmail: actorUser.email,
      targetId: targetUser.id,
      targetName: targetUser.name,
      targetEmail: targetUser.email,
    })
    .from(auditLogs)
    .leftJoin(actorUser, eq(auditLogs.actorUserId, actorUser.id))
    .leftJoin(targetUser, eq(auditLogs.targetUserId, targetUser.id))
    .where(whereClause)
    .orderBy(desc(auditLogs.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const [countRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLogs)
    .where(whereClause);

  const total = Number(countRow?.count ?? 0);

  return {
    items: rows.map((row) => ({
      id: row.id,
      action: row.action,
      createdAt: row.createdAt,
      metadata: row.metadata,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      actor: row.actorId
        ? { id: row.actorId, name: row.actorName ?? "", email: row.actorEmail ?? "" }
        : null,
      target: row.targetId
        ? { id: row.targetId, name: row.targetName ?? "", email: row.targetEmail ?? "" }
        : null,
    })),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
