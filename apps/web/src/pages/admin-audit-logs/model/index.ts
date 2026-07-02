import { useQuery } from "@tanstack/react-query"

import type { AuditLogAction, AuditLogsPage } from "./types"

const API_URL = import.meta.env.VITE_API_URL

async function fetchAuditLogs(params: {
  page: number
  pageSize: number
  action: AuditLogAction | "all"
}): Promise<AuditLogsPage> {
  const query = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  })
  if (params.action !== "all") {
    query.set("action", params.action)
  }

  const res = await fetch(
    `${API_URL}/api/admin/audit-logs?${query.toString()}`,
    {
      credentials: "include",
    }
  )

  if (!res.ok) {
    throw new Error("Failed to load audit logs")
  }

  return res.json()
}

export function useAuditLogs(params: {
  page: number
  pageSize: number
  action: AuditLogAction | "all"
}) {
  return useQuery({
    queryKey: ["admin", "audit-logs", params],
    queryFn: () => fetchAuditLogs(params),
    placeholderData: (previousData) => previousData,
  })
}
