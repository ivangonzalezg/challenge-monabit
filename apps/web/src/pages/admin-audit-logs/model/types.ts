export type AuditLogAction = "USER_CREATED" | "USER_UPDATED" | "USER_DELETED"

export type AuditLogActorOrTarget = {
  id: string
  name: string
  email: string
} | null

export type AuditLogEntry = {
  id: string
  action: AuditLogAction
  createdAt: string
  metadata: unknown
  ipAddress: string | null
  userAgent: string | null
  actor: AuditLogActorOrTarget
  target: AuditLogActorOrTarget
}

export type AuditLogsPage = {
  items: AuditLogEntry[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}
