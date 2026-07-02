import { useQuery } from "@tanstack/react-query"

import { authClient } from "@/entities/session"
import type { AdminUserSortBy } from "./types"

export function useUsers(params: {
  page: number
  pageSize: number
  search: string
  sortBy: AdminUserSortBy
  currentUserId: string | undefined
}) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const { data, error } = await authClient.admin.listUsers({
        query: {
          limit: params.pageSize,
          offset: (params.page - 1) * params.pageSize,
          sortBy: params.sortBy,
          sortDirection: "desc",
          ...(params.search
            ? {
                searchField: "email" as const,
                searchOperator: "contains" as const,
                searchValue: params.search,
              }
            : {}),
        },
      })

      if (error) {
        throw new Error("Failed to load users")
      }

      const items = data.users.filter(
        (user) => user.id !== params.currentUserId
      )
      const total = Math.max(0, data.total - 1)

      return {
        items,
        total,
        totalPages: Math.max(1, Math.ceil(total / params.pageSize)),
      }
    },
    enabled: Boolean(params.currentUserId),
    placeholderData: (previousData) => previousData,
  })
}
