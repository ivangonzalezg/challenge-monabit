import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { authClient } from "@/entities/session"

export function useUser(userId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "user", userId],
    queryFn: async () => {
      const { data, error } = await authClient.admin.getUser({
        query: { id: userId as string },
      })

      if (error || !data) {
        throw new Error("Failed to load user")
      }

      return data
    },
    enabled: Boolean(userId),
  })
}

export function useUpdateUserName(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (name: string) => {
      const { error } = await authClient.admin.updateUser({
        userId: userId as string,
        data: { name },
      })

      if (error) {
        throw new Error("Failed to update user")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "user", userId] })
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
    },
  })
}
